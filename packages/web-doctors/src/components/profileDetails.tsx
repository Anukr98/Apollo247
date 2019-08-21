import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphInput, AphButton } from '@aph/web-ui-components';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 65,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      backgroundColor: '#f7f7f7',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },

    labelRoot: {
      width: '100%',
    },
    iconLabel: {
      fontSize: 12,
      color: '#67919d',
      paddingTop: 10,
      textTransform: 'uppercase',
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },
    outerContainer: {
      backgroundColor: 'rgba(216, 216, 216, 0.08)',
      padding: 16,
      border: '1px solid rgba(2,71,91,0.1)',
      borderRadius: 5,
      '& h2': {
        lineHeight: '18px',
        fontWeight: 600,
        margin: '0 0 15px 0',
      },
    },
    tabContent: {
      borderRadius: 5,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 0,
      position: 'relative',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 30,
    },
    starDoctors: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      overflow: 'hidden',
      position: 'absolute',
      left: 10,
      '& h4': {
        borderBottom: 'none',
      },
    },
    tabLeftcontent: {
      paddingLeft: 20,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
      },
    },
    awardsSection: {
      padding: '10px 20px 10px 20px',
      marginBottom: 20,
    },
    tabRightcontent: {
      // paddingRight: 20,
    },
    columnContent: {
      '-webkit-column-break-inside': 'avoid',
      'page-break-inside': 'avoid',
      'break-inside': 'avoid',
      'max-width': 'initial',
    },
    gridContainer: {
      'column-count': 2,
      'column-fill': 'initial',
      display: 'block',
      [theme.breakpoints.down('xs')]: {
        'column-count': 1,
      },
    },
    serviceItem: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        // display: 'flex',
      },
    },
    serviceItemLeft: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      borderRadius: 5,
      marginBottom: 12,
      color: '#01475b',
      [theme.breakpoints.down('xs')]: {
        // display: 'flex',
      },
    },
    avatarBlock: {
      overflow: 'hidden',
      borderRadius: '5px 5px 0 0',
      position: 'relative',
      paddingBottom: 20,
    },
    bigAvatar: {
      width: '100%',
    },
    profileImg: {
      height: 80,
    },
    tabContentStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 0,
      position: 'relative',
      minHeight: 115,
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 15,
      marginRight: 10,
      '& h4': {
        borderBottom: 'none',
        fontSize: 18,
        color: '#02475b',
        margin: 0,
        padding: 0,
        fontWeight: theme.typography.fontWeightMedium,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '72%',
      },
      '& h6': {
        margin: 0,
        fontWeight: 600,
        color: '#0087ba',
      },
    },
    addStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 16,
      position: 'relative',
      minHeight: 115,
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 30,
      marginRight: 10,
      '& h5': {
        fontWeight: theme.typography.fontWeightMedium,
        color: 'rgba(2,71,91,0.6)',
        fontSize: 14,
      },
    },
    saveButton: {
      minWidth: 150,
      fontSize: 15,
      padding: '8px 16px',
      lineHeight: '24px',
      fontWeight: theme.typography.fontWeightBold,
      margin: theme.spacing(0),
      backgroundColor: '#fc9916',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
    },
    backButton: {
      minWidth: 120,
      fontSize: 15,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(0, 1, 0, 0),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: theme.typography.fontWeightBold,
      // pointerEvents: 'none',
      paddingLeft: 4,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    btnContainer: {
      borderTop: 'solid 2px rgba(101,143,155,0.2)',
      marginTop: 30,
      paddingTop: 10,
      textAlign: 'right',
    },
    invited: {
      color: '#ff748e',
      fontSize: 15,
      fontWeight: theme.typography.fontWeightMedium,
      marginTop: 10,
      textTransform: 'uppercase',
      '& img': {
        position: 'relative',
        top: 4,
        marginRight: 15,
        marginLeft: 0,
      },
    },
    posRelative: {
      position: 'relative',
    },
    moreIcon: {
      position: 'absolute',
      top: 0,
      right: 0,
      padding: theme.spacing(0),
      backgroundColor: 'transparent',
      boxShadow: 'none',
      minWidth: 20,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    none: {
      display: 'none',
    },
    starImg: {
      position: 'absolute',
      bottom: 7,
      right: 15,
      width: 40,
    },
    card: {
      boxShadow: 'none',
    },
    cardHeader: {
      padding: '12px 0 12px 12px',
      position: 'relative',
    },
    details: {
      '& button': {
        padding: '5px 8px 5px 0px',
        color: '#02475b',
        position: 'absolute',
        right: 0,
        top: 8,
      },
    },
    qualification: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeightMedium,
      color: '#658f9b',
      display: 'block',
      maxWidth: 400,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      paddingRight: '20px',
      width: '51%',
    },
    profileAvatar: {
      width: 80,
      height: 80,
      '& img': {
        height: 80,
      },
    },
    starDoctorHeading: {
      fontSize: 16,
      marginBottom: 15,
      fontWeight: 600,
      color: '#02475b',
    },
    starDoctordelete: {
      color: '#951717',
      fontSize: 15,
      fontWeight: theme.typography.fontWeightMedium,
      padding: '16px 20px',
      cursor: 'pointer',
    },
    ProfileContainer: {
      padding: '90px 20px 20px 20px',
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 0',
        fontSize: 16,
        fontWeight: theme.typography.fontWeightMedium,
        color: '#02475b',
        margin: 0,
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 22,
        fontSize: 20,
        borderBottom: 'solid 2px rgba(101,143,155,0.05)',
        fontWeight: 600,
      },
      '& h5': {
        padding: '5px 5px 3px 0',
        color: '#658f9b',
        fontWeight: 'normal',
      },
      '& h6': {
        padding: '5px 5px 5px 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontSize: 15,
        fontWeight: 600,
        color: '#0087ba',
        '& span': {
          padding: '0 2px',
        },
      },
    },
    leftNav: {
      fontSize: 15,
      lineHeight: 1.6,
      fontWeight: 500,
      padding: '10px 10px 0 10px',
    },
    navRightIcon: {
      position: 'absolute',
      top: 12,
      right: 15,
    },
    navLeftIcon: {
      position: 'relative',
      top: 5,
      height: 20,
      marginRight: 10,
    },
    tabActive: {
      backgroundColor: '#0087ba',
      color: '#fff',
    },
    inputWidth: {
      width: '40%',
      align: 'left',
      paddingRight: 26,
      marginBottom: 10,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    helpTxt: {
      color: '#0087ba',
      fontSize: 16,
      lineHeight: 1.38,
      fontWeight: 500,
    },
    orange: {
      color: '#fc9916',
      fontWeight: 700,
    },
  };
});

