// loadBalancerData.js

import AWS from 'aws-sdk';
import { resolveDnsToIp } from './../utils/index.js';

export async function getLoadBalancerData(region) {
  AWS.config.update({ region });
  const elbv2 = new AWS.ELBv2();
  const elb = new AWS.ELB();

  return new Promise(async (resolve, reject) => {
    try {
      let lbData = [];

      // Fetch ALB and NLB data
      const elbv2Data = await elbv2.describeLoadBalancers().promise();

      for (const lb of elbv2Data.LoadBalancers) {
        let ipAddresses = '';
        if (lb.Scheme === 'internet-facing') {
          ipAddresses = await resolveDnsToIp(lb.DNSName);
        }

        lbData.push({
          type: lb.Type.toUpperCase(),
          dnsName: lb.DNSName,
          resourceName: lb.LoadBalancerName,
          internetFacing: lb.Scheme === 'internet-facing',
          ipAddresses,
        });
      }

      // Fetch Classic Load Balancer data
      const elbData = await elb.describeLoadBalancers().promise();

      for (const lb of elbData.LoadBalancerDescriptions) {
        let ipAddresses = '';
        if (lb.Scheme === 'internet-facing') {
          ipAddresses = await resolveDnsToIp(lb.DNSName);
        }

        lbData.push({
          type: 'CLASSIC',
          dnsName: lb.DNSName,
          resourceName: lb.LoadBalancerName,
          internetFacing: lb.Scheme === 'internet-facing',
          ipAddresses,
        });
      }

      resolve(lbData);
    } catch (err) {
      reject(err);
    }
  });
}
