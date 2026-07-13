const test = require('node:test');
const assert = require('node:assert/strict');

const { createWorkerApp, startWorker } = require('../worker');

test('worker health state is reported correctly', async () => {
  const workerApp = createWorkerApp();

  assert.equal(workerApp.status, 'ready');
  assert.equal(workerApp.service, 'worker');
  assert.ok(Array.isArray(workerApp.components));
});

test('worker bootstrap serves a health endpoint', async () => {
  const worker = await startWorker({ port: 0, host: '127.0.0.1' });

  try {
    const response = await fetch(`http://127.0.0.1:${worker.port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ready');
    assert.equal(body.service, 'worker');
  } finally {
    await new Promise((resolve, reject) => worker.server.close((error) => (error ? reject(error) : resolve())));
  }
});
