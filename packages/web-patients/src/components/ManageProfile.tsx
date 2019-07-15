import { Theme, CircularProgress } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import { createStyles, makeStyles } from '@material-ui/styles';
import { useCurrentPatient, useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { NewProfile } from 'components/NewProfile';
import { ExistingProfile } from 'components/ExistingProfile';
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
  const { isSigningIn } = useAuth();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  useEffect(() => {
    if (allPatients) {
      const isSomePatientMissingRelation = allPatients.some((p) => _isEmpty(p.relation));
      if (isSomePatientMissingRelation) {
        // The mascotRef position has maybe not been calculated properly (or something) yet?
        // So the popup appears, but in the wrong location. Use a setTimeout to avoid this.
        setTimeout(() => setIsPopoverOpen(true), 0);
      }
    }
  }, [allPatients]);

  const hasExistingProfile = allPatients && allPatients.some((p) => !_isEmpty(p.uhid));
  const defaultNewProfile = allPatients ? currentPatient || allPatients[0] : null;

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
            {isSigningIn && (
              <CircularProgress style={{ position: 'absolute', top: 17, left: 17 }} />
            )}
          </div>
          <Popover
            open={!isSigningIn && isPopoverOpen}
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
            {hasExistingProfile ? (
              <ExistingProfile patients={allPatients!} onComplete={() => setIsPopoverOpen(false)} />
            ) : defaultNewProfile ? (
              <NewProfile patient={defaultNewProfile} onClose={() => setIsPopoverOpen(false)} />
            ) : null}
          </Popover>
        </div>
      )}
    </ProtectedWithLoginPopup>
  );
};
