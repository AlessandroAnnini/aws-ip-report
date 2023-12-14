import AWS from 'aws-sdk';

export async function getElasticBeanstalkData(region) {
  AWS.config.update({ region });
  const elasticbeanstalk = new AWS.ElasticBeanstalk();

  // Function to get details of all environments for a given application
  async function getEnvironmentsForApplication(appName) {
    return new Promise((resolve, reject) => {
      elasticbeanstalk.describeEnvironments(
        { ApplicationName: appName },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(data.Environments);
        }
      );
    });
  }

  return new Promise(async (resolve, reject) => {
    try {
      let ebData = [];

      // List all Elastic Beanstalk applications
      const apps = await elasticbeanstalk.describeApplications().promise();

      for (const app of apps.Applications) {
        // Get environments for each application
        const environments = await getEnvironmentsForApplication(
          app.ApplicationName
        );

        environments.forEach((env) => {
          ebData.push({
            applicationName: app.ApplicationName,
            environmentName: env.EnvironmentName,
            status: env.Status,
            health: env.Health,
            version: env.VersionLabel,
            solutionStack: env.SolutionStackName,
          });
        });
      }

      resolve(ebData);
    } catch (err) {
      reject(err);
    }
  });
}
