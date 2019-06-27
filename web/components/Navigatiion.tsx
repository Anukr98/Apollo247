import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    appNavigation: {
      marginLeft: 'auto',
      marginBottom: 10,
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
  const classes = useStyles();
  // This resolves to nothing and doesn't affect browser history
  const dudUrl = 'javascript:;';

  return (
    <div className={classes.appNavigation}>
      <Link to={dudUrl}>
        Consult Room
    </Link>
      <Link to={dudUrl}>
        Health Records
    </Link>
      <Link to={dudUrl}>
        Tests &amp; Medicines
    </Link>
    </div>
  );
};