export const profileDetails: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.ProfileContainer}>
          <div>
            <Grid container alignItems="flex-start" spacing={0}>
              <Grid item lg={3} sm={6} xs={12} className={classes.tabRightcontent}>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.avatarBlock}>
                    <img
                      alt=""
                      src={require('images/doctor-profile.jpg')}
                      className={classes.bigAvatar}
                    />
                    <img alt="" src={require('images/ic_star.svg')} className={classes.starImg} />
                  </div>
                  <Typography variant="h4">Dr. Seema Panda</Typography>
                  <Typography variant="h6">
                    <span> MCI Number : 0783329 </span>
                  </Typography>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_fees.svg')}
                      className={classes.navLeftIcon}
                    />
                    My Stats
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper
                  className={`${classes.serviceItemLeft} ${classes.tabContent} ${classes.tabActive}`}
                >
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_profilenav.svg')}
                      className={classes.navLeftIcon}
                    />
                    My Profile
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_availibility.svg')}
                      className={classes.navLeftIcon}
                    />
                    Availibility
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_fees.svg')}
                      className={classes.navLeftIcon}
                    />
                    Fees
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_smart_prescription.svg')}
                      className={classes.navLeftIcon}
                    />
                    Smart Prescription
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
                <Paper className={`${classes.serviceItemLeft} ${classes.tabContent}`}>
                  <div className={classes.leftNav}>
                    <img
                      alt=""
                      src={require('images/ic_settings.svg')}
                      className={classes.navLeftIcon}
                    />
                    Settings
                    <img
                      alt=""
                      src={require('images/ic_rightarrow.svg')}
                      className={classes.navRightIcon}
                    />
                  </div>
                </Paper>
              </Grid>
              <Grid item lg={9} sm={6} xs={12} className={classes.tabLeftcontent}>
                <div className={classes.outerContainer}>
                  <h2>Your Profile</h2>
                  <div className={`${classes.tabContent} ${classes.awardsSection}`}>
                    <Grid container spacing={0} className={classes.gridContainer}>
                      <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                        <Paper className={classes.serviceItem}>
                          <Typography variant="h5">Education</Typography>
                          <Typography variant="h3">MBBS</Typography>
                        </Paper>
                      </Grid>
                      <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                        <Paper className={classes.serviceItem}>
                          <Typography variant="h5">Awards</Typography>
                          <Typography variant="h3">First Certificate of Honour</Typography>
                        </Paper>
                      </Grid>

                      <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                        <Paper className={classes.serviceItem}>
                          <Typography variant="h5">Speciality</Typography>
                          <Typography variant="h3">General Physician</Typography>
                        </Paper>
                      </Grid>

                      <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                        <Paper className={classes.serviceItem}>
                          <Typography variant="h5">Speaks</Typography>
                          <Typography variant="h3">English,Hindi,Telugu,Bengali</Typography>
                        </Paper>
                      </Grid>

                      <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                        <Paper className={classes.serviceItem}>
                          <Typography variant="h5">Services</Typography>
                          <Typography variant="h3">Service List</Typography>
                        </Paper>
                      </Grid>

                      <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                        <Paper className={classes.serviceItem}>
                          <Typography variant="h5">MCI Number</Typography>
                          <Typography variant="h3">59997</Typography>
                        </Paper>
                      </Grid>

                      <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                        <Paper className={classes.serviceItem}>
                          <Typography variant="h5">In-person Consult Location</Typography>
                          <Typography variant="h3"> Banjarahills</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </div>
                  <h2>Your Star Doctors Team (2)</h2>
                  <h2>Secretary Login</h2>
                  <div className={`${classes.tabContent} ${classes.awardsSection}`}>
                    <h3>Enter the mobile number you’d like to assign access of your account to</h3>
                    <AphInput
                      className={classes.inputWidth}
                      inputProps={{ type: 'text' }}
                      placeholder="Type here..."
                    />
                  </div>
                  <div className={classes.helpTxt}>
                    <img
                      alt=""
                      src={require('images/ic_info.svg')}
                      className={classes.navLeftIcon}
                    />
                    Call <span className={classes.orange}>1800 - 3455 - 3455 </span>to make any
                    changes
                  </div>
                  <Grid
                    container
                    alignItems="flex-start"
                    spacing={0}
                    className={classes.btnContainer}
                  >
                    <Grid item lg={12} sm={12} xs={12}>
                      <AphButton
                        variant="contained"
                        color="primary"
                        classes={{ root: classes.backButton }}
                      >
                        BACK
                      </AphButton>
                      <AphButton
                        variant="contained"
                        color="primary"
                        classes={{ root: classes.saveButton }}
                      >
                        SAVE
                      </AphButton>
                    </Grid>
                  </Grid>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};
