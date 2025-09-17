const loadData = await si.currentLoad().catch(() => null); // se falhar, retorna null
const ramData = await si.mem();
const diskData = await si.fsSize();

res.json({
  load: loadData ? loadData.currentload : null,
  ram: {
    total: ramData.total,
    used: ramData.used,
    free: ramData.free
  },
  disk: diskData && diskData.length ? {
    fs: diskData[0].fs,
    mount: diskData[0].mount,
    size: diskData[0].size,
    used: diskData[0].used,
    use: diskData[0].use
  } : null,
  packages: await getPackageCount(),
  timestamp: Date.now()
});
