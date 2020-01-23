import React from 'react';
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
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& button': {
        padding: '10px 0',
      },
    },
    labelRoot: {
      width: '100%',
    },
    iconLabel: {
      fontSize: 10,
      color: '#67919d',
      paddingTop: 6,
      textTransform: 'uppercase',
      [theme.breakpoints.down(420)]: {
        fontSize: 8,
      },
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },
  };
});

export const NavigationBottom: React.FC = (props) => {
  const classes = useStyles();

  return (
    <BottomNavigation showLabels className={classes.root}>
      <BottomNavigationAction
        label="Appointments"
        icon={<img src={require('images/ic_consultroom.svg')} />}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="Health Records"
        icon={<img src={require('images/ic_myhealth.svg')} />}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="Medicines"
        icon={<img src={require('images/ic_orders.svg')} />}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="Tests"
        icon={<img src={require('images/ic_orders.svg')} />}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="My Account"
        icon={<img src={require('images/ic_account_dark.svg')} />}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
    </BottomNavigation>
  );
};
