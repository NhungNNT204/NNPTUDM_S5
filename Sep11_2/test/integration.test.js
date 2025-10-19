const axios = require('axios');

const base = 'http://localhost:3000';

async function waitServer(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await axios.head(url);
      return true;
    } catch (err) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return false;
}

async function run() {
  if (!await waitServer(base + '/posts')) {
    console.error('json-server did not start in time. Start it with `npm run start` in another terminal.');
    process.exit(2);
  }

  try {
    // 1) create
    const createResp = await axios.post(base + '/posts', { title: 'int-test-node', views: 1, isDelete: false });
    console.log('Created:', createResp.data);
    const id = createResp.data.id;
    if (!id) throw new Error('No id returned from create');

    // 2) confirm exists
    const all = (await axios.get(base + '/posts')).data;
    const found = all.find(p => p.title === 'int-test-node');
    if (!found) throw new Error('Created post not found');

    // 3) soft-delete
    const obj = Object.assign({}, found, { isDelete: true });
    await axios.put(base + '/posts/' + id, obj);
    console.log('Soft-deleted id=' + id);

    // 4) confirm in trash
    const all2 = (await axios.get(base + '/posts')).data;
    const trash = all2.find(p => p.id === id && p.isDelete === true);
    if (!trash) throw new Error('Delete not persisted');
    console.log('Confirmed in trash');

    // 5) restore
    const restoredObj = Object.assign({}, trash, { isDelete: false });
    await axios.put(base + '/posts/' + id, restoredObj);
    console.log('Restored id=' + id);

    // 6) confirm restored
    const all3 = (await axios.get(base + '/posts')).data;
    const restored = all3.find(p => p.id === id && (p.isDelete === false || p.isDelete === undefined));
    if (!restored) throw new Error('Restore failed');
    console.log('Integration test passed');

    // cleanup: remove the created post
    try {
      await axios.delete(base + '/posts/' + id);
    } catch (err) {
      // json-server may not allow delete if we rely on soft-delete model; ignore cleanup errors
    }

    process.exit(0);
  } catch (err) {
    console.error('Integration test failed:', err.message || err);
    process.exit(1);
  }
}

run();
