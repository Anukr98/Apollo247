import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      height: '100%',
      borderRadius: 5,
    },
    doctorProfile: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
    },
    doctorImage: {
      borderRadius: '5px 5px 0 0',
      overflow: 'hidden',
    },
    doctorInfo: {
      padding: '20px 5px 0 20px',
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
      paddingBottom: 5,
      marginBottom: 5,
      marginRight: 15,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
    },
    specialits: {
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 15,
      color: '#0087ba',
      textTransform: 'uppercase',
      position: 'relative',
      paddingRight: 40,
      marginRight: 15,
    },
    lineDivider: {
      paddingLeft: 5,
      paddingRight: 5,
    },
    doctorInfoGroup: {
      paddingBottom: 10,
      marginRight: 15,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      [theme.breakpoints.down('xs')]: {
        marginBottom: 10,
      },
    },
    infoRow: {
      display: 'flex',
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
      },
    },
    iconType: {
      width: 25,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    details: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      paddingLeft: 20,
      lineHeight: 1.5,
      [theme.breakpoints.down('xs')]: {
        fontSize: 12,
        paddingLeft: 0,
        fontWeight: 600,
      },
      '& p': {
        margin: 0,
      },
      '& span': {
        paddingRight: 5,
      },
    },
    textCenter: {
      alignItems: 'center',
    },
    doctorPrice: {
      marginLeft: 'auto',
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      lineHeight: 1.5,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    doctorPriceIn: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#02475b',
      lineHeight: 1.5,
      marginTop: 5,
      marginBottom: 10,
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    availability: {
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,135,186,0.11)',
      padding: '6px 12px',
      color: '#02475b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 10,
      marginTop: 5,
    },
    availableNow: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white,
    },
    consultGroup: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        borderRadius: 5,
        padding: 12,
        marginBottom: 10,
      },
    },
    consultDoctorInfoGroup: {
      borderBottom: 0,
      paddingBottom: 0,
    },
    opacityMobile: {
      [theme.breakpoints.down('xs')]: {
        opacity: 0.5,
      },
    },
    noIcon: {
      opacity: 0,
    },
    bottomActions: {
      padding: 20,
      '& button': {
        color: '#fc9916',
        borderRadius: 10,
      },
    },
    joinInSection: {
      backgroundColor: 'rgba(0,135,186,0.1)',
      padding: 10,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
    },
    joinTime: {
      fontWeight: 600,
      marginLeft: 'auto',
    },
    buttonGroup: {
      paddingRight: 15,
      paddingTop: 30,
    },
    joinBtn: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white + '!important',
      borderRadius: '5px !important',
      '&:hover': {
        backgroundColor: '#ff748e',
        color: theme.palette.common.white + '!important',
      },
    },
    moreToggle: {
      position: 'absolute',
      right: 0,
      top: 0,
      cursor: 'pointer',
      fontSize: 12,
      color: '#fc9916',
      fontWeight: 'bold',
    },
    appointmentDetails: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      marginTop: 30,
      marginRight: 15,
    },
    sectionHead: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 5,
      marginTop: -5,
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
    },
    moreIcon: {
      marginLeft: 'auto',
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    noBorder: {
      border: 0,
      paddingBottom: 0,
    },
    invoiceBtn: {
      boxShadow: 'none',
      padding: 0,
      color: '#fc9916',
      fontSize: 12,
      fontWeight: 'bold',
      clear: 'both',
    },
  };
});

export const ConsultDoctorProfile: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.doctorProfile}>
        <div className={classes.doctorImage}>
          <img src={'https://via.placeholder.com/328x138'} alt="" />
        </div>
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>Dr. Simran Rai</div>
          <div className={classes.specialits}>
            General Physician <span className={classes.lineDivider}>|</span> 7 Yrs
            <div className={classes.moreToggle}>More</div>
          </div>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 512px'}>
            <div className={classes.doctorInfoGroup}>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic-edu.svg')} alt="" />
                </div>
                <div className={classes.details}>
                  MS (Surgery)
                  <br /> MBBS (Internal Medicine)
                </div>
              </div>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic-awards.svg')} alt="" />
                </div>
                <div className={classes.details}>
                  Dr. B.C.Roy Award (2009)
                  <br /> William E. Ladd Medal (2013)
                  <br /> R. D. Birla Award (2014)
                </div>
              </div>
            </div>
            <div className={`${classes.doctorInfoGroup} ${classes.opacityMobile}`}>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic-location.svg')} alt="" />
                </div>
                <div className={classes.details}>Apollo Hospital, Jubilee Hills</div>
              </div>
              <div className={`${classes.infoRow} ${classes.textCenter}`}>
                <div className={classes.iconType}>
                  <img src={require('images/ic-language.svg')} alt="" />
                </div>
                <div className={classes.details}>Hindi, English, Telugu</div>
              </div>
            </div>
            <div className={`${classes.doctorInfoGroup} ${classes.consultDoctorInfoGroup}`}>
              <div className={classes.consultGroup}>
                <div className={classes.infoRow}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-rupee.svg')} alt="" />
                  </div>
                  <div className={classes.details}>
                    Online Consultation
                    <br />
                    Clinic Visit
                    <div className={classes.doctorPriceIn}>Rs. 299</div>
                  </div>
                  <div className={classes.doctorPrice}>
                    Rs. 299 <br />
                    Rs. 499
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.appointmentDetails}>
              <div className={classes.sectionHead}>
                <span>Appointment Details</span>
                <span className={classes.moreIcon}>
                  <img src={require('images/ic_more.svg')} alt="" />
                </span>
              </div>
              <div className={`${classes.doctorInfoGroup} ${classes.noBorder}`}>
                <div className={`${classes.infoRow} ${classes.textCenter}`}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic_calendar_show.svg')} alt="" />
                  </div>
                  <div className={classes.details}>Today, 6:30 pm</div>
                </div>
                <div className={`${classes.infoRow} ${classes.textCenter}`}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-language.svg')} alt="" />
                  </div>
                  <div className={classes.details}>40 min average waiting time</div>
                </div>
                <div className={`${classes.infoRow}`}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-location.svg')} alt="" />
                  </div>
                  <div className={classes.details}>
                    Apollo Hospital
                    <br />
                    Road No 72, Film Nagar
                    <br />
                    Jubilee Hills, Hyderabad
                  </div>
                </div>
              </div>
              <div className={classes.consultGroup}>
                <div className={classes.infoRow}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-rupee.svg')} alt="" />
                  </div>
                  <div className={classes.details}>
                    Online Consultation
                    <br />
                    Clinic Visit
                    <br />
                    <div className={classes.doctorPriceIn}>Rs. 299</div>
                    <AphButton className={classes.invoiceBtn}>Download Invoice</AphButton>
                  </div>
                  <div className={classes.doctorPrice}>
                    Rs. 299 <br />
                    Rs. 499
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.buttonGroup}>
              <div className={classes.joinInSection}>
                <span>Doctor Joining In</span>
                <span className={classes.joinTime}>9 mins</span>
              </div>
              <div className={classes.joinInSection}>
                <span>Time Remaining</span>
                <span className={classes.joinTime}>14 mins</span>
              </div>
            </div>
          </Scrollbars>
        </div>
        <div className={classes.bottomActions}>
          <AphButton className={classes.joinBtn} fullWidth>
            Doctor has joined!
          </AphButton>
          <AphButton fullWidth>Reschedule</AphButton>
        </div>
      </div>
    </div>
  );
};
