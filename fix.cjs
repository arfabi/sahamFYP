const fs = require('fs');
let c = fs.readFileSync('api/generate.ts', 'utf8');
c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('api/generate.ts', c);
