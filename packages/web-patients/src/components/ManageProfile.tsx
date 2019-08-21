import { Theme, CircularProgress } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import { createStyles, makeStyles } from '@material-ui/styles';
import { NewProfile } from 'components/NewProfile';
import { ExistingProfile } from 'components/ExistingProfile';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import React, { useRef, useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';

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
      right: '20px !important',
      bottom: '20px !important',
      left: 'auto !important',
      top: 'auto !important',
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
  const { isSigningIn } = useAuth();
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [isDataFilled, setIsDataFilled] = React.useState<boolean>(false);

  useEffect(() => {
    if (allCurrentPatients) {
      const isSomePatientMissingRelation = allCurrentPatients.some((p) => _isEmpty(p.relation));
      if (isSomePatientMissingRelation) {
        setIsDataFilled(true);
        // The mascotRef position has maybe not been calculated properly (or something) yet?
        // So the popup appears, but in the wrong location. Use a setTimeout to avoid this.
        setTimeout(() => setIsPopoverOpen(true), 0);
      }
    }
  }, [allCurrentPatients]);

  const hasExistingProfile =
    allCurrentPatients && allCurrentPatients.some((p) => !_isEmpty(p.uhid));
  const defaultNewProfile = allCurrentPatients ? currentPatient || allCurrentPatients[0] : null;

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
            onClose={() => setIsPopoverOpen(isDataFilled)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            classes={{ paper: classes.bottomPopover }}
          >
            {hasExistingProfile ? (
              <ExistingProfile
                patients={allCurrentPatients!}
                onComplete={() => setIsPopoverOpen(false)}
              />
            ) : defaultNewProfile ? (
              <NewProfile patient={defaultNewProfile} onClose={() => setIsPopoverOpen(false)} />
            ) : null}
          </Popover>
        </div>
      )}
    </ProtectedWithLoginPopup>
  );
};
