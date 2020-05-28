import { DeepLinkInput } from 'types/deeplinks';

export async function getDeeplink(deepLinkInput: DeepLinkInput): Promise<string> {
  const apiParams = {
    method: 'POST',
    headers: {
      authorization: '1b3u1l4h0013X00002bmthKQAQ1s6h3a2t',
      'content-type': 'application/json',
    },
    body: JSON.stringify(deepLinkInput),
  };

  const apiUrl = 'https://onelink.appsflyer.com/shortlink/v1/AEkA';
  return await fetch(apiUrl, apiParams)
    .then((res) => res.json())
    .then(
      (data) => {
        return data;
      },
      (err) => {}
    );
  return '';
}
