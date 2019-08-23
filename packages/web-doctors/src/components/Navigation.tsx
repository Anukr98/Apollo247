import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

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
        fontSize: 13,
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
  const classes = useStyles();
  return (
    <div className={classes.appNavigation} data-cypress="Navigation">
      <Link
        to={clientRoutes.welcome()}
        className={`${!window.location.href.includes('/myaccount') && classes.menuItemActive}`}
      >
        Home
      </Link>
      <Link to={clientRoutes.testsAndMedicine()}>Patients</Link>
    </div>
  );
};
