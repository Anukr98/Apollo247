import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { useAuth } from 'hooks/authHooks';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 65,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 9999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      padding: 20,
    },
    profileBlock: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      width: 328,
    },
    doctorImg: {
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      padding: '20px 5px',
    },
    customScroll: {
      padding: '0 15px',
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
    },
    doctorType: {
      fontSize: 16,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.8)',
    },
    contactNo: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      paddingTop: 5,
    },
    bottomActions: {
      padding: 20,
    },
  };
});

export const JDProfile: React.FC = (props) => {
  const classes = useStyles();

  const { currentPatient: currentDoctor, signOut, isSigningIn } = useAuth();

  const doctorFirstName =
    currentDoctor && currentDoctor.firstName ? _startCase(_toLower(currentDoctor.firstName)) : '';
  const doctorLastName =
    currentDoctor && currentDoctor.lastName ? _startCase(_toLower(currentDoctor.lastName)) : '';
  const doctorMobileNumber =
    currentDoctor && currentDoctor.mobileNumber
      ? _startCase(_toLower(currentDoctor.mobileNumber))
      : '';
  const doctorSalutation =
    currentDoctor && currentDoctor.salutation ? _startCase(_toLower(currentDoctor.salutation)) : '';
  const doctorSpecialty =
    currentDoctor && currentDoctor.specialty && currentDoctor.specialty.name
      ? _startCase(_toLower(currentDoctor.specialty.name))
      : '';
  const doctorPhotoUrl =
    currentDoctor && currentDoctor.photoUrl ? _startCase(_toLower(currentDoctor.photoUrl)) : '';

  return isSigningIn ? (
    <LinearProgress />
  ) : (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.profileBlock}>
            <div className={classes.doctorImg}>
              <img
                src={doctorPhotoUrl !== '' ? doctorPhotoUrl : 'https://via.placeholder.com/328x228'}
                alt="Doctor Profile Image"
              />
            </div>
            <div className={classes.doctorInfo}>
              <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 474px' }}>
                <div className={classes.customScroll}>
                  <div
                    className={classes.doctorName}
                  >{`${doctorSalutation} ${doctorFirstName} ${doctorLastName}`}</div>
                  <div className={classes.doctorType}>{doctorSpecialty}</div>
                  <div className={classes.contactNo}>{doctorMobileNumber}</div>
                </div>
              </Scrollbars>
            </div>
            <div className={classes.bottomActions}>
              <AphButton color="primary" fullWidth onClick={() => signOut()}>
                Logout
              </AphButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
