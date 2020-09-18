import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      padding: 20,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '23px',
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 16,
        fontWeight: 600,
      },
      '& ul': {
        paddingLeft: 20,
      },
    },
  });
});

export const WhyApollo: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <h3>Why Apollo247</h3>
      <ul>
        <li>Round-the-clock doctor availability</li>
        <li>Over 70 specialties</li>
        <li>Detailed digital prescriptions</li>
        <li>Order medicines {'&'} tests online</li>
        <li>Digitised health records</li>
      </ul>
    </div>
  );
};
