import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      display: 'flex',
      borderRadius: '0 0 10px 10px',
      boxShadow: '0 0 5px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: '#ffffff',
      padding: '40px 40px 25px 40px',
    },
    bannerInfo: {
      width: '50%',
      '& p': {
        fontSize: 17,
        lineHeight: 1.47,
        fontWeight: 500,
        color: '#0087ba',
        marginTop: 16,
        marginBottom: 20,
      },
      '& h1': {
        lineHeight: 72,
      },
    },
    bannerImg: {
      width: '50%',
      marginLeft: 'auto',
      marginBottom: -190,
      textAlign: 'right',
      '& img': {
        marginTop: -15,
      }
    },
    button: {
      minWidth: 200,
      padding: '8px 15px',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    },
  };
});

export const HeroBanner: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.heroBanner}>
      <div className={classes.bannerInfo}>
        <Typography variant="h1">hello!</Typography>
        <p>Not feeling well today? Don’t worry. We will help you find the right doctor :)</p>
        <Button variant="contained" color="primary" className={classes.button} >
          Consult a doctor
        </Button>
      </div>
      <div className={classes.bannerImg}>
        <img src={require('images/ic_doctor.svg')} alt="" />
      </div>
    </div>
  );
};
