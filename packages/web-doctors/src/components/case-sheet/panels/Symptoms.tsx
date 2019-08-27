import React, { Fragment, useEffect } from 'react';
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
import { GetCaseSheet } from 'graphql/types/GetCaseSheet';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton, AphDialogTitle } from '@aph/web-ui-components';
import _isEmpty from 'lodash/isEmpty';
const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flex: 1,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    borderRadius: '5px',
  },
  listItem: {
    display: 'flex',
    flexFlow: 'column',
    padding: '4px 0 0 12px',
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
    fontWeight: theme.typography.fontWeightBold,
    paddingLeft: 4,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  deleteSymptom: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    position: 'absolute',
    right: 0,
    color: '#666666',
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
    right: 0,
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
    marginBottom: 20,
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
  },
  helpText: {
    paddingLeft: 20,
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
}));
interface CasesheetInfoProps {
  casesheetInfo: GetCaseSheet;
}
interface errorObject {
  symptomError: boolean;
  sinceError: boolean;
  howOfftenError: boolean;
  severityError: boolean;
}
interface symptomObject {
  symptom: string;
  severity: string;
  howOften: string;
  since: string;
}
export const Symptoms: React.FC<CasesheetInfoProps> = (props) => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [symptom, setSymptom] = React.useState('');
  const [since, setSince] = React.useState('');
  const [howOften, setHowOften] = React.useState('');
  const [idx, setIdx] = React.useState();
  const [severity, setSeverity] = React.useState('');
  const [symptomData, setSymptomData] = React.useState<symptomObject[]>([]);
  const [errorState, setErrorState] = React.useState<errorObject>({
    symptomError: false,
    sinceError: false,
    howOfftenError: false,
    severityError: false,
  });

  const deleteSymptom = (idx: any) => {
    symptomData.splice(idx, 1);
    setSymptomData(symptomData);
    const sum = idx + Math.random();
    setIdx(sum);
  };
  const addUpdateSymptom = () => {
    if (_isEmpty(symptom)) {
      setErrorState({
        ...errorState,
        symptomError: true,
        sinceError: false,
        howOfftenError: false,
        severityError: false,
      });
    } else if (_isEmpty(since)) {
      setErrorState({
        ...errorState,
        symptomError: false,
        sinceError: true,
        howOfftenError: false,
        severityError: false,
      });
    } else if (_isEmpty(howOften)) {
      setErrorState({
        ...errorState,
        symptomError: false,
        sinceError: false,
        howOfftenError: true,
        severityError: false,
      });
    } else if (_isEmpty(severity)) {
      setErrorState({
        ...errorState,
        symptomError: false,
        sinceError: false,
        howOfftenError: false,
        severityError: true,
      });
    } else {
      setErrorState({
        ...errorState,
        symptomError: false,
        sinceError: false,
        howOfftenError: false,
        severityError: false,
      });

      const inputParams = {
        howOften: howOften,
        severity: severity,
        since: since,
        symptom: symptom,
      };
      const x = symptomData;
      x!.push(inputParams);
      setSymptomData(x);
      setIsDialogOpen(false);
    }
  };
  useEffect(() => {
    if (idx >= 0) {
      setSymptomData(symptomData);
    }
  }, [symptomData, idx]);
  useEffect(() => {
    if (
      props.casesheetInfo &&
      props!.casesheetInfo!.getCaseSheet!.caseSheetDetails!.symptoms !== null &&
      props!.casesheetInfo!.getCaseSheet!.caseSheetDetails!.symptoms!.length > 0
    ) {
      props!.casesheetInfo!.getCaseSheet!.caseSheetDetails!.symptoms!.forEach((res: any) => {
        const inputParams = {
          howOften: res.howOften,
          severity: res.severity,
          since: res.since,
          symptom: res.symptom,
        };
        const x = symptomData;
        x.push(inputParams);
        setSymptomData(x);
      });
    }
  }, []);
  return (
    <Typography className={classes.container} component="div">
      <div>
        {symptomData ? (
          <List className={classes.symtomList}>
            {symptomData &&
              symptomData.map((item, idx) => (
                <ListItem key={idx} alignItems="flex-start" className={classes.listItem}>
                  <ListItemText className={classes.symtomHeading} primary={item!.symptom} />
                  <AphButton
                    variant="contained"
                    color="primary"
                    classes={{ root: classes.deleteSymptom }}
                    onClick={() => deleteSymptom(idx)}
                  >
                    <img src={require('images/ic_cross.svg')} alt="" />
                  </AphButton>
                  <Fragment>
                    <List>
                      {item!.since && (
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
                      {item!.howOften && (
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
                      {item!.severity && (
                        <ListItem alignItems="flex-start" className={classes.symtomContent}>
                          <ListItemText
                            secondary={
                              <Fragment>
                                <Typography component="span">Severity: {item!.severity}</Typography>
                              </Fragment>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Fragment>
                </ListItem>
              ))}
          </List>
        ) : (
          'NO data Found'
        )}

        <AphButton
          variant="contained"
          color="primary"
          classes={{ root: classes.btnAddDoctor }}
          onClick={() => setIsDialogOpen(true)}
        >
          <img src={require('images/ic_add.svg')} alt="" />
          Add Symptom
        </AphButton>

        <Modal
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Paper className={classes.medicinePopup}>
            <AphDialogTitle className={classes.popupHeadingCenter}>
              ADD SYMPTOM
              <Button className={classes.cross}>
                <img
                  src={require('images/ic_cross.svg')}
                  alt=""
                  onClick={() => {
                    setIsDialogOpen(false);
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
                        <h6>Symptom</h6>
                        <div className={classes.numberTablets}>
                          <AphTextField
                            placeholder=""
                            value={symptom}
                            onChange={(event) => {
                              setSymptom(event.target.value);
                            }}
                            error={errorState.symptomError}
                          />
                          {errorState.symptomError && (
                            <FormHelperText
                              className={classes.helpText}
                              component="div"
                              error={errorState.symptomError}
                            >
                              Please Enter something
                            </FormHelperText>
                          )}
                        </div>
                      </div>
                      <div>
                        <h6>Since?</h6>
                        <div className={classes.numberTablets}>
                          <AphTextField
                            placeholder=""
                            value={since}
                            onChange={(event) => {
                              setSince(event.target.value);
                            }}
                            error={errorState.sinceError}
                          />
                          {errorState.sinceError && (
                            <FormHelperText
                              className={classes.helpText}
                              component="div"
                              error={errorState.sinceError}
                            >
                              Please Enter something
                            </FormHelperText>
                          )}
                        </div>
                      </div>
                      <div>
                        <h6>How often?</h6>
                        <div className={classes.numberTablets}>
                          <AphTextField
                            placeholder=""
                            value={howOften}
                            onChange={(event) => {
                              setHowOften(event.target.value);
                            }}
                            error={errorState.howOfftenError}
                          />
                          {errorState.howOfftenError && (
                            <FormHelperText
                              className={classes.helpText}
                              component="div"
                              error={errorState.howOfftenError}
                            >
                              Please Enter something
                            </FormHelperText>
                          )}
                        </div>
                      </div>
                      <div>
                        <h6>Severity</h6>
                        <div className={classes.numberTablets}>
                          <AphTextField
                            placeholder=""
                            value={severity}
                            onChange={(event) => {
                              setSeverity(event.target.value);
                            }}
                            error={errorState.severityError}
                          />
                          {errorState.severityError && (
                            <FormHelperText
                              className={classes.helpText}
                              component="div"
                              error={errorState.severityError}
                            >
                              Please Enter something
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
                      Add Symptom
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
