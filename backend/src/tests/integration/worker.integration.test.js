// tests/integration/worker.integration.test.js
const { Queue, Worker } = require('bullmq');
const { redisConnectionOptions, QUEUE_NAMES } = require('../../config/worker');

describe('End-to-End Async Worker Pipeline Cross-Integration', () => {
  let productionQueue;
  let simulatedWorker;

  beforeAll(() => {
    productionQueue = new Queue(QUEUE_NAMES.NOTIFICATION_ESCALATION, {
      connection: redisConnectionOptions
    });
  });

  afterAll(async () => {
    await productionQueue.close();
    if (simulatedWorker) {
      await simulatedWorker.close();
    }
  });

  it('should pass job packets seamlessly from API layer down through worker event cycles', (done) => {
    const uniqueUserId = 'user_integration_test_999';
    
    simulatedWorker = new Worker(
      QUEUE_NAMES.NOTIFICATION_ESCALATION,
      async (job) => {
        try {
          expect(job.name).toEqual('escalateMissedDose');
          expect(job.data.userId).toEqual(uniqueUserId);
          
          done();
        } catch (error) {
          done(error);
        }
      },
      { connection: redisConnectionOptions }
    );

    productionQueue.add('escalateMissedDose', { userId: uniqueUserId })
      .catch((err) => done(err));
  });
});