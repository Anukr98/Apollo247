import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';
import { LoggedInUserType } from 'graphql/types/globalTypes';
import { webEngageEventTracking } from 'webEngageTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    appNavigation: {
      padding: '17px 0',
      borderLeft: '1px solid rgba(2,71,91,0.1)',
      marginLeft: 20,
      marginBottom: 5,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      '& a': {
        fontSize: 14,
        fontWeight: 600,
        color: theme.palette.secondary.dark,
        textTransform: 'uppercase',
        padding: 24,
        [theme.breakpoints.down('sm')]: {
          paddingLeft: 10,
          paddingRight: 10,
        },
      },
    },
    menuItemActive: {
      backgroundColor: '#f7f8f5',
      position: 'relative',
      '&:after': {
        position: 'absolute',
        content: '""',
        bottom: 0,
        left: 0,
        height: 5,
        width: '100%',
        backgroundColor: '#00b38e',
      },
    },
  };
});

export const Navigation: React.FC = (props) => {
  const classes = useStyles({});

  // TODO remove currentPatient and name it as currentDoctor
  const isJuniorDoctor = useAuth() && useAuth().currentUserType === LoggedInUserType.JUNIOR;
  const isAdminDoctor = useAuth() && useAuth().currentUserType === LoggedInUserType.JDADMIN;

  return (
    <div className={classes.appNavigation} data-cypress="Navigation">
      {isJuniorDoctor && (
        <>
          <Link
            title="Active Consults"
            id="activeConsult"
            to={clientRoutes.juniorDoctorActive()}
            className={` ${window.location.href.toLowerCase().includes('/junior-doctor/active') &&
              classes.menuItemActive}`}
          >
            Active Consults
          </Link>
          <Link
            title="Past Consults"
            id="pastConsult"
            to={clientRoutes.juniorDoctorPast()}
            className={` ${window.location.href.toLowerCase().includes('/junior-doctor/past') &&
              classes.menuItemActive}`}
          >
            Past Consults
          </Link>
        </>
      )}
      {!isJuniorDoctor && !isAdminDoctor ? (
        <>
          <Link
            title="Home"
            id="homeId"
            to={clientRoutes.welcome()}
            className={` ${window.location.href.toLowerCase().includes('/calendar') &&
              classes.menuItemActive}`}
          >
            Home
          </Link>
          <Link
            title="Patients"
            onClick={() => {
              webEngageEventTracking(null,
                'Front_end - Doctor Clicked on the Patient Log'
              );
            }}
            className={`${window.location.href.includes('/patientlog') && classes.menuItemActive}`}
            to={clientRoutes.PatientLog()}
          >
            Patients
          </Link>
        </>
      ) : null}
    </div>
  );
};
