import { EntityRepository, Repository } from 'typeorm';
import { Patient } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';

import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
  PrismSignUpUserData,
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

    mobileNumber = '8019677178';

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
    mobileNumber = '8019677178';
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
    return usersResult && usersResult.response ? usersResult.response.signUpUserData : [];
  }

  async validateAndGetUHID(id: string, prismUsersList: PrismSignUpUserData[]) {
    const patientData = await this.findOne({ where: { id } }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, {
        error,
      });
    });
    console.log('patientData', patientData);
    if (!patientData) {
      throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, {
        error: 'Invalid PatientId',
      });
    }

    const matchedUser = prismUsersList.filter((user) => user.UHID == patientData.uhid);
    console.log('mathchedUser', matchedUser);
    return matchedUser.length > 0 ? matchedUser[0].UHID : null;
  }

  //utility method to get prism user details
  getPrismUsersDetails(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    fetch(
      `${process.env.PRISM_GET_USER_DETAILS_API}?authToken=${authToken}&uhid=${uhid}`,
      prismHeaders
    )
      .then((res) => res.json())
      .catch((error) => {
        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });
  }

  async uploadDocumentToPrism(uhid: string, authToken: string) {
    const payLoad = {
      file:
        '{"file":"feq2LwtsrQADd3nNLyxBAAAEEEEAAAQQ8CPAOtAdUikQAAQQQQAABBBBorwABdHvPLS1DAAEEEEAAAQQQ8CBAAO0BlSIRQAABBBBAAAEE2itAAN3ec0vLEEAAAQQQQAABBDwIEEB7QKVIBBBAAAEEEEAAgfYKEEC399zSMgQQQAABBBBAAAEPAgTQHlApEgEEEEAAAQQQQKC9AgTQ7T23tAwBBBBAAAEEEEDAgwABtAdUikQAAQQQQAABBBBorwABdHvPLS1DAAEEEEAAAQQQ8CBAAO0BlSIRQAABBBBAAAEE2itAAN3ec0vLEEAAAQQQQAABBDwIEEB7QKVIBBBAAAEEEEAAgfYKEEC399zSMgQQQAABBBBAAAEPAgTQHlApEgEEEEAAAQQQQKC9AgTQ7T23tAwBBBBAAAEEEEDAgwABtAdUikQAAQQQQAABBBBorwABdHvPLS1DAAEEEEAAAQQQ8CBAAO0BlSIRQAABBBBAAAEE2itAAN3ec0vLEEAAAQQQQAABBDwIEEB7QKVIBBBAAAEEEEAAgfYKEEC399zSMgQQQAABBBBAAAEPAgTQHlApEgEEEEAAAQQQQKC9AgTQ7T23tAwBBBBAAAEEEEDAgwABtAdUikQAAQQQQAABBBBorwABdHvPLS1DAAEEEEAAAQQQ8CBAAO0BlSIRQAABBBBAAAEE2itAAN3ec0vLEEAAAQQQQAABBDwIEEB7QKVIBBBAAAEEEEAAgfYKEEC399zSMgQQQAABBBBAAAEPAgTQHlApEgEEEEAAAQQQQKC9Av8DeJrFsb7n4X8AAAAASUVORK5CYII=",',
      authtoken: authToken,
      format: 'png',
      tag: 'HealthChecks',
      programe: 'prog2',
      date: '1572253220',
      uhid: uhid,
      category: 'OpSummary',
      filename: 'TestFile1234.png',
    };
    console.log(process.env.PRISM_UPLOAD_RECORDS_API);
    const uploadResult = await fetch('http://blue.phrdemo.com/ui/data/uploaduserrecords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
      },
      body: JSON.stringify(payLoad),
    })
      .then((res) => res.text())
      .catch((error) => {
        console.log('error in upload:====== ', error);
        throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
      });

    console.log('upload records response', uploadResult);
    return uploadResult;
  }
}
