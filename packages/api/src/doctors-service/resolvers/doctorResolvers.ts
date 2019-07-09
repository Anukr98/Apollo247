import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';

export const doctorTypeDefs = gql`
  extend type Query {
    sayHello: String
  }
`;

//const sayHello = 'Hello world!';

const sayHello: Resolver<any> = async (parent, args): Promise<String> => {
  return 'Hello world!';
};

export const doctorResolvers = {
  Query: {
    sayHello,
  },
};
