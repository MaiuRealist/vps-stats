const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Função para contar pacotes instalados em Debian
async function getPackageCount() {
    return new Promise((resolve) => {
        exec('dpkg --get-selections | wc -l', (err, stdout) => {
            if (err) return resolve(null);
            const n = parseInt(stdout.trim(), 10);
            resolve(Number.isNaN(n) ? null : n);
        });
    });
}

// Função para formatar uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hrs = Math.floor(seconds / 3600);
    seconds %= 3600;
    const mins = Math.floor(seconds / 60);
    return `${days}d ${hrs}h ${mins}m`;
}

// Endpoint principal
app.get('/api/stats', async (req, res) => {
    try {
        const [load, mem, fsSize] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize()
        ]);

        const rootFs = fsSize.find(f => f.mount === '/') || null;

        const stats = {
            load: load.currentload.toFixed(2), // %
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
                use: rootFs.use // %
            } : null,
            packages: await getPackageCount(),
            uptime: formatUptime(process.uptime()),
            timestamp: Date.now()
        };

        res.json(stats);
    } catch (err) {
        console.error('error /api/stats', err);
        res.status(500).json({ error: 'failed to collect stats' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`VPS stats API listening on port ${PORT}`);
});
