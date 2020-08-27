import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { BottomNavigation, Theme } from '@material-ui/core';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/styles';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { buyMedicineClickTracking } from 'webEngageTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      bottom: 0,
      height: 'auto',
      boxShadow: '0 -10px 30px 0 rgba(0, 0, 0, 0.6)',
      [theme.breakpoints.up(901)]: {
        display: 'none',
      },
      '& button': {
        padding: '10px 0',
      },
    },
    labelRoot: {
      flex: 'auto',
      minWidth: 'auto',
      [theme.breakpoints.up(560)]: {
        width: '100%',
        flex: 1,
      },
      [theme.breakpoints.down(560)]: {
        padding: '6px 6px 8px',
      },
    },
    iconLabel: {
      fontSize: 10,
      color: '#67919d',
      paddingTop: 6,
      textTransform: 'uppercase',
      [theme.breakpoints.down(560)]: {
        fontSize: 8,
      },
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },
    logoutModal: {
      padding: '12px 0',
      '& h3': {
        fontSize: 18,
        fontWeight: 500,
        margin: 0,
      },
    },
    bottomActions: {
      textAlign: 'right',
      paddingTop: 20,
      '& button': {
        marginLeft: 15,
      },
    },
    hieLink: {
      display: 'none',
    },
    activeMenu: {
      backgroundColor: '#02475b',
      color: '#fff !important',
      '& img': {
        filter:
          'invert(100%) sepia(86%) saturate(0%) hue-rotate(69deg) brightness(115%) contrast(100%)',
      },
      '& span': {
        color: '#ffffff',
      },
    },
  };
});

export const NavigationBottom: React.FC = (props) => {
  const classes = useStyles({});
  const currentPath = window.location.pathname;
  const { isSignedIn } = useAuth();
  const { currentPatient } = useAllCurrentPatients();

  return (
    <ProtectedWithLoginPopup>
      {({ protectWithLoginPopup }) => (
        <>
          {isSignedIn ? (
            <BottomNavigation showLabels className={classes.root}>
              <BottomNavigationAction
                onClick={() => clientRoutes.appointments()}
                component={Link}
                label="Appointment"
                icon={
                  <img
                    src={require('images/bottom-nav/ic_home.svg')}
                    alt="Appointments"
                    title="Appointments"
                  />
                }
                to={clientRoutes.appointments()}
                className={currentPath === clientRoutes.appointments() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              />
              <BottomNavigationAction
                onClick={() => {
                  clientRoutes.medicines();
                  buyMedicineClickTracking(currentPatient && currentPatient.id);
                }}
                label="Medicines"
                component={Link}
                to={clientRoutes.medicines()}
                icon={
                  <img
                    src={require('images/ic_medicines.svg')}
                    alt="Medicines"
                    title="Medicines"
                  />
                }
                className={currentPath === clientRoutes.medicines() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              />
              {/* <BottomNavigationAction
                onClick={() => clientRoutes.tests()}
                label="Tests"
                component={Link}
                to={clientRoutes.tests()}
                icon={<img src={require('images/bottom-nav/ic_tests.svg')} />}
                className={currentPath === clientRoutes.tests() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              /> */}
              <BottomNavigationAction
                label="Health Records"
                component={Link}
                to={clientRoutes.healthRecords()}
                icon={
                  <img
                    src={require('images/bottom-nav/ic_myhealth.svg')}
                    alt="Health Records"
                    title="Health Records"
                  />
                }
                className={currentPath === clientRoutes.healthRecords() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              />
              <BottomNavigationAction
                onClick={() => clientRoutes.myAccount()}
                label="My Account"
                component={Link}
                to={clientRoutes.myAccount()}
                icon={
                  <img
                    src={require('images/bottom-nav/ic_account.svg')}
                    alt="My Account"
                    title="My Account"
                  />
                }
                className={currentPath === clientRoutes.myAccount() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              />
            </BottomNavigation>
          ) : (
            <BottomNavigation showLabels className={classes.root}>
              <BottomNavigationAction
                onClick={() => clientRoutes.welcome()}
                component={Link}
                label="Home"
                icon={
                  <img src={require('images/bottom-nav/ic_home.svg')} alt="Home" title="Home" />
                }
                to={clientRoutes.welcome()}
                className={currentPath === clientRoutes.welcome() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              />
              <BottomNavigationAction
                onClick={() => clientRoutes.specialityListing()}
                label="Doctors"
                component={Link}
                to={clientRoutes.specialityListing()}
                icon={
                  <img
                    src={require('images/ic_doctors.svg')}
                    alt="Doctors"
                    title="Doctors"
                  />
                }
                className={
                  currentPath === clientRoutes.specialityListing() ? classes.activeMenu : ''
                }
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              />
              <BottomNavigationAction
                label="Pharmacy"
                component={Link}
                to={clientRoutes.medicines()}
                icon={
                  <img
                    src={require('images/ic_medicines.svg')}
                    alt="Medicines"
                    title="Medicines"
                  />
                }
                className={currentPath === clientRoutes.medicines() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              />
              {/* <BottomNavigationAction
                onClick={() => clientRoutes.tests()}
                label="Tests"
                component={Link}
                to={clientRoutes.tests()}
                icon={<img src={require('images/bottom-nav/ic_tests.svg')} />}
                className={currentPath === clientRoutes.tests() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              /> */}
              <BottomNavigationAction
                onClick={() => clientRoutes.covidLanding()}
                label="Covid-19"
                component={Link}
                to={clientRoutes.covidLanding()}
                icon={
                  <img
                    src={require('images/ic_covid.svg')}
                    alt="Covid19"
                    title="Covid19"
                  />
                }
                className={currentPath === clientRoutes.covidLanding() ? classes.activeMenu : ''}
                classes={{
                  root: classes.labelRoot,
                  label: classes.iconLabel,
                  selected: classes.iconSelected,
                }}
              />
            </BottomNavigation>
          )}
        </>
      )}
    </ProtectedWithLoginPopup>
  );
};
