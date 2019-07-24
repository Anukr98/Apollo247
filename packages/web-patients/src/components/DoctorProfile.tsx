import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import { GetDoctorProfileById as DoctorDetails } from 'graphql/types/getDoctorProfileById';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 328,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
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
      padding: 20,
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
      paddingBottom: 5,
      marginBottom: 5,
      borderBottom: '1px solid rgba(1,71,91,0.2)',
    },
    specialits: {
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 15,
      color: '#0087ba',
      textTransform: 'uppercase',
      position: 'relative',
      paddingRight: 40,
    },
    shareIcon: {
      position: 'absolute',
      right: 0,
      top: 0,
      cursor: 'pointer',
    },
    lineDivider: {
      paddingLeft: 5,
      paddingRight: 5,
    },
    doctorInfoGroup: {
      paddingBottom: 10,
      borderBottom: '1px solid rgba(1,71,91,0.2)',
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
    button: {
      marginTop: 20,
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
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 0,
      },
    },
    opacityMobile: {
      [theme.breakpoints.down('xs')]: {
        opacity: 0.5,
      },
    },
  };
});

interface DoctorProfileProps {
  doctorDetails: DoctorDetails | null;
  onBookConsult: () => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = (props) => {
  const classes = useStyles();

  const { doctorDetails, onBookConsult } = props;

  if (
    doctorDetails &&
    doctorDetails.getDoctorProfileById &&
    doctorDetails.getDoctorProfileById.profile
  ) {
    const firstName = doctorDetails.getDoctorProfileById.profile.firstName;
    const lastName = doctorDetails.getDoctorProfileById.profile.lastName;
    const speciality = doctorDetails.getDoctorProfileById.profile.speciality;
    const experience = doctorDetails.getDoctorProfileById.profile.experience;
    const education = doctorDetails.getDoctorProfileById.profile.education;
    const awards = doctorDetails.getDoctorProfileById.profile.awards;
    const languages = doctorDetails.getDoctorProfileById.profile.languages;
    const locations = doctorDetails.getDoctorProfileById.profile.address;
    const profileImage = doctorDetails.getDoctorProfileById.profile.photoUrl;
    const avaForVirtualConsult =
      doctorDetails.getDoctorProfileById.profile.availableForVirtualConsultation;
    const avaForPhyConsult =
      doctorDetails.getDoctorProfileById.profile.availableForPhysicalConsultation;

    const onlineConsultFees = doctorDetails.getDoctorProfileById.profile.onlineConsultationFees;
    const physicalConsultationFees =
      doctorDetails.getDoctorProfileById.profile.physicalConsultationFees;

    return (
      <div className={classes.root}>
        <div className={classes.doctorProfile}>
          <div className={classes.doctorImage}>
            <img
              src={profileImage !== null ? profileImage : 'https://via.placeholder.com/328x138'}
              alt={firstName !== null ? firstName : ''}
            />
          </div>
          <div className={classes.doctorInfo}>
            <div className={classes.doctorName}>
              Dr. {firstName}&nbsp;{lastName}
            </div>
            <div className={classes.specialits}>
              {speciality} <span className={classes.lineDivider}>|</span> {experience} Yrs
              <div className={classes.shareIcon}>
                <img src={require('images/ic_home.svg')} alt="" />
              </div>
            </div>
            <div className={classes.doctorInfoGroup}>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic_home.svg')} alt="" />
                </div>
                <div className={classes.details}>{education}</div>
              </div>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic_home.svg')} alt="" />
                </div>
                <div className={classes.details}>{awards}</div>
              </div>
            </div>
            <div className={`${classes.doctorInfoGroup} ${classes.opacityMobile}`}>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic_home.svg')} alt="" />
                </div>
                <div className={classes.details}>{locations}</div>
              </div>
              <div className={`${classes.infoRow} ${classes.textCenter}`}>
                <div className={classes.iconType}>
                  <img src={require('images/ic_home.svg')} alt="" />
                </div>
                <div className={classes.details}>{languages}</div>
              </div>
            </div>

            <div className={`${classes.doctorInfoGroup} ${classes.consultDoctorInfoGroup}`}>
              {avaForVirtualConsult ? (
                <div className={classes.consultGroup}>
                  <div className={classes.infoRow}>
                    <div className={classes.iconType}>
                      <img src={require('images/ic_home.svg')} alt="" />
                    </div>
                    <div className={classes.details}>
                      Online Consultation
                      <div className={classes.doctorPriceIn}>Rs.{onlineConsultFees}</div>
                      <div className={`${classes.availability} ${classes.availableNow}`}>
                        Available in 15 mins
                      </div>
                    </div>
                    <div className={classes.doctorPrice}>Rs.{onlineConsultFees}</div>
                  </div>
                </div>
              ) : null}

              {avaForPhyConsult ? (
                <div className={classes.consultGroup}>
                  <div className={classes.infoRow}>
                    <div className={classes.iconType}>
                      <img src={require('images/ic_home.svg')} alt="" />
                    </div>
                    <div className={classes.details}>
                      Clinic Visit
                      <div className={classes.doctorPriceIn}>Rs.{physicalConsultationFees}</div>
                      <div className={`${classes.availability}`}>Available in 27 mins</div>
                    </div>
                    <div className={classes.doctorPrice}>Rs.{physicalConsultationFees}</div>
                  </div>
                </div>
              ) : null}
            </div>

            <AphButton
              onClick={(e) => {
                onBookConsult();
              }}
              fullWidth
              color="primary"
              className={classes.button}
            >
              Book Consultation
            </AphButton>
          </div>
        </div>
      </div>
    );
  } else {
    return <div>Page Not Found....</div>;
  }
};
