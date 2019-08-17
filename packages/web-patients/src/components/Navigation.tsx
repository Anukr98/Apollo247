import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    appNavigation: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      '& a': {
        fontSize: 13,
        fontWeight: 600,
        color: theme.palette.secondary.dark,
        textTransform: 'uppercase',
        padding: '36px 20px 35px 20px',
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
  const classes = useStyles();
  const currentPath = window.location.pathname;
  return (
    <div className={classes.appNavigation} data-cypress="Navigation">
      <Link
        className={currentPath === clientRoutes.consultRoom() ? classes.menuItemActive : ''}
        to={clientRoutes.consultRoom()}
      >
        Consult Room
      </Link>
      <Link
        to={clientRoutes.healthRecords()}
        className={currentPath === clientRoutes.healthRecords() ? classes.menuItemActive : ''}
      >
        Health Records
      </Link>
      <Link
        to={clientRoutes.testsAndMedicine()}
        className={currentPath === clientRoutes.testsAndMedicine() ? classes.menuItemActive : ''}
      >
        Tests &amp; Medicines
      </Link>
    </div>
  );
};
