import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
import DoctorsData from '../data/doctors.json';
import { JsonValue } from 'apollo-utilities';
import { isNull } from 'util';

export const doctorTypeDefs = gql`
  type Doctor {
    firstName: String
    lastName: String
    mobileNumber: String
    experience: String
  }

  extend type Query {
    getDoctorsData: [Doctor]
    hasAccess(mobileNumber: String): Boolean
  }
`;

const getDoctorsData: Resolver<any> = async (parent, args): Promise<JSON> => {
  return JSON.parse(JSON.stringify(DoctorsData));
};

const hasAccess: Resolver<any, { mobileNumber: string }> = async (
  parent,
  args
): Promise<Boolean> => {
  let authorized = DoctorsData.find((item) => {
    return item.mobileNumber == args.mobileNumber;
  });
  if (isNull(authorized)) return false;
  return true;
};

export const doctorResolvers = {
  Query: {
    getDoctorsData,
    hasAccess,
  },
};
