import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { Doctor } from 'doctors-service/entities';

export const chooseDoctorTypeDefs = gql`
  input ChooseDoctorInput {
    slotDateTime: DateTime!
    specialityId: ID!
  }

  type ChooseDoctorResult {
    availalbeDoctors: [AvailableDoctor]
  }

  type AvailableDoctor {
    doctorId: ID!
    availableSlot: DateTime!
    doctorFirstName: String!
    doctorLastName: String!
    doctorPhoto: String!
    specialityId: ID!
    specialityName: String!
    experience: Int!
  }

  extend type Query {
    getAvailableDoctors(ChooseDoctorInput: ChooseDoctorInput): ChooseDoctorResult!
  }
`;

type AvailableDoctor = {
  doctorId: string;
  availableSlot: Date;
  doctorFirstName: string;
  doctorLastName: string;
  doctorPhoto: string;
  specialityId: string;
  specialityName: string;
  experience: Number;
};

type ChooseDoctorResult = {
  availalbeDoctors: AvailableDoctor[];
};

type ChooseDoctorInput = {
  slotDateTime: Date;
  specialityId: string;
};

type ChooseDoctorInputArgs = {
  ChooseDoctorInput: ChooseDoctorInput;
};

const getAvailableDoctors: Resolver<
  null,
  ChooseDoctorInputArgs,
  ConsultServiceContext,
  ChooseDoctorResult
> = async (parent, { ChooseDoctorInput }, { doctorsDb, consultsDb }) => {
  const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);
  const appointmentsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const doctorsList = await docConsultRep.searchBySpecialty(ChooseDoctorInput.specialityId);
  const availalbeDoctors: AvailableDoctor[] = [];
  function getDetails(doctor: Doctor) {
    return new Promise<AvailableDoctor>(async (resolve) => {
      const apptCount = await appointmentsRepo.checkDoctorAppointmentByDate(
        doctor.id,
        ChooseDoctorInput.slotDateTime
      );
      const availableDoctor: AvailableDoctor = {
        doctorFirstName: doctor.firstName,
        doctorLastName: doctor.lastName,
        doctorId: doctor.id,
        doctorPhoto: doctor.photoUrl,
        availableSlot: ChooseDoctorInput.slotDateTime,
        specialityId: doctor.specialty.id,
        specialityName: doctor.specialty.name,
        experience: doctor.experience,
      };
      if (apptCount === 0) {
        availalbeDoctors.push(availableDoctor);
      }
      resolve(availableDoctor);
    });
  }

  const promises: object[] = [];
  if (doctorsList && doctorsList.length > 0) {
    doctorsList.map(async (doctor) => {
      promises.push(getDetails(doctor));
    });
  }
  await Promise.all(promises);
  return { availalbeDoctors };
};

export const chooseDoctorResolvers = {
  Query: {
    getAvailableDoctors,
  },
};
