import { Theme, FormControl, CircularProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { Gender, Relation } from 'graphql/types/globalTypes';
import React, { useState } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import { isNameValid, isEmailValid, isDobValid } from '@aph/universal/dist/aphValidators';
import _isEmpty from 'lodash/isEmpty';
import { UpdatePatient, UpdatePatientVariables } from 'graphql/types/UpdatePatient';
import { UPDATE_PATIENT } from 'graphql/profiles';
import { ProfileSuccess } from 'components/ProfileSuccess';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { Formik, FormikProps, Field, FieldProps, Form } from 'formik';
import { useMutation } from 'react-apollo-hooks';
import _toLower from 'lodash/toLower';
import _upperFirst from 'lodash/upperFirst';
import { Alerts } from 'components/Alerts/Alerts';
import { Route } from 'react-router-dom';
import {
  webengageUserLoginTracking,
  webengageUserDetailTracking,
  HdfcUserSignupDetailTracking,
} from '../webEngageTracking';
import { clientRoutes } from 'helpers/clientRoutes';
import { PARTNER_TP_REF_CODES } from 'helpers/constants';
import { useAuth, useLoginPopupState } from 'hooks/authHooks';
import { LazyIntersection } from './lib/LazyIntersection';

const isoDatePattern = 'yyyy-MM-dd';
const clientDatePattern = 'dd/MM/yyyy';

export const convertClientDateToIsoDate = (ddmmyyyy: string | null) => {
  if (!ddmmyyyy) return null;
  const date = parse(ddmmyyyy, clientDatePattern, new Date());
  return format(date, isoDatePattern);
};

const convertIsoDateToClientDate = (isoDateStr: string | null) => {
  if (!isoDateStr) return null;
  const date = parse(isoDateStr, isoDatePattern, new Date());
  return format(date, clientDatePattern);
};

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    formControl: {
      marginBottom: 25,
      width: '100%',
      position: 'relative',
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
      },
    },
    refFormControl: {
      marginBottom: 20,
      marginTop: -5,
      width: '100%',
      position: 'relative',
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
      },
    },
    signUpPop: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        borderRadius: 0,
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    referralCodeWrapper: {
      backgroundColor: '#0087ba',
      padding: 20,
      paddingBottom: 0,
      color: '#fff',
      margin: '0 -20px',
      display: 'flex',
      alignItems: 'flex-start',
    },
    enterCode: {
      width: '100%',
      paddingLeft: 20,
    },
    inputField: {
      marginTop: 8,
      '& input': {
        color: '#fff',
        paddingRight: 35,
      },
      '& > div': {
        borderColor: '#fff !important',
        '&:before': {
          borderBottom: '2px solid #fff !important',
        },
        '&:not(:focus)': {
          '&:before': {
            borderColor: '#fff !important',
          },
          '&:after': {
            borderColor: '#fff !important',
          },
        },
        '&:hover': {
          borderColor: '#fff !important',
          '&:before': {
            borderBottom: '2px solid #fff !important',
          },
          '&:after': {
            borderBottom: '2px solid #fff !important',
          },
        },
      },
    },
    tickIcon: {
      position: 'absolute',
      right: 0,
      top: 14,
    },
    actions: {
      padding: 20,
      position: 'sticky',
    },
    btnGroup: {
      paddingTop: 7,
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: theme.palette.common.white,
        fontSize: 16,
        fontWeight: 500,
      },
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    customScrollBar: {
      height: '70vh',
      overflow: 'auto',
      [theme.breakpoints.down('xs')]: {
        height: '66vh',
      },
    },
    signinGroup: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    formGroup: {
      paddingTop: 30,
    },
    showMessage: {
      opacity: 1.0,
    },
    hideMessage: {
      opacity: 0,
    },
    errorMessage: {
      paddingTop: 5,
    },
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    noMargin: {
      marginBottom: 5,
    },
    genderBtns: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: '7px 13px 7px 13px',
      textTransform: 'none',
    },
    labelText: {
      fontSize: 13,
    },
    required: {
      color: 'red',
    },
    backArrow: {
      cursor: 'pointer',
      paddingLeft: 20,
    },
  });
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

