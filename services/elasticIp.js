import AWS from 'aws-sdk';

export async function getElasticIpData(region) {
  AWS.config.update({ region });
  const ec2 = new AWS.EC2();

  return new Promise((resolve, reject) => {
    ec2.describeAddresses({}, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      let eipData = [];
      data.Addresses.forEach((eip) => {
        eipData.push({
          ip: eip.PublicIp,
          instanceId: eip.InstanceId || 'Unattached',
          allocationId: eip.AllocationId,
          associated: eip.InstanceId ? 'Attached' : 'Unattached',
        });
      });

      resolve(eipData);
    });
  });
}
