# AWS IP Report

## Overview

This Node.js application generates a report of AWS resources and their associated public IPv4 addresses executing dns lookups to determine the public IP addresses when necessary. The report is generated as a markdown, a pdf and an Excel file in the `output` directory. The report is organized by resource type.

It covers

- API Gateway instances
- EC2 instances
- EKS clusters
- Elastic Beanstalk environments
- Elastic IPs
- Load Balancers (ALB, NLB, CLB)
- NAT Gateway instances
- RDS instances
- Subnets
- VPCs

## Setup

1. **Install Node.js and npm**: Ensure that Node.js and npm are installed on your system.

2. **Install Dependencies**: Run `npm install` in the project directory to install the necessary dependencies.

3. **Configure AWS Credentials**: To allow the application to access your AWS account, you need to set up AWS credentials. Follow these steps:

   - **Option 1: Use AWS CLI**:
     - If not already installed, install the AWS CLI following [these instructions](https://aws.amazon.com/cli/).
     - Configure your AWS credentials by running `aws configure` and entering your access key ID, secret access key, and default region.
   - **Option 2: Manual Configuration**:

     - Create a file named `credentials` in a new directory at `~/.aws/` (UNIX/Linux) or `%UserProfile%\.aws\` (Windows).
     - Add the following content to the file, replacing the placeholders with your actual AWS credentials:

       ```text
       [default]
       aws_access_key_id = YOUR_ACCESS_KEY_ID
       aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
       ```

     - Optionally, specify the default region in a file named `config` in the same `.aws` directory:

       ```text
       [default]
       region = YOUR_DEFAULT_REGION
       ```

4. **Run the Application**: Execute `npm start` to run the application and generate the report in the `output` directory as markdowna and pdf files.

## Note

The application lists resources and their public IPs (if applicable). It does not determine active usage of IPs.

# AWS Networking Report

## Overview

This report provides an overview of the current AWS networking configuration, including details about various services and resources.

---

## API Gateway Instances

List and describe the API Gateway instances, including their types (REST, HTTP, WebSocket), endpoints, and any associated API stages or resources.

---

## EC2 Instances

### Public EC2 Instances

(List of public EC2 instances with details like Instance ID, IP Address, and attached security groups)

### Private EC2 Instances

(List of private EC2 instances with details)

---

## EKS Clusters

Provide details on each EKS cluster, including cluster names, associated node groups, and any relevant networking configurations like VPC and subnet associations.

---

## Elastic Beanstalk Environments

List the Elastic Beanstalk environments, including environment details, associated applications, and environment health status.

---

## Elastic IPs

Enumerate allocated Elastic IPs, their associated resources (if any), and status (whether they are attached or detached).

---

## Load Balancers

### Application Load Balancers (ALB)

(List of ALBs with details)

### Network Load Balancers (NLB)

(List of NLBs with details)

### Classic Load Balancers (CLB)

(List of CLBs with details)

---

## NAT Gateway Instances

Detail each NAT Gateway, including associated VPC, subnet, and the Elastic IPs allocated to them.

---

## RDS Instances

List the RDS instances, including details on instance type, DB engine, and whether they are publicly accessible.

---

## Subnets

Provide a summary of subnets within each VPC, including details like CIDR blocks, associated route tables, and whether they are public or private.

---

## VPCs

List all VPCs along with their CIDR blocks, attached Internet Gateways or NAT Gateways, and any notable configurations.

---

## Summary

Conclude the report with a high-level summary, highlighting any potential concerns or areas for improvement in the current network setup.
