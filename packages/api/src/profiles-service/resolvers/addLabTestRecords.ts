import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';

import {
    MedicalRecords,
    MedicalRecordParameters,
    MedicalRecordType
} from 'profiles-service/entities';

import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { MedicalRecordParametersRepository } from 'profiles-service/repositories/medicalRecordParametersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getUnixTime } from 'date-fns';
import { ApiConstants } from 'ApiConstants';

import { LabResultsUploadRequest, LabResultsUploadResponse } from 'types/phrv1';
import { LabResultsInputArgs, uploadLabResults } from 'profiles-service/resolvers/labResultsUpload';

import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';
import { getFileTypeFromMime } from 'helpers/generalFunctions';

export const addPatientLabTestRecordTypeDefs = gql`

    input AddLabTestRecordInput {
        patientId: ID!
        recordType: MedicalRecordType!
        labTestName: String!
        labTestDate: Date!
        referringDoctor: String
        observations: String
        additionalNotes: String
        labTestResults: [LabTestParameters]
        testResultFiles: [LabTestFileProperties]
    }

    input LabTestParameters {
        maximum: Float
        minimum: Float
        parameterName: String
        result: Float
        unit: String
    }

    input LabTestFileProperties {
        fileName: String
        mimeType: String
        content: String
    }

    type AddLabTestRecordResult {
        status: Boolean
    }

    extend type Mutation {
        addPatientLabTestRecord(addLabTestRecordInput: AddLabTestRecordInput): AddLabTestRecordResult!
    }
`
type AddLabTestRecordInput = {
    patientId: string;
    recordType: MedicalRecordType;
    labTestName: string;
    labTestDate: Date;
    referringDoctor: string;
    observations: string;
    additionalNotes: string;
    labTestResults: [LabTestParameters];
    testResultFiles: [LabTestFileProperties];
};

interface LabTestFileProperties {
    fileName: string;
    mimeType: string;
    content: string;
};

interface PrismLabTestFileProperties extends LabTestFileProperties {
    id: string
    dateCreated: number;
}

interface LabTestParameters {
    maximum: number;
    minimum: number;
    parameterName: string;
    result: number;
    unit: string;
};

interface PrismLabTestParameters {
    parameterName: string;
    unit: string;
    result: string;
    resultDate: number;
    range: string;
    outOfRange: Boolean;
}

type LabTestRecordInputArgs = { addLabTestRecordInput: AddLabTestRecordInput };

type AddLabTestRecordResult = {
    status: boolean;
};


const addPatientLabTestRecord: Resolver<
    null,
    LabTestRecordInputArgs,
    ProfilesServiceContext,
    AddLabTestRecordResult
> = async (parent, { addLabTestRecordInput }, { profilesDb }) => {

    const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient = await patientsRepo.getPatientDetails(addLabTestRecordInput.patientId);
    if (patient == null) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }

    /* Add lab test records to PRISM */

    const labTestFilesInput: Array<PrismLabTestFileProperties> = [];


    if (addLabTestRecordInput.testResultFiles && addLabTestRecordInput.testResultFiles.length) {
        addLabTestRecordInput.testResultFiles.forEach((file) => {
            if (file && file.fileName) {
                labTestFilesInput.push({
                    id: "",
                    fileName: file.fileName,
                    mimeType: file.mimeType,
                    content: file.content,
                    dateCreated: getUnixTime(new Date()) * 1000
                })
            }
        })
    }

    const labTestResultsInput: PrismLabTestParameters[] = [];

    addLabTestRecordInput.labTestResults.map((item) => {
        labTestResultsInput.push({
            parameterName: item.parameterName,
            result: item.result.toString(),
            unit: item.unit,
            range: item.minimum && item.maximum ? item.minimum + '-' + item.maximum : '',
            outOfRange: false,
            resultDate: getUnixTime(new Date(addLabTestRecordInput.labTestDate)) * 1000,
        });
    });

    const labResultsInputArgs: LabResultsInputArgs = {
        labResultsInput: {
            labTestName: addLabTestRecordInput.labTestName,
            labTestDate: addLabTestRecordInput.labTestDate
                ? getUnixTime(addLabTestRecordInput.labTestDate) * 1000
                : getUnixTime(new Date()) * 1000,
            labTestRefferedBy: addLabTestRecordInput.referringDoctor,
            observation: addLabTestRecordInput.observations,
            identifier: '',
            additionalNotes: addLabTestRecordInput.additionalNotes,
            labTestResults: labTestResultsInput,
            labTestSource: ApiConstants.LABTEST_SOURCE_SELF_UPLOADED.toString(),
            visitId: '',
            testResultFiles: labTestFilesInput,
        },
        uhid: patient.uhid,
    };

    const uploadedResult = (await uploadLabResults(null, labResultsInputArgs, null)) as {
        recordId: string;
    };

    const prismFileIds = uploadedResult.recordId;

    /* Upload document to blob storage 
    As of now supports one file
    */

    let documentURLs = '';

    if (
        addLabTestRecordInput.testResultFiles && addLabTestRecordInput.testResultFiles.length &&
        addLabTestRecordInput.testResultFiles[0].fileName.length > 0
    ) {
        const fileRecord = addLabTestRecordInput.testResultFiles[0]

        const uploadFileType = getFileTypeFromMime(fileRecord.mimeType);

        documentURLs = await uploadFileToBlobStorage(
            uploadFileType,
            fileRecord.content
        );
    }

    const addLabTestRecordAttrs: Partial<MedicalRecords> = {
        additionalNotes: addLabTestRecordInput.additionalNotes,
        documentURLs: documentURLs,
        observations: addLabTestRecordInput.observations,
        patient: patient,
        prismFileIds: prismFileIds,
        recordType: addLabTestRecordInput.recordType,
        referringDoctor: addLabTestRecordInput.referringDoctor,
        testDate: addLabTestRecordInput.labTestDate,
        testName: addLabTestRecordInput.labTestName,
    };

    /* Save lab test record to db */

    const medicalRecordRepo = profilesDb.getCustomRepository(MedicalRecordsRepository);
    const medicalRecord = await medicalRecordRepo.addMedicalRecord(addLabTestRecordAttrs);

    /* Save lab test parameters to db */

    if (
        medicalRecord &&
        addLabTestRecordInput.labTestResults &&
        addLabTestRecordInput.labTestResults.length > 0
    ) {
        const medicalRecordParamsRepo = profilesDb.getCustomRepository(
            MedicalRecordParametersRepository
        );

        let medicalRecordparameters: Partial<MedicalRecordParameters>[] =
            addLabTestRecordInput.labTestResults;
        medicalRecordparameters.map((p) => (p.medicalRecords = medicalRecord));

        medicalRecordparameters = JSON.parse(JSON.stringify(medicalRecordparameters))
        await medicalRecordParamsRepo.addMedicalRecordParameters(medicalRecordparameters);
    }

    return { status: true };
}

export const addPatientLabTestRecordResolvers = {
    Mutation: {
        addPatientLabTestRecord
    },
};