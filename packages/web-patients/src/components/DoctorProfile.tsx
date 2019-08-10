import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import Scrollbars from 'react-custom-scrollbars';
import _forEach from 'lodash/forEach';

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
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 0,
      },
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
    },
  };
});

interface DoctorProfileProps {
  doctorDetails: DoctorDetails;
  onBookConsult: () => void;
  avaPhy: boolean;
  avaOnline: boolean;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = (props) => {
  const classes = useStyles();

  const { doctorDetails, onBookConsult } = props;

  if (doctorDetails && doctorDetails.getDoctorDetailsById) {
    let hospitalLocation = '';

    const firstName = doctorDetails.getDoctorDetailsById.firstName;
    const lastName = doctorDetails.getDoctorDetailsById.lastName;
    const speciality = doctorDetails.getDoctorDetailsById.specialty.name;
    const experience = doctorDetails.getDoctorDetailsById.experience;
    const education = doctorDetails.getDoctorDetailsById.qualification;
    const awards = doctorDetails.getDoctorDetailsById.awards;
    const languages = doctorDetails.getDoctorDetailsById.languages;
    const profileImage = doctorDetails.getDoctorDetailsById.photoUrl;

    const onlineConsultFees = doctorDetails.getDoctorDetailsById.onlineConsultationFees;
    const physicalConsultationFees = doctorDetails.getDoctorDetailsById.physicalConsultationFees;

    _forEach(doctorDetails.getDoctorDetailsById.doctorHospital, (hospitalDetails) => {
      if (hospitalDetails.facility.facilityType === 'HOSPITAL') {
        hospitalLocation = hospitalDetails.facility.name;
      }
    });

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
                <img src={require('images/ic-share-green.svg')} alt="" />
              </div>
            </div>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 546px'}>
              <div className={classes.doctorInfoGroup}>
                <div className={classes.infoRow}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-edu.svg')} alt="" />
                  </div>
                  <div className={classes.details}>{education}</div>
                </div>
                <div className={classes.infoRow}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-awards.svg')} alt="" />
                  </div>
                  <div className={classes.details}>
                    {awards && awards.replace(/<\/?[^>]+(>|$)/g, '')}
                  </div>
                </div>
              </div>
              <div className={`${classes.doctorInfoGroup} ${classes.opacityMobile}`}>
                <div className={classes.infoRow}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-location.svg')} alt="" />
                  </div>
                  <div className={classes.details}>{hospitalLocation}</div>
                </div>
                <div className={`${classes.infoRow} ${classes.textCenter}`}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-language.svg')} alt="" />
                  </div>
                  <div className={classes.details}>{languages}</div>
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
                      <div className={classes.doctorPriceIn}>Rs.{onlineConsultFees}</div>
                      <div className={`${classes.availability} ${classes.availableNow}`}>
                        Available in 15 mins
                      </div>
                    </div>
                    <div className={classes.doctorPrice}>Rs.{onlineConsultFees}</div>
                  </div>
                </div>
                <div className={classes.consultGroup}>
                  <div className={classes.infoRow}>
                    <div className={`${classes.iconType} ${classes.noIcon}`}>
                      <img src={require('images/ic-rupee.svg')} alt="" />
                    </div>
                    <div className={classes.details}>
                      Clinic Visit
                      <div className={classes.doctorPriceIn}>Rs.{physicalConsultationFees}</div>
                      <div className={`${classes.availability}`}>Available in 27 mins</div>
                    </div>
                    <div className={classes.doctorPrice}>Rs.{physicalConsultationFees}</div>
                  </div>
                </div>
              </div>
            </Scrollbars>
          </div>
          <div className={classes.bottomActions}>
            <AphButton
              onClick={(e) => {
                onBookConsult();
              }}
              fullWidth
              color="primary"
            >
              Book Appointment
            </AphButton>
          </div>
        </div>
      </div>
    );
  } else {
    return <div>Invalid doctor id</div>;
  }
};
