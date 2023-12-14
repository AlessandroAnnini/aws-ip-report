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
          // Check if the instance has a public IP address
          if (instance.PublicIpAddress) {
            // Find the name tag
            const nameTag = instance.Tags.find((tag) => tag.Key === 'Name');
            const instanceName = nameTag ? nameTag.Value : 'Unnamed Instance';

            ec2Data.push({
              name: instanceName, // Adding the instance name
              ip: instance.PublicIpAddress,
              resourceName: instance.InstanceId,
            });
          }
        });
      });

      resolve(ec2Data);
    });
  });
}
