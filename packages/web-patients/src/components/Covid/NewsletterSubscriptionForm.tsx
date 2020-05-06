import { CircularProgress, FormControl, Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import React, { useState } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import { isEmailValid, isNameValid } from '@aph/universal/dist/aphValidators';
import _isEmpty from 'lodash/isEmpty';
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik';
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
      width: 100,
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

    noMargin: {
      marginBottom: 5,
    },
    noBoxShadow: {
      boxShadow: 'none',
    },
    subscriptionPrimaryBtn: {
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
              }, 1500);
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
          const requiredFields: (keyof FormValues)[] = ['emailAddress'];
          const formHasErrors = !_isEmpty(errors);
          const formIsUntouched = !dirty;
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
                        isEmailValid(email) ? undefined : 'Invalid email address'
                      }
                      render={({ field }: FieldProps<{ emailAddress: string }>) => (
                        <FormControl className={classes.formControl} fullWidth>
                          <AphTextField
                            {...field}
                            label="Email*"
                            placeholder="Add your email"
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
                      validate={(name: string) =>
                        _isEmpty(name) || isNameValid(name) ? undefined : 'Invalid name'
                      }
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
                    className={`${classes.subscriptionPrimaryBtn} ${classes.noBoxShadow}`}
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
                    {isSubmitting ? <CircularProgress size={22} color="secondary" /> : 'SUBSCRIBE'}
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
