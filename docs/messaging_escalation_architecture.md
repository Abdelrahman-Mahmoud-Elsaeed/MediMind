# MediMind — Messaging & Worker Escalation Architecture

## Overview

In the MediMind platform, the **Worker Service** continuously evaluates patient medication schedules and detects missed doses or delayed administration. When a critical threshold is reached, the Worker triggers an **Escalation Alert** to notify caregivers and healthcare providers.

To ensure high availability, fault tolerance, and zero message loss, the notification subsystem utilizes **AWS SNS**, **AWS SQS**, and an **SQS Dead Letter Queue (`escalation-dlq`)**.

---

## Escalation Event Flow

```
 ┌─────────────────────────────────────────────────────────┐
 │                     Worker Service                      │
 │    (Monitors schedules & evaluates missed doses)       │
 └────────────────────────────┬────────────────────────────┘
                              │
                              │ 1. Worker detects missed dose & publishes event
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   AWS SNS Topic                         │
 │      (medtrack-development-escalation-topic)            │
 └────────────────────────────┬────────────────────────────┘
                              │
                              │ 2. Fan-out subscription to SQS
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                  AWS SQS Escalation Queue               │
 │      (medtrack-development-escalation-queue)            │
 └────────────────────────────┬────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    [DELIVERY SUCCESS]              [DELIVERY FAILURE]
  Alert sent to Caregiver        Worker retries up to 3x
  via SMS / Push / Email          (maxReceiveCount = 3)
                                              │
                                              ▼
                                ┌───────────────────────────┐
                                │ AWS SQS Dead Letter Queue │
                                │ (escalation-dlq)          │
                                └───────────────────────────┘
                                  Holds un-delivered alerts
                                  for admin inspection & audit
```

---

## Component Roles & Responsibilities

### 1. Worker Service (Event Trigger)
* **Function**: Runs background loops to track patient dose compliance.
* **Action**: When a patient misses a dose beyond the grace period, the Worker constructs an escalation payload (Patient ID, Medication ID, Missed Time, Contact Info) and publishes it to the SNS Topic (`AWS_SNS_TOPIC_ARN`).

### 2. AWS SNS Topic (`medtrack-development-escalation-topic`)
* **Function**: Pub/Sub notification hub.
* **Action**: Receives incoming escalation events from the Worker and broadcasts them to subscribed queues.

### 3. AWS SQS Primary Queue (`medtrack-development-escalation-queue`)
* **Function**: Buffers escalation notification tasks for asynchronous processing.
* **Configuration**:
  * `delay_seconds = 900` (15-minute delay buffer)
  * `visibility_timeout_seconds = 1800` (30 minutes)
  * `message_retention_seconds = 86400` (24 hours)

### 4. AWS SQS Dead Letter Queue (`medtrack-development-escalation-dlq`)
* **Function**: Isolates unprocessable or un-deliverable emergency notifications.
* **Why it is critical**:
  * **Prevents Infinite Retry Loops**: If a notification fails 3 times (e.g. invalid phone number, carrier network outage, SMS API rate limit), AWS automatically moves the message into `escalation-dlq`.
  * **Unblocks the Primary Queue**: Prevents corrupted or failing messages from stalling subsequent patient alerts.
  * **Guarantees Zero Data Loss**: Retains failed messages for up to 14 days so administrators can inspect, fix, and redrive critical missed-dose alerts manually or via automated recovery scripts.

---

## Infrastructure as Code (Terraform Definition)

```hcl
resource "aws_sns_topic" "escalation_topic" {
  name = "${var.project_name}-${var.environment}-escalation-topic"
}

resource "aws_sqs_queue" "escalation_queue" {
  name                       = "${var.project_name}-${var.environment}-escalation-queue"
  delay_seconds              = 900
  visibility_timeout_seconds = 1800
  message_retention_seconds  = 86400

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.escalation_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "escalation_dlq" {
  name = "${var.project_name}-${var.environment}-escalation-dlq"
}

resource "aws_sns_topic_subscription" "sqs_subscription" {
  topic_arn = aws_sns_topic.escalation_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.escalation_queue.arn
}
```
