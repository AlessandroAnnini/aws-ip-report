import AWS from 'aws-sdk';
import { resolveDnsToIp } from './../utils/index.js';

export async function getApiGatewayData(region) {
  AWS.config.update({ region });
  const apiGateway = new AWS.APIGateway();
  const apiGatewayV2 = new AWS.ApiGatewayV2();

  function getHostnameFromUrl(url) {
    const { hostname } = new URL(url);
    return hostname;
  }

  async function resolveApiEndpoints(apis) {
    return Promise.all(
      apis.map(async (api) => {
        const hostname = getHostnameFromUrl(api.endpoint);
        const ipAddresses = await resolveDnsToIp(hostname);

        return { ...api, ipAddresses };
      })
    );
  }

  async function getRestApiStages(apiId) {
    try {
      const stageData = await apiGateway
        .getStages({ restApiId: apiId })
        .promise();
      return stageData.item.map((stage) => stage.stageName);
    } catch (error) {
      console.error(`Error fetching stages for REST API ${apiId}:`, error);
      return [];
    }
  }

  async function getRestApis() {
    const data = await apiGateway.getRestApis().promise();

    const apis = await Promise.all(
      data.items.map(async (api) => {
        const stages = await getRestApiStages(api.id);

        return {
          name: api.name,
          id: api.id,
          endpoint: `https://${api.id}.execute-api.${AWS.config.region}.amazonaws.com`,
          type: 'REST',
          stages, // Include stages for REST APIs
        };
      })
    );

    return resolveApiEndpoints(apis);
  }

  async function getHttpApis() {
    const data = await apiGatewayV2.getApis().promise();

    const apis = data.Items.filter((api) => api.ProtocolType === 'HTTP').map(
      (api) => ({
        name: api.Name,
        id: api.ApiId,
        endpoint: api.ApiEndpoint,
        type: 'HTTP',
      })
    );

    return resolveApiEndpoints(apis);
  }

  async function getWebSocketApis() {
    const data = await apiGatewayV2.getApis().promise();

    const apis = data.Items.filter(
      (api) => api.ProtocolType === 'WEBSOCKET'
    ).map((api) => ({
      name: api.Name,
      id: api.ApiId,
      endpoint: api.ApiEndpoint,
      type: 'WEBSOCKET',
    }));

    return resolveApiEndpoints(apis);
  }

  try {
    const restApis = await getRestApis();
    const httpApis = await getHttpApis();
    const webSocketApis = await getWebSocketApis();

    return [...restApis, ...httpApis, ...webSocketApis];
  } catch (err) {
    console.error('Error fetching API Gateway data:', err);
    throw err;
  }
}
