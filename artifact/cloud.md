
# MedTrack Backend Development Context

This document outlines the cloud infrastructure layout, active AWS services, and environment integrations managed by our Terraform setup. Use this as your architectural anchor when writing backend code.

---

## 1. Core Architecture Overview

Our backend runs on **AWS ECS Fargate** (serverless containers) inside a highly secure, private-facing multi-Availability Zone (AZ) network. 


```

[ Public Traffic ] ---> [ Internet Gateway ] ---> [ Application Load Balancer (ALB) ]
| (HTTP:80)
v
[ Private Subnets ] <----------------------------- [ ECS Fargate Tasks ]
|
+------------------+-----------------------+-------------------+
| (TLS:27017)      | (HTTPS:443)           | (HTTPS:443)       | (HTTPS:443)
v                  v                       v                   v
[ DocumentDB ]       [ S3 Bucket ]          [ SQS / SNS ]     [ Secrets Manager ]

```

---

## 2. Environment Variables & Secret Management

Your Fargate containers are configured to automatically fetch configurations at boot. 
* **Standard Settings:** Passed down as classic environment variables.
* **Secrets & Credentials:** Injected securely via **AWS Secrets Manager**. You **do not** need to bundle `.env` files inside your Docker image.

At runtime, AWS Fargate will automatically populate the `DB_CREDS` environment variable:

| Environment Variable | Description / Source | Format / Structure |
| :--- | :--- | :--- |
| `DB_CREDS` | Injected securely from Secrets Manager | A JSON string containing keys: `username`, `password` |

###  Local Development vs. Production Integration Pattern
Write your backend config file to extract credentials dynamically.

```javascript
// Example (Node.js)
const dbCredsRaw = process.env.DB_CREDS;
let dbUser, dbPass;

if (dbCredsRaw) {
  // Production: Parse injected JSON from AWS Secrets Manager
  const creds = JSON.parse(dbCredsRaw);
  dbUser = creds.username;
  dbPass = creds.password;
} else {
  // Local development: Fallback to local process environment variables
  dbUser = process.env.LOCAL_DB_USER || "admin";
  dbPass = process.env.LOCAL_DB_PASS || "supersecret";
}

```

---

## 3. Storage & Infrastructure Access Guide

Here is how your backend code should interact with each AWS service.

### Database: Amazon DocumentDB (MongoDB Compatible)

* **Encryption Requirement:** DocumentDB strictly enforces **TLS/SSL** by default.
* **Connection String:**
```
mongodb://<username>:<password>@<docdb_endpoint>:27017/?ssl=true&ssl_ca_certs=rds-global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred

```


* **Development action item:** Download the global RDS certificate authority bundle (`rds-global-bundle.pem`) and package it with your app codebase so your MongoDB driver can validate the DocumentDB TLS certificates.

###  Storage: Amazon S3

* **What's accessible:** An isolated, secure S3 bucket.
* **IAM Permissions:** The container's IAM Task Role is pre-authorized to `PutObject`, `GetObject`, and `DeleteObject` inside your application bucket.
* **Implementation:** Use the AWS SDK of your programming language of choice. Since IAM roles are automatically assigned to Fargate containers, **you do not need AWS Access Keys or Secret Keys** in your code (the SDK automatically discovers the container credentials).

###  Messaging: SNS + SQS

* **SNS Topics:** Used for broadcasting transactional events or system notifications.
* **SQS Queues:** Used for processing heavy, asynchronous background tasks (such as PDF generation, image processing, or bulk operations).
* **IAM Permissions:** The backend container is fully authorized to publish messages to SNS and pull/delete messages from SQS.

