const express = require('express');
load: load.currentload, // em %
ram: {
total: mem.total,
used: mem.used,
free: mem.free
},
disk: rootFs ? {
fs: rootFs.fs,
mount: rootFs.mount,
size: rootFs.size,
used: rootFs.used,
use: rootFs.use // porcentagem
} : null,
packages: await getPackageCount(),
timestamp: Date.now()
});
} catch (err) {
console.error('error /api/stats', err);
res.status(500).json({ error: 'failed to collect stats' });
}
});


async function getPackageCount() {
// tentativa simples de contar pacotes instalados em Debian
// se falhar, retorna null
const { exec } = require('child_process');
return new Promise((resolve) => {
exec('dpkg --get-selections | wc -l', (err, stdout) => {
if (err) return resolve(null);
const n = parseInt(stdout.trim(), 10);
if (Number.isNaN(n)) return resolve(null);
resolve(n);
});
});
}


function formatUptime(seconds) {
const days = Math.floor(seconds / 86400);
seconds %= 86400;
const hrs = Math.floor(seconds / 3600);
seconds %= 3600;
const mins = Math.floor(seconds / 60);
return `${days}d ${hrs}h ${mins}m`;
}


app.listen(PORT, () => {
console.log(`VPS stats API listening on port ${PORT}`);
});
