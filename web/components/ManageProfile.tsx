import { Theme } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import { createStyles, makeStyles } from '@material-ui/styles';
import { useCurrentPatient } from 'hooks/authHooks';
import { NewProfile } from 'components/NewProfile';
import { ExistingProfile } from 'components/ExistingProfile';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
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
  });
});

export const ManageProfile: React.FC = (props) => {
  const classes = useStyles();
  const mascotRef = useRef(null);
  const currentPatient = useCurrentPatient();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  return (
    <ProtectedWithLoginPopup>
      {({ protectWithLoginPopup, isProtected }) => (
        <div className={classes.signUpBar}>
          <div
            className={classes.mascotCircle}
            ref={mascotRef}
            onClick={() => (isProtected ? protectWithLoginPopup() : setIsPopoverOpen(true))}
          >
            <img src={require('images/ic_mascot.png')} alt="" />
          </div>
          <Popover
            open={isPopoverOpen}
            anchorEl={mascotRef.current}
            onClose={() => setIsPopoverOpen(false)}
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
            {currentPatient && currentPatient.uhid ? <ExistingProfile /> : <NewProfile />}
          </Popover>
        </div>
      )}
    </ProtectedWithLoginPopup>
  );
};
