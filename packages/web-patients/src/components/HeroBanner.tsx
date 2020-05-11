import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import MenuItem from '@material-ui/core/MenuItem';
import _isEmpty from 'lodash/isEmpty';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { OurServices } from 'components/OurServices';
import { AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { AddNewProfile } from 'components/MyAccount/AddNewProfile';
import { MascotWithMessage } from './MascotWithMessage';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      backgroundColor: '#fff',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
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
        paddingTop: 60,
      },
      [theme.breakpoints.up(900)]: {
        minHeight: 400,
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
          maxWidth: 370,
          [theme.breakpoints.down('xs')]: {
            maxWidth: 'calc(100% - 55px)',
          },
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
        bottom: 0,
      },
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
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
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
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
      cursor: 'pointer',
    },
    callImg: {
      marginLeft: 'auto',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    loginHeroBanner: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
    },
    loginbannerImg: {
      bottom: 0,
    },
    desktopBanner: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'inline-block',
      },
    },
    mobileBanner: {
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    expertBox: {
      padding: 20,
      textAlign: 'center',
      '& h2': {
        fontSize: 16,
        margin: 0,
      },
      '& a': {
        fontSize: 14,
        paddingTop: 5,
        display: 'inline-block',
        color: '#0087ba',
        fontWeight: 500,
      },
      '& button': {
        marginTop: 20,
      },
    },
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const HeroBanner: React.FC = () => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = useState<boolean>(false);
  const [isMeClicked, setIsMeClicked] = useState<boolean>(false);

  return (
    <div
      className={`${classes.heroBanner} ${isSignedIn ? classes.loginHeroBanner : ''}`}
      data-cypress="HeroBanner"
    >
      <div className={`${classes.bannerImg} ${isSignedIn ? classes.loginbannerImg : ''}`}>
        <img
          className={classes.mobileBanner}
          src={require('images/img_doctors_xxhdpi.png')}
          alt=""
        />
        <img className={classes.desktopBanner} src={require('images/img-doctors@1x.png')} alt="" />
      </div>
      <div className={classes.bannerInfo}>
        {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
          <Typography variant="h1">
            <span title={'hi'}>hi</span>
            <AphSelect
              value={currentPatient.id}
              onChange={(e) => setCurrentPatientId(e.target.value as Patient['id'])}
              classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
              title={currentPatient.firstName || ''}
            >
              {allCurrentPatients.map((patient) => {
                // const isSelected = patient.id === currentPatient.id;
                const isSelected = patient.relation === 'ME';
                const name = (patient.firstName || '').toLocaleLowerCase();
                return (
                  <MenuItem
                    selected={isSelected}
                    value={patient.id}
                    classes={{ selected: classes.menuSelected }}
                    key={patient.id}
                    title={name || ''}
                  >
                    {name}
                  </MenuItem>
                );
              })}
              <MenuItem classes={{ selected: classes.menuSelected }}>
                <AphButton
                  color="primary"
                  classes={{ root: classes.addMemberBtn }}
                  onClick={() => {
                    setIsAddNewProfileDialogOpen(true);
                  }}
                  title={'Add Member'}
                >
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
      </div>
      <AphDialog open={isAddNewProfileDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAddNewProfileDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Add New Member</AphDialogTitle>
        <AddNewProfile
          closeHandler={(isAddNewProfileDialogOpen: boolean) =>
            setIsAddNewProfileDialogOpen(isAddNewProfileDialogOpen)
          }
          isMeClicked={isMeClicked}
          selectedPatientId=""
          successHandler={(isPopoverOpen: boolean) => setIsPopoverOpen(isPopoverOpen)}
          isProfileDelete={false}
        />
      </AphDialog>
      <Popover
        open={isPopoverOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <MascotWithMessage
          messageTitle=""
          message="Profile created successfully."
          closeButtonLabel="OK"
          closeMascot={() => {
            setIsPopoverOpen(false);
            window.location.reload(true);
          }}
        />
      </Popover>
    </div>
  );
};
