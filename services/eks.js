import AWS from 'aws-sdk';

export async function getEksData(region) {
  AWS.config.update({ region });

  const eks = new AWS.EKS();
  const autoscaling = new AWS.AutoScaling();
  const ec2 = new AWS.EC2();

  // Function to get public IP data for given EC2 instance IDs
  async function getEc2DataForInstanceIds(instanceIds) {
    return new Promise((resolve, reject) => {
      // Describe EC2 instances using provided instance IDs
      ec2.describeInstances({ InstanceIds: instanceIds }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        let ec2Data = [];
        data.Reservations.forEach((reservation) => {
          reservation.Instances.forEach((instance) => {
            // Include only instances with a public IP address
            if (instance.PublicIpAddress) {
              ec2Data.push({
                instanceId: instance.InstanceId,
                publicIp: instance.PublicIpAddress,
              });
            }
          });
        });

        resolve(ec2Data);
      });
    });
  }

  // Function to get instance IDs for a given EKS node group
  async function getInstanceIdsForNodeGroup(nodegroupName, clusterName) {
    try {
      // Retrieve details of the specified EKS node group
      const nodeGroupResponse = await eks
        .describeNodegroup({ clusterName, nodegroupName })
        .promise();

      // Extract Auto Scaling group names from the node group details
      const autoScalingGroupNames =
        nodeGroupResponse.nodegroup.resources.autoScalingGroups.map(
          (asg) => asg.name
        );

      let instanceIds = [];

      // Loop through Auto Scaling groups to get EC2 instance IDs
      for (const asgName of autoScalingGroupNames) {
        // Describe each Auto Scaling group to get its EC2 instance IDs
        const asgResponse = await autoscaling
          .describeAutoScalingGroups({ AutoScalingGroupNames: [asgName] })
          .promise();
        const ids = asgResponse.AutoScalingGroups[0].Instances.map(
          (instance) => instance.InstanceId
        );
        instanceIds = instanceIds.concat(ids);
      }

      return instanceIds;
    } catch (error) {
      console.error('Error getting instance IDs for node group:', error);
      throw error;
    }
  }

  // Function to list all node groups in a given EKS cluster
  async function listEksNodeGroups(clusterName) {
    const response = await eks.listNodegroups({ clusterName }).promise();
    return response.nodegroups;
  }

  // Function to list all EKS clusters
  async function listEksClusters() {
    const response = await eks.listClusters().promise();
    return response.clusters;
  }

  return new Promise(async (resolve, reject) => {
    try {
      let eksData = [];
      // List all EKS clusters
      const clusters = await listEksClusters();

      // Iterate over each cluster
      for (const clusterName of clusters) {
        // List all node groups for the cluster
        const nodeGroups = await listEksNodeGroups(clusterName);

        // Iterate over each node group
        for (const nodeGroup of nodeGroups) {
          // Get instance IDs for the node group
          const instanceIds = await getInstanceIdsForNodeGroup(
            nodeGroup,
            clusterName
          );
          // Get EC2 data for these instance IDs
          const ec2Data = await getEc2DataForInstanceIds(instanceIds);

          // Add data to the eksData array, including cluster and node group information
          eksData = eksData.concat(
            ec2Data.map((item) => ({
              ip: item.publicIp,
              resourceName: `${clusterName}/${nodeGroup}/${item.instanceId}`,
            }))
          );
        }
      }

      resolve(eksData);
    } catch (err) {
      reject(err);
    }
  });
}
