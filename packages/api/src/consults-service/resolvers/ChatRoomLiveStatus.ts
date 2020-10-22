import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { BOOKINGSOURCE, DEVICETYPE } from 'consults-service/entities';
import { ApiConstants } from 'ApiConstants';
import { getCache, setCache } from 'consults-service/database/connectRedis';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const liveStatusTypeDefs = gql`
    enum USER_TYPE {
        DOCTOR
        PATIENT
    }
    enum USER_STATUS {
        LEAVING
        ENTERING
    }
    enum CALL_STATUS {
        NOT_STARTED
        IN_PROGRESS
        COMPLETED
    }
    type setAndGetNumberOfParticipantsInput {
        appointmentId: String,
        userType: USER_TYPE,
        sourceType: BOOKINGSOURCE,
        deviceType: DEVICETYPE,
        userStatus: USER_STATUS
    }
    type setAndGetNumberOfParticipantsResult {
        DOCTOR: [setAndGetNumberOfParticipantsInput],
        PATIENT: [setAndGetNumberOfParticipantsInput],
        NUMBER_OF_PARTIPANTS: Int
        CALL_STATUS: CALL_STATUS
    }
    type healthRecordResult {
        isError: Boolean
        response: String
    }
    extend type Query {
        setAndGetNumberOfParticipants(
            appointmentId: String,
            userType: USER_TYPE,
            sourceType: BOOKINGSOURCE,
            deviceType: DEVICETYPE,
            userStatus: USER_STATUS,
            callStatus: CALL_STATUS)
        : setAndGetNumberOfParticipantsResult,
    }
    extend type Mutation {
        updateHealthRecordNudgeStatus(
            appointmentId: String!
            hideHealthRecordNudge: Boolean
        ): healthRecordResult!
    }
`;

enum USER_TYPE {
    DOCTOR = 'DOCTOR',
    PATIENT = 'PATIENT'
}

enum USER_STATUS {
    LEAVING = 'LEAVING',
    ENTERING = 'ENTERING',
}

export enum CALL_STATUS {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

type setAndGetNumberOfParticipantsInput = {
    appointmentId: string,
    userType: USER_TYPE,
    sourceType: BOOKINGSOURCE,
    deviceType: DEVICETYPE,
    userStatus: USER_STATUS,
    callStatus: CALL_STATUS
}

type setAndGetNumberOfParticipantsResult = {
    [USER_TYPE.DOCTOR]: any[],
    [USER_TYPE.PATIENT]: any[],
    ['NUMBER_OF_PARTIPANTS']: number
    ['CALL_STATUS']: CALL_STATUS
}

const REDIS_NUMBEROFPARTICIPANTS_KEY_PREFIX = `numberOfParticipants:key:`;
const setAndGetNumberOfParticipants: Resolver<
    null,
    setAndGetNumberOfParticipantsInput,
    ConsultServiceContext,
    setAndGetNumberOfParticipantsResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
    if (!args.appointmentId) {
        throw new Error(AphErrorMessages.INVALID_APPOINTMENT_ID);
    }
    const redisKey = `${REDIS_NUMBEROFPARTICIPANTS_KEY_PREFIX}${args.appointmentId}`;
    const keyAppointment = await getCache(redisKey);
    let key_appointment: any;
    if (keyAppointment && typeof keyAppointment == 'string') {
        key_appointment = JSON.parse(keyAppointment);
        if (key_appointment[args.userType].length) {
            if (args.userStatus === USER_STATUS.LEAVING) {
                key_appointment[args.userType].pop();
            } else {
                key_appointment[args.userType].pop();
                key_appointment[args.userType].push(args);
            }
        } else {
            if (args.userStatus === USER_STATUS.ENTERING) {
                key_appointment[args.userType].push(args);
            }
        }

        if (args.callStatus) {
            key_appointment['CALL_STATUS'] = args.callStatus;
        }

        await setCache(redisKey, JSON.stringify(key_appointment), ApiConstants.CACHE_EXPIRATION_14400);
    } else {
        key_appointment = {
            [USER_TYPE.PATIENT]: [],
            [USER_TYPE.DOCTOR]: [],
            ['CALL_STATUS']: 'NOT_STARTED'
        }
        if (args.userStatus === USER_STATUS.ENTERING) {
            key_appointment[args.userType].push(args);
        }
        await setCache(redisKey, JSON.stringify(key_appointment), ApiConstants.CACHE_EXPIRATION_14400);
    }
    return {
        ...key_appointment,
        NUMBER_OF_PARTIPANTS: key_appointment[USER_TYPE.PATIENT].length + key_appointment[USER_TYPE.DOCTOR].length,
    };
};

const updateHealthRecordNudgeStatus: Resolver<
    null,
    { appointmentId: string; hideHealthRecordNudge: boolean; },
    ConsultServiceContext,
    {
        isError: boolean;
        response: string;
    }
> = async (parent, args, { consultsDb }) => {
    try {
        const appRepository = consultsDb.getCustomRepository(AppointmentRepository);
        await appRepository.updateAppointmentAttributes(args.appointmentId, { hideHealthRecordNudge: args.hideHealthRecordNudge });
        return { isError: false, response: "Updated Successfully" };
    } catch (err) {
        console.error("error in updating hideHealthRecordNudge > ", err);
        return { isError: true, response: "Not Updated" };
    }
};

export const liveStatusResolvers = {
    Query: {
        setAndGetNumberOfParticipants,
    },
    Mutation: {
        updateHealthRecordNudgeStatus
    }
};
