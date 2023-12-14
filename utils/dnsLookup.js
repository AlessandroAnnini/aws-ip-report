import dns from 'node:dns';

export async function resolveDnsToIp(dnsName) {
  return new Promise((resolve, reject) => {
    dns.resolve4(dnsName, (err, addresses) => {
      if (err) {
        reject(err);
      } else {
        resolve(addresses.join(', '));
      }
    });
  });
}
