import React, { Fragment, useEffect, useContext } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Theme,
  Paper,
  Grid,
  FormHelperText,
  Modal,
  Button,
} from '@material-ui/core';
//import { GetJuniorDoctorCaseSheet } from 'graphql/types/GetJuniorDoctorCaseSheet';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton, AphDialogTitle } from '@aph/web-ui-components';

import { isEmpty, debounce, trim } from 'lodash';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flex: 1,
  },
  listItem: {
    display: 'flex',
    flexFlow: 'column',
    padding: '0px 0 10px 10px',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    borderRadius: 5,
    minWidth: '100%',
    // maxWidth: 288,
    margin: '5px 0',

    '& h6': {
      fontSize: 12,
      color: '#01475b',
      fontWeight: 'normal',
    },
    '& h3': {
      fontSize: 14,
      color: '#01475b',
      fontWeight: 500,
    },
  },
  symtomHeading: {
    margin: '5px 0 0 0',
    '& span': {
      fontSize: 14,
      color: '#01475b',
      fontWeight: 500,
    },
  },
  symtomContent: {
    padding: '0 0 0 10px',
    '& div': {
      margin: 0,
    },
    '& p': {
      '& span': {
        fontSize: 12,
        color: '#01475b',
        fontWeight: 'normal',
      },
    },
  },
  symtomList: {
    padding: '0 0 10px 0',
    '& ul': {
      padding: 0,
    },
  },
  btnAddDoctor: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: theme.palette.action.selected,
    fontSize: 14,
    fontWeight: 600,
    paddingLeft: 4,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '& img': {
      marginRight: 8,
    },
  },
  deleteSymptom: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    position: 'absolute',
    right: 0,
    color: '#666666',
    top: 7,
    minWidth: 10,
    fontSize: 14,
    fontWeight: theme.typography.fontWeightBold,
    paddingLeft: 4,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  popupHeadingCenter: {
    '& h6': {
      fontSize: 13,
      color: '#01475b',
      fontWeight: 600,
      textAlign: 'center',
      marginTop: 5,
    },
  },
  medicinePopup: {
    width: 480,
    margin: '30px auto 0 auto',
    boxShadow: 'none',
  },
  cross: {
    position: 'absolute',
    right: -5,
    minWidth: 20,
    top: -9,
    fontSize: 18,
    color: '#02475b',
  },
  dialogContent: {
    padding: 20,
    minHeight: 380,
    '& h6': {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.6)',
      marginBottom: 10,
      marginTop: 0,
    },
  },
  numberTablets: {
    fontSize: 16,
    color: '#02475b',
    fontWeight: 500,
    marginBottom: 30,
    '& button': {
      border: '1px solid #00b38e',
      padding: '5px 10px',
      fontSize: 12,
      fontWeight: 'normal',
      borderRadius: 14,
      marginRight: 15,
      color: '#00b38e',
      backgroundColor: '#fff',
    },
    '& input': {
      paddingTop: 0,
      paddingBottom: 5,
    },
  },
  helpText: {
    paddingLeft: 0,
    paddingRight: 20,
  },
  dialogActions: {
    padding: 20,
    paddingTop: 10,
    boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
    position: 'relative',
    textAlign: 'right',
    '& button': {
      borderRadius: 10,
      minwidth: 130,
      padding: '8px 20px',
    },
  },
  editSymptom: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    minWidth: 'auto',
    padding: 0,
    position: 'absolute',
    right: 50,
    top: 15,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '& img': {
      maxWidth: 20,
      maxHeight: 20,
    },
  },
  cancelBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: '#fc9916',
    backgroundColor: 'transparent',
    boxShadow: '0 2px 5px 0 rgba(0,0,0,0.2)',
    border: 'none',
    marginRight: 10,
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#fc9916',
    },
  },
  paper: {
    textAlign: 'left',
    color: theme.palette.text.secondary,
    marginBottom: 12,
    backgroundColor: '#f7f7f7',
    border: '1px solid rgba(2,71,91,0.1)',
    padding: '12px 40px 12px 12px',
    maxWidth: 288,
    borderRadius: 5,
    position: 'relative',
    '& h5': {
      fontSize: 14,
      color: '#02475b',
      margin: 0,
      fontWeight: 600,
    },
    '& h6': {
      fontSize: 12,
      color: '#02475b',
      margin: 0,
      fontWeight: 'normal',
    },
  },
  nodatafound: {
    fontSize: 14,
    margin: '10px 0 10px 4px',
  },
  symptomCaption: {
    marginLeft: 20,
  },
  fullRow: {
    width: '100%',
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
  const { symptoms, setSymptoms } = useContext(CaseSheetContext);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [symptom, setSymptom] = React.useState('');
  const [since, setSince] = React.useState('');
  const [howOften, setHowOften] = React.useState('');
  const [idx, setIdx] = React.useState();
  const [severity, setSeverity] = React.useState('');
  const { caseSheetEdit } = useContext(CaseSheetContext);
  const [isUpdate, setIsUpdate] = React.useState(false);
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
  const [idxValue, setIdxValue] = React.useState();
  const addUpdateSymptom = () => {
    console.log(symptoms);
    let duplicate = false;
    if (symptoms && symptom.length > 0) {
      symptoms.forEach((val: any, index: any) => {
        if (val.symptom && val.symptom.trim().toLowerCase() === symptom.trim().toLowerCase()) {
          duplicate = isUpdate ? idxValue !== index : true;
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

      if (isUpdate && symptoms) {
        const currentSymptom = symptoms[idxValue];
        currentSymptom.symptom = symptom;
        currentSymptom.severity = severity;
        currentSymptom.howOften = howOften;
        currentSymptom.since = since;
      } else {
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
      if (ReqSymptom) {
        setSymptom(ReqSymptom.symptom || '');
        setSince(ReqSymptom.since || '');
        setHowOften(ReqSymptom.howOften || '');
        setSeverity(ReqSymptom.severity || '');
      }
      setIsDialogOpen(true);
      setIsUpdate(true);
      setIdxValue(idx);
    }
  };

  return (
    <Typography className={classes.container} component="div">
      <div className={classes.fullRow}>
        {symptoms && symptoms.length > 0 ? (
          <List className={classes.symtomList}>
            {symptoms &&
              symptoms!.map(
                (item, idx) =>
                  item!.symptom!.trim() !== '' && (
                    <ListItem key={idx} alignItems="flex-start" className={classes.listItem}>
                      <ListItemText className={classes.symtomHeading} primary={item!.symptom} />
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
                        variant="contained"
                        color="primary"
                        classes={{ root: classes.deleteSymptom }}
                        onClick={() => deleteSymptom(idx)}
                      >
                        <img src={caseSheetEdit && require('images/ic_cancel_green.svg')} alt="" />
                      </AphButton>
                      <Fragment>
                        <List>
                          {item!.since && item!.since.trim() !== '' && (
                            <ListItem alignItems="flex-start" className={classes.symtomContent}>
                              <ListItemText
                                secondary={
                                  <Fragment>
                                    <Typography component="span">Since: {item!.since}</Typography>
                                  </Fragment>
                                }
                              />
                            </ListItem>
                          )}
                          {item!.howOften && item!.howOften.trim() !== '' && (
                            <ListItem alignItems="flex-start" className={classes.symtomContent}>
                              <ListItemText
                                secondary={
                                  <Fragment>
                                    <Typography component="span">
                                      How Often : {item!.howOften}
                                    </Typography>
                                  </Fragment>
                                }
                              />
                            </ListItem>
                          )}
                          {item!.severity && item!.severity.trim() !== '' && (
                            <ListItem alignItems="flex-start" className={classes.symtomContent}>
                              <ListItemText
                                secondary={
                                  <Fragment>
                                    <Typography component="span">
                                      Severity: {item!.severity}
                                    </Typography>
                                  </Fragment>
                                }
                              />
                            </ListItem>
                          )}
                        </List>
                      </Fragment>
                    </ListItem>
                  )
              )}
          </List>
        ) : (
          <div className={classes.nodatafound}>No data Found</div>
        )}

        {caseSheetEdit && (
          <AphButton
            variant="contained"
            color="primary"
            classes={{ root: classes.btnAddDoctor }}
            onClick={() => {
              setIsDialogOpen(true);
              setIsUpdate(false);
            }}
          >
            <img src={require('images/ic_dark_plus.svg')} alt="" />
            ADD COMPLAINT
          </AphButton>
        )}

        <Modal
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Paper className={classes.medicinePopup}>
            <AphDialogTitle className={classes.popupHeadingCenter}>
              ADD COMPLAINT
              <Button className={classes.cross}>
                <img
                  src={require('images/ic_cross.svg')}
                  alt=""
                  onClick={() => {
                    clearError();
                    setIsDialogOpen(false);
                    clearField();
                  }}
                />
              </Button>
            </AphDialogTitle>
            <div>
              {
                <div>
                  <div>
                    <div className={classes.dialogContent}>
                      <div>
                        <h6>COMPLAINT</h6>
                        <div className={classes.numberTablets}>
                          <AphTextField
                            placeholder=""
                            value={symptom}
                            inputProps={{ maxLength: 30 }}
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
                      </div>
                      <div className={classes.symptomCaption}>
                        <h6>Since?</h6>
                        <div className={classes.numberTablets}>
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
                      </div>
                      <div className={classes.symptomCaption}>
                        <h6>How often?</h6>
                        <div className={classes.numberTablets}>
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
                      </div>
                      <div className={classes.symptomCaption}>
                        <h6>Severity</h6>
                        <div className={classes.numberTablets}>
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
                      color="primary"
                      onClick={() => {
                        setIsDialogOpen(false);
                        clearField();
                        clearError();
                      }}
                    >
                      Cancel
                    </AphButton>
                    <AphButton
                      color="primary"
                      onClick={() => {
                        addUpdateSymptom();
                      }}
                    >
                      {isUpdate ? 'Update Complaint' : 'Add Complaint'}
                    </AphButton>
                  </div>
                </div>
              }
            </div>
          </Paper>
        </Modal>
      </div>
    </Typography>
  );
};
