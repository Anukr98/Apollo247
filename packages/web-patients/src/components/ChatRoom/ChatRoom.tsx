import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState, useEffect } from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { ChatWindow } from 'components/ChatRoom/ChatWindow';
import { ConsultDoctorProfile } from 'components/ChatRoom/ConsultDoctorProfile';
import { useParams } from 'hooks/routerHooks';
import { useMutation } from 'react-apollo-hooks';
import { useAuth } from 'hooks/authHooks';
import { UPDATE_APPOINTMENT_SESSION } from 'graphql/consult';
import {
  UpdateAppointmentSession,
  UpdateAppointmentSessionVariables,
} from 'graphql/types/UpdateAppointmentSession';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/doctors';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    doctorListingSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    leftSection: {
      width: 328,
    },
    rightSection: {
      width: 'calc(100% - 328px)',
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
  };
});

type Params = { appointmentId: string; doctorId: string };

export const ChatRoom: React.FC = (props) => {
  const classes = useStyles();
  const params = useParams<Params>();
  const appointmentId = params.appointmentId;
  const doctorId = params.doctorId;
  const { isSignedIn } = useAuth();

  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');

  const mutationResponse = useMutation<UpdateAppointmentSession, UpdateAppointmentSessionVariables>(
    UPDATE_APPOINTMENT_SESSION,
    {
      variables: {
        UpdateAppointmentSessionInput: { appointmentId: appointmentId, requestRole: 'PATIENT' },
      },
    }
  );

  useEffect(() => {
    if (isSignedIn) {
      mutationResponse()
        .then((data) => {
          const appointmentToken =
            data && data.data && data.data.updateAppointmentSession
              ? data.data.updateAppointmentSession.appointmentToken
              : '';
          const sessionId =
            data && data.data && data.data.updateAppointmentSession.sessionId
              ? data.data.updateAppointmentSession.sessionId
              : '';
          setsessionId(sessionId);
          settoken(appointmentToken);
        })
        .catch(() => {
          window.alert('An error occurred while loading :(');
        });
    }
  }, [isSignedIn]);

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorDetailsById,
    GetDoctorDetailsByIdVariables
  >(GET_DOCTOR_DETAILS_BY_ID, {
    variables: { id: doctorId },
  });

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <div>Error....</div>;
  }

  return !isSignedIn ? (
    <LinearProgress />
  ) : (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => (window.location.href = clientRoutes.consultRoom())}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            Consultation - Case #362079
          </div>
          <div className={classes.doctorListingSection}>
            <div className={classes.leftSection}>
              {data && <ConsultDoctorProfile doctorDetails={data} appointmentId={appointmentId} />}
            </div>
            <div className={classes.rightSection}>
              {data && (
                <ChatWindow
                  sessionId={sessionId}
                  token={token}
                  appointmentId={appointmentId}
                  doctorId={doctorId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
