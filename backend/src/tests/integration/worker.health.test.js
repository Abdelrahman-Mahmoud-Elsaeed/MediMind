// src/tests/integration/worker.health.test.js
const { Queue } = require('bullmq');
const { redisConnectionOptions, QUEUE_NAMES } = require('../../config/worker');

describe('BullMQ / Redis Infrastructure Connectivity Check', () => {
  let testQueue;

  beforeAll(() => {
    testQueue = new Queue(QUEUE_NAMES.MEDICATION_SCHEDULER, {
      connection: redisConnectionOptions
    });
  });

  afterAll(async () => {
    await testQueue.close();
  });

  it('should verify communication with active Redis storage layer instance', async () => {
    const client = await testQueue.client;
    const pingResponse = await client.ping();
    expect(pingResponse).toEqual('PONG');
  });

  it('should safely append task records into scheduler channel without failure', async () => {
    const jobName = 'isolatedTestPingJob'; 
    const fakeData = { payload: 'system_test_ping' };

    const job = await testQueue.add(jobName, fakeData, { 
      removeOnComplete: true,
      removeOnFail: true 
    });
    
    expect(job).toHaveProperty('id');
    expect(job.name).toEqual(jobName);
    expect(job.data.payload).toEqual('system_test_ping');
  });
});