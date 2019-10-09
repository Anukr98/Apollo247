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
  diagnosticPrescription:
    | GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription[]
    | null;
  setDiagnosticPrescription:
    | React.Dispatch<
        React.SetStateAction<
          | GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription[]
          | null
        >
      >
    | (() => void);
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
  pastAppointments: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments[] | null;
  setCasesheetNotes: (notes: string) => void;
  autoCloseCaseSheet: boolean;
}

export const CaseSheetContextJrd = createContext<CaseSheetContextPropsJrd>({
  loading: true,
  setCaseSheetEdit: () => {},
  caseSheetEdit: false,
  patientDetails: null,
  appointmentInfo: null,
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
});
