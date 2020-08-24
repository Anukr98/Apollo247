import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorHelpLine } from 'doctors-service/entities/';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorHelpLineRepository } from 'doctors-service/repositories/doctorHelplineRepository';

export const getDoctorHelplineTypeDef = gql`
  type DoctorHelpLine {
    doctorType: DoctorType!
    mobileNumber: String!
  }

  extend type Query {
    getDoctorHelpline: [DoctorHelpLine]
  }
`;
const getDoctorHelpline: Resolver<null, {}, DoctorsServiceContext, DoctorHelpLine[]> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const helplineRepo = doctorsDb.getCustomRepository(DoctorHelpLineRepository);
  const helplineDetails = await helplineRepo.getHelplineDetails();
  return helplineDetails;
};

export const getDoctorHelplineResolver = {
  Query: {
    getDoctorHelpline,
  },
};
