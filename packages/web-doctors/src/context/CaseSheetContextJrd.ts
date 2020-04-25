import {
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_healthVault,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment_appointmentDocuments as appointmentDocument,
} from 'graphql/types/GetJuniorDoctorCaseSheet';
import { createContext } from 'react';

export interface CaseSheetContextPropsJrd {
  loading: boolean;
  caseSheetEdit: boolean;
  setCaseSheetEdit: React.Dispatch<React.SetStateAction<boolean>> | (() => false);
  patientDetails: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails | null;
  appointmentInfo: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_appointment | null;
  caseSheetId: string | null;
  symptoms: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms[] | null;
  setSymptoms:
    | React.Dispatch<
        React.SetStateAction<
          GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms[] | null
        >
      >
    | (() => void);
  notes: string | null;
  setNotes: React.Dispatch<React.SetStateAction<string | null>> | (() => void);
  juniorDoctorNotes: string | null;
  diagnosis: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis[] | null;
  setDiagnosis:
    | React.Dispatch<
        React.SetStateAction<
          GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosis[] | null
        >
      >
    | (() => void);
  otherInstructions:
    | GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions[]
    | null;
  setOtherInstructions:
    | React.Dispatch<
        React.SetStateAction<
          | GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_otherInstructions[]
          | null
        >
      >
    | (() => void);
  diagnosticPrescription: any[] | null;
  setDiagnosticPrescription: React.Dispatch<React.SetStateAction<any[] | null>> | (() => void);
  medicinePrescription:
    | GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription[]
    | null;
  setMedicinePrescription:
    | React.Dispatch<
        React.SetStateAction<
          | GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_medicinePrescription[]
          | null
        >
      >
    | (() => void);
  consultType: string[];
  setConsultType: React.Dispatch<React.SetStateAction<string[]>> | (() => void);
  followUp: boolean[];
  setFollowUp: React.Dispatch<React.SetStateAction<boolean[]>> | (() => void);
  followUpAfterInDays: string[];
  setFollowUpAfterInDays: React.Dispatch<React.SetStateAction<string[]>> | (() => void);
  followUpDate: string[];
  setFollowUpDate: React.Dispatch<React.SetStateAction<string[]>> | (() => void);
  healthVault:
    | GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_patientDetails_healthVault[]
    | null;
  appointmentDocuments: appointmentDocument[] | null;
  pastAppointments: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments[] | null;
  setCasesheetNotes: (notes: string) => void;
  autoCloseCaseSheet: boolean;

  height: string;
  weight: string;
  temperature: string;
  bp: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  dietAllergies: string;
  drugAllergies: string;
  lifeStyle: string;
  familyHistory: string;
  menstrualHistory: string;
  dosageList: any;

  setHeight: (height: string) => void;
  setWeight: (weight: string) => void;
  setTemperature: (temperature: string) => void;
  setBp: (bp: string) => void;
  setPastMedicalHistory: (medicalHistory: string) => void;
  setPastSurgicalHistory: (surgicalHistory: string) => void;
  setDietAllergies: (dietAllergy: string) => void;
  setDrugAllergies: (drugAllergy: string) => void;
  setLifeStyle: (lifeStyle: string) => void;
  setFamilyHistory: (familyHistory: string) => void;
  setMenstrualHistory: (menstrualHistory: string) => void;

  gender: string;
  setGender: (gender: string) => void;
  documentArray: appointmentDocument | null;
  setDocumentArray: (documentArray: appointmentDocument) => void;
}

export const CaseSheetContextJrd = createContext<CaseSheetContextPropsJrd>({
  loading: true,
  setCaseSheetEdit: () => {},
  caseSheetEdit: false,
  patientDetails: null,
  appointmentInfo: null,
  appointmentDocuments: null,
  caseSheetId: null,
  symptoms: null,
  setSymptoms: () => {},
  notes: null,
  setNotes: () => {},
  juniorDoctorNotes: null,
  diagnosis: null,
  setDiagnosis: () => {},
  otherInstructions: null,
  setOtherInstructions: () => {},
  diagnosticPrescription: null,
  setDiagnosticPrescription: () => {},
  medicinePrescription: null,
  setMedicinePrescription: () => {},
  consultType: [],
  setConsultType: () => {},
  followUp: [],
  setFollowUp: () => {},
  followUpAfterInDays: [],
  setFollowUpAfterInDays: () => {},
  followUpDate: [],
  setFollowUpDate: () => {},
  healthVault: null,
  pastAppointments: null,
  setCasesheetNotes: () => {},
  autoCloseCaseSheet: false,
  documentArray: null,
  setDocumentArray: () => {},
  height: '',
  weight: '',
  bp: '',
  temperature: '',
  pastMedicalHistory: '',
  pastSurgicalHistory: '',
  dietAllergies: '',
  drugAllergies: '',
  lifeStyle: '',
  familyHistory: '',
  menstrualHistory: '',
  dosageList: [],

  setBp: () => {},
  setHeight: () => {},
  setWeight: () => {},
  setTemperature: () => {},
  setPastMedicalHistory: () => {},
  setPastSurgicalHistory: () => {},
  setDietAllergies: () => {},
  setDrugAllergies: () => {},
  setLifeStyle: () => {},
  setFamilyHistory: () => {},
  setMenstrualHistory: () => {},

  gender: '',
  setGender: () => {},
});
