import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { BottomNavigation, Theme } from '@material-ui/core';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/styles';

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
      borderTop: '4px solid #fff',
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
      backgroundColor: '#f7f8f5',
      borderTop: '4px solid #00b38e',
    },
  };
});

export const NavigationBottom: React.FC = (props) => {
  const classes = useStyles();
  const currentPath = window.location.pathname;

  return (
    <BottomNavigation showLabels className={classes.root}>
      <BottomNavigationAction
        component={Link}
        label="Appointments"
        icon={<img src={require('images/bottom-nav/ic_appointments.svg')} />}
        to={clientRoutes.appointments()}
        className={currentPath === clientRoutes.appointments() ? classes.activeMenu : ''}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="Health Records"
        component={Link}
        to={clientRoutes.healthRecords()}
        icon={<img src={require('images/bottom-nav/ic_myhealth.svg')} />}
        className={currentPath === clientRoutes.healthRecords() ? classes.activeMenu : ''}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      {/* <BottomNavigationAction
        label="Medicines"
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
        label="My Account"
        component={Link}
        to={clientRoutes.myAccount()}
        icon={<img src={require('images/bottom-nav/ic_account.svg')} />}
        className={currentPath === clientRoutes.myAccount() ? classes.activeMenu : ''}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
    </BottomNavigation>
  );
};
