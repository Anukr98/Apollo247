import { EntityRepository, Repository } from 'typeorm';
import { Patient } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';
import requestPromise from 'request-promise';

import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
  PrismSignUpUserData,
} from 'types/prism';
import { UploadDocumentInput } from 'profiles-service/resolvers/uploadDocumentToPrism';

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
    return authTokenResult !== null ? authTokenResult.response : null;
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
  async getPrismUsersDetails(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const detailsResult = await fetch(
      `${process.env.PRISM_GET_USER_DETAILS_API}?authToken=${authToken}&uhid=${uhid}`,
      prismHeaders
    )
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });

    return detailsResult;
  }

  async uploadDocumentToPrism(uhid: string, prismAuthToken: string, docInput: UploadDocumentInput) {
    console.log(uhid, prismAuthToken);

    const currentTimeStamp = Math.floor(new Date().getTime() / 1000);
    const randomNumber = Math.floor(Math.random() * 10000);
    const fileFormat = docInput.fileType.toLowerCase();
    const documentName = `${currentTimeStamp}${randomNumber}.${fileFormat}`;
    const formData = {
      file: docInput.base64FileInput,
      authtoken: prismAuthToken,
      format: fileFormat,
      tag: docInput.category,
      programe: ApiConstants.PRISM_UPLOAD_DOCUMENT_PROGRAME,
      date: currentTimeStamp,
      uhid: uhid,
      category: docInput.category,
      filename: documentName,
    };

    const options = {
      method: 'POST',
      url: `${process.env.PRISM_UPLOAD_RECORDS_API}`,
      headers: {
        Connection: 'keep-alive',
        'Accept-Encoding': 'gzip, deflate',
        Host: 'blue.phrdemo.com',
        Accept: '*/*',
      },
      formData: formData,
    };
    console.log('==========================', options, '=================');

    const uploadResult = await requestPromise(options)
      .then((res) => {
        console.log('in rseponseee', res);

        return JSON.parse(res);
      })
      .catch((err) => {
        console.log(err);
        throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
      });

    console.log(
      'upload result ------->',
      uploadResult,
      uploadResult['errorCode'],
      uploadResult['response'],
      uploadResult != null,
      uploadResult.response != null,
      uploadResult !== null && uploadResult.response !== null,
      uploadResult.response
    );
    return uploadResult && uploadResult.response ? uploadResult.response : null;
  }
}
