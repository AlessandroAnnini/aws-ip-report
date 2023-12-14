// getApiGatewayData.js

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

  async function getRestApis() {
    const data = await apiGateway.getRestApis().promise();

    const apis = data.items.map((api) => ({
      name: api.name,
      id: api.id,
      endpoint: `https://${api.id}.execute-api.${AWS.config.region}.amazonaws.com`,
      type: 'REST',
    }));

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
