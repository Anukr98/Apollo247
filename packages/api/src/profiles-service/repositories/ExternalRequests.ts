import { BlockOneApolloPointsRequest } from 'types/oneApolloTypes';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { OneApollTransaction, ONE_APOLLO_USER_REG } from 'profiles-service/entities';

export class OneApollo {
  baseUrl: string;
  headers: {
    'Content-Type': string;
    AccessToken: string;
    APIKey: string;
  };
  businessUnit: string;
  constructor() {
    this.baseUrl = process.env.ONEAPOLLO_BASE_URL || '';
    this.headers = {
      'Content-Type': 'application/json',
      AccessToken: <string>process.env.ONEAPOLLO_ACCESS_TOKEN,
      APIKey: <string>process.env.ONEAPOLLO_API_KEY,
    };
    this.businessUnit = <string>process.env.ONEAPOLLO_BUSINESS_UNIT;
  }

  async createOneApolloUser(oneApollUser: ONE_APOLLO_USER_REG) {
    try {
      const response = await fetch(this.baseUrl + '/Customer/Register', {
        method: 'POST',
        body: JSON.stringify(oneApollUser),
        headers: this.headers,
      });
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_ERROR, undefined, { e });
    }
  }

  async getOneApolloUser(mobileNumber: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/Customer/GetByMobile?mobilenumber=${mobileNumber}&BusinessUnit=${this.businessUnit}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.GET_ONEAPOLLO_USER_ERROR, undefined, { e });
    }
  }

  async blockOneUserCredits(input: BlockOneApolloPointsRequest) {
    try {
      const response = await fetch(`${this.baseUrl}/redemption/block`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(input),
      });
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.BLOCK_CREDITS_ONEAPOLLO_ERROR, undefined, { e });
    }
  }
  async createOneApolloTransaction(transaction: Partial<OneApollTransaction>) {
    try {
      const response = await fetch(this.baseUrl + '/transaction/create', {
        method: 'POST',
        body: JSON.stringify(transaction),
        headers: this.headers,
      });
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_TRANSACTION_ERROR, undefined, {
        e,
      });
    }
  }
  async getOneApolloUserTransactions(mobileNumber: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/Customer/GetTransactionsByBU?BusinessUnit=${this.businessUnit}&mobilenumber=${mobileNumber}&Count=${process.env.ONEAPOLLO_DEFAULT_TRANSACTIONS_COUNT}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.GET_ONEAPOLLO_USER_TRANSACTIONS_ERROR, undefined, { e });
    }
  }
}
