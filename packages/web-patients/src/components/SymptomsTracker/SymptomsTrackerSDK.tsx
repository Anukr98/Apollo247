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
import { NavigatorSDK } from '@praktice/navigator-react-web-sdk';
import $Generator from '@praktice/navigator-react-web-sdk';

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

export const SymptomsTrackerSDK: React.FC = () => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = useState<boolean>(false);
  const [isMeClicked, setIsMeClicked] = useState<boolean>(false);
  const isMediumScreen = useMediaQuery('(min-width:768px)');
  const requestObject = {
    type: 'categoryList',
    component: null,
    componentProps: [{ style: { fontWeight: 'bold' } }, 'fullWidth', 'bordered'],
  };

  return (
    <div>
      <Header />
      <NavigatorSDK
        clientId="A6A375AF-A374-41F6-8EA5-C2E8B3239FAC"
        patientAge={30}
        patientGender="male"
      />
      {isSignedIn && <NavigationBottom />}
    </div>
  );
};
