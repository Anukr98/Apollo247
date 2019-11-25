import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, MenuItem, Popover } from '@material-ui/core';
import React, { useRef } from 'react';
import { Header } from 'components/Header';
import { AphSelect, AphButton } from '@aph/web-ui-components';
import { ThingsToDo } from 'components/ConsultRoom/ThingsToDo';
import { ConsultationsCard } from 'components/ConsultRoom/ConsultationsCard';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { GET_PATIENT_APPOINTMENTS } from 'graphql/doctors';
import {
  GetPatientAppointments,
  GetPatientAppointmentsVariables,
} from 'graphql/types/GetPatientAppointments';
import { clientRoutes } from 'helpers/clientRoutes';
import { Route } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
// import { APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import _isEmpty from 'lodash/isEmpty';
import { useAuth } from 'hooks/authHooks';
import { STATUS } from 'graphql/types/globalTypes';
import isToday from 'date-fns/isToday';
import { TransferConsultMessage } from 'components/ConsultRoom/TransferConsultMessage';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import moment from 'moment';
// import { getIstTimestamp } from 'helpers/dateHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    none: {
      display: 'none',
    },
    block: {
      display: 'block',
    },
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 0,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeightMedium,
      textAlign: 'center',
      color: '#02475b',
      padding: '14px 10px',
      textTransform: 'none',
      width: '50%',
      opacity: 1,
      lineHeight: 'normal',
      [theme.breakpoints.down('xs')]: {
        width: '50%',
      },
    },
    tabSelected: {
      fontWeight: theme.typography.fontWeightBold,
      color: '#02475b',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
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
    consultPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      paddingLeft: 40,
      paddingRight: 20,
      paddingTop: 46,
      paddingBottom: 40,
    },
    consultationsHeader: {
      paddingBottom: 60,
      width: 'calc(100% - 328px)',
      paddingRight: 20,
      '& h1': {
        display: 'flex',
        fontSize: 50,
        [theme.breakpoints.down('xs')]: {
          fontSize: 30,
        },
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: '#0087ba',
        margin: 0,
        paddingTop: 10,
      },
    },
    selectMenuRoot: {
      paddingRight: 55,
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 50,
      fontWeight: 600,
      lineHeight: '66px',
      paddingTop: 2,
      paddingBottom: 7,
      [theme.breakpoints.down('xs')]: {
        fontSize: 30,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      marginLeft: 30,
      paddingBottom: 0,
      paddingRight: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    bottomActions: {
      marginTop: 20,
      maxWidth: 201,
    },
    consultSection: {
      display: 'flex',
      paddingRight: 20,
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      marginTop: -60,
    },
    rightSection: {
      width: 328,
      marginTop: -183,
    },
    noConsultations: {
      paddingBottom: 0,
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    noAppointments: {
      padding: 10,
      margin: 10,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const ConsultRoom: React.FC = (props) => {
  const classes = useStyles({});
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  // const currentDate = new Date().toISOString().substring(0, 10);
  const currentDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  const { isSignedIn } = useAuth();
  const mascotRef = useRef(null);
  const [isPopoverOpen] = React.useState<boolean>(false);
  const [tabValue, setTabValue] = React.useState<number>(0);

  const { data, loading, error } = useQueryWithSkip<
    GetPatientAppointments,
    GetPatientAppointmentsVariables
  >(GET_PATIENT_APPOINTMENTS, {
    variables: {
      patientAppointmentsInput: {
        patientId:
          (currentPatient && currentPatient.id) ||
          (allCurrentPatients && allCurrentPatients[0].id) ||
          '',
        appointmentDate: currentDate,
      },
    },
    fetchPolicy: 'no-cache',
  });

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <div>Unable to load Consults...</div>;
  }

  let todaysConsultations = 0;

  const appointments =
    data && data.getPatinetAppointments && data.getPatinetAppointments.patinetAppointments
      ? data.getPatinetAppointments.patinetAppointments
      : [];

  console.log(appointments + '');

  // filter appointments that are greater than current time.
  // const filterAppointments = appointments.filter(appointmentDetails => {
  //   const currentTime = new Date().getTime();
  //   const appointmentTime = new Date(
  //     appointmentDetails.appointmentDateTime
  //   ).getTime();
  //   if (appointmentTime > currentTime) {
  //     if (isToday(appointmentTime)) todaysConsultations++;

  //     return appointmentDetails;
  //   }
  // });

  const availableAppointments = appointments.filter((appointmentDetails) => {
    const currentTime = new Date().getTime();
    const appointmentTime = new Date(appointmentDetails.appointmentDateTime).getTime();
    if (appointmentTime > currentTime) {
      if (isToday(appointmentTime)) todaysConsultations++;

      return appointmentDetails;
    }
  });

  const pastAppointments = appointments.filter((appointmentDetails) => {
    const currentTime = new Date().getTime();
    const appointmentTime = new Date(appointmentDetails.appointmentDateTime).getTime();
    if (appointmentTime <= currentTime) {
      if (isToday(appointmentTime)) todaysConsultations++;
      return appointmentDetails;
    }
  });

  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };

  console.log(pastAppointments);

  return isSignedIn ? (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.consultPage}>
          <div
            className={`${classes.consultationsHeader} ${
              availableAppointments.length === 0 ? classes.noConsultations : ''
            }`}
          >
            {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
              <Typography variant="h1">
                <span>hi</span>
                <AphSelect
                  value={currentPatient.id}
                  onChange={(e) => setCurrentPatientId(e.target.value as Patient['id'])}
                  classes={{
                    root: classes.selectMenuRoot,
                    selectMenu: classes.selectMenuItem,
                  }}
                >
                  {allCurrentPatients.map((patient) => {
                    const isSelected = patient.id === currentPatient.id;
                    const name = isSelected
                      ? (patient.firstName || '').toLocaleLowerCase()
                      : (patient.firstName || '').toLocaleLowerCase();
                    return (
                      <MenuItem
                        selected={isSelected}
                        value={patient.id}
                        classes={{ selected: classes.menuSelected }}
                        key={patient.id}
                      >
                        {name}
                      </MenuItem>
                    );
                  })}
                  <MenuItem classes={{ selected: classes.menuSelected }}>
                    <AphButton color="primary" classes={{ root: classes.addMemberBtn }}>
                      Add Member
                    </AphButton>
                  </MenuItem>
                </AphSelect>
              </Typography>
            ) : (
              <Typography variant="h1">hello there!</Typography>
            )}

            {availableAppointments.length === 0 ? (
              <>
                <p>You have no consultations today :) Hope you are doing well?</p>
                <div className={classes.bottomActions}>
                  <Route
                    render={({ history }) => (
                      <AphButton
                        fullWidth
                        color="primary"
                        onClick={() => {
                          history.push(clientRoutes.doctorsLanding());
                        }}
                      >
                        Consult Doctor
                      </AphButton>
                    )}
                  />
                </div>
              </>
            ) : todaysConsultations > 0 ? (
              <p>
                You have {availableAppointments.length}
                {availableAppointments.length > 1 ? ' consultations' : ' consultation'} today!
              </p>
            ) : (
              <p>You have no consultations today :)</p>
            )}
          </div>
        </div>
        {/* <div className={classes.consultSection}>
          <div className={classes.rightSection}>
            {data ? <ConsultationsCard appointments={data} /> : null}
          </div>
          <div className={classes.rightSection}>
            <ThingsToDo />
          </div>
        </div> */}
        <div>
          <div>
            <Tabs
              value={tabValue}
              variant="fullWidth"
              classes={{
                root: classes.tabsRoot,
                indicator: classes.tabsIndicator,
              }}
              onChange={(e, newValue) => {
                setTabValue(newValue);
              }}
            >
              <Tab
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Active"
              />
              <Tab
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Past"
              />
            </Tabs>
          </div>
          <TabContainer>
            <div className={tabValue !== 0 ? classes.none : classes.block}>
              <div className={classes.consultSection}>
                {availableAppointments && availableAppointments.length > 0 ? (
                  <ConsultationsCard appointments={availableAppointments} />
                ) : (
                  <div className={classes.noAppointments}>
                    <div>want to book an Appointment?</div>
                    <button onClick={() => (window.location.href = clientRoutes.doctorsLanding())}>
                      Book an Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </TabContainer>
          <TabContainer>
            <div className={tabValue !== 1 ? classes.none : classes.block}>
              <div className={classes.consultSection}>
                {pastAppointments ? <ConsultationsCard appointments={pastAppointments} /> : null}
              </div>
            </div>
          </TabContainer>
        </div>
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
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
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            <TransferConsultMessage />
          </div>
        </div>
      </Popover>
    </div>
  ) : (
    <LinearProgress />
  );
};
