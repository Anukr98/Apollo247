import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { BottomNavigation, Theme } from '@material-ui/core';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/styles';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useLoginPopupState, useAuth } from 'hooks/authHooks';

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
  const classes = useStyles();
  const currentPath = window.location.pathname;
  const { isSignedIn } = useAuth();

  return (
    <ProtectedWithLoginPopup>
      {({ protectWithLoginPopup }) => (
        <>
          <BottomNavigation showLabels className={classes.root}>
            <BottomNavigationAction
              onClick={() => clientRoutes.welcome()}
              component={Link}
              label="Home"
              icon={<img src={require('images/bottom-nav/ic_home.svg')} />}
              to={clientRoutes.welcome()}
              className={currentPath === clientRoutes.welcome() ? classes.activeMenu : ''}
              classes={{
                root: classes.labelRoot,
                label: classes.iconLabel,
                selected: classes.iconSelected,
              }}
            />
            <BottomNavigationAction
              onClick={() => clientRoutes.doctorsLanding()}
              label="Doctors"
              component={Link}
              to={clientRoutes.doctorsLanding()}
              icon={<img src={require('images/bottom-nav/ic_doctors.svg')} />}
              className={currentPath === clientRoutes.doctorsLanding() ? classes.activeMenu : ''}
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
              icon={<img src={require('images/bottom-nav/ic_medicines.svg')} />}
              className={currentPath === clientRoutes.medicines() ? classes.activeMenu : ''}
              classes={{
                root: classes.labelRoot,
                label: classes.iconLabel,
                selected: classes.iconSelected,
              }}
            />
            <BottomNavigationAction
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
            />
            <BottomNavigationAction
              onClick={() => clientRoutes.covidLanding()}
              label="Covid-19"
              component={Link}
              to={clientRoutes.covidLanding()}
              icon={<img src={require('images/bottom-nav/ic_covid.svg')} />}
              className={currentPath === clientRoutes.covidLanding() ? classes.activeMenu : ''}
              classes={{
                root: classes.labelRoot,
                label: classes.iconLabel,
                selected: classes.iconSelected,
              }}
            />
          </BottomNavigation>
        </>
      )}
    </ProtectedWithLoginPopup>
  );
};
