import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ApolloError, AuthenticationError, UserInputError } from 'apollo-server';

export class AphError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: AphErrorMessages, properties?: Record<string, any>) {
    return new UserInputError(message, properties);
  }
}
