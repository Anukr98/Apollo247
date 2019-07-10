import { Theme, FormControl } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import { AphTextField } from '@aph/web-ui-components';
import { Gender, Relation } from 'graphql/types/globalTypes';
import React, { useState, useEffect } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import { isNameValid, isEmailValid, isDobValid } from '@aph/universal/validators';
import _includes from 'lodash/includes';
import { Mutation } from 'react-apollo';
import { updatePatientVariables, updatePatient } from 'graphql/types/updatePatient';
import { UPDATE_PATIENT } from 'graphql/profiles';
import { useCurrentPatient } from 'hooks/authHooks';
// import { onError } from 'apollo-link-error';
import moment from 'moment';

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
      display: 'block',
    },
    hideMessage: {
      display: 'none',
    },
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
  });
});

export interface NewProfileProps {
  popupHandler: (popup: boolean) => void;
  showSuccess: (popup: boolean) => void;
}

export const NewProfile: React.FC<NewProfileProps> = (props) => {
  const classes = useStyles();
  const genders = Object.values(Gender);
  const currentPatient = useCurrentPatient();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [selectedGender, setGender] = useState<string>('');

  useEffect(() => {
    if (currentPatient) {
      currentPatient.firstName !== null ? setFirstName(currentPatient.firstName) : '';
      currentPatient.lastName !== null ? setLastName(currentPatient.lastName) : '';
      currentPatient.gender !== null ? setGender(currentPatient.gender) : '';
      currentPatient.emailAddress !== null ? setEmailAddress(currentPatient.emailAddress) : '';
      if (currentPatient.dateOfBirth !== null) {
        const dobString = new Date(parseInt(currentPatient.dateOfBirth));
        setDateOfBirth(moment(dobString.toUTCString()).format('DD/MM/YYYY'));
      }
    }
  }, [currentPatient]);

  const currentPatientId = currentPatient ? currentPatient.id : '';

  // const link = onError(({ graphQLErrors, networkError }) => {
  //   if (graphQLErrors)
  //     graphQLErrors.map(({ message, locations, path }) =>
  //       console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
  //     );
  //   if (networkError) console.log(`[Network error]: ${networkError}`);
  // });

  const submitDisabled =
    firstName.trim().length > 0 &&
    isNameValid(firstName) &&
    (lastName.trim().length > 0 && isNameValid(lastName)) &&
    (dateOfBirth.trim().length === 10 && isDobValid(dateOfBirth)) &&
    (emailAddress.trim().length === 0 || (emailAddress.length > 0 && isEmailValid(emailAddress))) &&
    _includes(genders, selectedGender)
      ? false
      : true;

  const showFirstNameError = firstName.trim().length > 0 && !isNameValid(firstName);
  const showLastNameError = lastName.trim().length > 0 && !isNameValid(lastName);
  const showDobError = dateOfBirth.trim().length === 10 && !isDobValid(dateOfBirth);
  const showEmailIdError = emailAddress.trim().length > 0 && !isEmailValid(emailAddress);
  const { popupHandler, showSuccess } = props;

  return (
    <div className={classes.signUpPop}>
      <div className={classes.mascotIcon}>
        <img src={require('images/ic_mascot.png')} alt="" />
      </div>
      <div className={classes.customScrollBar}>
        <div className={classes.signinGroup}>
          <Typography variant="h2">
            welcome
            <br /> to apollo 24/7
          </Typography>
          <p>Let us quickly get to know you so that we can get you the best help :)</p>
          <div className={classes.formGroup}>
            <FormControl className={classes.formControl} fullWidth>
              <AphTextField
                label="First Name"
                placeholder="Example, Jonathan"
                value={firstName}
                error={showFirstNameError}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                inputProps={{ maxLength: 20 }}
              />
              <FormHelperText
                className={showFirstNameError ? classes.showMessage : classes.hideMessage}
                component="div"
                error={true}
              >
                Invalid first name
              </FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl} fullWidth>
              <AphTextField
                label="Last Name"
                placeholder="Example, Donut"
                value={lastName}
                error={showLastNameError}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                inputProps={{ maxLength: 20 }}
              />
              <FormHelperText
                className={showLastNameError ? classes.showMessage : classes.hideMessage}
                component="div"
                error={true}
              >
                Invalid last name
              </FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl} fullWidth>
              <AphTextField
                label="Date Of Birth"
                placeholder="dd/mm/yyyy"
                value={dateOfBirth}
                error={showDobError}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                }}
                inputProps={{ type: 'text', maxLength: 10 }}
              />
              <FormHelperText
                className={showDobError ? classes.showMessage : classes.hideMessage}
                component="div"
                error={true}
              >
                Invalid date of birth
              </FormHelperText>
            </FormControl>
            <div className={classes.formControl}>
              <label>Gender</label>
              <Grid container spacing={2} className={classes.btnGroup}>
                {Object.values(Gender).map((gender) => (
                  <Grid item xs={4} sm={4} key={gender}>
                    <AphButton
                      variant="contained"
                      value={gender}
                      classes={selectedGender === gender ? { root: classes.btnActive } : {}}
                      onClick={(e) => {
                        setGender(e.currentTarget.value);
                      }}
                    >
                      {gender}
                    </AphButton>
                  </Grid>
                ))}
              </Grid>
            </div>
            <FormControl className={classes.formControl} fullWidth>
              <AphTextField
                label="Email Address (Optional)"
                placeholder="name@email.com"
                value={emailAddress}
                error={showEmailIdError}
                onChange={(e) => {
                  setEmailAddress(e.target.value);
                }}
              />
              <FormHelperText
                className={showEmailIdError ? classes.showMessage : classes.hideMessage}
                component="div"
                error={true}
              >
                Invalid email
              </FormHelperText>
            </FormControl>
          </div>
        </div>
      </div>
      <div className={classes.actions}>
        <Mutation<updatePatient, updatePatientVariables>
          mutation={UPDATE_PATIENT}
          onCompleted={() => {
            popupHandler(false);
            showSuccess(true);
          }}
        >
          {(mutate, { loading }) => (
            <AphButton
              fullWidth
              disabled={submitDisabled}
              variant="contained"
              color="primary"
              onClick={() => {
                const gqlDobFormat = moment(dateOfBirth, 'DD/MM/YYYY')
                  .format('YYYY/MM/DD')
                  .toString();
                mutate({
                  variables: {
                    patientInput: {
                      id: currentPatientId,
                      firstName: firstName,
                      lastName: lastName,
                      gender: Gender[selectedGender],
                      dateOfBirth: gqlDobFormat,
                      emailAddress: emailAddress,
                      relation: Relation['ME'],
                    },
                  },
                });
              }}
            >
              Submit
            </AphButton>
          )}
        </Mutation>
      </div>
    </div>
  );
};
