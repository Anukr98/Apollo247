import { Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AppButton } from 'components/ui/AppButton';
import { AppTextField } from 'components/ui/AppTextField';
import { useLoginPopupVisible, useSetLoginPopupVisible } from 'hooks/authHooks';
import React, { useRef } from 'react';

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
  });
});

export const SignUp: React.FC = (props) => {
  const classes = useStyles();
  const mascotRef = useRef(null);
  const loginPopupVisible = useLoginPopupVisible();
  const setLoginPopupVisible = useSetLoginPopupVisible();

  return (
    <div className={classes.signUpBar}>
      <div
        className={classes.mascotCircle}
        ref={mascotRef}
        onClick={(e) => setLoginPopupVisible(true)}
      >
        <img src={require('images/ic_mascot.png')} alt="" />
      </div>
      <Popover
        open={loginPopupVisible}
        anchorEl={mascotRef.current}
        onClose={() => setLoginPopupVisible(false)}
        className={classes.bottomPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
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
                <AppTextField label="First Name" placeholder="Example, Jonathan" />
                <AppTextField label="Last Name" placeholder="Example, Donut" />
                <AppTextField label="Date Of Birth" placeholder="mm/dd/yyyy" />
                <div className={classes.formControl}>
                  <label>Gender</label>
                  <Grid container spacing={2} className={classes.btnGroup}>
                    <Grid item xs={6} sm={4}>
                      <AppButton variant="contained">Male</AppButton>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <AppButton variant="contained">Female</AppButton>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <AppButton variant="contained">Other</AppButton>
                    </Grid>
                  </Grid>
                </div>
                <AppTextField label="Email Address (Optional)" placeholder="name@email.com" />
              </div>
            </div>
          </div>
          <div className={classes.actions}>
            <AppButton fullWidth disabled variant="contained" color="primary">
              Submit
            </AppButton>
          </div>
        </div>
      </Popover>
    </div>
  );
};
