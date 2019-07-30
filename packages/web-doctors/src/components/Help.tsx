import {
  FormControl,
  FormHelperText,
  InputAdornment,
  Theme,
  Typography,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphInput } from '@aph/web-ui-components';
import React, { useState } from 'react';
import { isMobileNumberValid } from '@aph/universal/aphValidators';
import isNumeric from 'validator/lib/isNumeric';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '30px 0 50px 0',
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 10,
      },
    },
    helpWrap: {
      paddingBottom: 0,
    },
    button: {
      [theme.breakpoints.up('sm')]: {
        minWidth: 200,
      },
    },
    inputAdornment: {
      color: theme.palette.secondary.dark,
      '& p': {
        color: theme.palette.secondary.dark,
        fontSize: 18,
        fontWeight: 500,
        marginBottom: 9,
      },
    },
    helpText: {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.dark,
      marginTop: 10,
      lineHeight: 2,
      opacity: 1,
    },
    needHelp: {
      padding: '8px',
      width: '84%',
      margin: '30px 7% 0 7%',
      borderRadius: '5px',
      boxShadow: 'none',
    },
    cross: {
      position: 'absolute',
      right: 0,
      top: '10px',
      fontSize: '18px',
      color: '#02475b',
    },
    helpInput: {
      '& input': {
        fontSize: 18,
        fontWeight: 500,
        color: '#02475b',
      },
    },
  };
});

const mobileNumberPrefix = '+91';
const validPhoneMessage = '';
const invalidPhoneMessage = 'This seems like the wrong number';
interface HelpProps {
  setBackArrow: () => void;
}
export const HelpPopup: React.FC<HelpProps> = (props) => {
  const { setBackArrow } = props;
  const classes = useStyles();
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [phoneMessage, setPhoneMessage] = useState<string>(validPhoneMessage);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [showHelpPage, setShowHelpPage] = useState<boolean>(true);

  return showHelpPage ? (
    <div className={`${classes.loginFormWrap} ${classes.helpWrap}`}>
      <Typography variant="h2">need help?</Typography>
      <p>You can request a call back for us to resolve your issue ASAP</p>
      <FormControl fullWidth className={classes.helpInput}>
        <AphInput
          autoFocus
          inputProps={{ type: 'tel', maxLength: 10 }}
          value={mobileNumber}
          onPaste={(e) => {
            if (!isNumeric(e.clipboardData.getData('text'))) e.preventDefault();
          }}
          onChange={(event) => {
            setMobileNumber(event.currentTarget.value);
            if (event.currentTarget.value !== '') {
              if (isMobileNumberValid(event.currentTarget.value)) {
                setPhoneMessage(validPhoneMessage);
                setShowErrorMessage(false);
              } else {
                setPhoneMessage(invalidPhoneMessage);
                setShowErrorMessage(true);
              }
            } else {
              setPhoneMessage(validPhoneMessage);
              setShowErrorMessage(false);
            }
          }}
          error={mobileNumber.trim() !== '' && !isMobileNumberValid(mobileNumber)}
          onKeyPress={(e) => {
            if (isNaN(parseInt(e.key, 10))) {
              e.preventDefault();
            }
          }}
          startAdornment={
            <InputAdornment className={classes.inputAdornment} position="start">
              {mobileNumberPrefix}
            </InputAdornment>
          }
        />
        <FormHelperText component="div" className={classes.helpText} error={showErrorMessage}>
          {phoneMessage}
        </FormHelperText>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        disabled={!isMobileNumberValid(mobileNumber) || mobileNumber.length !== 10}
        className={classes.needHelp}
        onClick={() => {
          setShowHelpPage(false);
          setBackArrow();
        }}
      >
        CALL ME
      </Button>
    </div>
  ) : (
    <div className={`${classes.loginFormWrap} ${classes.helpWrap}`}>
      <Typography variant="h2">done!</Typography>
      <p>You will receive a call from us shortly.</p>
    </div>
  );
};
