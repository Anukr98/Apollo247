import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    actions: {
      padding: '10px 20px 20px 20px',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        minWidth: 'auto',
        boxShadow: 'none',
        '&:first-child': {
          color: '#fc9916',
        },
        '&:last-child': {
          marginLeft: 'auto',
        },
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
  };
});

export const MedicineNotifyPopover: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Okay! :)</Typography>
        <p>You will be notified when Crocin Advance Tab is back in stock.</p>
      </div>
      <div className={classes.actions}>
        <AphButton>Ok, Got it</AphButton>
      </div>
    </div>
  );
};
