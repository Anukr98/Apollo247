import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import React from 'react';
import _isEmpty from 'lodash/isEmpty';
import { useAuth } from 'hooks/authHooks';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { NavigatorSDK } from '@praktice/navigator-react-web-sdk';
import Scrollbars from 'react-custom-scrollbars';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { AphCustomDropdown } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      borderRadius: '0 0 10px 10px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
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
    symptomsTracker: {
      paddingRight: 20,
      paddingBottom: 20,
      paddingLeft: 5,
      [theme.breakpoints.down(767)]: {
        paddingTop: 55,
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    subHeader: {
      position: 'relative',
      zIndex: 9,
      [theme.breakpoints.up(768)]: {
        display: 'flex',
      },
    },
    leftCol: {
      display: 'none',
      [theme.breakpoints.up(768)]: {
        flex: '3 1 0%',
        padding: '0 1rem',
        display: 'block',
      },
    },
    rightCol: {
      [theme.breakpoints.up(768)]: {
        flex: '7 1 0%',
        padding: '0 1rem',
        position: 'relative',
      },
    },
    profileDropdown: {
      fontSize: 14,
      fontWeight: 500,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 20,
      padding: '8px 0 8px 1rem',
      [theme.breakpoints.down(767)]: {
        left: 'auto',
        position: 'fixed',
        top: 78,
      },
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'uppercase',
      paddingTop: 7,
      paddingBottom: 6,
      paddingLeft: 4,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
  };
});

const customContainerStyle = {
  sectA_container: {
    display: 'inline-block',
    padding: 20,
    paddingTop: 10,
  },
  search_button_wrapper: {
    paddingTop: '1rem',
    position: 'absolute',
    right: 20,
    top: 0,
    zIndex: 9,
  },
  selected: {
    marginBottom: 0,
    marginLeft: -5,
    marginRight: -5,
  },
  search_button: {
    margin: 0,
    textAlign: 'center',
  },
  sectB: {
    paddingTop: 40,
  },
  inputWrapper: {
    '& input': {
      fontSize: 16,
      fontWeight: 500,
      fontFamily: 'IBM Plex Sans,sans-serif',
    },
  },
};

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const SymptomsTrackerSDK: React.FC = () => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const isMediumScreen = useMediaQuery('(max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.pageHeader}>
            <Link to={clientRoutes.symptomsTrackerFor()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            Consult a doctor
          </div>
          <Scrollbars
            autoHide={true}
            autoHeight
            autoHeightMin={
              isSmallScreen
                ? 'calc(100vh - 135px)'
                : isMediumScreen
                ? 'calc(100vh - 205px)'
                : 'calc(100vh - 155px)'
            }
          >
            <div className={classes.subHeader}>
              <div className={classes.leftCol}></div>
              <div className={classes.rightCol}>
                <div className={classes.profileDropdown}>
                  For
                  <AphCustomDropdown classes={{ selectMenu: classes.selectMenuItem }}>
                    <MenuItem
                      classes={{
                        root: classes.menuRoot,
                        selected: classes.menuSelected,
                      }}
                    >
                      Mallesh
                    </MenuItem>
                  </AphCustomDropdown>
                </div>
              </div>
            </div>
            <div className={classes.symptomsTracker}>
              <NavigatorSDK
                clientId="A6A375AF-A374-41F6-8EA5-C2E8B3239FAC"
                patientAge={30}
                patientGender="male"
                sdkContainerStyle={customContainerStyle}
              />
            </div>
          </Scrollbars>
        </div>
      </div>
      {isSignedIn && <NavigationBottom />}
    </div>
  );
};
