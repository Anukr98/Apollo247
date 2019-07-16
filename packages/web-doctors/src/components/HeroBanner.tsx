import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { AphButton } from '@aph/web-ui-components';
import MenuItem from '@material-ui/core/MenuItem';
import { AphSelect } from '@aph/web-ui-components';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import _isEmpty from 'lodash/isEmpty';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/lowerCase';
import { PatientSignIn_patientSignIn_patients } from 'graphql/types/PatientSignIn'; // eslint-disable-line camelcase
import { useAuth } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: theme.palette.primary.contrastText,
      padding: '40px 0 80px 40px',
      position: 'relative',
      [theme.breakpoints.up('lg')]: {
        display: 'flex',
      },
      [theme.breakpoints.down('xs')]: {
        padding: '40px 20px',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        paddingTop: 30,
      },
    },
    bannerInfo: {
      [theme.breakpoints.up('lg')]: {
        width: '40%',
      },
      '& p': {
        fontSize: 20,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
        marginTop: 40,
        marginBottom: 40,
        [theme.breakpoints.between('sm', 'md')]: {
          paddingRight: 400,
        },
        '& span': {
          fontWeight: 'bold',
          display: 'block',
        },
      },
      '& h1': {
        display: 'flex',
        [theme.breakpoints.down('xs')]: {
          fontSize: 36,
        },
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
        },
      },
    },
    bannerImg: {
      marginBottom: -190,
      textAlign: 'right',
      position: 'absolute',
      top: 90,
      right: 0,
      [theme.breakpoints.up('lg')]: {
        width: '75%',
        marginLeft: 'auto',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        width: 585,
        position: 'absolute',
        right: 0,
        bottom: 0,
        marginBottom: -150,
      },
      '& img': {
        marginTop: -15,
        maxWidth: '100%',
        [theme.breakpoints.between('sm', 'md')]: {
          marginTop: -21,
        },
        [theme.breakpoints.down('xs')]: {
          maxWidth: 281,
          marginTop: -50,
        },
      },
    },
    button: {
      [theme.breakpoints.up('sm')]: {
        minWidth: 200,
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 56,
      fontWeight: 600,
      lineHeight: '66px',
      [theme.breakpoints.down('xs')]: {
        fontSize: 36,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minWidth: 100,
      marginLeft: 30,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

export const HeroBanner: React.FC = () => {
  const classes = useStyles();
  const { allCurrentPatients, currentPatient, setCurrentPatient } = useAuth();

  return (
    <div className={classes.heroBanner}>
      <div className={classes.bannerInfo}>
        <p>
          The best way to connect with your patients, grow your practice and enhance your
          professional network;
          <span>anytime, anywhere :)</span>
        </p>
        <ProtectedWithLoginPopup>
          {({ protectWithLoginPopup }) => (
            <AphButton
              variant="contained"
              color="primary"
              classes={{ root: classes.button }}
              onClick={() => protectWithLoginPopup()}
            >
              GET STARTED
            </AphButton>
          )}
        </ProtectedWithLoginPopup>
      </div>
      <div className={classes.bannerImg}>
        <img src={require('images/ic_doctor.svg')} alt="" />
      </div>
    </div>
  );
};
