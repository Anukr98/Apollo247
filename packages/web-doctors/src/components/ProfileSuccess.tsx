import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        justifyContent: 'center',
      },
    },
    mascotCircle: {
      [theme.breakpoints.up('sm')]: {
        marginLeft: 'auto',
        cursor: 'pointer',
        position: 'fixed',
        bottom: 10,
        right: 15,
      },
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
      [theme.breakpoints.down('xs')]: {
        width: '100%',
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
      padding: '0 20px 20px 20px',
      display: 'flex',
    },

    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
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
    },
    signinGroup: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    button: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 'auto',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  });
});

export interface ProfileSuccessProps {
  popupHandler: (popup: boolean) => void;
}

export const ProfileSuccess: React.FC<ProfileSuccessProps> = (props) => {
  const classes = useStyles({});
  const { popupHandler } = props;
  return (
    <div className={classes.signUpBar}>
      <div className={classes.signUpPop}>
        <div className={classes.mascotIcon}>
          <img src={require('images/ic_mascot.png')} alt="" />
        </div>
        <div className={classes.signinGroup}>
          <Typography variant="h2">congratulations!</Typography>
          <p>
            Welcome to the Apollo family. You can add more family members any time from ‘My
            Account’.
          </p>
        </div>
        <div className={classes.actions}>
          <AphButton
            color="primary"
            classes={{ root: classes.button }}
            onClick={() => {
              popupHandler(false);
              window.location.reload();
            }}
          >
            Ok, Got it
          </AphButton>
        </div>
      </div>
    </div>
  );
};
