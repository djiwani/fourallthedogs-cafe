# Four All The Dogs Café

Live site: [cafe.fourallthedogs.com](https://cafe.fourallthedogs.com)

A serverless coffee ordering platform built on AWS, named after our four dogs — Kilo, Mocha, Ahri, and Sake.

## Overview

This repository contains the frontend for the Four All The Dogs Café ordering system. Customers can browse the menu, place orders, and receive confirmation — all backed by a fully serverless AWS architecture.

An admin dashboard allows authenticated staff to view all incoming orders in real time.

## Features

- Browse the menu and place orders with drink, temperature, size, and extras
- AWS IAM signed requests via Cognito Identity Pool — secure ordering without requiring a login
- Admin dashboard protected by Cognito User Pool JWT authentication
- Real-time order visibility with timestamps and order details
- Fully responsive design

## Tech Stack

**Frontend**
- Vanilla HTML, CSS, JavaScript
- AWS SDK for JavaScript (Signature Version 4 request signing)
- Amazon Cognito Identity SDK

**Backend & Infrastructure**
- AWS Lambda — order processing and retrieval
- Amazon API Gateway — HTTP API with IAM and JWT authorization
- Amazon DynamoDB — order storage
- Amazon Cognito — admin auth (User Pool) and guest auth (Identity Pool)
- Amazon SNS — real-time email notifications on new orders
- Amazon S3 — static frontend hosting
- Amazon CloudFront — global CDN with HTTPS enforcement and WAF
- Infrastructure provisioned via Terraform → [coffee-terraform](https://github.com/djiwani/coffee-terraform)

## CI/CD

This repo uses GitHub Actions to automatically deploy on every push to `main`:

1. Syncs all files to S3
2. Invalidates CloudFront cache

Changes are live within ~15 seconds of pushing.

## Related

- Infrastructure repo: [djiwani/coffee-terraform](https://github.com/djiwani/coffee-terraform)