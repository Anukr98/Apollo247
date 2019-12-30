import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Between } from 'typeorm';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { Appointment } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const getAppointmentOverviewTypeDefs = gql`
    type AppointmentList {
        appointment: Appointment!
    }

    type GetAppointmentOverviewResult {
        appointments: [AppointmentList!]!
        completed: Int
        cancelled: Int
        upcoming: Int
        doctorAway: Int
    }
    input GetAllDoctorAppointmentsInput  {
        doctorId : String!
        fromDate: DateTime
        toDate: DateTime
    }
    extend type Query {
        getAppointmentOverview(appointmentOverviewInput:GetAllDoctorAppointmentsInput): GetAppointmentOverviewResult!
    }
`;

type AppointmentList = {
    appointment: Appointment;
};
type getAppointmentOverviewResult = {
    appointments: AppointmentList[];
    completed: number;
    cancelled: number;
    upcoming: number;
    doctorAway: number;
};
type GetAllDoctorAppointmentsInput = {
    doctorId: string;
    fromDate: Date;
    toDate: Date;
}
type GetAllDoctorAppointmentsInputArgs = { appointmentOverviewInput: GetAllDoctorAppointmentsInput };


const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
    apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
    patRepo: patientsDb.getCustomRepository(PatientRepository),
    docRepo: doctorsDb.getCustomRepository(DoctorRepository),
});

const getAppointmentOverview: Resolver<
    null,
    GetAllDoctorAppointmentsInputArgs,
    ConsultServiceContext,
    getAppointmentOverviewResult
> = async (parent, { appointmentOverviewInput }, context) => {
    const { apptRepo } = getRepos(context);
    const doctorId = appointmentOverviewInput.doctorId;
    const fromDate = appointmentOverviewInput.fromDate;
    const toDate = appointmentOverviewInput.toDate;

    const allAppointments = await apptRepo.find({
        where: {
            doctorId,
            appointmentDateTime: Between(fromDate, toDate)
        },
        order: { appointmentDateTime: 'DESC' },
    });
    const completedAppointments = await apptRepo.getCompletedAppointments(doctorId, fromDate, toDate, 0);
    const cannceldAppointments = await apptRepo.getCompletedAppointments(doctorId, fromDate, toDate, 1);
    const doctorAway = await apptRepo.getDoctorAway(doctorId, fromDate, toDate);
    const inNextHour = await apptRepo.getAppointmentsInNextHour(doctorId);

    const appointments = await Promise.all(
        allAppointments.map(async (appointment) => {
            return { appointment };
        })
    );
    const appointmentOverviewOutput = {
        appointments,
        completed: completedAppointments,
        cancelled: cannceldAppointments,
        upcoming: inNextHour,
        doctorAway: doctorAway,

    };
    return appointmentOverviewOutput;
};

export const getAppointmentOverviewResolvers = {
    Query: {
        getAppointmentOverview,
    },
};

