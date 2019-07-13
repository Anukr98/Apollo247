import { AphErrorMessages } from '@aph/universal/aphErrorMessages';
import { ApolloError } from 'apollo-server';

export class AphError {
  constructor(message: AphErrorMessages, code?: string, properties?: Record<string, any>) {
    return new ApolloError(message, code, properties);
  }
}
