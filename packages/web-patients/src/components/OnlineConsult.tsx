import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    consultGroup: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.text.primary,
      padding: 15,
      marginTop: 10,
      marginBottom: 10,
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.43,
        letterSpacing: 0.35,
        color: theme.palette.secondary.light,
        marginTop: 0,
      },
    },
    actions: {
      paddingTop: 10,
      paddingBottom: 10,
      marginLeft: -8,
      marginRight: -8,
    },
    button: {
      fontSize: 16,
      fontWeight: 500,
      marginLeft: 8,
      marginRight: 8,
      textTransform: 'none',
      borderRadius: 10,
      paddingLeft: 10,
      paddingRight: 10,
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
    bottomActions: {
      padding: '30px 15px 6px 15px',
    },
  };
});

export const OnlineConsult: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.consultGroup}>
        <p>
          Dr. Simran is available in 15mins! Would you like to consult now or schedule for later?
        </p>
        <div className={classes.actions}>
          <AphButton color="secondary" className={`${classes.button} ${classes.buttonActive}`}>
            Consult Now
          </AphButton>
          <AphButton color="secondary" className={classes.button}>
            Schedule For Later
          </AphButton>
        </div>
      </div>
      <div className={classes.bottomActions}>
        <AphButton fullWidth color="primary">
          PAY Rs. 299
        </AphButton>
      </div>
    </div>
  );
};
