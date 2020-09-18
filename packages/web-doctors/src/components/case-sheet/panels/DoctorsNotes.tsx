import React, { useContext } from 'react';
import { Typography, makeStyles, Box } from '@material-ui/core';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { getLocalStorageItem, updateLocalStorageItem } from './LocalStorageUtils';
import { AphTextField } from '@aph/web-ui-components';
import { useParams } from 'hooks/routerHooks';

const useStyles = makeStyles(() => ({
  container: {
    borderRadius: '5px',
    color: '#01475b !important',
    padding: '10px 10px 10px 0px',
    fontSize: 14,
    lineHeight: 1.43,
    fontWeight: 'normal',
    width: '100%',
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

type Params = { id: string; patientId: string; tabValue: string };
export const DoctorsNotes: React.FC = (props) => {
  const classes = useStyles({});

  const params = useParams<Params>();
  const { juniorDoctorNotes, notes, setSRDNotes, caseSheetEdit, diagnosticTestResult, setDiagnosticTestResult,
    clinicalObservationNotes, setClinicalObservationNotes } = useContext(CaseSheetContext);
  const getDefaultValue = (field: string) => {
    if(field === 'note'){
      const storageItem = getLocalStorageItem(params.id);
      return storageItem ? storageItem.notes : notes;
    }else if(field === 'diagnosticTestResult'){
      const storageItem = getLocalStorageItem(params.id);
      return storageItem ? storageItem.diagnosticTestResult : diagnosticTestResult;
    }else if(field === 'clinicalObservationNotes'){
      const storageItem = getLocalStorageItem(params.id);
      return storageItem ? storageItem.clinicalObservationNotes : clinicalObservationNotes;
    }
  };

  return (
    <div>
      <div className={classes.container}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
          Junior Doctor Notes
        </Typography>
        <Typography component="div">
          <AphTextField
          fullWidth
          className={classes.textFieldColor}
          defaultValue={juniorDoctorNotes && juniorDoctorNotes.length > 0 ? juniorDoctorNotes : 'No notes'}
          multiline
          disabled
          />
        </Typography>
      </div>
      <div className={classes.container}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
          Diagnostics Test Results
        </Typography>
        <Typography component="div">
          <AphTextField
            fullWidth
            className={classes.textFieldColor}
            defaultValue={getDefaultValue('diagnosticTestResult')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.id);
              if (storageItem) {
                storageItem.diagnosticTestResult = e.target.value;
                updateLocalStorageItem(params.id, storageItem);
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
            className={classes.textFieldColor}
            defaultValue={getDefaultValue('clinicalObservationNotes')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.id);
              if (storageItem) {
                storageItem.clinicalObservationNotes = e.target.value;
                updateLocalStorageItem(params.id, storageItem);
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
          Personal Notes (What you enter here won't be shown to the patient..)
        </Typography>
        <Typography component="div">
          <AphTextField
            fullWidth
            placeholder="What you enter here won't be shown to the patient.."
            defaultValue={getDefaultValue('note')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.id);
              if (storageItem) {
                storageItem.notes = e.target.value;
                updateLocalStorageItem(params.id, storageItem);
              }
              setSRDNotes(e.target.value);
            }}
            disabled={!caseSheetEdit}
            multiline
          />
        </Typography>
      </div>
    </div>
  );
};
