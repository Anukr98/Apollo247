import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { ActiveConsultCard } from 'components/JuniorDoctors/ActiveConsultCard';
import { PastConsultCard } from 'components/JuniorDoctors/PastConsultCard';
import { useQuery } from 'react-apollo-hooks';
import { GET_CONSULT_QUEUE } from 'graphql/consults';
import { useCurrentPatient } from 'hooks/authHooks';
import { GetConsultQueueVariables, GetConsultQueue } from 'graphql/types/GetConsultQueue';
import _isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';
import { AphLinearProgress } from '@aph/web-ui-components';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { DOCTOR_ONLINE_STATUS } from 'graphql/types/globalTypes';
import { STATUS } from 'graphql/types/globalTypes';

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
    },
    pageHeader: {
      boxShadow: '0 1px 5px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      padding: '32px 40px 20px 40px',
      '& h2': {
        fontSize: 28,
        fontWeight: 600,
        margin: 0,
        letterSpacing: 'normal',
        color: '#02475b',
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: '#0087ba',
        margin: 0,
        paddingTop: 12,
      },
    },
    contentGroup: {
      display: 'flex',
    },
    leftSection: {
      width: 'calc(50% - 1px)',
      borderRight: '1px solid rgba(2,71,91,0.2)',
    },
    rightSection: {
      width: '50%',
    },
    blockGroup: {
      width: '100%',
    },
    blockHeader: {
      boxShadow: '0 2px 10px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 12,
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
    },
    blockBody: {
      padding: '30px 20px',
      position: 'relative',
    },
    customScroll: {
      padding: '0 20px',
    },
    boxGroup: {
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      padding: '30px 30px 10px 30px',
      marginBottom: 10,
    },
    cardLoader: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
    },
    noData: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      padding: 10,
      textAlign: 'center',
      opacity: 0.6,
    },
  };
});

export const JuniorDoctor: React.FC = (props) => {
  const classes = useStyles({});
  const currentDoctor = useCurrentPatient();
  const { isSigningIn } = useAuth();

  const { data, loading, error, stopPolling } = useQuery<GetConsultQueue, GetConsultQueueVariables>(
    GET_CONSULT_QUEUE,
    {
      skip: !currentDoctor,
      variables: {
        doctorId: currentDoctor!.id,
      },
      pollInterval: 10 * 1000,
      notifyOnNetworkStatusChange: true,
    }
  );

  useEffect(() => {
    if (data && data.getConsultQueue) {
      const { consultQueue } = data && data.getConsultQueue;
      const allConsults = consultQueue.map((consult) => ({
        ...consult,
        appointment: {
          ...consult.appointment,
          appointmentDateTime: new Date(consult.appointment.appointmentDateTime),
        },
      }));
      const activeConsults = allConsults.filter((consult) => consult.isActive);

      localStorage.setItem('activeConsultQueueCount', activeConsults.length.toString());
    } else {
      localStorage.setItem('activeConsultQueueCount', '1');
    }
  }, [data]);

  const {
    data: doctorDetailsData,
    error: doctorDetailsError,
    loading: doctorDetailsLoading,
  } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);

  const currentStatus =
    doctorDetailsData &&
    doctorDetailsData.getDoctorDetails &&
    doctorDetailsData.getDoctorDetails.onlineStatus;

  if (currentStatus === DOCTOR_ONLINE_STATUS.AWAY) stopPolling();

  let content: [React.ReactNode, React.ReactNode] = [null, null];
  let isActiveConsultsAvailable,
    isPastConsultsAvailable = false;

  if (
    doctorDetailsLoading ||
    doctorDetailsError ||
    !doctorDetailsData ||
    !doctorDetailsData.getDoctorDetails
  )
    return null;

  if (error) content = [<div>An error occured :(</div>, <div>An error occured :(</div>];
  if (loading && _isEmpty(data)) content = [<AphLinearProgress />, <AphLinearProgress />];
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

    const pastConsults = allConsults
      .filter((consult) => !consult.isActive && consult.appointment.status !== STATUS.CANCELLED)
      .reverse();
    content = [
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 320px'}>
        <div className={classes.customScroll} onContextMenu={(e) => e.preventDefault()}>
          <div className={classes.boxGroup}>
            {activeConsults.map(({ id, patient, appointment, isActive }, index) => {
              isActiveConsultsAvailable = true;
              return (
                <Link
                  key={id}
                  to={clientRoutes.JDConsultRoom({
                    appointmentId: appointment.id,
                    patientId: patient.id,
                    queueId: String(id),
                    isActive: isActive ? 'active' : 'done',
                  })}
                >
                  <ActiveConsultCard
                    id={id}
                    patient={{ ...patient, queueNumber: index + 1 }}
                    appointment={appointment}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </Scrollbars>,
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 320px'}>
        <div className={classes.customScroll} onContextMenu={(e) => e.preventDefault()}>
          <div className={classes.boxGroup}>
            {pastConsults.map(({ id, patient, appointment, isActive }) => {
              isPastConsultsAvailable = true;

              return (
                <Link
                  key={id}
                  to={clientRoutes.JDConsultRoom({
                    appointmentId: appointment.id,
                    patientId: patient.id,
                    queueId: String(id),
                    isActive: isActive ? 'active' : 'done',
                  })}
                >
                  <PastConsultCard id={id} key={id} patient={patient} appointment={appointment} />
                </Link>
              );
            })}
          </div>
        </div>
      </Scrollbars>,
    ];
  }

  return isSigningIn ? (
    <AphLinearProgress />
  ) : (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.pageHeader}>
            <h2>hello doc :)</h2>
            <p>Easily manage all your old and new patients here</p>
          </div>
          <div className={classes.contentGroup}>
            <div className={classes.leftSection}>
              <div className={classes.blockGroup}>
                <div className={classes.blockHeader}>Active Patients</div>
                <div className={classes.blockBody}>
                  {loading && data && <AphLinearProgress className={classes.cardLoader} />}
                  {isActiveConsultsAvailable ? (
                    content[0]
                  ) : (
                    <>
                      {!loading ? (
                        <div className={classes.noData}>No Patients in your queue.</div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={classes.rightSection}>
              <div className={classes.blockGroup}>
                <div className={classes.blockHeader}>Past Consults</div>
                <div className={classes.blockBody}>
                  {loading && data && <AphLinearProgress className={classes.cardLoader} />}
                  {isPastConsultsAvailable ? (
                    content[1]
                  ) : (
                    <>
                      {!loading ? <div className={classes.noData}>No data available.</div> : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
