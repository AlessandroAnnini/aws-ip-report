import fs from 'node:fs';
import { mdToPdf } from 'md-to-pdf';
import xl from 'excel4node';
import {
  getApiGatewayData,
  getEc2Data,
  getEksData,
  getElasticBeanstalkData,
  getElasticIpData,
  getLoadBalancerData,
  getNatGatewayData,
  getRdsData,
  getSubnetData,
  getVpcData,
} from './services/index.js';

const awsRegion = 'eu-central-1';

let report = `# AWS IPv4

The application lists resources and their public IPs (if applicable). It does not determine active usage of IPs.

- [AWS IPv4](#aws-ipv4)
  - [API Gateway (all public)](#api-gateway-all-public)
  - [EC2](#ec2)
  - [EKS](#eks)
  - [Elastic Beanstalk](#elastic-beanstalk)
  - [Elastic IPs (all public)](#elastic-ips-all-public)
  - [Load Balancers](#load-balancers)
  - [NAT Gateways](#nat-gateways)
  - [RDS](#rds)
  - [Subnets](#subnets)
  - [VPC](#vpc)\n\n`;

function jsonToMarkdownTable(json) {
  // Check if json is an array and is not empty
  if (!Array.isArray(json) || json.length === 0) {
    return 'No data available to display in the table.';
  }

  // Extract keys from the first object in the json array
  const keys = Object.keys(json[0]);
  if (keys.length === 0) {
    return 'Data objects do not have any keys.';
  }

  let table = `| ${keys.join(' | ')} |\n`;
  table += `| ${keys.map(() => '---').join(' | ')} |\n`;

  json.forEach((item) => {
    const values = Object.values(item);
    table += `| ${values.join(' | ')} |\n`;
  });

  return table;
}

function appendToReport(sectionTitle, data) {
  report += `## ${sectionTitle}\n`;
  report += jsonToMarkdownTable(data);
  report += '\n';
}

async function generateExcelReport(dataMap) {
  const wb = new xl.Workbook();
  const options = {
    sheetFormat: {
      defaultColWidth: 30,
    },
  };

  for (const [serviceName, data] of Object.entries(dataMap)) {
    const ws = wb.addWorksheet(serviceName, options);
    if (!data.length) continue;

    // Headers
    const headers = Object.keys(data[0]);
    headers.forEach((header, index) => {
      ws.cell(1, index + 1).string(header);
    });

    // Data Rows
    data.forEach((item, rowIdx) => {
      Object.values(item).forEach((value, colIdx) => {
        ws.cell(rowIdx + 2, colIdx + 1).string(value.toString());
      });
    });
  }

  wb.write('./output/aws-ip-report.xlsx');
}

async function generateReport() {
  try {
    console.log('API Gateway');
    const apiGatewayData = await getApiGatewayData(awsRegion);
    appendToReport('API Gateway (all public)', apiGatewayData);

    console.log('EC2');
    const ec2Data = await getEc2Data(awsRegion);
    appendToReport('EC2', ec2Data);

    console.log('EKS');
    const eksData = await getEksData(awsRegion);
    appendToReport('EKS', eksData);

    console.log('Elastic Beanstalk');
    const elasticBeanstalkData = await getElasticBeanstalkData(awsRegion);
    appendToReport('Elastic Beanstalk', elasticBeanstalkData);

    console.log('Elastic IPs');
    const elasticIpsData = await getElasticIpData(awsRegion);
    appendToReport('Elastic IPs (all public)', elasticIpsData);

    console.log('Load Balancers (internetFacing == isPublic)');
    const loadBalancerData = await getLoadBalancerData(awsRegion);
    appendToReport('Load Balancers', loadBalancerData);

    console.log('NAT Gateways (all public)');
    const natGatewayData = await getNatGatewayData(awsRegion);
    appendToReport('NAT Gateways', natGatewayData);

    console.log('RDS');
    const rdsData = await getRdsData(awsRegion);
    appendToReport('RDS', rdsData);

    console.log('Subnets');
    const subnetData = await getSubnetData(awsRegion);
    appendToReport('Subnets', subnetData);

    console.log('VPC');
    const vpcData = await getVpcData(awsRegion);
    appendToReport('VPC', vpcData);

    // create output directory if it doesn't exist
    if (!fs.existsSync('./output')) {
      fs.mkdirSync('./output');
    }

    console.log('Writing reporto to markdown file...');
    fs.writeFileSync('./output/aws-ip-report.md', report);

    console.log('Writing report to pdf file...');
    const pdfOptions = {
      dest: './output/aws-ip-report.pdf',
      pdf_options: { landscape: true, format: 'A4' },
    };
    await mdToPdf({ content: report }, pdfOptions);

    // Create Excel Report
    console.log('Writing report to Excel file...');
    const dataMap = {
      'API Gateway (all public)': apiGatewayData,
      EC2: ec2Data,
      EKS: eksData,
      'Elastic Beanstalk': elasticBeanstalkData,
      'Elastic IPs (all public)': elasticIpsData,
      'Load Balancers': loadBalancerData,
      'NAT Gateways': natGatewayData,
      RDS: rdsData,
      Subnets: subnetData,
      VPC: vpcData,
    };
    await generateExcelReport(dataMap);

    console.log('Report generated successfully!');
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

generateReport();
