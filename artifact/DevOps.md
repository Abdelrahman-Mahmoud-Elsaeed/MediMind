# DevOps, Deployment & CI/CD Architecture (Artifact 5)

**Project Title:** Intelligent Medication Management Platform  
**Phase:** Phase 4 (Artifact 5)  
**Target Audience:** DevOps Engineers, Backend Developers, Tech Leads  

---

## 1. Containerization Strategy (Docker & Compose)

The entire stack will be containerized using Docker to ensure environment consistency across local development, staging, and production. 

### 1.1 Service Architecture (docker-compose)
For local development and single-node staging, we use Docker Compose to orchestrate the services. Notice the separation of the `api` and the `worker`—this ensures heavy background tasks (like generating medication schedules) don't slow down the main API serving the user.

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "${PORT:-8080}:${PORT:-8080}"
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - PORT=${PORT:-8080}
      - MONGO_URI=${MONGO_URI}
      - REDIS_URL=redis://redis:6379
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - COOKIE_SECRET=${COOKIE_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME}
    depends_on:
      - mongodb
      - redis

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - MONGO_URI=${MONGO_URI}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

*(Note: MongoDB is intentionally excluded from the Compose file as we will use a managed cloud database like MongoDB Atlas for high availability).*

---

## 2. CI/CD Pipeline Architecture

We will implement a robust Continuous Integration and Continuous Deployment (CI/CD) pipeline (e.g., using GitHub Actions or GitLab CI) triggered automatically on git pushes and pull requests.

### 2.1 Continuous Integration (CI) - Runs on Every PR

1. **Code Checkout & Setup:** Pull the repository and set up Node.js/Frontend environments.
2. **Linting & Formatting:** Run ESLint and Prettier to ensure code quality standards.
3. **Security Audits:** Run `npm audit` and static application security testing (SAST) tools to catch vulnerabilities in dependencies.
4. **Unit & Integration Testing:** Execute Jest/Mocha test suites. The pipeline strictly fails if tests do not pass or if code coverage drops below 80%.

### 2.2 Continuous Deployment (CD) - Runs on Merge to `main`

1. **Build Docker Images:** Build the `api`, `worker`, and `frontend` Docker images.
2. **Tag & Push:** Tag the images with the git commit hash and push them to a Container Registry (e.g., AWS ECR, Docker Hub).
3. **Deploy to Staging/Production:**
* **Frontend:** Build the static assets and deploy to a CDN/Hosting provider (Vercel, AWS S3 + CloudFront).
* **Backend:** Trigger a rolling update to the cloud hosting environment (e.g., AWS ECS, DigitalOcean App Platform, or Kubernetes), pulling the latest Docker images.
* **Database Migrations:** Run any necessary database scripts safely before the new API pods accept traffic.



---

## 3. Cloud Infrastructure & Hosting

To ensure scalability and HIPAA/GDPR compliance, the production infrastructure is distributed across specialized managed services.

* **Frontend Hosting:** Vercel or AWS Amplify (provides global CDN distribution, edge caching, and automatic SSL).
* **Compute (API & Workers):** AWS ECS (Elastic Container Service) with Fargate or DigitalOcean App Platform. This allows the API and Workers to auto-scale independently based on CPU/Memory load.
* **Database:** **MongoDB Atlas (Dedicated Cluster)**. Provides out-of-the-box automated backups, point-in-time recovery, and at-rest encryption (AES-256) required for medical data.
* **Object Storage:** AWS S3 for storing uploaded medication images (from the `/uploads/image` endpoint). Bucket configured with block public access (serving images via CloudFront CDN).
* **Reverse Proxy / Load Balancer:** An Application Load Balancer (ALB) or Nginx ingress routes traffic to healthy backend containers and terminates HTTPS (SSL/TLS).

---

## 4. Observability: Monitoring & Logging

Given the critical nature of a medication adherence platform, proactive monitoring is required.

* **Application Performance Monitoring (APM):** Datadog or New Relic integrated into the Node.js API to monitor endpoint latency (especially the database-heavy `/doses` queries).
* **Error Tracking:** Sentry.io integrated into both the Frontend and Backend to capture unhandled exceptions in real-time and alert the engineering team via Slack.
* **Centralized Logging:** Winston/Morgan (Node.js loggers) formatting logs as JSON, forwarded to a centralized log aggregator (ELK Stack - Elasticsearch, Logstash, Kibana, or AWS CloudWatch). **Crucial:** Logs must be scrubbed of any Personally Identifiable Information (PII) before leaving the container.
* **Uptime Monitoring:** UptimeRobot or Pingdom checking the `/api/v1/health` endpoint every 1 minute to alert on system outages.
