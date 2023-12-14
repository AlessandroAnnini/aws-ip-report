import fs from 'node:fs';
import { mdToPdf } from 'md-to-pdf';
import {
  getApiGatewayData,
  getEc2Data,
  getElasticIpData,
  getEksData,
  getElasticBeanstalkData,
  getLoadBalancerData,
  getNatGatewayData,
  getRdsData,
} from './services/index.js';

const awsRegion = 'eu-central-1';

let report =
  '# AWS IPv4\n\nThe application lists resources and their public IPs (if applicable). It does not determine active usage of IPs.\n\n';

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

// Append data to the report
function appendToReport(sectionTitle, data) {
  report += `## ${sectionTitle}\n`;
  report += jsonToMarkdownTable(data);
  report += '\n';
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
    console.log('Report generated successfully!');
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

generateReport();
