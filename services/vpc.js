import AWS from 'aws-sdk';

export async function getVpcData(region) {
  AWS.config.update({ region });
  const ec2 = new AWS.EC2();

  return new Promise((resolve, reject) => {
    ec2.describeVpcs({}, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      let vpcData = [];
      data.Vpcs.forEach((vpc) => {
        const tags = vpc.Tags.reduce((acc, tag) => {
          acc[tag.Key] = tag.Value;
          return acc;
        }, {});

        vpcData.push({
          vpcId: vpc.VpcId,
          state: vpc.State,
          cidrBlock: vpc.CidrBlock,
          tags: JSON.stringify(tags),
        });
      });

      resolve(vpcData);
    });
  });
}
