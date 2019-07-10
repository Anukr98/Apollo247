import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import MenuItem from '@material-ui/core/MenuItem';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import _isEmpty from 'lodash/isEmpty';
import { PatientSignIn_patientSignIn_patients } from 'graphql/types/PatientSignIn'; // eslint-disable-line camelcase
import { useAuth } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: theme.palette.text.primary,
      padding: 40,
      position: 'relative',
      [theme.breakpoints.up('lg')]: {
        display: 'flex',
      },
      [theme.breakpoints.down('xs')]: {
        padding: '40px 20px',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        paddingTop: 60,
      },
    },
    bannerInfo: {
      [theme.breakpoints.up('lg')]: {
        width: '50%',
      },
      '& p': {
        fontSize: 17,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        marginTop: 16,
        marginBottom: 20,
        [theme.breakpoints.between('sm', 'md')]: {
          paddingRight: 400,
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
      [theme.breakpoints.up('lg')]: {
        width: '50%',
        marginLeft: 'auto',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        width: 400,
        position: 'absolute',
        right: 40,
        bottom: 0,
        marginBottom: -150,
      },
      '& img': {
        marginTop: -15,
        maxWidth: '100%',
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
        {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
          <Typography variant="h1">
            <span>hello</span>
            <AphSelect
              value={currentPatient.id}
              onChange={(e) => {
                const newId = e.target.value as PatientSignIn_patientSignIn_patients['id'];
                const newCurrentPatient = allCurrentPatients.find((p) => p.id === newId);
                if (newCurrentPatient) setCurrentPatient(newCurrentPatient);
              }}
              classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
            >
              {allCurrentPatients.map((patient) => (
                <MenuItem
                  selected={patient.id === currentPatient.id}
                  value={patient.id}
                  classes={{ selected: classes.menuSelected }}
                  key={patient.id}
                >
                  {patient.firstName}
                </MenuItem>
              ))}
              <MenuItem classes={{ selected: classes.menuSelected }}>
                <AphButton color="primary" classes={{ root: classes.addMemberBtn }}>
                  Add Member
                </AphButton>
              </MenuItem>
            </AphSelect>
          </Typography>
        ) : (
          <Typography variant="h1">hello there!!</Typography>
        )}

        <p>The best way to connect with your patients,<br />
          grow your practice and enhance your<br />
          professional network;<br />
          <b>anytime, anywhere :)</b>
        </p>
        <ProtectedWithLoginPopup>
          {({ protectWithLoginPopup }) => (
            <AphButton
              variant="contained"
              color="primary"
              classes={{ root: classes.button }}
              onClick={() => protectWithLoginPopup()}
            >
              Get Started
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
