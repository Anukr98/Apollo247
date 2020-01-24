import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import MenuItem from '@material-ui/core/MenuItem';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import _isEmpty from 'lodash/isEmpty';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      padding: 40,
      paddingTop: 46,
      position: 'relative',
      [theme.breakpoints.up('lg')]: {
        display: 'flex',
      },
      [theme.breakpoints.down('xs')]: {
        padding: '40px 20px',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        paddingTop: 60,
        borderRadius: 0,
      },
    },
    bannerInfo: {
      position: 'relative',
      zIndex: 1,
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
      position: 'absolute',
      [theme.breakpoints.up('lg')]: {
        right: 32,
        top: 30,
      },
      [theme.breakpoints.between('sm', 'md')]: {
        width: 400,
        right: 32,
        top: 90,
      },
      [theme.breakpoints.down('xs')]: {
        right: 20,
        bottom: -175,
      },
      '& img': {
        maxWidth: '100%',
        [theme.breakpoints.down('xs')]: {
          maxWidth: 281,
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
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const HeroBanner: React.FC = () => {
  const classes = useStyles();
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();

  return (
    <div className={classes.heroBanner} data-cypress="HeroBanner">
      <div className={classes.bannerInfo}>
        {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
          <Typography variant="h1">
            <span>hello</span>
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

        <p>Not feeling well today? Don’t worry. We will help you find the right doctor :)</p>
        <ProtectedWithLoginPopup>
          {({ protectWithLoginPopup }) => (
            <AphButton
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={() => protectWithLoginPopup()}
            >
              Consult a doctor
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
