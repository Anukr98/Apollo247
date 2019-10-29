import {
  GetCaseSheet_getCaseSheet_patientDetails,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_appointment,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails_healthVault,
} from 'graphql/types/GetCaseSheet';
import { createContext } from 'react';

export interface CaseSheetContextProps {
  loading: boolean;
  caseSheetEdit: boolean;
  setCaseSheetEdit: React.Dispatch<React.SetStateAction<boolean>> | (() => false);
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
  appointmentInfo: GetCaseSheet_getCaseSheet_caseSheetDetails_appointment | null;
  caseSheetId: string | null;
  symptoms: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null;
  setSymptoms:
    | React.Dispatch<
        React.SetStateAction<GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null>
      >
    | (() => void);
  notes: string | null;
  setSRDNotes: React.Dispatch<React.SetStateAction<string | null>> | (() => void);
  juniorDoctorNotes: string | null;
  diagnosis: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[] | null;
  setDiagnosis:
    | React.Dispatch<
        React.SetStateAction<GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[] | null>
      >
    | (() => void);
  otherInstructions: GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions[] | null;
  setOtherInstructions:
    | React.Dispatch<
        React.SetStateAction<GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions[] | null>
      >
    | (() => void);
  diagnosticPrescription:
    | GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[]
    | null;
  setDiagnosticPrescription:
    | React.Dispatch<
        React.SetStateAction<
          GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[] | null
        >
      >
    | (() => void);
  medicinePrescription: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] | null;
  setMedicinePrescription:
    | React.Dispatch<
        React.SetStateAction<
          GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] | null
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
  healthVault: GetCaseSheet_getCaseSheet_patientDetails_healthVault[] | null;
  pastAppointments: GetCaseSheet_getCaseSheet_pastAppointments[] | null;

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

  jrdName: string;
  jrdSubmitDate: string;
}

export const CaseSheetContext = createContext<CaseSheetContextProps>({
  loading: true,
  setCaseSheetEdit: () => {},
  caseSheetEdit: false,
  patientDetails: null,
  appointmentInfo: null,
  caseSheetId: null,
  symptoms: null,
  setSymptoms: () => {},
  notes: null,
  setSRDNotes: () => {},
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

  jrdName: '',
  jrdSubmitDate: '',
});
