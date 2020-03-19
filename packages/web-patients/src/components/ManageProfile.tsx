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
      paddingTop: 20,
      [theme.breakpoints.up(901)]: {
        display: 'flex',
      },
      [theme.breakpoints.down(900)]: {
        textAlign: 'center',
      },
      [theme.breakpoints.up(1134)]: {
        paddingTop: 0,
      },
    },
    mascotCircle: {
      cursor: 'pointer',
      [theme.breakpoints.up(768)]: {
        marginLeft: 'auto',
        marginBottom: 12,
        marginRight: 15,
      },
      [theme.breakpoints.up(1134)]: {
        marginLeft: 'auto',
        position: 'fixed',
        bottom: 0,
        right: 0,
      },
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
        verticalAlign: 'middle',
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

  // console.log(hasExistingProfile, defaultNewProfile, '-----------');

  return (
    <ProtectedWithLoginPopup>
      {({ protectWithLoginPopup, isProtected }) => (
        <div className={classes.signUpBar}>
          <div
            className={classes.mascotCircle}
            ref={mascotRef}
            onClick={() => (isProtected ? protectWithLoginPopup() : setIsPopoverOpen(true))}
            title={'Need Help?'}
          >
            <img src={require('images/ic-mascot.png')} alt="" />
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
