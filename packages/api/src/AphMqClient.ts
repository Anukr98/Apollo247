import url from 'url';
import rhea, { EventContext, ConnectionOptions } from 'rhea';

export enum AphMqMessageTypes {
  BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
}

export type AphMqMessage<T, P> = {
  type: T;
  payload: P;
};

export type AphMqReceivedMessage<M> = {
  message: M;
  accept: () => void;
};

const container = rhea.create_container();

export const AphMqClient = {
  connect: function() {
    const azureConnectionString =
      'Endpoint=sb://apollo-hospitals.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=/eX+5EqSEyXQ1iLjt7dt3jJ0YlAWw3imtgmV1CAKcYk=';

    const parseConnectionString = (connString: string) => {
      const parsed: Record<string, string> = connString.split(';').reduce((acc, part) => {
        const splitIndex = part.indexOf('=');
        return {
          ...acc,
          [part.substring(0, splitIndex)]: part.substring(splitIndex + 1),
        };
      }, {});
      return parsed;
    };

    const parsedAzureConn = parseConnectionString(azureConnectionString);

    const connectionOptions: ConnectionOptions =
      process.env.NODE_ENV === 'local'
        ? {
            host: 'localhost',
            username: 'rabbitmq',
            password: 'rabbitmq',
            port: 5672,
            reconnect_limit: 100,
          }
        : {
            transport: 'tls',
            host: url.parse(parsedAzureConn.Endpoint).hostname,
            hostname: url.parse(parsedAzureConn.Endpoint).hostname,
            username: parsedAzureConn.SharedAccessKeyName,
            password: parsedAzureConn.SharedAccessKey,
            port: 5671,
            reconnect_limit: 100,
          };

    const queueName = 'entity-actions';
    container.on('connection_open', (context: EventContext) => {
      context.connection.open_receiver({ autoaccept: false, source: queueName });
      context.connection.open_sender({ target: queueName });
    });

    container.connect(connectionOptions);
  },

  send: function<M>(message: M) {
    container.once('sendable', (context: EventContext) => {
      context.sender!.send({ body: message });
    });
  },

  onReceive: function<M>(
    type: AphMqMessageTypes,
    callbackFn: (message: AphMqReceivedMessage<M>) => void
  ) {
    container.on('message', (context: EventContext) => {
      if (context.message!.body.type === type) {
        const receivedMessage: AphMqReceivedMessage<M> = {
          accept: () => context.delivery!.accept(),
          message: context.message!.body as M,
        };
        callbackFn(receivedMessage);
      }
    });
  },
};
