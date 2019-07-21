import { Theme, FormControl, CircularProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { Gender, Relation } from 'graphql/types/globalTypes';
import React, { useState } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import { isNameValid, isDateValid, isEmailValid } from '@aph/universal/aphValidators';
import _isEmpty from 'lodash/isEmpty';
import { UpdatePatient, UpdatePatientVariables } from 'graphql/types/UpdatePatient';
import { UPDATE_PATIENT } from 'graphql/profiles';
import { ProfileSuccess } from 'components/ProfileSuccess';
import { parse, format } from 'date-fns';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { Formik, FormikProps, Field, FieldProps, Form } from 'formik';
import { useMutation } from 'react-apollo-hooks';

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
      marginBottom: 20,
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
    actions: {
      padding: 20,
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
        height: '75vh',
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
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
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

export interface NewProfileProps {
  patient: Patient;
  onClose: () => void;
}

export const NewProfile: React.FC<NewProfileProps> = (props) => {
  const classes = useStyles();
  const { patient } = props;
  const [showProfileSuccess, setShowProfileSuccess] = useState<boolean>(false);
  const updatePatient = useMutation<UpdatePatient, UpdatePatientVariables>(UPDATE_PATIENT);

  if (showProfileSuccess) {
    return <ProfileSuccess onSubmitClick={() => props.onClose()} />;
  }

  return (
    <div className={classes.signUpPop}>
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
              },
            },
          })
            .then(() => setShowProfileSuccess(true))
            .catch((error) => {
              console.error(error);
              window.alert('Something went wrong :(');
            });
        }}
        render={({
          isSubmitting,
          dirty,
          touched,
          errors,
          values,
          setFieldValue,
          handleSubmit,
        }: FormikProps<FormValues>) => {
          const showError = (fieldName: keyof FormValues) =>
            !_isEmpty(values[fieldName]) && touched[fieldName] && Boolean(errors[fieldName]);
          const requiredFields: (keyof FormValues)[] = [
            'firstName',
            'lastName',
            'dateOfBirth',
            'gender',
          ];
          const submitIsDisabled =
            !dirty ||
            requiredFields.some((field) => _isEmpty(values[field]) || Boolean(errors[field]));
          return (
            <Form>
              <div className={classes.mascotIcon}>
                <img src={require('images/ic_mascot.png')} alt="" />
              </div>
              <div className={classes.customScrollBar}>
                <div className={classes.signinGroup}>
                  <Typography variant="h2">
                    welcome <br /> to apollo 24/7
                  </Typography>
                  <p data-cypress="confirmationGreeting">
                    Let us quickly get to know you so that we can get you the best help :)
                  </p>
                  <div className={classes.formGroup}>
                    <Field
                      name="firstName"
                      validate={(name: string) =>
                        isNameValid(name) ? undefined : 'Invalid first name'
                      }
                      render={({ field }: FieldProps<{ firstName: string }>) => (
                        <FormControl className={classes.formControl} fullWidth>
                          <AphTextField
                            {...field}
                            label="First Name"
                            placeholder="Example, Jonathan"
                            error={showError('firstName')}
                            inputProps={{ maxLength: 20 }}
                          />
                          <FormHelperText
                            className={
                              showError('firstName') ? classes.showMessage : classes.hideMessage
                            }
                            component="div"
                            error={true}
                          >
                            {errors.firstName}
                          </FormHelperText>
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
                            label="Last Name"
                            placeholder="Example, Donut"
                            error={showError('lastName')}
                            inputProps={{ maxLength: 20 }}
                          />
                          <FormHelperText
                            className={
                              showError('lastName') ? classes.showMessage : classes.hideMessage
                            }
                            component="div"
                            error={true}
                          >
                            {errors.lastName}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    <Field
                      name="dateOfBirth"
                      validate={(dob: string) =>
                        isDateValid(dob) ? undefined : 'Invalid date of birth'
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
                          <FormHelperText
                            className={
                              showError('dateOfBirth') ? classes.showMessage : classes.hideMessage
                            }
                            component="div"
                            error={true}
                          >
                            {errors.dateOfBirth}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    <Field
                      name="gender"
                      render={({ field }: FieldProps<{ gender: Gender }>) => (
                        <FormControl className={classes.formControl}>
                          <label>Gender</label>
                          <Grid container spacing={2} className={classes.btnGroup}>
                            {Object.values(Gender).map((gender) => (
                              <Grid item xs={4} sm={4} key={gender}>
                                <AphButton
                                  variant="contained"
                                  value={gender}
                                  classes={
                                    values.gender === gender ? { root: classes.btnActive } : {}
                                  }
                                  onClick={(e) =>
                                    setFieldValue('gender', e.currentTarget.value as Gender)
                                  }
                                >
                                  {gender}
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
                        _isEmpty(email) || isEmailValid(email) ? undefined : 'Invalid email address'
                      }
                      render={({ field }: FieldProps<{ emailAddress: string }>) => (
                        <FormControl className={classes.formControl} fullWidth>
                          <AphTextField
                            {...field}
                            label="Email Address (Optional)"
                            placeholder="name@emailaddress.com"
                            error={showError('emailAddress')}
                          />
                          <FormHelperText
                            className={
                              showError('emailAddress') ? classes.showMessage : classes.hideMessage
                            }
                            component="div"
                            error={true}
                          >
                            {errors.emailAddress}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
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
            </Form>
          );
        }}
      />
    </div>
  );
};