interface FormValues {
  firstName: Patient['firstName'];
  lastName: Patient['lastName'];
  dateOfBirth: Patient['dateOfBirth'];
  emailAddress: Patient['emailAddress'];
  gender: Patient['gender'];
}

export interface customSignUp {
  heading: string | null;
  subHeading: string | null;
  showMascot: boolean | null;
  referral: string | null;
}

export interface NewProfileProps {
  patient: Patient;
  onClose: () => void;
  customSignUp?: customSignUp;
}

export const NewProfile: React.FC<NewProfileProps> = (props) => {
  const classes = useStyles({});
  const { patient } = props;
  const urlParams = new URLSearchParams(window.location.search);

  const [showProfileSuccess, setShowProfileSuccess] = useState<boolean>(false);
  const [isValidReferralCode, setIsValidReferralCode] = useState<boolean>(true);
  const updatePatient = useMutation<UpdatePatient, UpdatePatientVariables>(UPDATE_PATIENT);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const orderedGenders = [Gender.MALE, Gender.FEMALE];
  const { signOut } = useAuth();
  const { setIsLoginPopupVisible: setLoginPopupVisible } = useLoginPopupState();

  if (showProfileSuccess) {
    return <ProfileSuccess onSubmitClick={() => props.onClose()} />;
  }

  let signUpObject = {
    heading: 'Welcome to apollo 24|7',
    subHeading:
      'Enter your detailsLet us quickly get to know you so that we can get you the best help :)',
    showMascot: true,
    referral: '',
  };

  signUpObject = props.customSignUp ? props.customSignUp : signUpObject;
  const tpRefCode = urlParams.get('tp_ref_code')
    ? String(urlParams.get('tp_ref_code'))
    : signUpObject.referral;
  const [referralCode, setReferralCode] = useState<string>(tpRefCode);

  return (
    <div className={classes.signUpPop} data-cypress="NewProfile">
      <Route
        render={({ history }) => (
          <Formik
            initialValues={{
              firstName: patient.firstName || '',
              lastName: patient.lastName || '',
              dateOfBirth: convertIsoDateToClientDate(patient.dateOfBirth) || '',
              emailAddress: patient.emailAddress || '',
              gender: patient.gender || null,
            }}
            onSubmit={(values) => {
              return updatePatient({
                variables: {
                  patientInput: {
                    id: patient.id,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    gender: values.gender,
                    dateOfBirth: convertClientDateToIsoDate(values.dateOfBirth),
                    emailAddress: _isEmpty(values.emailAddress) ? null : values.emailAddress,
                    relation: Relation.ME,
                    referralCode: referralCode.length > 0 ? referralCode : null,
                  },
                },
              })
                .then(() => {
                  /* webengage code start */
                  webengageUserLoginTracking(patient.mobileNumber);
                  webengageUserDetailTracking({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    gender: values.gender,
                    emailAddress: values.emailAddress,
                    dateOfBirth: values.dateOfBirth,
                    mobileNumber: patient.mobileNumber,
                  });
                  /* webengage code end */
                  if (props.customSignUp.referral === 'HDFCBANK') {
                    HdfcUserSignupDetailTracking({
                      firstName: values.firstName,
                      lastName: values.lastName,
                      gender: values.gender,
                      emailAddress: values.emailAddress,
                      dateOfBirth: values.dateOfBirth,
                      mobileNumber: patient.mobileNumber,
                    });
                    history.push(clientRoutes.welcome());
                  } else {
                    setShowProfileSuccess(true);
                  }
                })
                .catch((error) => {
                  console.error(error);
                  setIsAlertOpen(true);
                  setAlertMessage('Something went wrong :(');
                });
            }}
            render={({
              isSubmitting,
              dirty,
              touched,
              errors,
              values,
              setFieldValue,
            }: // handleSubmit,
            FormikProps<FormValues>) => {
              const showError = (fieldName: keyof FormValues) =>
                !_isEmpty(values[fieldName]) && touched[fieldName] && Boolean(errors[fieldName]);
              const requiredFields: (keyof FormValues)[] = [
                'firstName',
                'lastName',
                'dateOfBirth',
                'gender',
              ];
              const formIsUntouched = !dirty;
              const formHasErrors = !_isEmpty(errors);
              const someRequiredFieldsMissing = requiredFields.some((field) =>
                _isEmpty(values[field])
              );
              const submitIsDisabled =
                formIsUntouched ||
                formHasErrors ||
                someRequiredFieldsMissing ||
                (referralCode.length > 0 && !isValidReferralCode);
              return (
                <Form>
                  {!signUpObject.showMascot ? (
                    <></>
                  ) : (
                    <div className={classes.mascotIcon}>
                      <LazyIntersection src={require('images/ic-mascot.png')} alt="" />
                    </div>
                  )}
                  <div className={classes.customScrollBar}>
                    <div className={classes.signinGroup}>
                      <Typography variant="h2">{signUpObject.heading}</Typography>
                      <p>{signUpObject.subHeading}</p>
                      <div className={classes.formGroup}>
                        <Field
                          name="firstName"
                          validate={(name: string) =>
                            isNameValid(name) ? undefined : 'Invalid first name'
                          }
                          render={({ field }: FieldProps<{ firstName: string }>) => (
                            <FormControl
                              className={`${classes.formControl} ${classes.noMargin}`}
                              fullWidth
                            >
                              <AphTextField
                                {...field}
                                label="Full Name"
                                placeholder="First Name"
                                error={showError('firstName')}
                                inputProps={{ maxLength: 20 }}
                              />
                              {showError('firstName') ? (
                                <FormHelperText
                                  className={
                                    showError('firstName')
                                      ? classes.showMessage
                                      : classes.hideMessage
                                  }
                                  component="div"
                                  error={true}
                                >
                                  {errors.firstName}
                                </FormHelperText>
                              ) : (
                                ''
                              )}
                            </FormControl>
                          )}
                        />

                        <Field
                          name="lastName"
                          validate={(name: string) =>
                            isNameValid(name) ? undefined : 'Invalid last name'
                          }
                          render={({ field }: FieldProps<{ firstName: string }>) => (
                            <FormControl className={classes.formControl} fullWidth>
                              <AphTextField
                                {...field}
                                placeholder="Last Name"
                                error={showError('lastName')}
                                inputProps={{ maxLength: 20 }}
                              />
                              {showError('lastName') ? (
                                <FormHelperText
                                  className={
                                    showError('lastName')
                                      ? classes.showMessage
                                      : classes.hideMessage
                                  }
                                  component="div"
                                  error={true}
                                >
                                  {errors.lastName}
                                </FormHelperText>
                              ) : (
                                ''
                              )}
                            </FormControl>
                          )}
                        />

                        <Field
                          name="dateOfBirth"
                          validate={(dob: string) =>
                            isDobValid(dob) ? undefined : 'Invalid date of birth'
                          }
                          render={({ field }: FieldProps<{ firstName: string }>) => (
                            <FormControl className={classes.formControl} fullWidth>
                              <AphTextField
                                {...field}
                                label="Date Of Birth"
                                placeholder="dd/mm/yyyy"
                                error={showError('dateOfBirth')}
                                inputProps={{ type: 'text', maxLength: 10 }}
                              />
                              {showError('dateOfBirth') ? (
                                <FormHelperText
                                  className={
                                    showError('dateOfBirth')
                                      ? classes.showMessage
                                      : classes.hideMessage
                                  }
                                  component="div"
                                  error={true}
                                >
                                  {errors.dateOfBirth}
                                </FormHelperText>
                              ) : (
                                ''
                              )}
                            </FormControl>
                          )}
                        />

                        <Field
                          name="gender"
                          render={({ field }: FieldProps<{ gender: Gender }>) => (
                            <FormControl className={classes.formControl}>
                              <label>Gender</label>
                              <Grid container spacing={2} className={classes.btnGroup}>
                                {orderedGenders.map((gender) => (
                                  <Grid item xs={4} sm={4} key={gender}>
                                    <AphButton
                                      color="secondary"
                                      value={gender}
                                      className={`${classes.genderBtns} ${
                                        values.gender === gender ? classes.btnActive : ''
                                      }`}
                                      onClick={(e) =>
                                        setFieldValue('gender', e.currentTarget.value as Gender)
                                      }
                                    >
                                      {_upperFirst(_toLower(gender))}
                                    </AphButton>
                                  </Grid>
                                ))}
                              </Grid>
                            </FormControl>
                          )}
                        />

                        <Field
                          name="emailAddress"
                          validate={(email: string) =>
                            _isEmpty(email) || isEmailValid(email)
                              ? undefined
                              : 'Invalid email address'
                          }
                          render={({ field }: FieldProps<{ emailAddress: string }>) => (
                            <FormControl className={classes.formControl} fullWidth>
                              <AphTextField
                                {...field}
                                label="Email Address (Optional)"
                                placeholder="name@email.com"
                                error={showError('emailAddress')}
                              />
                              {showError('emailAddress') ? (
                                <FormHelperText
                                  className={
                                    showError('emailAddress')
                                      ? classes.showMessage
                                      : classes.hideMessage
                                  }
                                  component="div"
                                  error={true}
                                >
                                  {errors.emailAddress}
                                </FormHelperText>
                              ) : (
                                ''
                              )}
                            </FormControl>
                          )}
                        />

                        <div className={classes.referralCodeWrapper}>
                          <img src={require('images/ic_gift.svg')} alt="" />
                          <div className={classes.enterCode}>
                            <div className={classes.labelText}>
                              Do You Have A Referral Code? (Optional)
                            </div>
                            <FormControl className={classes.refFormControl} fullWidth>
                              <AphTextField
                                className={classes.inputField}
                                placeholder="Enter Referral Code"
                                value={referralCode}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  setReferralCode(inputValue);

                                  const isValidReferralCode = inputValue.length > 0;
                                  setIsValidReferralCode(isValidReferralCode);
                                }}
                                inputProps={{ type: 'text', maxLength: 25 }}
                                disabled={
                                  tpRefCode.length > 0 && PARTNER_TP_REF_CODES.includes(tpRefCode)
                                    ? true
                                    : false
                                }
                              />
                              {!isValidReferralCode ? (
                                <FormHelperText
                                  className={classes.errorMessage}
                                  component="div"
                                  error={true}
                                >
                                  Referral code should be minimum 1 character.
                                </FormHelperText>
                              ) : (
                                referralCode.length > 0 && (
                                  <img
                                    className={classes.tickIcon}
                                    src={require('images/ic_check_white.svg')}
                                    alt=""
                                  />
                                )
                              )}
                            </FormControl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={classes.actions}>
                    <AphButton
                      fullWidth
                      type="submit"
                      disabled={submitIsDisabled}
                      variant="contained"
                      color="primary"
                    >
                      {isSubmitting ? <CircularProgress size={22} color="secondary" /> : 'Submit'}
                    </AphButton>
                  </div>
                  <Alerts
                    setAlertMessage={setAlertMessage}
                    alertMessage={alertMessage}
                    isAlertOpen={isAlertOpen}
                    setIsAlertOpen={setIsAlertOpen}
                  />
                </Form>
              );
            }}
          />
        )}
      />
    </div>
  );
};
