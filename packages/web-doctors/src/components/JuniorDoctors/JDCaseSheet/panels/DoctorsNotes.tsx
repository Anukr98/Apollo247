+import React, { useContext } from 'react';
import { Typography, makeStyles, Box } from '@material-ui/core';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { useParams } from 'hooks/routerHooks';
import { Params } from 'components/JuniorDoctors/JDCaseSheet/CaseSheet';
import {
  getLocalStorageItem,
  updateLocalStorageItem,
} from 'components/case-sheet/panels/LocalStorageUtils';

const useStyles = makeStyles(() => ({
  container: {
    borderRadius: '5px',
    color: '#01475b !important',
    padding: '10px 10px 10px 0px',
    fontSize: 14,
    lineHeight: 1.43,
    fontWeight: 'normal',
    width: '100%',
    marginBottom: 15,
  },
  notesHeader: {
    color: 'rgba(2,71,91,0.6)',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 10,
  },
  textFieldColor: {
    '& input': {
      color: 'initial',
      '& :before': {
        border: 0,
      },
    },
  },
  textFieldWrapper: {
    border: 'solid 1px #30c1a3',
    borderRadius: 10,
    padding: 16,
    color: '#01475b',
    fontSize: 14,
    fontWeight: 500,
  },
}));

export const DoctorsNotes: React.FC = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const { notes, caseSheetEdit, diagnosticTestResult, setDiagnosticTestResult,
    clinicalObservationNotes, setClinicalObservationNotes, setCasesheetNotes } = useContext(CaseSheetContextJrd);
  const getDefaultValue = (field: string) => {
    const storageItem = getLocalStorageItem(params.appointmentId);
    if(field === 'notes'){
      return storageItem ? storageItem.notes : notes;
    }else if(field === 'diagnosticTestResult'){
      return storageItem ? storageItem.diagnosticTestResult : diagnosticTestResult;
    }else if(field === 'clinicalObservationNotes'){
      return storageItem ? storageItem.clinicalObservationNotes : clinicalObservationNotes;
    }
  };
  return (
    <div>
      <div className={classes.container}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
          Diagnostics Test Results
        </Typography>
        <Typography component="div">
          <AphTextField
            fullWidth
            defaultValue={getDefaultValue('diagnosticTestResult')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.diagnosticTestResult = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setDiagnosticTestResult(e.target.value);
            }}
            disabled={!caseSheetEdit}
            multiline
          />
        </Typography>
      </div>
      <div className={classes.container}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
          Clinical Observation/notes
        </Typography>
        <Typography component="div">
          <AphTextField
            fullWidth
            defaultValue={getDefaultValue('clinicalObservationNotes')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.clinicalObservationNotes = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setClinicalObservationNotes(e.target.value);
            }}
            disabled={!caseSheetEdit}
            multiline
          />
        </Typography>
      </div>
      <div className={classes.container}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
          Notes (This is for Senior Doctor view only)
        </Typography>
        <Typography component="div">
          <AphTextField
            fullWidth
            placeholder="What you enter here won't be shown to the patient.."
            defaultValue={getDefaultValue('notes')}
            disabled={!caseSheetEdit}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.notes = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setCasesheetNotes(e.target.value);
            }}
            multiline
          />
        </Typography>
      </div>
    </div>
  );
};