import { AphErrorMessages } from '@aph/universal/aphErrorMessages';
import { ApolloError, AuthenticationError } from 'apollo-server';

export class AphError extends ApolloError {
  constructor(message: AphErrorMessages, code?: string, properties?: Record<string, any>) {
    super(message, code, properties);
  }
}

export class AphAuthenticationError extends AuthenticationError {
  constructor(message: AphErrorMessages) {
    super(message);
  }
}
