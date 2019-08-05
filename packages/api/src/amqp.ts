import url from 'url';
import rhea, { EventContext, ConnectionOptions, Container } from 'rhea';

(() => {
  enum MqMessageTypes {
    BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
  }

  interface MqMessage<P> {
    type: MqMessageTypes;
    payload: P;
  }

  const container = rhea.create_container();

  const azureConnectionString = '';

  const AphMqClient = {
    connect: function() {
      const parsedAzureConn = parseConnectionString(azureConnectionString);
      const connectionOptions: ConnectionOptions = USE_AZURE
        ? {
            transport: 'tls' as 'tls',
            host: url.parse(parsedAzureConn.Endpoint).hostname,
            hostname: url.parse(parsedAzureConn.Endpoint).hostname,
            username: parsedAzureConn.SharedAccessKeyName,
            password: parsedAzureConn.SharedAccessKey,
            port: 5671,
            reconnect_limit: 100,
          }
        : {
            host: 'localhost',
            username: 'rabbitmq',
            password: 'rabbitmq',
            port: 5672,
            reconnect_limit: 100,
          };
    },

    send: function<P>(message: MqMessage<P>) {},
  };

  AphMqClient.connect();
  const bookAppointmentMessage = {
    type: MqMessageTypes.BOOK_APPOINTMENT,
    payload: {
      id: '123',
    },
  };
  AphMqClient.send(bookAppointmentMessage);
  AphMqClient.onReceive((message: MqMessage<any>) => {
    if (message.type === MqMessageTypes.BOOK_APPOINTMENT) {
      await bookAppointmentMessage(messsage.id);
      message.ack();
    }
  });
})();

// enum CarrotTypes {
//   BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
// }

// interface Carrot {
//   type: CarrotTypes;
//   payload: Record<string, any>;
// }

// interface BookAppointmentCarrot extends Carrot {
//   type: CarrotTypes.BOOK_APPOINTMENT,
//   payload: {
//     doctorId: string;
//     patientId: string;
//     date: Date;
//   };
// }

// class AphRabbit {
//   private container: Container;

//   constructor() {
//     this.container = rhea.create_container();
//   }

//   connect = () => {
//     const parsedAzureConn = parseConnectionString(azureConnectionString);
//     const connectionOptions: ConnectionOptions = USE_AZURE
//       ? {
//           transport: 'tls' as 'tls',
//           host: url.parse(parsedAzureConn.Endpoint).hostname,
//           hostname: url.parse(parsedAzureConn.Endpoint).hostname,
//           username: parsedAzureConn.SharedAccessKeyName,
//           password: parsedAzureConn.SharedAccessKey,
//           port: 5671,
//           reconnect_limit: 100,
//         }
//       : {
//           host: 'localhost',
//           username: 'rabbitmq',
//           password: 'rabbitmq',
//           port: 5672,
//           reconnect_limit: 100,
//         };
//   };

//   sendCarrot = (carrot:Carrot) => {

//   }
// }

// const rabbit = new AphRabbit();
// rabbit.connect();
// rabbit.sendCarrot({
//   type: CarrotTypes.BOOK_APPOINTMENT,
//   payload: {},
// });
// rabbit.receiveCarrot((carrot) => {
//   if (carrot.type === BookA)
// })

const USE_AZURE = false;

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

const queueName = 'entity-actions';

(async () => {
  const container = rhea.create_container();

  const parsedAzureConn = parseConnectionString(azureConnectionString);
  const connectionOptions: ConnectionOptions = USE_AZURE
    ? {
        transport: 'tls',
        host: url.parse(parsedAzureConn.Endpoint).hostname,
        hostname: url.parse(parsedAzureConn.Endpoint).hostname,
        username: parsedAzureConn.SharedAccessKeyName,
        password: parsedAzureConn.SharedAccessKey,
        port: 5671,
        reconnect_limit: 100,
      }
    : {
        host: 'localhost',
        username: 'rabbitmq',
        password: 'rabbitmq',
        port: 5672,
        reconnect_limit: 100,
      };

  container.on('connection_open', (context: EventContext) => {
    console.log('connected!');
    context.connection.open_receiver({ autoaccept: false, source: queueName });
    context.connection.open_sender({ target: queueName });
  });

  container.on('message', (context: EventContext) => {
    const timeout = 10;
    console.log('message received: ', context.message!.body, `accepting in ${timeout} seconds...`);
    setTimeout(() => {
      console.log('accepting message');
      context.delivery!.accept();
      context.connection.close();
    }, timeout * 1000);
  });

  container.once('sendable', (context: EventContext) => {
    const msg = 'Hello World!';
    console.log('sending:', msg);
    context.sender!.send({ body: msg });
  });

  container.connect(connectionOptions);
})();
