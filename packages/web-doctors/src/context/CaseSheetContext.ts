import {
  GetCaseSheet_getCaseSheet_patientDetails,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_appointment,
  GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails_healthVault,
  GetCaseSheet_getCaseSheet_caseSheetDetails_appointment_appointmentDocuments as appointmentDocument,
} from 'graphql/types/GetCaseSheet';
import { createContext } from 'react';

export interface VitalErrorProps {
  height: String;
  weight: String;
}

export interface CaseSheetContextProps {
  loading: boolean;
  caseSheetEdit: boolean;
  setCaseSheetEdit: React.Dispatch<React.SetStateAction<boolean>> | (() => false);
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
  appointmentInfo: GetCaseSheet_getCaseSheet_caseSheetDetails_appointment | null;
  createdDoctorProfile: GetCaseSheet_getCaseSheet_caseSheetDetails_createdDoctorProfile | null;
  caseSheetId: string | null;
  symptoms: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null;
  setSymptoms:
    | React.Dispatch<
        React.SetStateAction<GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null>
      >
    | (() => void);
  notes: string | null;
  sdConsultationDate: string | null;
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
  diagnosticPrescription: any[] | null;
  setDiagnosticPrescription: React.Dispatch<React.SetStateAction<any[] | null>> | (() => void);
  favouriteTests: any[] | null;
  setFavouriteTests: React.Dispatch<React.SetStateAction<any[] | null>> | (() => void);
  medicinePrescription: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] | null;
  setMedicinePrescription:
    | React.Dispatch<
        React.SetStateAction<
          GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] | null
        >
      >
    | (() => void);

  favouriteMedicines: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] | null;
  setFavouriteMedicines:
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
  followUpConsultType: string[];
  setFollowUpConsultType: React.Dispatch<React.SetStateAction<string[]>> | (() => void);
  followUpAfterInDays: string[];
  setFollowUpAfterInDays: React.Dispatch<React.SetStateAction<string[]>> | (() => void);
  followUpDate: string[];
  setFollowUpDate: React.Dispatch<React.SetStateAction<string[]>> | (() => void);
  healthVault: GetCaseSheet_getCaseSheet_patientDetails_healthVault[] | null;
  pastAppointments: GetCaseSheet_getCaseSheet_pastAppointments[] | null;
  appointmentDocuments: appointmentDocument[] | null;
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
  vitalError: VitalErrorProps;
  referralDescription: string;
  referralSpecialtyName: string;
  referralError: boolean;
  medicationHistory: string;
  occupationHistory: string;

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
  setVitalError: (vitalError: VitalErrorProps) => void;
  setReferralSpecialtyName: (referralSpecialtyName: string) => void;
  setReferralDescription: (referralDescription: string) => void;
  setReferralError: (referralError: boolean) => void;
  setMedicationHistory: (medicationHistory: string) => void;
  setOccupationHistory: (occupationHistory: string) => void;

  gender: string;
  setGender: (gender: string) => void;

  jrdName: string;
  jrdSubmitDate: string;
  documentArray: appointmentDocument | null;
  setDocumentArray: (documentArray: appointmentDocument) => void;
}

export const CaseSheetContext = createContext<CaseSheetContextProps>({
  loading: true,
  setCaseSheetEdit: () => {},
  caseSheetEdit: false,
  patientDetails: null,
  appointmentInfo: null,
  appointmentDocuments: null,
  createdDoctorProfile: null,
  caseSheetId: null,
  symptoms: null,
  setSymptoms: () => {},
  notes: null,
  sdConsultationDate: null,
  setSRDNotes: () => {},
  juniorDoctorNotes: null,
  diagnosis: null,
  setDiagnosis: () => {},
  otherInstructions: null,
  setOtherInstructions: () => {},
  diagnosticPrescription: null,
  setDiagnosticPrescription: () => {},
  favouriteTests: null,
  setFavouriteTests: () => {},
  medicinePrescription: null,
  setMedicinePrescription: () => {},
  favouriteMedicines: [],
  setFavouriteMedicines: () => {},
  consultType: [],
  setConsultType: () => {},
  followUpConsultType: [],
  setFollowUpConsultType: () => {},
  followUp: [],
  setFollowUp: () => {},
  followUpAfterInDays: [],
  setFollowUpAfterInDays: () => {},
  followUpDate: [],
  setFollowUpDate: () => {},
  healthVault: null,
  pastAppointments: null,
  documentArray: null,
  setDocumentArray: (documentArray: appointmentDocument) => {},
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
  vitalError: {
    height: '',
    weight: '',
  },
  referralSpecialtyName: '',
  referralDescription: '',
  referralError: false,
  medicationHistory: '',
  occupationHistory: '',

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
  setVitalError: () => {},
  setReferralSpecialtyName: () => {},
  setReferralDescription: () => {},
  setReferralError: () => {},
  setMedicationHistory: () => {},
  setOccupationHistory: () => {},

  gender: '',
  setGender: () => {},

  jrdName: '',
  jrdSubmitDate: '',
});
