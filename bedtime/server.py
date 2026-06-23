#!/usr/bin/env python3
import argparse
import hashlib
import html
import json
import os
import re
import time
import urllib.error
import urllib.request
from collections import OrderedDict
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def load_local_env(path=".env"):
    try:
        with open(path, encoding="utf-8") as env_file:
            for line in env_file:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                name, value = line.split("=", 1)
                os.environ.setdefault(name.strip(), value.strip())
    except FileNotFoundError:
        pass


load_local_env()

AZURE_SPEECH_VOICE = os.environ.get("AZURE_SPEECH_VOICE", "zh-TW-HsiaoChenNeural")
AZURE_SPEECH_FORMAT = "audio-24khz-48kbitrate-mono-mp3"
MAX_TEXT_LENGTH = 5000
MAX_CACHE_ITEMS = 64
AUDIO_CACHE = OrderedDict()
# Retry transient Azure throttling (429 Too Many Requests / 503) with backoff.
# Batch synthesis (generate-bedtime-audio.py) fires many requests in a row and
# can trip the per-second/per-minute transaction cap; without this a whole run
# aborts partway. Honors the Retry-After header when Azure sends one.
TTS_MAX_RETRIES = 6


def json_bytes(value):
    return json.dumps(value, ensure_ascii=False).encode("utf-8")


def speech_config():
    return os.environ.get("AZURE_SPEECH_KEY"), os.environ.get("AZURE_SPEECH_REGION")


# Polyphone (多音字) pronunciation fixes. Each entry rewrites a character to a
# specific reading via SSML <phoneme>. For the zh-TW voice the SAPI alphabet
# expects Zhuyin/Bopomofo (e.g. ㄕㄨˇ), not Pinyin. Patterns run on already
# HTML-escaped text, so the matched characters must contain no escaped symbols.
PRONUNCIATIONS = [
    # 數 as the verb "to count" → ㄕㄨˇ (shǔ, 3rd tone). Skip the noun readings
    # 數量 / 數學 / 字數, which are correctly ㄕㄨˋ (shù, 4th tone).
    (re.compile(r"(?<!字)數(?![量學])"), '<phoneme alphabet="sapi" ph="ㄕㄨˇ">數</phoneme>'),
]


def apply_pronunciations(escaped_text, voice=None):
    # The SAPI Zhuyin <phoneme> overrides only work for zh-TW voices. zh-CN
    # voices (the child character voices) reject any <phoneme alphabet="sapi">
    # with HTTP 400 — Zhuyin *and* Pinyin — so skip overrides for them and rely
    # on the zh-CN voice's own context-based polyphone reading.
    if voice and voice.startswith("zh-CN"):
        return escaped_text
    for pattern, replacement in PRONUNCIATIONS:
        escaped_text = pattern.sub(replacement, escaped_text)
    return escaped_text


def lang_of(voice):
    parts = (voice or "").split("-")
    return "-".join(parts[:2]) if len(parts) >= 2 else "zh-TW"


def build_ssml(text, voice=None):
    voice = voice or AZURE_SPEECH_VOICE
    escaped = apply_pronunciations(html.escape(text, quote=False), voice)
    return (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
        f'xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="{html.escape(lang_of(voice), quote=True)}">'
        f'<voice name="{html.escape(voice, quote=True)}">'
        '<prosody rate="-15%" pitch="-2%">'
        f"{escaped}"
        "</prosody></voice></speak>"
    ).encode("utf-8")


def synthesize(text, voice=None):
    voice = voice or AZURE_SPEECH_VOICE
    key, region = speech_config()
    if not key or not region:
        raise RuntimeError("Azure Speech environment variables are not configured")

    cache_key = hashlib.sha256(f"{voice}\0{text}".encode("utf-8")).hexdigest()
    if cache_key in AUDIO_CACHE:
        AUDIO_CACHE.move_to_end(cache_key)
        return AUDIO_CACHE[cache_key]

    endpoint = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    request = urllib.request.Request(
        endpoint,
        data=build_ssml(text, voice),
        method="POST",
        headers={
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": AZURE_SPEECH_FORMAT,
            "User-Agent": "apple-bedtime-story",
        },
    )
    for attempt in range(TTS_MAX_RETRIES):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                audio = response.read()
            break
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 503) or attempt == TTS_MAX_RETRIES - 1:
                raise
            retry_after = (exc.headers.get("Retry-After") or "").strip()
            if retry_after.replace(".", "", 1).isdigit():
                delay = float(retry_after)
            else:
                delay = min(60.0, 5.0 * (attempt + 1))
            time.sleep(delay)

    AUDIO_CACHE[cache_key] = audio
    AUDIO_CACHE.move_to_end(cache_key)
    while len(AUDIO_CACHE) > MAX_CACHE_ITEMS:
        AUDIO_CACHE.popitem(last=False)
    return audio


class BedtimeHandler(SimpleHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "https://jammieaiwriter-jpg.github.io")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def send_bytes(self, status, body, content_type):
        self.send_response(status)
        self.send_cors_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_bytes(200, b"ok", "text/plain; charset=utf-8")
            return
        if self.path == "/api/tts/status":
            key, region = speech_config()
            self.send_bytes(
                200,
                json_bytes(
                    {
                        "enabled": bool(key and region),
                        "voice": AZURE_SPEECH_VOICE,
                        "region": region if key and region else None,
                    }
                ),
                "application/json; charset=utf-8",
            )
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/tts":
            self.send_bytes(404, json_bytes({"error": "not found"}), "application/json")
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length))
            text = payload.get("text", "")
            voice = payload.get("voice")
            if not isinstance(text, str) or not text.strip():
                raise ValueError("text is required")
            if voice is not None and not isinstance(voice, str):
                raise ValueError("voice must be a string")
            if len(text) > MAX_TEXT_LENGTH:
                raise ValueError(f"text exceeds {MAX_TEXT_LENGTH} characters")
            audio = synthesize(text, voice)
            self.send_bytes(200, audio, "audio/mpeg")
        except ValueError as error:
            self.send_bytes(400, json_bytes({"error": str(error)}), "application/json")
        except RuntimeError as error:
            self.send_bytes(503, json_bytes({"error": str(error)}), "application/json")
        except urllib.error.HTTPError as error:
            self.send_bytes(
                502,
                json_bytes({"error": "Azure Speech request failed", "status": error.code}),
                "application/json",
            )
        except Exception:
            self.send_bytes(502, json_bytes({"error": "speech synthesis failed"}), "application/json")


def main():
    parser = argparse.ArgumentParser(description="Serve the bedtime story with optional Azure Speech TTS.")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8123")))
    args = parser.parse_args()
    server = ThreadingHTTPServer(("0.0.0.0", args.port), BedtimeHandler)
    print(f"Bedtime story: http://localhost:{args.port}")
    print(f"Azure voice: {AZURE_SPEECH_VOICE} ({'enabled' if all(speech_config()) else 'fallback only'})")
    server.serve_forever()


if __name__ == "__main__":
    main()
