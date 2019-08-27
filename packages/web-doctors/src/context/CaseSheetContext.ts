import {
  GetCaseSheet_getCaseSheet_patientDetails,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
} from 'graphql/types/GetCaseSheet';
import { createContext } from 'react';

export interface CaseSheetContextProps {
  loading: boolean;
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
  caseSheetId: string | null;
  symptoms: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null;
  setSymptoms:
    | React.Dispatch<
        React.SetStateAction<GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null>
      >
    | (() => void);
  notes: string | null;
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
}

export const CaseSheetContext = createContext<CaseSheetContextProps>({
  loading: true,
  patientDetails: null,
  caseSheetId: null,
  symptoms: null,
  setSymptoms: () => {},
  notes: null,
  diagnosis: null,
  setDiagnosis: () => {},
  otherInstructions: null,
  setOtherInstructions: () => {},
  diagnosticPrescription: null,
  setDiagnosticPrescription: () => {},
  medicinePrescription: null,
  setMedicinePrescription: () => {},
});
