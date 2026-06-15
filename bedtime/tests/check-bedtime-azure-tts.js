const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const preview = fs.readFileSync(path.join(root, 'week02.html'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.py'), 'utf8');

[index, preview].forEach((html, index) => {
  const label = index === 0 ? 'index.html' : 'week02.html';
  [
    "fetch('/api/tts'",
    'zh-TW-HsiaoChenNeural',
    'playAzureSpeech',
    'stopAzureSpeech',
    'speechSynthesis.speak(utterance)'
  ].forEach(token => {
    if (!html.includes(token)) throw new Error(`${label} missing Azure TTS token ${token}`);
  });
});

[
  'AZURE_SPEECH_KEY',
  'AZURE_SPEECH_REGION',
  'zh-TW-HsiaoChenNeural',
  '/api/tts',
  'Ocp-Apim-Subscription-Key',
  'application/ssml+xml',
  'audio-24khz-48kbitrate-mono-mp3',
  '<prosody rate="-15%" pitch="-2%">'
].forEach(token => {
  if (!server.includes(token)) throw new Error(`server.py missing Azure TTS token ${token}`);
});

if (server.includes('AZURE_SPEECH_KEY = "')) {
  throw new Error('server.py must not hard-code an Azure Speech key');
}

console.log(JSON.stringify({
  voice: 'zh-TW-HsiaoChenNeural',
  fallback: 'speechSynthesis',
  secretLocation: 'environment'
}, null, 2));
