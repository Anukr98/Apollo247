import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { ApolloError, AuthenticationError, UserInputError } from 'apollo-server';

export class AphError {
  constructor(message: AphErrorMessages, code?: string, properties?: Record<string, any>) {
    return new ApolloError(message, code, properties);
  }
}

export class AphAuthenticationError {
  constructor(message: AphErrorMessages) {
    return new AuthenticationError(message);
  }
}

export class AphUserInputError {
  constructor(message: AphErrorMessages, properties?: Record<string, any>) {
    return new UserInputError(message, properties);
  }
}
