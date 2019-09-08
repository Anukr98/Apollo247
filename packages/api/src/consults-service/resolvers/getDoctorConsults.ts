import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { Patient } from 'profiles-service/entities';
import { Appointment } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const getDoctorConsultsTypeDefs = gql`
  type DoctorConsult {
    patient: Patient
    appointment: Appointment
  }

  type GetDoctorConsultsResult {
    doctorConsults: [DoctorConsult!]!
  }

  extend type Query {
    getDoctorConsults: GetDoctorConsultsResult!
  }
`;

type GetDoctorConsultsResult = {
  doctorConsults: {
    patient: Patient;
    appointment: Appointment;
  }[];
};

const getDoctorConsults: Resolver<
  null,
  {},
  ConsultServiceContext,
  GetDoctorConsultsResult
> = async (parent, args, { firebaseUid, doctorsDb, consultsDb, patientsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const patRepo = patientsDb.getCustomRepository(PatientRepository);
  const currentDoctor = await docRepo.getDoctorDetails(firebaseUid);
  if (!currentDoctor) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  const doctorId = currentDoctor.id;
  // TODO Just return the most recent 20 for now, add this is an input arg later
  const appointments = await apptRepo.find({
    where: { doctorId },
    order: { appointmentDateTime: 'DESC' },
    take: 20,
  });
  const doctorConsults = await Promise.all(
    appointments.map(async (appointment) => {
      const patient = (await patRepo.findById(appointment.patientId)) as Patient;
      return { appointment, patient };
    })
  );
  return { doctorConsults };
};

export const getDoctorConsultsResolvers = {
  Query: {
    getDoctorConsults,
  },
};
