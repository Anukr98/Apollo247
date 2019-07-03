import { Theme, FormControl } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AppButton } from 'components/ui/AppButton';
import { AppTextField } from 'components/ui/AppTextField';
import { Sex as GENDER } from 'graphql/types/globalTypes';
import React, { useState } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import { isNameValid, isEmailValid, isDobValid } from 'utils/FormValidationUtils';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
    },
    formControl: {
      marginBottom: 20,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
      },
    },
    mascotCircle: {
      marginLeft: 'auto',
      cursor: 'pointer',
      position: 'fixed',
      bottom: 10,
      right: 15,
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
      },
    },
    signUpPop: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
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
  });
});

export const NewProfile: React.FC = (props) => {
  const classes = useStyles();
  const genders = Object.values(GENDER).filter((g) => g != 'NOT_APPLICABLE' && g != 'NOT_KNOWN');
  const [showFirstNameError, setShowFirstNameError] = useState<boolean>(false);
  const [showLastNameError, setShowLastNameError] = useState<boolean>(false);
  const [showDobError, setDobError] = useState<boolean>(false);
  const [showEmailIdError, setShowEmailIdError] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');

  const submitDisabled =
    firstName.length > 2 && lastName.length > 2 && dateOfBirth.length === 10 ? false : true;

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
              <AppTextField
                label="First Name"
                placeholder="Example, Jonathan"
                value={firstName}
                error={firstName ? !isNameValid(firstName) : false}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (!isNameValid(e.target.value)) {
                    setShowFirstNameError(true);
                  } else {
                    setShowFirstNameError(false);
                  }
                }}
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
              <AppTextField
                label="Last Name"
                placeholder="Example, Donut"
                value={lastName}
                error={lastName ? !isNameValid(lastName) : false}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (!isNameValid(e.target.value)) {
                    setShowLastNameError(true);
                  } else {
                    setShowLastNameError(false);
                  }
                }}
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
              <AppTextField
                label="Date Of Birth"
                placeholder="dd/mm/yyyy"
                value={dateOfBirth}
                error={dateOfBirth ? !isDobValid(dateOfBirth) : false}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  if (!isDobValid(e.target.value)) {
                    setDobError(true);
                  } else {
                    setDobError(false);
                  }
                }}
                inputProps={{ type: 'date' }}
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
                {genders.map((gender) => (
                  <Grid item xs={6} sm={4} key={gender}>
                    <AppButton variant="contained">{gender}</AppButton>
                  </Grid>
                ))}
              </Grid>
            </div>
            <FormControl className={classes.formControl} fullWidth>
              <AppTextField
                label="Email Address (Optional)"
                placeholder="name@email.com"
                value={emailAddress}
                error={emailAddress ? !isEmailValid(emailAddress) : false}
                onChange={(e) => {
                  setEmailAddress(e.target.value);
                  if (e.target.value !== '' && !isEmailValid(e.target.value)) {
                    setShowEmailIdError(true);
                  } else {
                    setShowEmailIdError(false);
                  }
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
        <AppButton fullWidth disabled={submitDisabled} variant="contained" color="primary">
          Submit
        </AppButton>
      </div>
    </div>
  );
};
