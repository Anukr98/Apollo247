import { Theme, FormControl, CircularProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { Gender } from 'graphql/types/globalTypes';
import React from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import { isDobValid } from '@aph/universal/dist/aphValidators';
import _isEmpty from 'lodash/isEmpty';
import { parse, format } from 'date-fns';
import { Formik, FormikProps, Field, FieldProps, Form } from 'formik';
import _toLower from 'lodash/toLower';
import _upperFirst from 'lodash/upperFirst';

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
        textAlign: 'left',
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
      paddingTop: 0,
      boxShadow: 'none',
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
      height: 'auto',
      overflow: 'auto',
      [theme.breakpoints.down('xs')]: {
        height: 'auto',
      },
    },
    signinGroup: {
      padding: 0,
    },
    formGroup: {
      paddingTop: 0,
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
  });
});

interface FormValues {
  dateOfBirth: any | null;
  gender: Gender | null;
}

export interface NewProfileProps {
  onClose: () => void;
  setData(obj: object): any;
}

export const SymptomsTrackerLoggedOutForm: React.FC<NewProfileProps> = (props) => {
  const classes = useStyles();
  const urlParams = new URLSearchParams(window.location.search);
  const orderedGenders = [Gender.MALE, Gender.FEMALE, Gender.OTHER];

  return (
    <div className={classes.signUpPop} data-cypress="NewProfile">
      <Formik
        onSubmit={() => {}}
        initialValues={{
          dateOfBirth: '',
          gender: null,
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
          const requiredFields: (keyof FormValues)[] = ['dateOfBirth', 'gender'];
          const formIsUntouched = !dirty;
          const formHasErrors = !_isEmpty(errors);
          const someRequiredFieldsMissing = requiredFields.some((field) => _isEmpty(values[field]));

          return (
            <Form>
              <div className={classes.customScrollBar}>
                <div className={classes.signinGroup}>
                  <div className={classes.formGroup}>
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
                            onBlur={(e) =>
                              props.setData({
                                gender: values.gender,
                                dob: convertClientDateToIsoDate(e.currentTarget.value),
                              })
                            }
                          />
                          {showError('dateOfBirth') ? (
                            <FormHelperText
                              className={
                                showError('dateOfBirth') ? classes.showMessage : classes.hideMessage
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
                                  onClick={(e) => {
                                    setFieldValue('gender', e.currentTarget.value as Gender);
                                    props.setData({
                                      gender: e.currentTarget.value as Gender,
                                      dob: convertClientDateToIsoDate(values.dateOfBirth),
                                    });
                                  }}
                                >
                                  {_upperFirst(_toLower(gender))}
                                </AphButton>
                              </Grid>
                            ))}
                          </Grid>
                        </FormControl>
                      )}
                    />
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      />
    </div>
  );
};
