import { Theme, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { PatientCard } from 'components/JuniorDoctors/PatientCard';
import { PastConsults } from 'components/JuniorDoctors/PastConsults';
import { useQuery } from 'react-apollo-hooks';
import { GetDoctorConsults, GetDoctorConsultsVariables } from 'graphql/types/GetDoctorConsults';
import { GET_DOCTOR_CONSULTS } from 'graphql/consults';
import { useCurrentPatient } from 'hooks/authHooks';

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
  };
});

export const JuniorDoctor: React.FC = (props) => {
  const classes = useStyles();
  const currentDoctor = useCurrentPatient();
  console.log('currentDoctor', currentDoctor);
  const { data, loading, error } = useQuery<GetDoctorConsults, GetDoctorConsultsVariables>(
    GET_DOCTOR_CONSULTS,
    {
      skip: !currentDoctor,
      variables: {
        getDoctorConsultsInput: {
          doctorId: currentDoctor!.id,
        },
      },
    }
  );
  console.log(data);

  let content: [React.ReactNode, React.ReactNode] = [null, null];

  if (error) content = [<div>An error occured :(</div>, <div>An error occured :(</div>];

  if (loading) content = [<CircularProgress />, <CircularProgress />];

  if (data && data.getDoctorConsults && data.getDoctorConsults.doctorConsults) {
    const { doctorConsults } = data.getDoctorConsults;
    const pastConsults = doctorConsults.filter(
      (dc) => new Date(dc.appointment.appointmentDateTime) < new Date()
    );
    const futureConsults = doctorConsults.filter(
      (dc) => new Date(dc.appointment.appointmentDateTime) > new Date()
    );
    console.log(doctorConsults, pastConsults, futureConsults);
    content = [
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 320px'}>
        <div className={classes.customScroll}>
          <div className={classes.boxGroup}>
            {futureConsults.map(({ patient, appointment }, index) => (
              <PatientCard
                key={patient.id}
                patient={{
                  firstName: patient.firstName || '',
                  lastName: patient.lastName || '',
                  uhid: patient.uhid,
                  photoUrl: patient.photoUrl,
                  queueNumber: index + 1,
                }}
                appointment={{
                  appointmentDateTime: new Date(appointment.appointmentDateTime),
                  appointmentType: appointment.appointmentType,
                }}
              />
            ))}
          </div>
        </div>
      </Scrollbars>,

      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 320px'}>
        <div className={classes.customScroll}>
          <div className={classes.boxGroup}>
            <PastConsults />
          </div>
        </div>
      </Scrollbars>,
    ];
  }

  return (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.pageHeader}>
            <h2>hello doc :)</h2>
            <p>manage your new and old patients easily here</p>
          </div>
          <div className={classes.contentGroup}>
            <div className={classes.leftSection}>
              <div className={classes.blockGroup}>
                <div className={classes.blockHeader}>Active Patients</div>
                <div className={classes.blockBody}>{content[0]}</div>
              </div>
            </div>
            <div className={classes.rightSection}>
              <div className={classes.blockGroup}>
                <div className={classes.blockHeader}>Past Consults</div>
                <div className={classes.blockBody}>{content[1]}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
