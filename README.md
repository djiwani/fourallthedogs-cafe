# Four All The Dogs Café

Live: [cafe.fourallthedogs.com](https://cafe.fourallthedogs.com)

A fully serverless coffee ordering platform built on AWS — named after four large dogs: Kilo, Mocha, Ahri, and Sake. Built as the first project in a three-project AWS portfolio, intentionally scoped to serverless to demonstrate that VPC complexity is only justified when the workload demands it.

---

## Architecture

```
                    ┌─────────────────────┐
                    │     CloudFront      │
                    │  (CDN + HTTPS + WAF)│
                    └──────────┬──────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
        ┌──────▼──────┐               ┌────────▼────────┐
        │  S3 (Static │               │   API Gateway   │
        │   Frontend) │               │  (HTTP API)     │
        └─────────────┘               └────────┬────────┘
                                               │
                                  ┌────────────┴────────────┐
                                  │                         │
                           ┌──────▼──────┐         ┌───────▼──────┐
                           │   Lambda    │         │   Lambda     │
                           │ (Place      │         │ (Get Orders) │
                           │  Order)     │         │              │
                           └──────┬──────┘         └──────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
             ┌──────▼──────┐           ┌────────▼──────┐
             │   DynamoDB  │           │     SNS       │
             │  (Orders)   │           │  (Email       │
             └─────────────┘           │  Notification)│
                                       └───────────────┘

Auth Layer:
  Guest ordering  → Cognito Identity Pool (IAM SigV4 signed requests)
  Admin dashboard → Cognito User Pool (JWT authorization)
```

---

## Key Design Decision — No VPC

This project runs entirely outside a VPC. Lambda, API Gateway, DynamoDB, Cognito, SNS, S3, and CloudFront are all AWS-managed services that communicate over the AWS service network without requiring private networking.

Choosing serverless here was deliberate: the workload is event-driven, stateless, and low-volume. Deploying a VPC would add NAT Gateway cost, subnet management, and security group complexity with zero benefit at this scale.

This decision is contrasted intentionally with OpenCourt (VPC endpoints, no NAT Gateway) and Redline (VPC with NAT Gateway) — three projects, three different networking architectures, each justified by actual requirements.

---

## Auth Model

Two separate authentication mechanisms serve different use cases:

**Guest ordering (Cognito Identity Pool + IAM)**
Customers place orders without creating an account. The Identity Pool issues temporary IAM credentials scoped to the `PlaceOrder` Lambda invoke permission only. Requests are signed with SigV4 using those credentials. No username or password required, and the credentials are scoped to the minimum necessary permission.

**Admin dashboard (Cognito User Pool + JWT)**
Staff authenticate with a username and password through the Cognito hosted UI. The User Pool issues a JWT that API Gateway validates before allowing access to the order retrieval endpoint. Completely separate auth flow from guest ordering.

---

## Tech Stack

**Frontend**
- Vanilla HTML, CSS, JavaScript
- AWS SDK for JavaScript (SigV4 signing for IAM-authorized requests)
- Amazon Cognito Identity SDK

**Backend**
- AWS Lambda (Node.js) — order processing and retrieval
- Amazon API Gateway (HTTP API) — IAM authorization for orders, JWT authorization for admin
- Amazon DynamoDB — order storage with timestamp-based sorting
- Amazon SNS — email notification on every new order

**Infrastructure**
- Amazon S3 — static frontend hosting
- Amazon CloudFront — global CDN, HTTPS enforcement, WAF
- Amazon Cognito — User Pool (admin) and Identity Pool (guest)
- Terraform — all infrastructure as code in [coffee-terraform](https://github.com/djiwani/coffee-terraform)

---

## CI/CD

GitHub Actions deploys on every push to `main`:

1. Syncs all files to the S3 bucket
2. Invalidates the CloudFront cache

Changes are live in approximately 15 seconds.

---

## Related Repositories

- [coffee-terraform](https://github.com/djiwani/coffee-terraform) — Terraform infrastructure
- [opencourt-terraform](https://github.com/djiwani/opencourt-terraform) — Next project: VPC endpoints, ECS Fargate, Aurora Serverless
- [redline-terraform](https://github.com/djiwani/redline-terraform) — Final project: EKS, multi-service, full modular Terraform
