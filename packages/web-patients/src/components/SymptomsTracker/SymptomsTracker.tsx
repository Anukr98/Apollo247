import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import MenuItem from '@material-ui/core/MenuItem';
import _isEmpty from 'lodash/isEmpty';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { AddNewProfile } from 'components/MyAccount/AddNewProfile';
import { Header } from 'components/Header';
import { ManageProfile } from 'components/ManageProfile';
import { NavigationBottom } from 'components/NavigationBottom';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Scrollbars from 'react-custom-scrollbars';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      borderRadius: '0 0 10px 10px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f7f8f5',
      marginBottom: 20,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
    },
    heroBanner: {
      backgroundColor: '#f7f8f5',
      position: 'relative',
      borderRadius: 10,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
    },
    bannerInfo: {
      padding: '40px 20px 20px 20px',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        paddingTop: 80,
      },
      '& p': {
        fontSize: 17,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        marginTop: 18,
        marginBottom: 40,
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
          maxWidth: 'calc(100% - 65px)',
          [theme.breakpoints.down('xs')]: {
            maxWidth: 'calc(100% - 55px)',
          },
        },
      },
    },
    pageHeader: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: theme.palette.secondary.dark,
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        padding: '16px 20px',
        position: 'fixed',
        top: 72,
        width: '100%',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        width: 48,
        height: 48,
        top: 0,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
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
    loginHeroBanner: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
    },
    buttonsWrapper: {
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
      '& button': {
        minWidth: 201,
        textTransform: 'uppercase',
        color: '#fcb716',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: '#fff',
        [theme.breakpoints.down('xs')]: {
          flex: 1,
          minWidth: 'auto',
        },
        '&:nth-child(1)': {
          marginRight: 16,
          [theme.breakpoints.down(340)]: {
            marginRight: 5,
          },
        },
      },
      '& :active ': {
        color: '#fff !important',
        backgroundColor: '#fcb716 !important',
      },
    },
    activeButton: {
      color: '#fff !important',
      backgroundColor: '#fcb716 !important',
    },
    signUpBar: {
      marginBottom: 20,
    },
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const SymptomsTracker: React.FC = () => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [selectCurrentUser, setSelectCurrentUser] = useState<boolean>(false);

  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = useState<boolean>(false);
  const [isMeClicked, setIsMeClicked] = useState<boolean>(false);
  const isMediumScreen = useMediaQuery('(min-width:768px)');

  return (
    <div>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={`${classes.heroBanner} ${isSignedIn ? classes.loginHeroBanner : ''}`}>
            <div className={classes.pageHeader}>
              <Link to={clientRoutes.welcome()}>
                <div className={classes.backArrow}>
                  <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                  <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
                </div>
              </Link>
              consult a doctor
            </div>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMax={isMediumScreen ? 'calc(100vh - 200px)' : 'auto'}
            >
              <div className={classes.bannerInfo}>
                {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
                  <Typography variant="h1">
                    <span>
                      hi {!selectCurrentUser && currentPatient.firstName}{' '}
                      {!selectCurrentUser && `:)`}
                    </span>
                    {selectCurrentUser && (
                      <AphSelect
                        value={currentPatient.id}
                        onChange={(e) => {
                          if (e.target.value) {
                            window.location.href = clientRoutes.symptomsTracker();
                          }
                          setCurrentPatientId(e.target.value as Patient['id']);
                        }}
                        classes={{
                          root: classes.selectMenuRoot,
                          selectMenu: classes.selectMenuItem,
                        }}
                        open={selectCurrentUser}
                        onClick={() => {
                          setSelectCurrentUser(!selectCurrentUser);
                        }}
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
                              onClick={() => {
                                setSelectCurrentUser(!selectCurrentUser);
                              }}
                            >
                              {name}
                            </MenuItem>
                          );
                        })}
                        <MenuItem classes={{ selected: classes.menuSelected }} key="addMember">
                          <AphButton
                            color="primary"
                            classes={{ root: classes.addMemberBtn }}
                            onClick={() => {
                              setIsAddNewProfileDialogOpen(true);
                            }}
                          >
                            Add Member
                          </AphButton>
                        </MenuItem>
                      </AphSelect>
                    )}
                  </Typography>
                ) : (
                  <Typography variant="h1">hello there!</Typography>
                )}
                <div>
                  <p>Who is the patient today?</p>
                  <div className={classes.buttonsWrapper}>
                    <Link to={clientRoutes.symptomsTracker()}>
                      <AphButton className={!selectCurrentUser ? classes.activeButton : ''}>
                        MYSELF
                      </AphButton>
                    </Link>
                    {/* <Link to={clientRoutes.symptomsTracker()}> */}
                    <AphButton
                      onClick={() => setSelectCurrentUser(true)}
                      className={selectCurrentUser ? classes.activeButton : ''}
                    >
                      SOMEONE ELSE
                    </AphButton>
                    {/* </Link> */}
                  </div>
                </div>
              </div>
            </Scrollbars>
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
          </div>
        </div>
      </div>
      {isSignedIn && <NavigationBottom />}
      <div className={classes.signUpBar}>
        <ManageProfile />
      </div>
    </div>
  );
};
