const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Função para contar pacotes Debian/Ubuntu
async function getPackageCount() {
  return new Promise((resolve) => {
    exec('dpkg --get-selections | wc -l', (err, stdout) => {
      if (err) {
        console.error('Erro dpkg:', err);
        return resolve(null);
      }
      const n = parseInt(stdout.trim(), 10);
      if (Number.isNaN(n)) return resolve(null);
      resolve(n);
    });
  });
}

// Formata uptime em dias, horas e minutos
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hrs = Math.floor(seconds / 3600);
  seconds %= 3600;
  const mins = Math.floor(seconds / 60);
  return `${days}d ${hrs}h ${mins}m`;
}

// Endpoint principal da API
app.get('/api/stats', async (req, res) => {
  try {
    const loadData = await si.currentLoad().catch(err => {
      console.error('Erro CPU load:', err);
      return null;
    });

    const memData = await si.mem().catch(err => {
      console.error('Erro RAM:', err);
      return null;
    });

    const fsData = await si.fsSize().catch(err => {
      console.error('Erro Disk:', err);
      return [];
    });

    const packages = await getPackageCount().catch(err => {
      console.error('Erro Packages:', err);
      return null;
    });

    res.json({
      load: loadData ? loadData.currentload : null,
      ram: memData ? {
        total: memData.total,
        used: memData.used,
        free: memData.free
      } : null,
      disk: fsData.length ? {
        fs: fsData[0].fs,
        mount: fsData[0].mount,
        size: fsData[0].size,
        used: fsData[0].used,
        use: fsData[0].use
      } : null,
      packages,
      uptime: formatUptime(process.uptime()),
      timestamp: Date.now()
    });
  } catch (err) {
    console.error('Erro /api/stats:', err);
    res.status(500).json({ error: 'failed to collect stats' });
  }
});

app.listen(PORT, () => {
  console.log(`VPS stats API listening on port ${PORT}`);
});
