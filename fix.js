const fs = require('fs');
let content = fs.readFileSync('build_phase4.js', 'utf8');

// Replace \"SELECT with \\\"SELECT
content = content.replace(/\\"SELECT/g, '\\\\\\"SELECT');

// Replace ;\" with ;\\\"
content = content.replace(/;\\"/g, ';\\\\\\"');

// Replace [PID]);\" with [PID]);\\\"
content = content.replace(/\[PID\]\);\\"/g, '[PID]);\\\\\\"');

// Replace 'idle';\" with 'idle';\\\"
content = content.replace(/'idle';\\"/g, "'idle';\\\\\\\"");

fs.writeFileSync('build_phase4.js', content);
console.log('Fixed quotes in build_phase4.js');
