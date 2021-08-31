import { useEffect, useState } from 'react';
import Axios, { AxiosResponse, Canceler } from 'axios';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export const useGetClientAuthToken = (customer_id: string) => {
  const [token, setToken] = useState<any>([]);

  const getJuspayClientToken = (): Promise<AxiosResponse<any>> => {
    const baseUrl =
      AppConfig?.APP_ENV == 'PROD' ? 'https://api.juspay.in' : 'https://sandbox.juspay.in';
    const url = `${baseUrl}/v2/customers/${customer_id}`;
    return Axios.post(
      url,
      { 'options.get_client_auth_token': 'true' },
      {
        headers: {
          your_api_key: '2927ED6D69D4087837CEB2BA03FD4A',
          'x-merchantid': 'apollopharm',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  };

  const initiate = async () => {
    try {
      console.log('inside initiate');
      const response = await getJuspayClientToken();
      const { data } = response;
      console.log('data >>', data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    initiate();
  }, []);

  return { token };
};
