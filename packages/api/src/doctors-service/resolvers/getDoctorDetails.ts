import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctors-service';
import { Doctor } from 'doctors-service/entity/doctor';
import { getRepository } from 'typeorm';

export const getDoctorDetailsTypeDefs = gql`
  extend type Query {
    getDoctorDetails: [Doctor]
  }
`;

const getDoctorDetails: Resolver<null, {}, DoctorsServiceContext, Doctor[]> = async (
  parent,
  args,
  { mobileNumber }
) => {
  const doctorRepository = getRepository(Doctor);
  console.log(mobileNumber);
  const doctordata = await doctorRepository.find({
    where: { mobileNumber: mobileNumber },
    relations: ['specialty', 'doctorHospital'],
  });
  console.log(doctordata);
  return doctordata;
};

export const getDoctorDetailsResolvers = {
  Query: {
    getDoctorDetails,
  },
};
