import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';

import {
    MedicalRecords,
    MedicalRecordType
} from 'profiles-service/entities';

import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getUnixTime } from 'date-fns';
import { ApiConstants } from 'ApiConstants';

import {
    prescriptionSource,
    uploadPrescriptions,
    PrescriptionInputArgs,
} from 'profiles-service/resolvers/prescriptionUpload';

import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';
import { getFileTypeFromMime } from 'helpers/generalFunctions';

export const addPatientLabTestRecordTypeDefs = gql`

    input AddPrescriptionRecordInput {
        id: String
        patientId: ID!
        recordType: MedicalRecordType!
        issuingDoctor: String
        location: String
        dateOfPrescription: Date
        prescriptionFiles: [prescriptionFileProperties]
    }

    input prescriptionFileProperties {
        fileName: String
        mimeType: String
        content: String
    }

    type AddPrescriptionRecordResult {
        status: Boolean
    }

    extend type Mutation {
        addPatientPrescriptionRecord(addPrescriptionRecordInput: AddPrescriptionRecordInput): AddPrescriptionRecordResult!
    }
`

type prescriptionFileProperties = {
    fileName: string;
    mimeType: string;
    content: string;
}

interface PrismPrescriptionFileProperties extends prescriptionFileProperties {
    id: string
    dateCreated: number;
}

type AddPrescriptionRecordInput = {
    id?: string;
    patientId: string;
    recordType: MedicalRecordType;
    issuingDoctor: string;
    location: string;
    dateOfPrescription: Date;
    prescriptionFiles: [prescriptionFileProperties]
}

type PrescriptionRecordInputArgs = { addPrescriptionRecordInput: AddPrescriptionRecordInput };

type AddPrescriptionRecordResult = {
    status: boolean;
};

const addPatientPrescriptionRecord: Resolver<
    null,
    PrescriptionRecordInputArgs,
    ProfilesServiceContext,
    AddPrescriptionRecordResult
> = async (parent, { addPrescriptionRecordInput }, { profilesDb }) => {

    const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient = await patientsRepo.getPatientDetails(addPrescriptionRecordInput.patientId);

    if (patient == null) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }

    /* Add prescription record to PRISM */

    const prescriptionFilesInput: Array<PrismPrescriptionFileProperties> = [];


    if (addPrescriptionRecordInput.prescriptionFiles && addPrescriptionRecordInput.prescriptionFiles.length) {
        addPrescriptionRecordInput.prescriptionFiles.forEach((file) => {
            if (file && file.fileName) {
                prescriptionFilesInput.push({
                    id: "",
                    fileName: file.fileName,
                    mimeType: file.mimeType,
                    content: file.content,
                    dateCreated: getUnixTime(new Date()) * 1000
                })
            }
        })
    }

    const prescriptionInputArgs: PrescriptionInputArgs = {
        prescriptionInput: {
            id: addPrescriptionRecordInput.id ? addPrescriptionRecordInput.id : '',
            prescribedBy: addPrescriptionRecordInput.issuingDoctor,
            prescriptionName: '',
            dateOfPrescription: addPrescriptionRecordInput.dateOfPrescription
                ? getUnixTime(addPrescriptionRecordInput.dateOfPrescription) * 1000
                : getUnixTime(new Date()) * 1000,
            startDate: 0,
            endDate: 0,
            notes: '',
            prescriptionSource: prescriptionSource.SELF,
            prescriptionDetail: [],
            prescriptionFiles: prescriptionFilesInput,
            speciality: '',
            hospital_name: '',
            hospitalId: '',
            address: '',
            city: '',
            pincode: '',
            instructions: [],
            diagnosis: [],
            diagnosticPrescription: [],
            medicinePrescriptions: [],
        },
        uhid: patient.uhid,
    };

    const uploadedResult = (await uploadPrescriptions(null, prescriptionInputArgs, null)) as {
        recordId: string;
    };

    const prismFileIds = uploadedResult.recordId;

    /* Upload document to blob storage 
    As of now supports one file
    */

    let documentURLs = '';

    if (
        addPrescriptionRecordInput.prescriptionFiles && addPrescriptionRecordInput.prescriptionFiles.length &&
        addPrescriptionRecordInput.prescriptionFiles[0].fileName.length > 0
    ) {
        const fileRecord = addPrescriptionRecordInput.prescriptionFiles[0]

        const uploadFileType = getFileTypeFromMime(fileRecord.mimeType);

        documentURLs = await uploadFileToBlobStorage(
            uploadFileType,
            fileRecord.content
        );
    }

    /* Save prescription record data to db */
    const addPrescriptionRecordAttrs: Partial<MedicalRecords> = {
        additionalNotes: '',
        documentURLs: documentURLs,
        issuingDoctor: addPrescriptionRecordInput.issuingDoctor,
        location: addPrescriptionRecordInput.location,
        observations: '',
        patient: patient,
        prismFileIds: prismFileIds,
        recordType: addPrescriptionRecordInput.recordType,
        referringDoctor: '',
        testDate: addPrescriptionRecordInput.dateOfPrescription,
        testName: '',
    };

    const medicalRecordRepo = profilesDb.getCustomRepository(MedicalRecordsRepository);
    await medicalRecordRepo.addMedicalRecord(addPrescriptionRecordAttrs);

    return { status: true };
}

export const addPatientPrescriptionRecordResolvers = {
    Mutation: {
        addPatientPrescriptionRecord
    },
};