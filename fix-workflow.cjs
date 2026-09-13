const fs = require('fs');
const p = 'n8n-workflows/sahamfyp-rss-trigger-news-scrape.json';
let c = fs.readFileSync(p, 'utf8');

// Replace the check-exists node entirely
const oldNode = /\{[^{}]*"id":\s*"check-exists"[^{}]*\}/;
const newNode = JSON.stringify({
  "parameters": {
    "method": "POST",
    "url": "https://saham-fyp.vercel.app/api/news-scrape/check",
    "sendHeaders": true,
    "headerParameters": { "parameters": [{ "name": "Content-Type", "value": "application/json" }] },
    "sendBody": true,
    "bodyParameters": { "parameters": [{ "name": "url", "value": "={{ $json.url }}" }] },
    "options": {}
  },
  "id": "check-exists",
  "name": "1. Check Exists?",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [480, 300]
}, null, 2);

// Simple text replacement
const searchStr = '"url": "=https://saham-fyp.vercel.app/api/news-scrape/check?url={{$json.url}}"';
const replaceStr = '"url": "https://saham-fyp.vercel.app/api/news-scrape/check",\n        "sendHeaders": true,\n        "headerParameters": { "parameters": [{ "name": "Content-Type", "value": "application/json" }] },\n        "sendBody": true,\n        "bodyParameters": { "parameters": [{ "name": "url", "value": "={{ $json.url }}" }] }';

c = c.replace(searchStr, replaceStr);

// Remove old "options": {} that's now after our new content
c = c.replace(/"sendBody": true,\s*"bodyParameters": \{[^}]*\},\s*"options": \{\}/, '"sendBody": true,\n        "bodyParameters": { "parameters": [{ "name": "url", "value": "={{ $json.url }}" }] },\n        "options": {}');

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed!');
console.log('Has check?url:', c.includes('check?url='));
console.log('Has sendBody:', c.includes('"sendBody": true'));
