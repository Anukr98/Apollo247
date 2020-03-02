import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import { useAuth } from 'hooks/authHooks';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DOCTOR_ONLINE_STATUS } from 'graphql/types/globalTypes';
import { UPDATE_DOCTOR_ONLINE_STATUS } from 'graphql/doctors';
import {
  UpdateDoctorOnlineStatus,
  UpdateDoctorOnlineStatusVariables,
} from 'graphql/types/UpdateDoctorOnlineStatus';
import { useMutation } from 'react-apollo-hooks';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { GET_CONSULT_QUEUE } from 'graphql/consults';
import { GetConsultQueueVariables, GetConsultQueue } from 'graphql/types/GetConsultQueue';
import { useQuery } from 'react-apollo-hooks';
import { AphLinearProgress } from '@aph/web-ui-components';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';

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
      textAlign: 'center',
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
      },
    },
    doctorInfo: {
      padding: '20px 5px',
      minHeight: 150,
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
    popoverTile: {
      color: '#fcb716',
      fontWeight: 500,
    },
    noDoctorImage: {
      paddingBottom: 0,
    },
  };
});

export const JDProfile: React.FC = (props) => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [logoutFailed, setIsLogoutFailed] = React.useState(false);
  const [clearQueue, setClearQueue] = React.useState(false);
  const { currentPatient: currentDoctor, signOut, isSigningIn } = useAuth();
  let activeConsultsCount: number = 0;

  const doctorAwayMutation = useMutation<
    UpdateDoctorOnlineStatus,
    UpdateDoctorOnlineStatusVariables
  >(UPDATE_DOCTOR_ONLINE_STATUS, {
    variables: {
      doctorId: (currentDoctor && currentDoctor.id) || '',
      onlineStatus: DOCTOR_ONLINE_STATUS.AWAY,
    },
  });

  const { data, loading, error } = useQuery<GetConsultQueue, GetConsultQueueVariables>(
    GET_CONSULT_QUEUE,
    {
      skip: !currentDoctor,
      variables: {
        doctorId: currentDoctor!.id,
      },
      fetchPolicy: 'no-cache',
    }
  );

  const {
    data: doctorDetailsData,
    error: doctorDetailsError,
    loading: doctorDetailsLoading,
  } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);

  if (
    doctorDetailsLoading ||
    doctorDetailsError ||
    !doctorDetailsData ||
    !doctorDetailsData.getDoctorDetails
  )
    return null;

  const { onlineStatus } = doctorDetailsData.getDoctorDetails;

  if (loading) return <AphLinearProgress />;
  if (error) return <div>An error occurred while loading your consults....</div>;
  if (data && data.getConsultQueue) {
    const { consultQueue } = data.getConsultQueue;
    const allConsults = consultQueue.map((consult) => ({
      ...consult,
      appointment: {
        ...consult.appointment,
        appointmentDateTime: new Date(consult.appointment.appointmentDateTime),
      },
    }));
    const activeConsults = allConsults.filter((consult) => consult.isActive);
    activeConsultsCount = activeConsults.length;
  }

  const doctorFirstName =
    currentDoctor && currentDoctor.firstName ? _startCase(_toLower(currentDoctor.firstName)) : '';
  const doctorLastName =
    currentDoctor && currentDoctor.lastName ? _startCase(_toLower(currentDoctor.lastName)) : '';
  const doctorMobileNumber =
    currentDoctor && currentDoctor.mobileNumber
      ? _startCase(_toLower(currentDoctor.mobileNumber))
      : '';
  const mobileDoctor = doctorMobileNumber.toString().split('');
  const realDigits = mobileDoctor.map(Number);
  const digits = realDigits.slice(0, 2);
  const numbers = realDigits.slice(2, 12).join('');

  const doctorSalutation =
    currentDoctor && currentDoctor.salutation ? _startCase(_toLower(currentDoctor.salutation)) : '';
  const doctorQualification = currentDoctor && currentDoctor.qualification;
  const doctorPhotoUrl = currentDoctor && currentDoctor.photoUrl ? currentDoctor.photoUrl : '';

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
            <div
              className={`${classes.doctorImg} ${
                doctorPhotoUrl !== '' ? classes.noDoctorImage : ''
              }`}
            >
              <img
                src={doctorPhotoUrl !== '' ? doctorPhotoUrl : require('images/no_photo.png')}
                alt="Doctor Profile Image"
              />
            </div>
            <div className={classes.doctorInfo}>
              <div className={classes.customScroll}>
                <div
                  className={classes.doctorName}
                >{`${doctorSalutation} ${doctorFirstName} ${doctorLastName}`}</div>
                <div className={classes.doctorType}>{doctorQualification}</div>
                <div className={classes.contactNo}>
                  {'+'}
                  {digits} {numbers}
                </div>
              </div>
            </div>
            <div className={classes.bottomActions}>
              <AphButton
                color="primary"
                fullWidth
                onClick={() => {
                  if (activeConsultsCount > 0 || onlineStatus === DOCTOR_ONLINE_STATUS.ONLINE) {
                    setClearQueue(true);
                  } else {
                    doctorAwayMutation()
                      .then(() => {
                        setIsDialogOpen(true);
                      })
                      .catch(() => {
                        setIsLogoutFailed(true);
                      });
                  }
                }}
              >
                Logout
              </AphButton>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.popoverTile}>Apollo 24x7</DialogTitle>
        <DialogContent>
          <DialogContentText>You are successfully Logged out from Apollo 24x7</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              signOut();
              setIsDialogOpen(false);
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={clearQueue}
        onClose={() => setClearQueue(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.popoverTile}>Apollo 24x7</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please mark yourself 'Away' first and clear your{' '}
            {activeConsultsCount > 0 ? activeConsultsCount : ''} active consults in Queue to logout.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setClearQueue(false);
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={logoutFailed}
        onClose={() => setIsLogoutFailed(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.popoverTile}>Apollo 24x7</DialogTitle>
        <DialogContent>
          <DialogContentText>Unable to log out!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setIsLogoutFailed(false);
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
