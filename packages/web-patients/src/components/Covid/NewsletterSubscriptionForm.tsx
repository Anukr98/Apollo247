import { Theme, FormControl, CircularProgress } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import React, { useState } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import { isNameValid, isEmailValid } from '@aph/universal/dist/aphValidators';
import _isEmpty from 'lodash/isEmpty';
import { Formik, FormikProps, Field, FieldProps, Form } from 'formik';
import _toLower from 'lodash/toLower';
import _upperFirst from 'lodash/upperFirst';
import fetchUtil from 'helpers/fetch';

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
      textAlign: 'right',
    },
    subscribeBtn: {
      margin: '0 0 0 10px',
      background: '#fff',
      color: '#fc9916 !important',
      fontSize: 13,
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
      overflow: 'auto',
      [theme.breakpoints.down('xs')]: {
        // height: '66vh',
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
    noBoxShadow: {
      boxShadow: 'none',
    },
    viewCartBtn: {
      fontSize: 13,
      color: '#fc9916',
      fontWeight: 'bold',
      textAlign: 'right',
      marginLeft: 'auto',
      textTransform: 'uppercase',
    },
    success: {
      margin: 0,
      padding: '10px 20px',
      fontWeight: 600,
    },
  });
});

interface FormValues {
  firstName: string;
  emailAddress: string;
}

export interface SubscriptionFormProps {
  //   patient: Patient;
  onClose: () => void;
}

export const NewsletterSubscriptionForm: React.FC<SubscriptionFormProps> = (props) => {
  const classes = useStyles({});

  const formikRef = React.useRef(null);

  const [apiMessage, setApiMessage] = useState<string>('');
  const [subscriptionSuccessful, setSubscriptionSuccessful] = useState<boolean>(false);
  const covidSubscriptionUrl = process.env.SUBSCRIBE_USER_NEWSLETTER_URL;

  return (
    <div data-cypress="NewProfile">
      <Formik
        ref={formikRef}
        initialValues={{
          firstName: '',
          emailAddress: '',
        }}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          setApiMessage('');
          fetchUtil(
            `${covidSubscriptionUrl}`,
            'POST',
            {
              email: values.emailAddress,
              name: values.firstName,
              category: 'covid19',
            },
            '',
            true
          ).then((res: any) => {
            if (res && res.success) {
              resetForm();
              setSubscriptionSuccessful(true);
              setApiMessage(res.msg);
              setTimeout(() => {
                props.onClose();
              }, 2000);
            } else {
              setSubmitting(false);
              setApiMessage(res.msg);
            }
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
          const requiredFields: (keyof FormValues)[] = ['firstName', 'emailAddress'];
          const formIsUntouched = !dirty;
          const formHasErrors = !_isEmpty(errors);
          const someRequiredFieldsMissing = requiredFields.some((field) => _isEmpty(values[field]));
          const submitIsDisabled = formIsUntouched || formHasErrors || someRequiredFieldsMissing;

          return (
            <Form>
              <div className={classes.mascotIcon}>
                <img src={require('images/ic-mascot.png')} alt="" />
              </div>
              <div className={classes.customScrollBar}>
                <div className={classes.signinGroup}>
                  <div className={classes.formGroup}>
                    <Field
                      name="emailAddress"
                      validate={(email: string) =>
                        _isEmpty(email) || isEmailValid(email) ? undefined : 'Invalid email address'
                      }
                      render={({ field }: FieldProps<{ emailAddress: string }>) => (
                        <FormControl className={classes.formControl} fullWidth>
                          <AphTextField
                            {...field}
                            label="Email Address"
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

                    <Field
                      name="firstName"
                      validate={(name: string) => (isNameValid(name) ? undefined : 'Invalid name')}
                      render={({ field }: FieldProps<{ firstName: string }>) => (
                        <FormControl
                          className={`${classes.formControl} ${classes.noMargin}`}
                          fullWidth
                        >
                          <AphTextField
                            {...field}
                            label="Name"
                            placeholder="Add your name"
                            error={showError('firstName')}
                            inputProps={{ maxLength: 20 }}
                          />
                          {showError('firstName') ? (
                            <FormHelperText
                              className={
                                showError('firstName') ? classes.showMessage : classes.hideMessage
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
                  </div>

                  {apiMessage && !subscriptionSuccessful && (
                    <FormHelperText error={true} component="div" className={classes.showMessage}>
                      {apiMessage}
                    </FormHelperText>
                  )}
                </div>
              </div>
              {!subscriptionSuccessful ? (
                <div className={classes.actions}>
                  <AphButton
                    className={`${classes.viewCartBtn} ${classes.noBoxShadow}`}
                    onClick={() => props.onClose()}
                  >
                    CANCEL
                  </AphButton>

                  <AphButton
                    disabled={submitIsDisabled}
                    className={
                      submitIsDisabled
                        ? `${classes.subscribeBtn} ${classes.noBoxShadow}`
                        : `${classes.subscribeBtn} `
                    }
                    type="submit"
                  >
                    {isSubmitting ? <CircularProgress size={22} color="secondary" /> : 'Subscribe'}
                  </AphButton>
                </div>
              ) : (
                <FormHelperText className={classes.success}>{apiMessage}</FormHelperText>
              )}
            </Form>
          );
        }}
      />
    </div>
  );
};
