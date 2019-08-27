import {
  GetCaseSheet_getCaseSheet_patientDetails,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
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
});
