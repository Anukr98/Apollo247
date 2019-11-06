import { EntityRepository, Repository } from 'typeorm';
import { Patient } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';

import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
} from 'types/prism';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {
  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  getPatientDetails(id: string) {
    return this.findOne({
      where: { id },
      relations: [
        'lifeStyle',
        'healthVault',
        'familyHistory',
        'patientAddress',
        'patientDeviceTokens',
        'patientNotificationSettings',
        'patientMedicalHistory',
      ],
    });
  }

  findByMobileNumber(mobileNumber: string) {
    return this.find({
      where: { mobileNumber },
    });
  }

  findDetailsByMobileNumber(mobileNumber: string) {
    return this.findOne({
      where: { mobileNumber },
      relations: [
        'lifeStyle',
        'healthVault',
        'familyHistory',
        'patientAddress',
        'patientDeviceTokens',
        'patientNotificationSettings',
        'patientMedicalHistory',
      ],
    });
  }

  updatePatientAllergies(id: string, allergies: string) {
    return this.update(id, { allergies });
  }

  //utility method to get prism auth token
  async getPrismAuthToken(mobileNumber: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const authTokenResult = await fetch(
      `${process.env.PRISM_GET_AUTH_TOKEN_API}?mobile=${mobileNumber}`,
      prismHeaders
    )
      .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
      .catch((error: PrismGetAuthTokenError) => {
        throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
      });

    console.log('prism auth token response', authTokenResult);
    return authTokenResult != null ? authTokenResult.response : null;
  }

  //utility method to get prism users list
  async getPrismUsersList(mobileNumber: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const usersResult = await fetch(
      `${process.env.PRISM_GET_USERS_API}?authToken=${authToken}&mobile=${mobileNumber}`,
      prismHeaders
    )
      .then((res) => res.json() as Promise<PrismGetUsersResponse>)
      .catch((error: PrismGetUsersError) => {
        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });

    console.log('prism get users response', usersResult);
    return usersResult && usersResult.response
      ? { authToken: usersResult.response.signUpUserData }
      : [];
  }
}
