import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { ActiveConsultCard } from 'components/JuniorDoctors/ActiveConsultCard';
import { useQuery } from 'react-apollo-hooks';
import { GET_CONSULT_QUEUE } from 'graphql/consults';
import { useCurrentPatient } from 'hooks/authHooks';
import { GetConsultQueueVariables, GetConsultQueue } from 'graphql/types/GetConsultQueue';
import _isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';
import { AphLinearProgress } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 65,
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
      width: '100%',
    },
    blockGroup: {
      width: '100%',
    },
    blockBody: {
      padding: '30px 20px',
      position: 'relative',
    },
    customScroll: {
      padding: '0 20px',
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

export const JuniorDoctorActive: React.FC = (props) => {
  const classes = useStyles({});
  const currentDoctor = useCurrentPatient();
  const { isSigningIn } = useAuth();

  let content: React.ReactNode = null;
  let isActiveConsultsAvailable = false;

  const { data, loading, error, stopPolling } = useQuery<GetConsultQueue, GetConsultQueueVariables>(
    GET_CONSULT_QUEUE,
    {
      skip: !currentDoctor,
      variables: {
        doctorId: currentDoctor!.id,
        isActive: true,
      },
      pollInterval: 360 * 1000,
      notifyOnNetworkStatusChange: true,
    }
  );

  if (error) content = <div>An error occured :(</div>;
  if (loading && _isEmpty(data)) content = <AphLinearProgress />;

  if (data && data.getConsultQueue) {
    const { consultQueue } = data.getConsultQueue;
    const allConsults = consultQueue.map((consult) => ({
      ...consult,
      appointment: {
        ...consult.appointment,
        appointmentDateTime: new Date(consult.appointment.appointmentDateTime),
      },
    }));

    //const activeConsults = allConsults.filter((consult) => consult.isActive);

    content = (
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 320px'}>
        <div className={classes.customScroll} onContextMenu={(e) => e.preventDefault()}>
          <div>
            {allConsults.map(({ id, patient, appointment, isActive }, index) => {
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
      </Scrollbars>
    );
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
            <p>Easily manage all your new patients here</p>
          </div>
          <div className={classes.contentGroup}>
            <div className={classes.leftSection}>
              <div className={classes.blockGroup}>
                <div className={classes.blockBody}>
                  {loading && data && <AphLinearProgress className={classes.cardLoader} />}
                  {isActiveConsultsAvailable ? (
                    content
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
          </div>
        </div>
      </div>
    </div>
  );
};
