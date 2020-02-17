import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import MenuItem from '@material-ui/core/MenuItem';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import _isEmpty from 'lodash/isEmpty';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { OurServices } from 'components/OurServices';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      backgroundColor: '#f7f8f5',
      position: 'relative',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
      }
    },
    bannerInfo: {
      padding: '0 20px 20px 20px',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        marginTop: -45,
      },
      [theme.breakpoints.up('sm')]: {
        width: 400,
        padding: 40,
      },
      '& p': {
        fontSize: 17,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        marginTop: 16,
        marginBottom: 20,
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
      [theme.breakpoints.down('xs')]: {
        marginTop: -40,
      },
      [theme.breakpoints.up('sm')]: {
        textAlign: 'right',
        width: 'calc(100% - 400px)',
        position: 'absolute',
        right: 0,
        bottom: -5,
      },
      '& img': {
        maxWidth: '100%',
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    selectMenuRoot: {
      paddingRight: 55,
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
      marginLeft: 30,
      paddingBottom: 0,
      paddingRight: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    callEmergency: {
      backgroundColor: '#d13135',
      padding: '0px 10px',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      marginTop: 8,
    },
    callImg: {
      marginLeft: 'auto',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    mobileImg: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    desktopImg: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    loginHeroBanner: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
    },
    loginbannerImg: {
      bottom: 0,
    },
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const HeroBanner: React.FC = () => {
  const classes = useStyles();
  const { isSignedIn } = useAuth();
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();

  return (
    <div className={`${classes.heroBanner} ${isSignedIn ? classes.loginHeroBanner : ''}`} data-cypress="HeroBanner">
      <div className={`${classes.bannerImg} ${isSignedIn ? classes.loginbannerImg : ''}`}>
        <img className={classes.mobileImg} src={require('images/img_doctorimage.png')} alt="" />
        <img className={classes.desktopImg} src={require('images/banner-img.png')} alt="" />
      </div>
      <div className={classes.bannerInfo}>
        {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
          <Typography variant="h1">
            <span>hi</span>
            <AphSelect
              value={currentPatient.id}
              onChange={(e) => setCurrentPatientId(e.target.value as Patient['id'])}
              classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
            >
              {allCurrentPatients.map((patient) => {
                const isSelected = patient.id === currentPatient.id;
                const name = isSelected
                  ? (patient.firstName || '').toLocaleLowerCase()
                  : (patient.firstName || '').toLocaleLowerCase();
                return (
                  <MenuItem
                    selected={isSelected}
                    value={patient.id}
                    classes={{ selected: classes.menuSelected }}
                    key={patient.id}
                  >
                    {name}
                  </MenuItem>
                );
              })}
              <MenuItem classes={{ selected: classes.menuSelected }}>
                <AphButton color="primary" classes={{ root: classes.addMemberBtn }}>
                  Add Member
                </AphButton>
              </MenuItem>
            </AphSelect>
          </Typography>
        ) : (
          <Typography variant="h1">hello there!</Typography>
        )}
        <p>How can we help you today? :)</p>
        <OurServices />
        <div className={classes.callEmergency}>
          <span>Call 1066 in emergency</span>
          <span className={classes.callImg}>
            <img src={require('images/ic-emergency.svg')} alt="" />
          </span>
        </div>
      </div>
    </div>
  );
};
