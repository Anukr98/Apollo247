import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { AppButton } from 'components/ui/AppButton';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
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
      padding: '0 20px 20px 20px',
      display: 'flex',
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

export const ProfileSuccess: React.FC = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div className={classes.signUpBar}>
      <div
        className={classes.mascotCircle}
        aria-describedby={id}
        onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
      >
        <img src={require('images/ic_mascot.png')} alt="" />
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
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
          <div className={classes.signinGroup}>
            <Typography variant="h2">
              Congratulations!
              </Typography>
            <p>Welcome to the Apollo family. You can add more family members any time from ‘My Account’.</p>
          </div>
          <div className={classes.actions}>
            <AppButton
              color="primary"
              classes={{ root: classes.button }}
            >
              Ok, Got it
            </AppButton>
          </div>
        </div>
      </Popover>
    </div >
  );
};
