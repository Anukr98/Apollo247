import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      padding: '18px 0 50px 0',
      '& p': {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 10,
      },
    },
  };
});

interface HelpProps {}
export const RegularPatients: React.FC<HelpProps> = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">need help3?</Typography>
      <p>Don’t worry. We are here for you :)</p>
    </div>
  );
};
