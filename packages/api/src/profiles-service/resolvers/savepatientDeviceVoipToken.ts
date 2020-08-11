import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DEVICE_TYPE, PatientDeviceTokens } from 'profiles-service/entities';

export const patientDeviceVoipTokenTypeDefs = gql`
  input voipPushTokenInput {
    patientId: String
    voipToken: String
  }

  type voipPushTokenResult {
    isError: Boolean
    response: String
    patientId: String
    voipToken: String 
  }

  extend type Mutation {
    addVoipPushToken(voipPushTokenInput: voipPushTokenInput): voipPushTokenResult!
  }
`;

type voipPushTokenInput = {
    patientId: String
    voipToken: String
};
  

type voipPushTokenResult = {
    isError: Boolean
    response: String
    patientId: String
    voipToken: String
}

type voipPushTokenInputArgs = {
    voipPushTokenInput: voipPushTokenInput
}

const addVoipPushToken: Resolver<
    null,
    voipPushTokenInputArgs,
    ProfilesServiceContext,
    voipPushTokenResult
    > = async (parent, { voipPushTokenInput }, { profilesDb }) => {

    const {patientId, voipToken} = voipPushTokenInput;
    console.log("patientId, voipToken > ", patientId, voipToken);
        
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient = await patientRepo.getPatientDetails(patientId.toString());
    if (!patient){
        throw new AphError(AphErrorMessages.GET_PATIENTS_ERROR, undefined, {});
    }
    const patientDeviceTokenRepo = profilesDb.getCustomRepository(PatientDeviceTokenRepository);
    const patientDevices = await patientDeviceTokenRepo.getDeviceVoipPushToken(patientId.toString(), DEVICE_TYPE.IOS);

    try {
        
        if(patientDevices.length){
            const updateAttrs = Object.assign(patientDevices[patientDevices.length-1], {deviceVoipPushToken: voipToken.toString()});
            await patientDeviceTokenRepo.updateVoipPushToken(updateAttrs.id, updateAttrs);
        } else {

            const deviceToken: Partial<PatientDeviceTokens> = {
                deviceType: DEVICE_TYPE.IOS,
                deviceVoipPushToken: voipToken.toString(),
                patient: patient,
                deviceOS: "",
                deviceToken: ""
            };

            await patientDeviceTokenRepo.savePatientDeviceToken(deviceToken);
        }

        return { response: "successfully added", isError: false, patientId, voipToken};

    } catch (err){
        return { response: "something went wrong", isError: true, patientId, voipToken};
    }

};



export const patientDeviceVoipTokenResolvers = {
    Mutation: {
        addVoipPushToken,
    },
};