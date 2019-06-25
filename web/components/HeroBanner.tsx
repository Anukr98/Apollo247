import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { AppButton } from 'components/ui/AppButton';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      display: 'flex',
      borderRadius: '0 0 10px 10px',
      backgroundColor: theme.palette.text.primary,
      padding: '40px 40px 20px 40px',
    },
    bannerInfo: {
      width: '50%',
      '& p': {
        fontSize: 17,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        marginTop: 16,
        marginBottom: 20,
      },
    },
    bannerImg: {
      width: '50%',
      marginLeft: 'auto',
      marginBottom: -190,
      textAlign: 'right',
      '& img': {
        marginTop: -15,
      },
    },
    button: {
      minWidth: 200,
    },
  };
});

export const HeroBanner: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.heroBanner}>
      <div className={classes.bannerInfo}>
        <Typography variant="h1">hello there!</Typography>
        <p>Not feeling well today? Don’t worry. We will help you find the right doctor :)</p>
        <AppButton
          variant="contained"
          color="primary"
          classes={{ root: classes.button }}
        >
          Consult a doctor
        </AppButton>
      </div>
      <div className={classes.bannerImg}>
        <img src={require('images/ic_doctor.svg')} alt="" />
      </div>
    </div>
  );
};
