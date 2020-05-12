import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    appNavigation: {
      marginLeft: 'auto',
      marginBottom: 10,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      '& a': {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.palette.secondary.dark,
        textTransform: 'uppercase',
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
  };
});

export const Navigation: React.FC = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.appNavigation}>
      <Link to={clientRoutes.healthRecords()}>Health Records</Link>
      <Link to={clientRoutes.testsAndMedicine()}>Tests &amp; Medicines</Link>
    </div>
  );
};
