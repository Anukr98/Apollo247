import React, { useEffect, useContext } from 'react';
import { Theme, FormHelperText } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton, AphDialogTitle, AphDialog } from '@aph/web-ui-components';
import { isEmpty, trim } from 'lodash';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms } from 'graphql/types/GetJuniorDoctorCaseSheet';
import Scrollbars from 'react-custom-scrollbars';

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
    paddingRight: 55,
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
      maxWidth: 20,
      maxHeight: 20,
    },
  },
  editSymptom: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    minWidth: 'auto',
    padding: 0,
    position: 'absolute',
    right: 30,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '& img': {
      maxWidth: 20,
      maxHeight: 20,
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
    padding: '8px 13px 8px 13px',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#fc9916',
    },
  },
  submitBtn: {
    borderRadius: 10,
    minWidth: 200,
    fontSize: 14,
    fontWeight: 600,
    padding: '8px 13px 8px 13px',
  },
  dialogContent: {
    padding: '20px 5px 0 20px',
  },
  customScroll: {
    paddingRight: 20,
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
interface ErrorObject {
  symptomError: boolean;
  sinceError: boolean;
  howOfftenError: boolean;
  severityError: boolean;
}

export const Symptoms: React.FC = (props) => {
  const classes = useStyles({});
  const { symptoms, setSymptoms } = useContext(CaseSheetContextJrd);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [symptom, setSymptom] = React.useState('');
  const [since, setSince] = React.useState('');
  const [howOften, setHowOften] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [idx, setIdx] = React.useState<any>();
  const [severity, setSeverity] = React.useState('');
  const [isUpdate, setIsUpdate] = React.useState(false);
  const { caseSheetEdit } = useContext(CaseSheetContextJrd);
  const [errorState, setErrorState] = React.useState<ErrorObject>({
    symptomError: false,
    sinceError: false,
    howOfftenError: false,
    severityError: false,
  });

  const deleteSymptom = (idx: number) => {
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
    setDetails('');
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

  const [idxValue, setIdxValue] = React.useState<any>();

  const addUpdateSymptom = () => {
    let duplicate = false;
    if (symptoms && symptom.length > 0) {
      symptoms.forEach(
        (
          val: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms,
          index: number
        ) => {
          if (val.symptom && trim(val.symptom).toLowerCase() === trim(symptom).toLowerCase()) {
            duplicate = isUpdate ? idxValue !== index : true;
          }
        }
      );
    }
    if (isEmpty(trim(symptom))) {
      setErrorState({
        ...errorState,
        symptomError: true,
        sinceError: false,
        howOfftenError: false,
        severityError: false,
      });
    } else if (isEmpty(trim(severity))) {
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

      if (isUpdate && symptoms) {
        const currentSymptom = symptoms[idxValue];
        currentSymptom.symptom = symptom;
        currentSymptom.severity = severity;
        currentSymptom.howOften = howOften;
        currentSymptom.since = since;
        currentSymptom.details = details;
      } else {
        const inputParams: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_symptoms = {
          __typename: 'SymptomList',
          howOften: howOften,
          severity: severity,
          since: since,
          symptom: symptom,
          details: details,
        };
        const symptomList = symptoms;
        symptomList!.push(inputParams);
        setSymptoms(symptomList);
      }
      setIsUpdate(false);
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

  const showSymptom = (idx: number) => {
    if (symptoms && symptoms.length > 0) {
      const ReqSymptom = symptoms[idx];
      if (ReqSymptom != null) {
        setSymptom(ReqSymptom.symptom || '');
        setSince(ReqSymptom.since || '');
        setHowOften(ReqSymptom.howOften || '');
        setSeverity(ReqSymptom.severity || '');
        setDetails(ReqSymptom.details || '');
      }
      setIsDialogOpen(true);
      setIsUpdate(true);
      setIdxValue(idx);
    }
  };

  return (
    <div className={classes.root}>
      {symptoms && symptoms.length > 0 ? (
        <div className={classes.symtomListGroup}>
          {symptoms &&
            symptoms!.map(
              (item, idx) =>
                item &&
                item.symptom &&
                trim(item.symptom) !== '' && (
                  <div key={idx} className={classes.listItem}>
                    <div className={classes.symtomHeading}>
                      {item!.symptom}
                      <AphButton
                        classes={{ root: classes.editSymptom }}
                        onClick={() => showSymptom(idx)}
                      >
                        <img
                          src={caseSheetEdit ? require('images/round_edit_24_px.svg') : ''}
                          alt=""
                        />
                      </AphButton>
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
                      {item.since && trim(item.since) !== '' && (
                        <div className={classes.symtomType}>Since: {item.since}</div>
                      )}
                      {item.howOften && trim(item.howOften) !== '' && (
                        <div className={classes.symtomType}>How Often : {item.howOften}</div>
                      )}
                      {item.severity && trim(item.severity) !== '' && (
                        <div className={classes.symtomType}>Severity: {item.severity}</div>
                      )}
                      {item.details && trim(item.details) !== '' && (
                        <div className={classes.symtomType}>Details: {item.details}</div>
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
        <AphButton
          classes={{ root: classes.addBtn }}
          onClick={() => {
            setIsDialogOpen(true);
            setIsUpdate(false);
          }}
        >
          <img src={require('images/ic_dark_plus.svg')} alt="" />
          Add Complaint
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
          ADD COMPLAINT
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
        <Scrollbars autoHide={true} style={{ height: 'calc(63vh' }}>
          <div className={classes.customScroll}>
            <div className={classes.dialogContent}>
              <div className={classes.formSection}>
                <div className={classes.formGroup}>
                  <label>Complaint</label>
                  <AphTextField
                    autoFocus
                    placeholder=""
                    value={symptom}
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
                      Please Enter Complaint(two complaint names can't be same)
                    </FormHelperText>
                  )}
                </div>
                <div className={classes.formSubGroup}>
                  <div className={classes.formGroup}>
                    <label>Since?</label>
                    <AphTextField
                      placeholder=""
                      value={since}
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
                  <div className={classes.formGroup}>
                    <label>Details</label>
                    <AphTextField
                      placeholder="Enter the details here"
                      value={details}
                      onChange={(event) => {
                        setDetails(event.target.value);
                        clearError();
                      }}
                      multiline
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
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
            {isUpdate ? 'Update Complaint' : 'Add Complaint'}
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
