import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';

import { MedicalRecordType } from 'profiles-service/entities';
import { HospitalizationRecords } from 'profiles-service/entities/hospitalizationRecordsEntity';

import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { HospitalizationRecordsRepository } from 'profiles-service/repositories/hospitalizationRecordsRepository';

import { saveDischargeSummaryToPrism } from 'helpers/phrV1Services'
import { DischargeSummaryUploadRequest, DischargeSummaryUploadResponse } from 'types/phrv1';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getUnixTime } from 'date-fns';
import { ApiConstants } from 'ApiConstants';
import { getFileTypeFromMime } from 'helpers/generalFunctions';
import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';

export const addPatientHospitalizationRecordTypeDefs = gql`

    input AddHospitalizationRecordInput {
        patientId: ID!
        recordType: MedicalRecordType!
        dischargeDate: Date!
        hospitalName: String!
        doctorName: String!
        hospitalizationFiles: [HospitalizationFileProperties]
    }

    input HospitalizationFileProperties {
        fileName: String
        mimeType: String
        content: String
    }

    type AddHospitalizationRecordResult {
        status: Boolean
    }

    extend type Mutation {
        addPatientHospitalizationRecord (addHospitalizationRecordInput: AddHospitalizationRecordInput): AddHospitalizationRecordResult!
    }
`

type HospitalizationFileProperties = {
    fileName: string;
    mimeType: string;
    content: string;
}

type AddHospitalizationRecordInput = {
    patientId: string;
    recordType: MedicalRecordType;
    dischargeDate: Date;
    hospitalName: string;
    doctorName: string;
    hospitalizationFiles: [HospitalizationFileProperties]
}

type HospitalizationRecordInputArgs = { addHospitalizationRecordInput: AddHospitalizationRecordInput };

type AddHospitalizationRecordResult = {
    status: boolean;
};

const addPatientHospitalizationRecord: Resolver<
    null,
    HospitalizationRecordInputArgs,
    ProfilesServiceContext,
    AddHospitalizationRecordResult
> = async (parent, { addHospitalizationRecordInput }, { profilesDb }) => {
    const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient = await patientsRepo.getPatientDetails(addHospitalizationRecordInput.patientId);

    if (patient == null) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }

    /* Add hospitalization / discharge summary records to PRISM */

    const hospitalizationFilesInput: {
        id: string;
        fileName: string;
        mimeType: string;
        content: string;
        dateCreated: number;
    }[] = [];

    if (addHospitalizationRecordInput.hospitalizationFiles && addHospitalizationRecordInput.hospitalizationFiles.length) {
        addHospitalizationRecordInput.hospitalizationFiles.forEach(function (file) {
            if (file && file.fileName) {
                hospitalizationFilesInput.push({
                    id: "",
                    fileName: file.fileName,
                    mimeType: file.mimeType,
                    content: file.content,
                    dateCreated: getUnixTime(new Date()) * 1000
                })
            }
        })
    }

    let dischargeSummaryUploadArgs: DischargeSummaryUploadRequest = {
        hospitalName: addHospitalizationRecordInput.hospitalName,
        dateOfHospitalization: "",
        doctorName: addHospitalizationRecordInput.doctorName,
        reasonForAdmission: "",
        diagnosisNotes: "",
        dateOfDischarge: getUnixTime(new Date(addHospitalizationRecordInput.dischargeDate)) * 1000,
        dischargeSummary: "",
        doctorInstruction: "",
        dateOfNextVisit: "",
        source: ApiConstants.HOSPITALIZATION_SELF_UPLOAD.toString(),
        hospitalizationFiles: hospitalizationFilesInput
    }

    let uploadResult: DischargeSummaryUploadResponse = await saveDischargeSummaryToPrism(patient.uhid, dischargeSummaryUploadArgs);

    const addHospitalizationRecordAttrs: Partial<HospitalizationRecords> = {
        patient: patient,
        recordType: addHospitalizationRecordInput.recordType,
        hospitalName: addHospitalizationRecordInput.hospitalName,
        dischargeDate: addHospitalizationRecordInput.dischargeDate,
        doctorName: addHospitalizationRecordInput.doctorName,
        prismFileIds: uploadResult.response

    }

    /* Upload document to blob storage 
    As of now supports one file
    */

    if (
        addHospitalizationRecordInput.hospitalizationFiles && addHospitalizationRecordInput.hospitalizationFiles.length &&
        addHospitalizationRecordInput.hospitalizationFiles[0].fileName.length > 0
    ) {
        let fileRecord = addHospitalizationRecordInput.hospitalizationFiles[0]

        const uploadFileType = getFileTypeFromMime(fileRecord.mimeType);

        addHospitalizationRecordAttrs.documentURLs = await uploadFileToBlobStorage(
            uploadFileType,
            fileRecord.content
        );
    }

    /* Save hospitalization records to DB */

    const hospitalizationRecordRepo = profilesDb.getCustomRepository(HospitalizationRecordsRepository);
    await hospitalizationRecordRepo.saveHospitalizationRecords(addHospitalizationRecordAttrs);

    return { status: true };

};

export const addPatientHospitalizationRecordResolvers = {
    Mutation: {
        addPatientHospitalizationRecord,
    },
};