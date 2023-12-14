import AWS from 'aws-sdk';
import { resolveDnsToIp } from './../utils/index.js';

export async function getRdsData(region) {
  AWS.config.update({ region });
  const rds = new AWS.RDS();

  return new Promise(async (resolve, reject) => {
    rds.describeDBInstances({}, async (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      let rdsData = [];
      for (const dbInstance of data.DBInstances) {
        // Check if the DB instance is publicly accessible
        if (dbInstance.Endpoint && dbInstance.PubliclyAccessible) {
          const ipAddresses = await resolveDnsToIp(dbInstance.Endpoint.Address);

          rdsData.push({
            ip: ipAddresses,
            endpoint: dbInstance.Endpoint.Address,
            resourceName: dbInstance.DBInstanceIdentifier,
            publiclyAccessible: dbInstance.PubliclyAccessible,
          });
        }
      }

      resolve(rdsData);
    });
  });
}
