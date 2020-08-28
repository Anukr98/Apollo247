import { BlockOneApolloPointsRequest, UnblockPointsRequest } from 'types/oneApolloTypes';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { OneApollTransaction, ONE_APOLLO_USER_REG } from 'profiles-service/entities';
import AbortController from 'abort-controller';
import { log } from 'customWinstonLogger';

export class OneApollo {
  baseUrl: string;
  headers: {
    'Content-Type': string;
    AccessToken: string;
    APIKey: string;
  };
  businessUnit: string;
  requestTimeout: number;
  controller: AbortController;
  constructor() {
    this.baseUrl = process.env.ONEAPOLLO_BASE_URL || '';
    this.headers = {
      'Content-Type': 'application/json',
      AccessToken: <string>process.env.ONEAPOLLO_ACCESS_TOKEN,
      APIKey: <string>process.env.ONEAPOLLO_API_KEY,
    };
    this.businessUnit = <string>process.env.ONEAPOLLO_BUSINESS_UNIT;
    this.requestTimeout = +(<string>process.env.ONEAPOLLO_REQUEST_TIMEOUT);
    this.controller = new AbortController();
  }

  _requestTimeout() {
    return setTimeout(() => {
      this.controller.abort();
    }, this.requestTimeout);
  }

  async createOneApolloUser(oneApollUser: ONE_APOLLO_USER_REG) {
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(this.baseUrl + '/Customer/Register', {
        method: 'POST',
        body: JSON.stringify(oneApollUser),
        headers: this.headers,
        signal: this.controller.signal,
      });
      return response.json();
    } catch (e) {
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      else throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }

  async getOneApolloUser(mobileNumber: string) {
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(
        `${this.baseUrl}/Customer/GetByMobile?mobilenumber=${mobileNumber}&BusinessUnit=${this.businessUnit}`,
        {
          method: 'GET',
          headers: this.headers,
          signal: this.controller.signal,
        }
      );
      return response.json();
    } catch (e) {
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      throw new AphError(AphErrorMessages.GET_ONEAPOLLO_USER_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }

  async blockOneUserCredits(input: BlockOneApolloPointsRequest) {
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(`${this.baseUrl}/redemption/block`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(input),
        signal: this.controller.signal,
      });
      return response.json();
    } catch (e) {
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      throw new AphError(AphErrorMessages.BLOCK_CREDITS_ONEAPOLLO_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }
  async createOneApolloTransaction(transaction: Partial<OneApollTransaction>): Promise<JSON> {
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(this.baseUrl + '/transaction/create', {
        method: 'POST',
        body: JSON.stringify(transaction),
        headers: this.headers,
      });
      return response.json();
    } catch (e) {
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_TRANSACTION_ERROR, undefined, {
        e,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
  async getOneApolloUserTransactions(mobileNumber: string) {
    const timeout = this._requestTimeout();
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
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);

      throw new AphError(AphErrorMessages.GET_ONEAPOLLO_USER_TRANSACTIONS_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }
  async unblockHealthCredits(input: UnblockPointsRequest) {
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(`${this.baseUrl}/redemption/UnblockHC`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(input),
        signal: this.controller.signal,
      });
      log(
        'profileServiceLogger',
        `unblockHealthCredits()`,
        `HEALTH_CREDITS_UNBLOCK_RESPONSE- ${JSON.stringify(response)}`,
        JSON.stringify(response),
        'true'
      );
    } catch (e) {
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      throw new AphError(AphErrorMessages.UNBLOCK_CREDITS_ONEAPOLLO_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }
}
