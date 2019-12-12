import { EntityRepository, Repository } from 'typeorm';
import { Patient } from 'profiles-service/entities';
import { format, differenceInMilliseconds } from 'date-fns';
import winston from 'winston';
import path from 'path';
import { ApiConstants } from 'ApiConstants';

@EntityRepository(Patient)
export class PatientNewRepository extends Repository<Patient> {
  async getAuthToken() {
    const AUTH_URL = `https://login.microsoftonline.com/f8300747-02c3-470c-a3d6-5a3355e3d77d/oauth2/token`;

    const REQUEST_PARAMETERS =
      'grant_type=password&username=aditya.kvs@popcornapps.com&password=thisisaady@11&client_id=ada2ecac-60e9-4d6b-b6af-b20091904735&resource=https://popcornapps-sandbox.api.crm8.dynamics.com';

    const authResponse = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      body: REQUEST_PARAMETERS,
    });

    const authResult = await authResponse.json();
    console.log('messageData--------', authResult);

    // the API frequently returns 201
    if (authResponse.status !== 200 && authResponse.status !== 201) {
      console.error(`Invalid response status ${authResponse.status}.`);
      throw new Error('Auth Token Error');
    }

    return authResult.access_token;
  }

  //method to insert patient
  async insertPatient(accessToken: string, mobilephone: string) {
    const logsDirPath = <string>process.env.API_LOGS_DIRECTORY;
    const logsDir = path.resolve(logsDirPath);

    winston.configure({
      transports: [
        new winston.transports.File({
          filename: logsDir + ApiConstants.PROFILES_SERVICE_ACCESS_LOG_FILE,
          level: 'info',
        }),
        new winston.transports.File({
          filename: logsDir + ApiConstants.PROFILES_SERVICE_ERROR_LOG_FILE,
          level: 'error',
        }),
      ],
      exitOnError: false, // do not exit on handled exceptions
    });

    console.log(mobilephone, '000000000000000000000');
    const INSERT_URL = `https://healthcare.crm8.dynamics.com/api/data/v9.1/contacts  `;
    const patientData = {
      mobilephone,
    };
    const reqStartTime = new Date();
    const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
    winston.log({
      message: 'External apiRequest Starting',
      time: reqStartTimeFormatted,
      operation: INSERT_URL,
      level: 'info',
    });
    const insertResponse = await fetch(INSERT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'bearer ' + accessToken,
      },
      body: JSON.stringify(patientData),
    });
    const insertResult = await insertResponse.text();

    const responseLog = {
      message: 'Request Ended',
      time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
      durationInMilliSeconds: differenceInMilliseconds(new Date(), reqStartTime),
      level: 'info',
      response: insertResult,
    };

    winston.log(responseLog);

    console.log('patient insert result: ', insertResult);

    if (
      insertResponse.status !== 200 &&
      insertResponse.status !== 201 &&
      insertResponse.status !== 204
    ) {
      console.error(`Invalid response status ${insertResponse.status}.`);
      throw new Error('Insert Patient Error');
    }

    return insertResult;
  }

  async updatePatient(accessToken: string, updateAttrs: Partial<Patient>, mobileNumber: string) {
    //get patient details from API by sending mobile number
    //const mobileNumber = updateAttrs.mobileNumber;
    const mobilephone = mobileNumber.replace('+', '');
    const GET_PATIENT_DETAILS_URL = `https://healthcare.crm8.dynamics.com/api/data/v9.1/contacts?$select=firstname,lastname,mobilephone,gendercode,new_uhid,emailaddress1,birthdate,new_relationtype,new_allergies,telephone1,address1_stateorprovince,address1_country,address1_line1,address1_line2,address1_city,address1_postalcode&$filter=contains(mobilephone,'${mobilephone}')`;

    const reqStartTime = new Date();
    const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
    winston.log({
      message: 'External apiRequest Starting',
      time: reqStartTimeFormatted,
      operation: GET_PATIENT_DETAILS_URL,
      level: 'info',
    });
    const getPatientDetails = await fetch(GET_PATIENT_DETAILS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'bearer ' + accessToken,
      },
    });
    const getPatientResult = await getPatientDetails.json();

    const responseLog = {
      message: 'Request Ended',
      time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
      durationInMilliSeconds: differenceInMilliseconds(new Date(), reqStartTime),
      level: 'info',
      response: getPatientResult,
    };

    winston.log(responseLog);

    if (getPatientResult.value.length === 0) {
      throw new Error('Invalid Mobile Number');
    }

    const contactId = getPatientResult.value[0].contactid;

    //update patient details
    if (contactId === '') {
      throw new Error('Update Patient Error contact Id empty');
    }

    const gendercode = {
      MALE: 1,
      FEMALE: 2,
      OTHER: 935000000,
    };

    const relationcode = {
      ME: 100000000,
      MOTHER: 100000001,
      FATHER: 100000002,
      SISTER: 100000003,
      BROTHER: 100000004,
      COUSIN: 100000005,
      WIFE: 100000006,
      HUSBAND: 100000007,
      OTHER: 100000008,
    };

    const UPDATE_URL = `https://healthcare.crm8.dynamics.com/api/data/v9.1/contacts(${contactId}) `;

    const updateData = {
      firstname: updateAttrs.firstName,
      lastname: updateAttrs.lastName,
      emailaddress1: updateAttrs.emailAddress,
      gendercode: updateAttrs.gender ? gendercode[updateAttrs.gender] : undefined,
      new_relationtype: updateAttrs.relation ? relationcode[updateAttrs.relation] : undefined,
      birthdate: updateAttrs.dateOfBirth
        ? format(updateAttrs.dateOfBirth, 'yyyy-MM-dd')
        : undefined,
    };
    console.log(JSON.stringify(updateData));

    const updateResponse = await fetch(UPDATE_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'bearer ' + accessToken,
      },
      body: JSON.stringify(updateData),
    });
    const updateResult = await updateResponse.text();
    console.log('updateResponse=====', updateResponse);
    console.log(updateResult);
    if (
      updateResponse.status !== 200 &&
      updateResponse.status !== 201 &&
      updateResponse.status !== 204
    ) {
      throw new Error('Update Patient Error');
    }
    //send response
    return updateResult;
  }
}
