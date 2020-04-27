/* Utility for fetch.
Please use this instead of axios or any other library for fetching anything from server,
if using a rest API */

export default (url: string, method: string, body: object, ctype: string, useToken: boolean) => {
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
  return fetch(url, options).then((res) => parseStatus(res.status, res));
};

function parseStatus(status: any, res: any) {
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
}

function requestHeaders(ctype: string, useToken: boolean) {
  return {
    'Content-Type': ctype || 'application/json',
    Authorization: useToken ? 'Basic Y29udGVudDp3YWxtYXJ0TlVUdG9reW9IZWlzdA==' : '',
  };
}
