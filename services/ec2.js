import AWS from 'aws-sdk';

export async function getEc2Data(region) {
  AWS.config.update({ region });
  const ec2 = new AWS.EC2();

  return new Promise((resolve, reject) => {
    ec2.describeInstances({}, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      let ec2Data = [];
      data.Reservations.forEach((reservation) => {
        reservation.Instances.forEach((instance) => {
          // Extract security group names
          const securityGroups = instance.SecurityGroups.map(
            (sg) => sg.GroupName
          ).join(', ');

          const nameTag = instance.Tags.find((tag) => tag.Key === 'Name');
          const instanceName = nameTag ? nameTag.Value : 'Unnamed Instance';

          ec2Data.push({
            name: instanceName,
            InstanceId: instance.InstanceId,
            publicIp: instance.PublicIpAddress || 'None',
            privateIp: instance.PrivateIpAddress,
            isPublic: !!instance.PublicIpAddress,
            securityGroups: securityGroups,
          });
        });
      });

      resolve(ec2Data);
    });
  });
}
