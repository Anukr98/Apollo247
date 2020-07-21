import url from 'url';
import rhea, { EventContext, ConnectionOptions } from 'rhea';

export enum AphMqMessageTypes {
  TEST = 'TEST',
  BOOKAPPOINTMENT = 'BOOKAPPOINTMENT',
  TESTRECEIVER = 'TESTRECEIVER',
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

    const USE_AZURE_SB = process.env.USE_AZURE_SERVICE_BUS === 'true';
    const parsedAzureConn = parseConnectionString(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING);

    const connectionOptions: ConnectionOptions = USE_AZURE_SB
      ? {
          transport: 'tls',
          host: url.parse(parsedAzureConn.Endpoint).hostname || '',
          hostname: url.parse(parsedAzureConn.Endpoint).hostname || '',
          username: parsedAzureConn.SharedAccessKeyName,
          password: parsedAzureConn.SharedAccessKey,
          port: parseInt(process.env.AZURE_SERVICE_BUS_PORT, 10),
          reconnect_limit: 100,
        }
      : {
          transport: 'tcp',
          host: process.env.RABBITMQ_HOST,
          username: process.env.RABBITMQ_USER,
          password: process.env.RABBITMQ_PASSWORD,
          port: parseInt(process.env.RABBITMQ_PORT, 10),
          reconnect_limit: 100,
        };

    const queueName = process.env.MESSAGE_QUEUE_QUEUE_NAME;
    container.on('connection_open', (context: EventContext) => {
      console.log('connected to message queue!');
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
