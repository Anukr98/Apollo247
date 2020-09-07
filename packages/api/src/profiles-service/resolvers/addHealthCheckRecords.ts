import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';

import { MedicalRecordType, Patient } from 'profiles-service/entities';
import { HealthCheckRecords } from 'profiles-service/entities/healthCheckRecordsEntity'

import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { HealthCheckRecordsRepository } from 'profiles-service/repositories/healthCheckRecordsRepository';

import { saveHealthCheckToPrism } from 'helpers/phrV1Services'
import { HealthCheckUploadRequest, HealthCheckUploadResponse } from 'types/phrv1';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getUnixTime } from 'date-fns';
import { ApiConstants } from 'ApiConstants';
import { getFileTypeFromMime } from 'helpers/generalFunctions';
import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';

export const addPatientHealthCheckRecordTypeDefs = gql`

    input AddHealthCheckRecordInput {
        patientId: ID!
        recordType: MedicalRecordType!
        healthCheckName: String!,
        healthCheckDate: Date!,
        healthCheckFiles: [HealthCheckFileProperties]
    }

    input HealthCheckFileProperties {
        fileName: String
        mimeType: String
        content: String
    }

    type AddHealthCheckRecordResult {
        status: Boolean
    }

    extend type Mutation {
        addPatientHealthCheckRecord (addHealthCheckRecordInput: AddHealthCheckRecordInput): AddHealthCheckRecordResult!
    }
`

type HealthCheckFileProperties = {
    fileName: string;
    mimeType: string;
    content: string;
}

type AddHealthCheckRecordInput = {
    patientId: string;
    recordType: MedicalRecordType;
    healthCheckName: string;
    healthCheckDate: Date;
    healthCheckFiles: [HealthCheckFileProperties]
}

type HealthCheckRecordInputArgs = { addHealthCheckRecordInput: AddHealthCheckRecordInput };

type AddHealthCheckRecordResult = {
    status: boolean;
};

const addPatientHealthCheckRecord: Resolver<
    null,
    HealthCheckRecordInputArgs,
    ProfilesServiceContext,
    AddHealthCheckRecordResult
> = async (parent, { addHealthCheckRecordInput }, { profilesDb }) => {
    const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient = await patientsRepo.getPatientDetails(addHealthCheckRecordInput.patientId);

    if (patient == null) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }

    /* Add health check records to PRISM */

    const healthCheckFilesInput: {
        id: string;
        fileName: string;
        mimeType: string;
        content: string;
        dateCreated: number;
    }[] = [];

    if (addHealthCheckRecordInput.healthCheckFiles && addHealthCheckRecordInput.healthCheckFiles.length) {
        addHealthCheckRecordInput.healthCheckFiles.forEach(function (file) {
            if (file && file.fileName) {
                healthCheckFilesInput.push({
                    id: "",
                    fileName: file.fileName,
                    mimeType: file.mimeType,
                    content: file.content,
                    dateCreated: getUnixTime(new Date()) * 1000
                })
            }
        })
    }

    let healthCheckUploadArgs: HealthCheckUploadRequest = {
        healthCheckName: addHealthCheckRecordInput.healthCheckName,
        healthCheckType: "",
        healthCheckSummary: "",
        healthCheckDate: addHealthCheckRecordInput.healthCheckDate ? getUnixTime(new Date(addHealthCheckRecordInput.healthCheckDate)) * 1000 : "",
        followupDate: "",
        source: ApiConstants.HEALTHCHECK_SELF_UPLOAD.toString(),
        healthCheckFiles: healthCheckFilesInput
    }

    let uploadResult: HealthCheckUploadResponse = await saveHealthCheckToPrism(patient.uhid, healthCheckUploadArgs);

    const addHealthCheckRecordsAttrs: Partial<HealthCheckRecords> = {
        patient: patient,
        recordType: addHealthCheckRecordInput.recordType,
        healthCheckName: addHealthCheckRecordInput.healthCheckName,
        healthCheckDate: addHealthCheckRecordInput.healthCheckDate,
        prismFileIds: uploadResult.response
    }

    /* Upload document to blob storage 
    As of now supports one file
    */

    if (
        addHealthCheckRecordInput.healthCheckFiles && addHealthCheckRecordInput.healthCheckFiles.length &&
        addHealthCheckRecordInput.healthCheckFiles[0].fileName.length > 0
    ) {
        let fileRecord = addHealthCheckRecordInput.healthCheckFiles[0]

        const uploadFileType = getFileTypeFromMime(fileRecord.mimeType);

        addHealthCheckRecordsAttrs.documentURLs = await uploadFileToBlobStorage(
            uploadFileType,
            fileRecord.content
        );
    }


    /* Save health check records to DB */
    const healthCheckRecordRepo = profilesDb.getCustomRepository(HealthCheckRecordsRepository);
    await healthCheckRecordRepo.saveHealthCheckRecords(addHealthCheckRecordsAttrs);

    return { status: true };

};

export const addPatientHealthCheckRecordsResolvers = {
    Mutation: {
        addPatientHealthCheckRecord,
    },
};
