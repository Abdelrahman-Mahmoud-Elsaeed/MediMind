# Test-Driven Development (TDD) Engineering Guidelines

**Project Title:** Intelligent Medication Management Platform  
**Phase:** Phase 4 (Artifact 6)  
**Target Audience:** Development Team, QA Engineers, Tech Leads  

---

## 1. The TDD Mandate & Philosophy

Because this platform dictates patient medication schedules, a single logical error could result in an adverse health event. Therefore, the engineering team operates strictly under a **Test-First** methodology for all core backend utilities, APIs, and critical frontend state management.

Engineers must follow the **Red-Green-Refactor** cycle:
1. **Red (Write Test):** Define the required behavior in a test before writing production code. The test must fail.
2. **Green (Write Code):** Write the simplest, minimum amount of code to make the test pass.
3. **Refactor (Optimize):** Clean up the code, optimize performance, and remove duplication while ensuring the test remains green.

---

## 2. Unit Testing Standards (Logic & Utilities)

All standalone business logic (e.g., schedule generation, inventory deduction math, token validation) must be tested in total isolation using **Jest**.

### Example: Schedule Generator Standard
Before implementing the utility to generate `timesOfDay`, an engineer must commit the following test:

```javascript
// __tests__/utils/scheduleGenerator.test.js
const { generateTimesOfDay } = require('../../utils/scheduleGenerator');

describe('generateTimesOfDay()', () => {
  it('should generate evenly spaced times based on dosesPerDay', () => {
    const result = generateTimesOfDay(3, '08:00');
    expect(result).toEqual(['08:00', '16:00', '00:00']);
  });

  it('should throw a Validation Error if doses exceed 24', () => {
    expect(() => generateTimesOfDay(25, '08:00')).toThrow('Cannot exceed 24 doses per day');
  });
});

```

---

## 3. API Integration Testing Standards (Supertest)

API endpoints must be tested against an ephemeral, in-memory database (like `mongodb-memory-server` or Testcontainers) to verify HTTP status codes, payload validation, and database writes.

### Example: Medication Creation Endpoint

Before writing the `POST /api/v1/medications` controller logic, the engineer must write a Supertest suite defining the exact API contract.

```javascript
// __tests__/api/medications.test.js
const request = require('supertest');
const app = require('../../app'); // The Express application
const mongoose = require('mongoose');

describe('POST /api/v1/medications', () => {
  let validToken;

  beforeAll(async () => {
    // Setup: Initialize in-memory DB and mock a user login to get a JWT
    validToken = await generateMockPatientToken();
  });

  it('should return 201 Created and the medication object on valid payload', async () => {
    const validPayload = {
      name: "Metformin",
      formType: "TABLET",
      schedule: { frequency: "DAILY", dosesPerDay: 2, firstDoseTime: "08:00", startDate: "2024-07-05T00:00:00Z" },
      // ... other required fields
    };

    const res = await request(app)
      .post('/api/v1/medications')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPayload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toEqual("Metformin");
    expect(res.body.data.schedule.timesOfDay).toEqual(["08:00", "20:00"]); // Verifies the logic hook fired
  });

  it('should return 401 Unauthorized if no Bearer token is provided', async () => {
    const res = await request(app).post('/api/v1/medications').send({});
    expect(res.statusCode).toEqual(401);
  });
});

```

---

## 4. CI/CD Enforcement & Code Coverage

The Continuous Integration (CI) pipeline acts as the final gatekeeper for the Test-First mandate.

1. **Strict Coverage Thresholds:** The CI pipeline will automatically reject any Pull Request (PR) where the code coverage drops below **85%** globally, or below **95%** in the `utils/` and `services/` directories.
2. **No Skipping:** The use of `.skip` or `.only` in Jest test suites is strictly forbidden in committed code and will be blocked by pre-commit Git hooks (e.g., Husky).
3. **Database Isolation:** Tests must not depend on the state left behind by previous tests. Engineers must use `beforeEach` and `afterEach` hooks to clear database collections between test runs to ensure deterministic results.
