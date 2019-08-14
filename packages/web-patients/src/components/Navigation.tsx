import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
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
  return (
    <div className={classes.appNavigation} data-cypress="Navigation">
      <Link className={classes.menuItemActive} to={clientRoutes.consultRoom()}>
        Consult Room
      </Link>
      <Link to={clientRoutes.healthRecords()}>Health Records</Link>
      <Link to={clientRoutes.testsAndMedicine()}>Tests &amp; Medicines</Link>
    </div>
  );
};
