// scripts/test-llm.mjs — smoke test api/_lib/llm.ts tanpa memakai kredit provider asli.
// Jalankan: npx tsx scripts/test-llm.mjs
// Menyalakan mock server OpenAI-compatible lokal, lalu memverifikasi:
// request shape (URL, Bearer auth, model, messages), fallback saat model
// tidak mendukung response_format, dan parsing JSON (extractJson).
// Exit code != 0 kalau ada assertion yang gagal.
import { createServer } from 'node:http';

let requestLog = [];
let rejectJsonMode = true;

const server = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const payload = JSON.parse(body || '{}');
    requestLog.push({
      url: req.url,
      auth: req.headers['authorization'],
      contentType: req.headers['content-type'],
      payload,
    });

    if (rejectJsonMode && payload.response_format) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'response_format json_object is not supported by this model' } }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        choices: [
          {
            message: {
              content: '```json\n{"category":"SINGLE_STOCK","ticker":"BBCA","confidence":0.9,"reason":"test"}\n```',
            },
          },
        ],
      })
    );
  });
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

process.env.SUMOPOD_API_KEY = 'sk-test-key';
process.env.SUMOPOD_BASE_URL = `http://127.0.0.1:${port}/v1`;
process.env.SUMOPOD_MODEL = 'gemini/gemini-3.1-flash-lite';

const { chatComplete, generateJson, extractJson, getLlmConfig, isLlmConfigured } = await import(
  '../api/_lib/llm.ts'
);

const results = [];
function check(name, cond, extra = '') {
  results.push(`${cond ? 'PASS' : 'FAIL'} — ${name}${extra ? ' :: ' + extra : ''}`);
  if (!cond) process.exitCode = 1;
}

const cfg = getLlmConfig();
check('isLlmConfigured() true saat key diisi', isLlmConfigured() === true);
check('model dari env', cfg.model === 'gemini/gemini-3.1-flash-lite', cfg.model);
check('baseUrl dari env', cfg.baseUrl === `http://127.0.0.1:${port}/v1`, cfg.baseUrl);

// --- text mode ---
const text = await chatComplete('halo', { temperature: 0.3 });
check('chatComplete balikin content', text.includes('SINGLE_STOCK'));
const req1 = requestLog[0];
check('POST ke /v1/chat/completions', req1.url === '/v1/chat/completions', req1.url);
check('Bearer auth header', req1.auth === 'Bearer sk-test-key', req1.auth);
check('model dikirim', req1.payload.model === 'gemini/gemini-3.1-flash-lite');
check('messages[0].role user', req1.payload.messages?.[0]?.role === 'user');
check('temperature diteruskan', req1.payload.temperature === 0.3);
check('tanpa response_format di mode text', !req1.payload.response_format);

// --- json mode + fallback saat model tidak support json mode ---
requestLog = [];
const parsed = await generateJson('klasifikasi', { temperature: 0.2 });
check('generateJson parse hasil', parsed.ticker === 'BBCA' && parsed.confidence === 0.9);
check('json mode dicoba dulu', requestLog[0]?.payload?.response_format?.type === 'json_object');
check('retry tanpa response_format', requestLog.length === 2 && !requestLog[1].payload.response_format, `requests=${requestLog.length}`);

// --- json mode didukung ---
rejectJsonMode = false;
requestLog = [];
const parsed2 = await generateJson('klasifikasi');
check('json mode tanpa retry saat didukung', requestLog.length === 1 && requestLog[0].payload.response_format?.type === 'json_object');
check('hasil parse tetap benar', parsed2.category === 'SINGLE_STOCK');

// --- extractJson varian ---
check('extractJson plain', extractJson('{"a":1}').a === 1);
check('extractJson fenced', extractJson('```json\n{"a":2}\n```').a === 2);
check('extractJson dengan teks pembuka', extractJson('Ini hasilnya: {"a":3} semoga membantu').a === 3);
let threw = false;
try {
  extractJson('bukan json sama sekali');
} catch {
  threw = true;
}
check('extractJson throw kalau tidak ada JSON', threw === true);

server.close();
console.log(results.join('\n'));