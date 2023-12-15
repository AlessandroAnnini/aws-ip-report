# AWS IP Report

## Overview

This Node.js application generates a report of AWS resources and their associated public IPv4 addresses executing dns lookups to determine the public IP addresses when necessary. The report is generated as a markdown file and a pdf file in the `output` directory. The report is organized by resource type.

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
