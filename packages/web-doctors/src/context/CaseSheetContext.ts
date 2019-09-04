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
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
  appointmentInfo: GetCaseSheet_getCaseSheet_caseSheetDetails_appointment | null,
  caseSheetId: string | null;
  symptoms: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null;
  setSymptoms:
    | React.Dispatch<
        React.SetStateAction<GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null>
      >
    | (() => void);
  notes: string | null;
  setNotes: React.Dispatch<React.SetStateAction<string | null>> | (() => void);
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
}

export const CaseSheetContext = createContext<CaseSheetContextProps>({
  loading: true,
  patientDetails: null,
  appointmentInfo: null,
  caseSheetId: null,
  symptoms: null,
  setSymptoms: () => {},
  notes: null,
  setNotes: () => {},
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
});
