import { Theme } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import { createStyles, makeStyles } from '@material-ui/styles';
import { useCurrentPatient, useAllCurrentPatients } from 'hooks/authHooks';
import { NewProfile } from 'components/NewProfile';
import { ExistingProfile } from 'components/ExistingProfile';
import { ProfileSuccess } from 'components/ProfileSuccess';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import React, { useRef, useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        justifyContent: 'center',
      },
    },
    mascotCircle: {
      cursor: 'pointer',
      [theme.breakpoints.up('sm')]: {
        marginLeft: 'auto',
        position: 'fixed',
        bottom: 10,
        right: 15,
      },
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
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
  });
});

export const ManageProfile: React.FC = (props) => {
  const classes = useStyles();
  const mascotRef = useRef(null);
  const currentPatient = useCurrentPatient();
  const allPatients = useAllCurrentPatients();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);

  useEffect(() => {
    if (allPatients) {
      const isSomePatientMissingRelation = allPatients.some((p) => _isEmpty(p.relation));
      if (isSomePatientMissingRelation) setIsPopoverOpen(true);
    }
  }, [allPatients]);

  const newUserMarkup = () => {
    if (showSuccess) {
      setIsPopoverOpen(true);
      return <ProfileSuccess popupHandler={(isPopoverOpen) => setIsPopoverOpen(isPopoverOpen)} />;
    } else if (currentPatient && currentPatient.uhid) {
      return <ExistingProfile popupHandler={(isPopoverOpen) => setIsPopoverOpen(isPopoverOpen)} />;
    } else {
      return (
        <NewProfile
          popupHandler={(isPopoverOpen) => setIsPopoverOpen(isPopoverOpen)}
          showSuccess={(showSuccess) => setShowSuccess(showSuccess)}
        />
      );
    }
  };

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
            className={classes.bottomPopover}
            onClose={() => setIsPopoverOpen(false)}
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
            {newUserMarkup()}
          </Popover>
        </div>
      )}
    </ProtectedWithLoginPopup>
  );
};
