import React from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { LoggedInUserType } from 'graphql/types/globalTypes';

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
    afterloginFormWrap: {
      padding: '0px 0 50px 0',
      '& p': {
        paddingTop: '25px',
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.5,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 10,
      },
      '& h2': {
        fontSize: 32,
        fontWeight: 600,
        marginTop: 5,
      },
    },
    helpWrap: {
      paddingBottom: 0,
    },
    afterHelpWrap: {
      paddingBottom: 0,
      padding: '0px 0 50px 0',
    },
    orange: {
      color: '#fc9916',
      fontWeight: 600,
      fontSize: 18,
    },
    helpSection: {
      borderBottom: '1px solid rgba(2, 71, 91, 0.15)',
      paddingBottom: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 15,
      },
      '&:last-child': {
        borderBottom: 'none',
      },

      '& h4': {
        fontSize: 16,
        lineHeight: '24px',
        // color: '#0087ba',
        color: '#02475b',
        fontWeight: 600,
        margin: '10px 0',
      },
      '& h5': {
        fontSize: 18,
        lineHeight: '24px',
        color: '#02475b',
        fontWeight: 'normal',
        margin: '3px auto',
        maxWidth: 790,
      },
      '& h6': {
        fontSize: 14,
        lineHeight: '18px',
        color: '#02475b',
        fontWeight: 500,
        opacity: 0.6,
        margin: '3px 0',
      },
    },
    needHelp: {
      margin: '30px 0 10px 0',
      textTransform: 'uppercase',
      fontSize: 24,
      fontWeight: 600,
    },
    testCallWrappper: {
      borderBottom: '1px solid rgba(2, 71, 91, 0.15)',
    },
    textCenter: {
      textAlign: 'center',
      marginTop: 60,
      '& img': {
        [theme.breakpoints.down('xs')]: {
          maxWidth: '90%',
        },
      },
    },
    backBtn: {
      fontWeight: 600,
      color: '#07ae8b',
      fontSize: 18,
      marginTop: 20,
      '& img': {
        position: 'relative',
        top: 5,
        marginRight: 10,
      },
    },
  };
});

export const Unauthorized: React.FC = (props) => {
  const classes = useStyles({});
  const currentUserType = useAuth().currentUserType;
  const isJuniorDoctor = useAuth() && currentUserType === LoggedInUserType.JUNIOR;

  return (
    <div className={classes.textCenter}>
      <img src={require('images/unauthorized.svg')} alt="" />
      <Typography variant="h2" className={classes.needHelp}>
        Unauthorized User
      </Typography>
      <div className={classes.helpSection}>
        <h5>
          It appears you are not allowed to access this page. If you think you should be able to
          access it, please relogin or contact on doctor helpline.
        </h5>
        <div className={classes.backBtn}>
          <img src={require('images/backarrow.svg')} alt="" />
          <Link to={isJuniorDoctor ? clientRoutes.juniorDoctor() : clientRoutes.calendar()}>
            GO BACK
          </Link>
        </div>
      </div>
    </div>
  );
};
