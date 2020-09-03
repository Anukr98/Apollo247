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
    log(
      'profileServiceLogger',
      `createOneApolloUser()`,
      `ONE_APOLLO_USER_CREATE_REQUEST - ${JSON.stringify(oneApollUser)}`,
      JSON.stringify(oneApollUser),
      ''
    );
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(this.baseUrl + '/Customer/Register', {
        method: 'POST',
        body: JSON.stringify(oneApollUser),
        headers: this.headers,
        signal: this.controller.signal,
      });
      const res = await response.json();
      log(
        'profileServiceLogger',
        `createOneApolloUser()`,
        `ONE_APOLLO_USER_CREATE_RESPONSE - ${JSON.stringify(oneApollUser)}`,
        res,
        ''
      );
      return res;
    } catch (e) {
      log(
        'profileServiceLogger',
        `createOneApolloUser()`,
        `ONE_APOLLO_USER_CREATE_REQUEST_FAILED - ${JSON.stringify(oneApollUser)}`,
        e.stack,
        'true'
      );
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      else throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }

  async getOneApolloUser(mobileNumber: string) {
    log(
      'profileServiceLogger',
      `getOneApolloUser()`,
      `ONE_APOLLO_USER_FETCH -${mobileNumber}`,
      mobileNumber,
      ''
    );
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
      const res = await response.json();

      log(
        'profileServiceLogger',
        `getOneApolloUser()`,
        `ONE_APOLLO_USER_FETCH_RESPONSE -${mobileNumber}`,
        res,
        ''
      );
      return res;
    } catch (e) {
      log(
        'profileServiceLogger',
        `getOneApolloUser()`,
        `ONE_APOLLO_USER_FETCH_FAILED -${mobileNumber}`,
        e.stack,
        'true'
      );
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      throw new AphError(AphErrorMessages.GET_ONEAPOLLO_USER_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }

  async blockOneUserCredits(input: BlockOneApolloPointsRequest) {
    log(
      'profileServiceLogger',
      `blockOneUserCredits()`,
      `BLOCK_USER_CREDITS_REQUEST - ${JSON.stringify(input)}`,
      JSON.stringify(input),
      ''
    );
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(`${this.baseUrl}/redemption/block`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(input),
        signal: this.controller.signal,
      });
      const res = await response.json();

      log(
        'profileServiceLogger',
        `blockOneUserCredits()`,
        `BLOCK_USER_CREDITS_RESPONSE - ${JSON.stringify(input)}`,
        res,
        ''
      );
      return res;
    } catch (e) {
      log(
        'profileServiceLogger',
        `blockOneUserCredits()`,
        `BLOCK_USER_CREDITS_REQUEST_FAILED - ${JSON.stringify(input)}`,
        e.stack,
        'true'
      );
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      throw new AphError(AphErrorMessages.BLOCK_CREDITS_ONEAPOLLO_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }
  async createOneApolloTransaction(transaction: Partial<OneApollTransaction>): Promise<JSON> {
    log(
      'profileServiceLogger',
      `createOneApolloTransaction()`,
      `CREATE_ONE_APOLLO_TRANSACTION - ${JSON.stringify(transaction)}`,
      JSON.stringify(transaction),
      ''
    );
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(this.baseUrl + '/transaction/create', {
        method: 'POST',
        body: JSON.stringify(transaction),
        headers: this.headers,
      });
      const res = await response.json();

      log(
        'profileServiceLogger',
        `createOneApolloTransaction()`,
        `CREATE_ONE_APOLLO_TRANSACTIO_RESPONSE - ${JSON.stringify(transaction)}`,
        res,
        ''
      );
      return res;
    } catch (e) {
      log(
        'profileServiceLogger',
        `createOneApolloTransaction()`,
        `CREATE_ONE_APOLLO_TRANSACTION_FAILED - ${JSON.stringify(transaction)}`,
        e.stack,
        ''
      );
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_TRANSACTION_ERROR, undefined, {
        e,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
  async getOneApolloUserTransactions(mobileNumber: string) {
    log(
      'profileServiceLogger',
      `getOneApolloUserTransactions()`,
      `GET_ONE_APOLLO_USER_TRANSACTION - ${mobileNumber}`,
      JSON.stringify(mobileNumber),
      ''
    );
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(
        `${this.baseUrl}/Customer/GetTransactionsByBU?BusinessUnit=${this.businessUnit}&mobilenumber=${mobileNumber}&Count=${process.env.ONEAPOLLO_DEFAULT_TRANSACTIONS_COUNT}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );
      const res = await response.json();

      log(
        'profileServiceLogger',
        `getOneApolloUserTransactions()`,
        `GET_ONE_APOLLO_USER_TRANSACTION_RESPONSE - ${mobileNumber}`,
        res,
        ''
      );
      return res;
    } catch (e) {
      log(
        'profileServiceLogger',
        `getOneApolloUserTransactions()`,
        `GET_ONE_APOLLO_USER_TRANSACTION_FAILED - ${mobileNumber}`,
        e.stack,
        'true'
      );
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);

      throw new AphError(AphErrorMessages.GET_ONEAPOLLO_USER_TRANSACTIONS_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }
  async unblockHealthCredits(input: UnblockPointsRequest) {
    log(
      'profileServiceLogger',
      `unblockHealthCredits()`,
      `UNBLOCK_HEALTH_CREDITS_REQUEST - ${JSON.stringify(input)}`,
      JSON.stringify(input),
      ''
    );
    const timeout = this._requestTimeout();
    try {
      const response = await fetch(`${this.baseUrl}/redemption/UnblockHC`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(input),
        signal: this.controller.signal,
      });
      const res = await response.json();

      log(
        'profileServiceLogger',
        `unblockHealthCredits()`,
        `HEALTH_CREDITS_UNBLOCK_RESPONSE- ${JSON.stringify(input)}`,
        res,
        ''
      );
      return res;
    } catch (e) {
      log(
        'profileServiceLogger',
        `unblockHealthCredits()`,
        `HEALTH_CREDITS_UNBLOCK_REQUEST_FAILED- ${JSON.stringify(input)}`,
        e.stack,
        'true'
      );
      if (e.name === 'AbortError') throw new AphError(AphErrorMessages.ONEAPOLLO_REQUEST_TIMEOUT);
      throw new AphError(AphErrorMessages.UNBLOCK_CREDITS_ONEAPOLLO_ERROR, undefined, { e });
    } finally {
      clearTimeout(timeout);
    }
  }
}
