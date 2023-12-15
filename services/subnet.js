import AWS from 'aws-sdk';

export async function getSubnetData(region) {
  AWS.config.update({ region });
  const ec2 = new AWS.EC2();

  async function isSubnetPublic(subnetId) {
    const routeTables = await ec2
      .describeRouteTables({
        Filters: [{ Name: 'association.subnet-id', Values: [subnetId] }],
      })
      .promise();

    return routeTables.RouteTables.some((routeTable) =>
      routeTable.Routes.some((route) => route.GatewayId?.startsWith('igw-'))
    );
  }

  return new Promise(async (resolve, reject) => {
    try {
      const data = await ec2.describeSubnets().promise();

      let subnetData = [];
      for (const subnet of data.Subnets) {
        const isPublic = await isSubnetPublic(subnet.SubnetId);

        const tags = subnet.Tags.reduce((acc, tag) => {
          acc[tag.Key] = tag.Value;
          return acc;
        }, {});

        subnetData.push({
          subnetId: subnet.SubnetId,
          vpcId: subnet.VpcId,
          cidrBlock: subnet.CidrBlock,
          availabilityZone: subnet.AvailabilityZone,
          state: subnet.State,
          isPublic,
          tags: JSON.stringify(tags),
        });
      }

      resolve(subnetData);
    } catch (err) {
      reject(err);
    }
  });
}
