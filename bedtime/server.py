#!/usr/bin/env python3
import argparse
import hashlib
import html
import json
import os
import re
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


def apply_pronunciations(escaped_text):
    for pattern, replacement in PRONUNCIATIONS:
        escaped_text = pattern.sub(replacement, escaped_text)
    return escaped_text


def build_ssml(text):
    escaped = apply_pronunciations(html.escape(text, quote=False))
    return (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
        'xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="zh-TW">'
        f'<voice name="{html.escape(AZURE_SPEECH_VOICE, quote=True)}">'
        '<prosody rate="-15%" pitch="-2%">'
        f"{escaped}"
        "</prosody></voice></speak>"
    ).encode("utf-8")


def synthesize(text):
    key, region = speech_config()
    if not key or not region:
        raise RuntimeError("Azure Speech environment variables are not configured")

    cache_key = hashlib.sha256(f"{AZURE_SPEECH_VOICE}\0{text}".encode("utf-8")).hexdigest()
    if cache_key in AUDIO_CACHE:
        AUDIO_CACHE.move_to_end(cache_key)
        return AUDIO_CACHE[cache_key]

    endpoint = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    request = urllib.request.Request(
        endpoint,
        data=build_ssml(text),
        method="POST",
        headers={
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": AZURE_SPEECH_FORMAT,
            "User-Agent": "apple-bedtime-story",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        audio = response.read()

    AUDIO_CACHE[cache_key] = audio
    AUDIO_CACHE.move_to_end(cache_key)
    while len(AUDIO_CACHE) > MAX_CACHE_ITEMS:
        AUDIO_CACHE.popitem(last=False)
    return audio


class BedtimeHandler(SimpleHTTPRequestHandler):
    def send_bytes(self, status, body, content_type):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

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
            if not isinstance(text, str) or not text.strip():
                raise ValueError("text is required")
            if len(text) > MAX_TEXT_LENGTH:
                raise ValueError(f"text exceeds {MAX_TEXT_LENGTH} characters")
            audio = synthesize(text)
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
