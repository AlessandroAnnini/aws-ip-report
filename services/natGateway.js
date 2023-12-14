import AWS from 'aws-sdk';

export async function getNatGatewayData(region) {
  AWS.config.update({ region });
  const ec2 = new AWS.EC2();

  return new Promise((resolve, reject) => {
    ec2.describeNatGateways({}, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      let natData = [];
      data.NatGateways.forEach((nat) => {
        // NAT Gateway can have one or more Elastic IPs associated with it.
        const eipAddresses = nat.NatGatewayAddresses.map(
          (addr) => addr.PublicIp
        ).filter((ip) => ip);

        natData.push({
          natGatewayId: nat.NatGatewayId,
          state: nat.State,
          eipAddresses: eipAddresses.join(', '),
        });
      });

      resolve(natData);
    });
  });
}
