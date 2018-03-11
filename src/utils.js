import https from 'https'

export const fetch = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, resp => {
        const { statusCode } = resp;
        if (statusCode !== 200) reject(`Status code: ${statusCode}`);

        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => resolve(data));
      })
      .on('error', reject)
  })
};

export const BASE_URL = 'https://www.hsx.com/security/view/';