import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { useAuth } from 'hooks/authHooks';
import Typography from '@material-ui/core/Typography';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { NavigatorSDK, $Generator } from '@praktice/navigator-react-web-sdk';
import Scrollbars from 'react-custom-scrollbars';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { SymptomsTrackerLoggedOutForm } from 'components/SymptomsTracker/SymptomsTrackerLoggedOutUserForm';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { AphCustomDropdown } from '@aph/web-ui-components';
import { AphButton } from '@aph/web-ui-components';
import { Route } from 'react-router-dom';
import { useAllCurrentPatients } from 'hooks/authHooks';
import moment from 'moment';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from '../../helpers/onePrimaryUser';

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
      zIndex: 2,
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
      display: 'flex',
      [theme.breakpoints.down(767)]: {
        display: 'none',
      },
    },
    labelFor: {
      marginTop: 6,
    },
    profileDropdownMobile: {
      fontSize: 14,
      fontWeight: 500,
      position: 'absolute',
      top: 4,
      right: 10,
      padding: '8px 0 8px 1rem',
      textTransform: 'none',
      display: 'flex',
      [theme.breakpoints.up(768)]: {
        display: 'none',
      },
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'capitalize',
      paddingTop: 7,
      paddingBottom: 6,
      paddingLeft: 4,
      '&:focus': {
        backgroundColor: 'transparent',
      },
      [theme.breakpoints.down(767)]: {
        maxWidth: 200,
      },
      [theme.breakpoints.down(500)]: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 55,
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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      paddingBottom: 0,
      paddingRight: 0,
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    contentGroup: {
      padding: 20,
      paddingTop: 0,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    bottomActions: {
      textAlign: 'right',
    },
    bottomButtons: {
      display: 'flex',
    },
    loaderImg: {
      marginLeft: 'auto',
      '& img': {
        maxWidth: 76,
        verticalAlign: 'middle',
      },
    },
    selectMenuRoot: {
      paddingRight: 55,
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    showBtnActions: {
      marginTop: '1rem',
      position: 'absolute',
      right: 20,
      top: 0,
      zIndex: 9,
      [theme.breakpoints.down(767)]: {
        position: 'fixed',
        top: 'auto',
        bottom: 0,
        marginTop: 0,
        zIndex: 991,
        padding: 11,
        width: '100%',
        left: 0,
        backgroundColor: '#dcdfce',
        textAlign: 'center',
      },
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
  selectedSymptomsStyle: {
    position: 'relative',
    '& span': {
      position: 'absolute',
    },
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

// type Patient = GetCurrentPatients_getCurrentPatients_patients;
interface CustomComponentProps {
  setDoctorPopOver: any;
  doctorPopover: boolean;
  stopRedirect: string;
}
export const CustomComponent: React.FC<CustomComponentProps> = (props) => {
  const classes = useStyles({});
  const [isRedirect, setIsRedirect] = useState(false);

  useEffect(() => {
    if (props.stopRedirect === 'continue' && isRedirect) {
      setTimeout(() => {
        window.location.href = clientRoutes.doctorsLanding();
      }, 5000);
    } else if (props.stopRedirect === 'stop') {
      window.location.reload();
    }
  }, [props.stopRedirect, isRedirect]);
  return (
    <Route
      render={({ history }) => {
        return (
          <div className={classes.showBtnActions}>
            <AphButton
              title="show speciality"
              color="primary"
              onClick={async () => {
                const queryResponse = await $Generator({ type: 'showSpeciality' });
                let specialities = [];
                if (
                  queryResponse &&
                  queryResponse.specialists &&
                  queryResponse.specialists.length
                ) {
                  specialities = queryResponse.specialists.map((item: { speciality: string }) =>
                    item.speciality.trim()
                  );
                  if (specialities.length > 0) {
                    const specialitiesEncoded = encodeURI(specialities.join(','));
                    localStorage.setItem('symptomTracker', specialitiesEncoded);
                    setIsRedirect(true);
                    props.setDoctorPopOver(true);
                  }
                }
              }}
            >
              Show Doctors
            </AphButton>
          </div>
        );
      }}
    ></Route>
  );
};
type Patient = GetCurrentPatients_getCurrentPatients_patients;
export const SymptomsTrackerSDK: React.FC = () => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const isMediumScreen = useMediaQuery('(max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [showPopup, setShowPopup] = useState(true);
  const [loggedOutPatientAge, setLoggedOutPatientAge] = useState('');
  const [loggedOutPatientGender, setLoggedOutPatientGender] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [doctorPopover, setDoctorPopOver] = useState(false);
  const [loggedOutUserDetailPopover, setLoggedOutUserDetailPopover] = useState<boolean>(false);
  const [stopRedirect, setStopRedirect] = useState('continue');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isRedirect, setIsRedirect] = useState(false);

  const getAge = (dob: string) =>
    moment()
      .diff(moment(dob, 'YYYY-MM-DD'), 'years')
      .toString();
  const setUserAge = (dob: string) => {
    setPatientAge(getAge(dob));
  };
  const setUserGender = (gender: string) => gender.toLowerCase();

  useEffect(()=>{
    if(isSignedIn && currentPatient && currentPatient.dateOfBirth && currentPatient.gender) {
      setUserAge(currentPatient.dateOfBirth);
      setPatientGender(setUserGender(currentPatient.gender));
    }
  }, [isSignedIn, currentPatient])

  useEffect(() => {
    if (isSignedIn && currentPatient && currentPatient.dateOfBirth) {
      // setPatientAge(currentPatient.dateOfBirth)
      setUserAge(currentPatient.dateOfBirth);
    } else if (loggedOutPatientAge && loggedOutPatientAge.length) {
      setUserAge(loggedOutPatientAge);
    }
  }, [loggedOutPatientAge]);

  useEffect(() => {
    if (isSignedIn && currentPatient && currentPatient.gender) {
      setPatientGender(setUserGender(currentPatient.gender));
    } else if (loggedOutPatientGender && loggedOutPatientGender.length) {
      setPatientGender(setUserGender(loggedOutPatientGender));
    }
  }, [loggedOutPatientGender]);

  const setLoggedOutPatientData = (dataObj: any) => {
    if (Object.values(dataObj).every((element) => element !== null)) {
      // save the values and hide the pop over
      setLoggedOutPatientAge(dataObj.dob);
      setLoggedOutPatientGender(dataObj.gender);
      setLoggedOutUserDetailPopover(false);
    }
  };

  const customListner = (resultData: any) => {
    let specialities = [];
    specialities = resultData.specialists.map((item: { speciality: string }) =>
      item.speciality.trim()
    );
    if (specialities.length > 0) {
      const specialitiesEncoded = encodeURI(specialities.join(','));
      localStorage.setItem('symptomTracker', specialitiesEncoded);
      setDoctorPopOver(true);
      setIsRedirect(true);
      // window.location.href = clientRoutes.doctorsLanding();
    }
  };

  const onePrimaryUser = hasOnePrimaryUser();

  useEffect(() => {
    if (stopRedirect === 'continue' && isRedirect) {
      setTimeout(() => {
        window.location.href = clientRoutes.doctorsLanding();
      }, 5000);
    } else if (stopRedirect === 'stop') {
      window.location.reload();
    }
  }, [stopRedirect, isRedirect]);
  useEffect(() => {
    if (!isSignedIn) {
      setLoggedOutUserDetailPopover(true);
    }
  }, []);
  return (
    <div className={classes.root}>
      <Header />
      {
        <div className={classes.container}>
          <div className={classes.pageContainer}>
            <div className={classes.pageHeader}>
              <Link to={clientRoutes.symptomsTrackerFor()}>
                <div className={classes.backArrow}>
                  <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                  <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
                </div>
              </Link>
              UNDERSTAND YOUR SYMPTOMS
              {isSignedIn && (
                <div className={classes.profileDropdownMobile}>
                  <div className={classes.labelFor}>For</div>

                  <AphCustomDropdown
                    classes={{ selectMenu: classes.selectMenuItem }}
                    value={currentPatient && currentPatient.id}
                    onChange={(e) => {
                      setCurrentPatientId(e.target.value as Patient['id']);
                    }}
                  >
                    {allCurrentPatients &&
                      allCurrentPatients.length > 0 &&
                      currentPatient &&
                      allCurrentPatients.map((patient) => {
                        const isSelected = patient && patient.id === currentPatient.id;
                        const name = (patient.firstName || '').toLocaleLowerCase();
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
                    {/* <MenuItem classes={{ selected: classes.menuSelected }}>
                    <AphButton
                      color="primary"
                      classes={{ root: classes.addMemberBtn }}
                      onClick={() => {
                        setIsAddNewProfileDialogOpen(true);
                      }}
                    >
                      Add Member
                    </AphButton>
                  </MenuItem> */}
                  </AphCustomDropdown>
                </div>
              )}
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
                  {isSignedIn && (
                    <div className={classes.profileDropdown}>
                      <div className={classes.labelFor}>For</div>
                      <AphCustomDropdown
                        classes={{ selectMenu: classes.selectMenuItem }}
                        value={currentPatient && currentPatient.id}
                        onChange={(e) => {
                          setCurrentPatientId(e.target.value as Patient['id']);
                        }}
                      >
                        {allCurrentPatients &&
                          allCurrentPatients.length > 0 &&
                          currentPatient &&
                          allCurrentPatients.map((patient) => {
                            const isSelected = patient && patient.id === currentPatient.id;
                            const name = (patient.firstName || '').toLocaleLowerCase();
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
                        {/* <MenuItem classes={{ selected: classes.menuSelected }}>
                        <AphButton
                          color="primary"
                          classes={{ root: classes.addMemberBtn }}
                          onClick={() => {
                            setIsAddNewProfileDialogOpen(true);
                          }}
                        >
                          Add Member
                        </AphButton>
                      </MenuItem> */}
                      </AphCustomDropdown>
                    </div>
                  )}
                </div>
              </div>
              {patientAge && patientGender && (
                <div className={classes.symptomsTracker}>
                  <NavigatorSDK
                    clientId={process.env.PRAKTICE_SDK_KEY}
                    key={(currentPatient && currentPatient.id) || 'guest'}
                    patientAge={patientAge}
                    patientGender={patientGender}
                    sdkContainerStyle={customContainerStyle}
                    searchDoctorlistner={customListner}
                    showDocBtn={() => (
                      <CustomComponent
                        setDoctorPopOver={setDoctorPopOver}
                        doctorPopover={doctorPopover}
                        stopRedirect={stopRedirect}
                      />
                    )}
                  />
                </div>
              )}
            </Scrollbars>
          </div>

          <Popover
            open={showPopup}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            classes={{ paper: classes.bottomPopover }}
          >
            <div className={classes.successPopoverWindow}>
              <div className={classes.windowWrap}>
                <div className={classes.mascotIcon}>
                  <img src={require('images/ic-mascot.png')} alt="" />
                </div>
                <div className={classes.contentGroup}>
                  <Typography variant="h3">hi! :)</Typography>
                  <p>Please pick or type the symptom most closely relating to your condition</p>
                  <div className={classes.bottomActions}>
                    <AphButton
                      color="primary"
                      classes={{ root: classes.addMemberBtn }}
                      onClick={() => {
                        setShowPopup(false);
                      }}
                    >
                      OK, GOT IT
                    </AphButton>
                  </div>
                </div>
              </div>
            </div>
          </Popover>
          <Popover
            open={doctorPopover}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            classes={{ paper: classes.bottomPopover }}
          >
            <div className={classes.successPopoverWindow}>
              <div className={classes.windowWrap}>
                <div className={classes.mascotIcon}>
                  <img src={require('images/ic-mascot.png')} alt="" />
                </div>
                <div className={classes.contentGroup}>
                  <Typography variant="h3">relax :)</Typography>
                  <p>We're finding the earliest available doctors for you</p>
                  <div className={classes.bottomButtons}>
                    <AphButton
                      color="primary"
                      classes={{ root: classes.addMemberBtn }}
                      onClick={() => {
                        setDoctorPopOver(false);
                        setStopRedirect('stop');
                      }}
                    >
                      NO, WAIT
                    </AphButton>
                    <div className={classes.loaderImg}>
                      <img src={require('images/ic_loader@3x.png')} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Popover>
        </div>
      }
      {!isSignedIn && (
        <Popover
          open={loggedOutUserDetailPopover}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          classes={{ paper: classes.bottomPopover }}
        >
          <div className={classes.successPopoverWindow}>
            <div className={classes.windowWrap}>
              <div className={classes.mascotIcon}>
                <img src={require('images/ic-mascot.png')} alt="" />
              </div>
              <div className={classes.contentGroup}>
                <Typography variant="h3">Hi! :)</Typography>
                <p>Tell us a little bit about the patient please</p>
                <div className={classes.bottomActions}>
                  <SymptomsTrackerLoggedOutForm
                    setData={(val: object) => setLoggedOutPatientData(val)}
                    onClose={() => setLoggedOutUserDetailPopover(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Popover>
      )}
      {!onePrimaryUser && <ManageProfile />}
    </div>
  );
};
