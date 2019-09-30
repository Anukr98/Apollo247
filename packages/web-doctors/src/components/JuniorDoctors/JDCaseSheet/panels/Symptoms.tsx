import React, { useEffect, useContext } from 'react';
import { Theme, FormHelperText } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton, AphDialogTitle, AphDialog } from '@aph/web-ui-components';

import { isEmpty, trim } from 'lodash';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  symtomListGroup: {
    paddingBottom: 4,
  },
  listItem: {
    borderRadius: 5,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 16,
    paddingTop: 14,
    marginBottom: 16,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  symtomHeading: {
    fontSize: 15,
    color: '#01475b',
    fontWeight: 500,
    position: 'relative',
    paddingRight: 40,
  },
  deleteSymptom: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    minWidth: 'auto',
    padding: 0,
    position: 'absolute',
    right: 0,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '& img': {
      maxWidth: 24,
      maxHeight: 24,
    },
  },
  symtomContent: {
    paddingTop: 5,
  },
  symtomType: {
    fontSize: 14,
    lineHeight: 1.43,
    color: '#01475b',
    wordBreak: 'break-word',
  },
  addBtn: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: theme.palette.action.selected,
    fontSize: 14,
    fontWeight: 600,
    padding: 0,
    marginTop: 16,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '& img': {
      marginRight: 8,
      verticalAlign: 'middle',
    },
  },
  noDataFound: {
    borderRadius: 5,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 16,
    paddingTop: 14,
    color: '#02475b',
  },
  dialogWindow: {
    '& >div': {
      '& >div': {
        maxWidth: 480,
      },
    },
  },
  dialogTitle: {
    '& h6': {
      fontSize: 13,
      color: '#01475b',
      fontWeight: 600,
      textAlign: 'center',
    },
  },
  dialogClose: {
    position: 'absolute',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    padding: 0,
    right: 0,
    top: -5,
    minWidth: 'auto',
  },
  dialogActions: {
    padding: '16px 20px',
    boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
    position: 'relative',
    textAlign: 'right',
  },
  cancelBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: '#fc9916',
    backgroundColor: 'transparent',
    boxShadow: '0 2px 5px 0 rgba(0,0,0,0.2)',
    border: 'none',
    marginRight: 20,
    minWidth: 'auto',
    borderRadius: 10,
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#fc9916',
    },
  },
  submitBtn: {
    borderRadius: 10,
    minWidth: 200,
    fontSize: 14,
  },
  dialogContent: {
    padding: 20,
  },
  formSection: {
    '& label': {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.6)',
    },
  },
  formGroup: {
    paddingBottom: 24,
  },
  formSubGroup: {
    paddingLeft: 20,
  },
  helpText: {
    paddingLeft: 0,
    paddingRight: 20,
  },
  formHeader: {
    '& input': {
      fontWeight: 'bold',
    },
  },
}));
interface errorObject {
  symptomError: boolean;
  sinceError: boolean;
  howOfftenError: boolean;
  severityError: boolean;
}
interface symptomObject {
  __typename: string;
  symptom: string;
  severity: string;
  howOften: string;
  since: string;
}
export const Symptoms: React.FC = (props) => {
  const classes = useStyles();
  const { symptoms, setSymptoms } = useContext(CaseSheetContextJrd);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [symptom, setSymptom] = React.useState('');
  const [since, setSince] = React.useState('');
  const [howOften, setHowOften] = React.useState('');
  const [idx, setIdx] = React.useState();
  const [severity, setSeverity] = React.useState('');
  const { caseSheetEdit } = useContext(CaseSheetContextJrd);
  const [errorState, setErrorState] = React.useState<errorObject>({
    symptomError: false,
    sinceError: false,
    howOfftenError: false,
    severityError: false,
  });

  const deleteSymptom = (idx: any) => {
    symptoms!.splice(idx, 1);
    setSymptoms(symptoms);
    const sum = idx + Math.random();
    setIdx(sum);
  };
  const clearField = () => {
    setSeverity('');
    setSymptom('');
    setHowOften('');
    setSince('');
  };
  const clearError = () => {
    setErrorState({
      ...errorState,
      symptomError: false,
      sinceError: false,
      howOfftenError: false,
      severityError: false,
    });
  };
  const addUpdateSymptom = () => {
    console.log(symptoms);
    let duplicate = false;
    if (symptoms!.length > 0 && symptom.length > 0) {
      symptoms!.forEach((val: any, index: any) => {
        if (val!.symptom!.trim().toLowerCase() === symptom.trim().toLowerCase()) {
          duplicate = true;
        }
      });
    }
    if (isEmpty(trim(symptom))) {
      setErrorState({
        ...errorState,
        symptomError: true,
        sinceError: false,
        howOfftenError: false,
        severityError: false,
      });
    } else if (isEmpty(trim(since))) {
      setErrorState({
        ...errorState,
        symptomError: false,
        sinceError: true,
        howOfftenError: false,
        severityError: false,
      });
    } else if (isEmpty(trim(howOften))) {
      setErrorState({
        ...errorState,
        symptomError: false,
        sinceError: false,
        howOfftenError: true,
        severityError: false,
      });
    } else if (isEmpty(severity)) {
      setErrorState({
        ...errorState,
        symptomError: false,
        sinceError: false,
        howOfftenError: false,
        severityError: true,
      });
    } else if (duplicate) {
      setErrorState({
        ...errorState,
        symptomError: true,
        sinceError: false,
        howOfftenError: false,
        severityError: false,
      });
    } else {
      setErrorState({
        ...errorState,
        symptomError: false,
        sinceError: false,
        howOfftenError: false,
        severityError: false,
      });

      const inputParams: any = {
        __typename: 'SymptomList',
        howOften: howOften,
        severity: severity,
        since: since,
        symptom: symptom,
      };
      const x = symptoms;
      x!.push(inputParams);
      setSymptoms(x);
      setIsDialogOpen(false);
      clearField();
      clearError();
    }
  };
  useEffect(() => {
    if (idx >= 0) {
      setSymptoms(symptoms);
    }
  }, [symptoms, idx]);

  return (
    <div className={classes.root}>
      {symptoms && symptoms.length > 0 ? (
        <div className={classes.symtomListGroup}>
          {symptoms &&
            symptoms!.map(
              (item, idx) =>
                item!.symptom!.trim() !== '' && (
                  <div key={idx} className={classes.listItem}>
                    <div className={classes.symtomHeading}>
                      {item!.symptom}
                      <AphButton
                        classes={{ root: classes.deleteSymptom }}
                        onClick={() => deleteSymptom(idx)}
                      >
                        <img
                          src={caseSheetEdit ? require('images/ic_cancel_green.svg') : ''}
                          alt=""
                        />
                      </AphButton>
                    </div>
                    <div className={classes.symtomContent}>
                      {item!.since && item!.since.trim() !== '' && (
                        <div className={classes.symtomType}>Since: {item!.since}</div>
                      )}
                      {item!.howOften && item!.howOften.trim() !== '' && (
                        <div className={classes.symtomType}>How Often : {item!.howOften}</div>
                      )}
                      {item!.severity && item!.severity.trim() !== '' && (
                        <div className={classes.symtomType}>Severity: {item!.severity}</div>
                      )}
                    </div>
                  </div>
                )
            )}
        </div>
      ) : (
        <div className={classes.noDataFound}>No data Found</div>
      )}
      {caseSheetEdit && (
        <AphButton classes={{ root: classes.addBtn }} onClick={() => setIsDialogOpen(true)}>
          <img src={require('images/ic_dark_plus.svg')} alt="" />
          Add Symptom
        </AphButton>
      )}
      <AphDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
        className={classes.dialogWindow}
      >
        <AphDialogTitle className={classes.dialogTitle}>
          ADD SYMPTOM
          <AphButton
            onClick={() => {
              clearError();
              setIsDialogOpen(false);
              clearField();
            }}
            className={classes.dialogClose}
          >
            <img src={require('images/ic_cross.svg')} alt="" />
          </AphButton>
        </AphDialogTitle>
        <div className={classes.dialogContent}>
          <div className={classes.formSection}>
            <div className={classes.formGroup}>
              <label>Symptom</label>
              <AphTextField
                placeholder=""
                value={symptom}
                inputProps={{ maxLength: 30 }}
                className={classes.formHeader}
                onChange={(event) => {
                  setSymptom(event.target.value);
                  clearError();
                }}
                error={errorState.symptomError}
              />
              {errorState.symptomError && (
                <FormHelperText
                  className={classes.helpText}
                  component="div"
                  error={errorState.symptomError}
                >
                  Please Enter Symptom(two symptom name can't be same)
                </FormHelperText>
              )}
            </div>
            <div className={classes.formSubGroup}>
              <div className={classes.formGroup}>
                <label>Since?</label>
                <AphTextField
                  placeholder=""
                  value={since}
                  inputProps={{ maxLength: 30 }}
                  onChange={(event) => {
                    setSince(event.target.value);
                    clearError();
                  }}
                  error={errorState.sinceError}
                />
                {errorState.sinceError && (
                  <FormHelperText
                    className={classes.helpText}
                    component="div"
                    error={errorState.sinceError}
                  >
                    Please Enter Since
                  </FormHelperText>
                )}
              </div>
              <div className={classes.formGroup}>
                <label>How often?</label>
                <AphTextField
                  placeholder=""
                  value={howOften}
                  inputProps={{ maxLength: 30 }}
                  onChange={(event) => {
                    setHowOften(event.target.value);
                    clearError();
                  }}
                  error={errorState.howOfftenError}
                />
                {errorState.howOfftenError && (
                  <FormHelperText
                    className={classes.helpText}
                    component="div"
                    error={errorState.howOfftenError}
                  >
                    Please Enter How Often
                  </FormHelperText>
                )}
              </div>
              <div className={classes.formGroup}>
                <label>Severity</label>
                <AphTextField
                  placeholder=""
                  inputProps={{ maxLength: 30 }}
                  value={severity}
                  onChange={(event) => {
                    setSeverity(event.target.value);
                    clearError();
                  }}
                  error={errorState.severityError}
                />
                {errorState.severityError && (
                  <FormHelperText
                    className={classes.helpText}
                    component="div"
                    error={errorState.severityError}
                  >
                    Please Enter Severity
                  </FormHelperText>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={classes.dialogActions}>
          <AphButton
            className={classes.cancelBtn}
            onClick={() => {
              setIsDialogOpen(false);
              clearField();
              clearError();
            }}
          >
            Cancel
          </AphButton>
          <AphButton
            className={classes.submitBtn}
            color="primary"
            onClick={() => {
              addUpdateSymptom();
            }}
          >
            Add Symptom
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
