/* Utility for fetch.
Please use this instead of axios or any other library for fetching anything from server,
if using a rest API */

const fetchUtil = async (
  url: string,
  method: string,
  body: object,
  ctype: string,
  useToken: boolean
) => {
  let options = {};
  if (method === 'GET') {
    options = {
      method,
      headers: requestHeaders(ctype, useToken),
    };
  } else {
    options = {
      method,
      headers: requestHeaders(ctype, useToken),
      body: JSON.stringify(body),
    };
  }
  const res = await fetch(url, options);
  return await parseStatus(res.status, res);
};

const parseStatus = (status: any, res: any) => {
  return new Promise((resolve, reject) => {
    if (status >= 200 && status < 300) {
      if (res.url.indexOf('.html') > -1) {
        return resolve(res);
      }
      res.json().then((response: any) => resolve(response));
    } else {
      res.json().then((response: any) => reject(response));
    }
  });
};

const requestHeaders = (ctype: string, useToken: boolean) => {
  return {
    'Content-Type': ctype || 'application/json',
    Authorization: useToken ? process.env.COVID_ARTICLE_API_AUTH_TOKEN : '',
  };
};

export default fetchUtil;
