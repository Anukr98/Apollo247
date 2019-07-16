import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 328,
    },
    doctorProfile: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
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
    },
    infoRow: {
      display: 'flex',
      paddingTop: 10,
    },
    iconType: {
      width: 25,
      textAlign: 'center',
    },
    details: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      paddingLeft: 20,
      lineHeight: 1.5,
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
  };
});

export interface DoctorProfileProps {
  doctorDetails: {
    profilePicture: String;
    doctorName: String;
    doctorSpeciality: String;
    doctorExperience: String;
    doctorQualification: [];
    awards: [];
    locations: [];
    languagesKnown: [];
    consultingOptions: {};
    isStarDoctor: boolean;
  };
  onBookConsult: () => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = (props) => {
  const classes = useStyles();

  const { doctorDetails, onBookConsult } = props;

  const consultingOptions = (consultingOptions) => {
    return Object.values(consultingOptions).map((consultingOption: any) => (
      <div className={classes.infoRow} key={consultingOption.consultType}>
        <div className={classes.iconType}>
          <img src={require('images/ic_home.svg')} alt="" />
        </div>
        <div className={classes.details}>
          {consultingOption.consultType}
          <div className={`${classes.availability} ${classes.availableNow}`}>
            Available in {consultingOption.availableIn} mins
          </div>
        </div>
        <div className={classes.doctorPrice}>{consultingOption.fees}</div>
      </div>
    ));
  };

  return (
    <div className={classes.root}>
      <div className={classes.doctorProfile}>
        <div className={classes.doctorImage}>
          <img src="https://via.placeholder.com/328x138" alt="" />
        </div>
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>{doctorDetails.doctorName}</div>
          <div className={classes.specialits}>
            General Physician <span className={classes.lineDivider}>|</span>{' '}
            {doctorDetails.doctorExperience} Yrs
            <div className={classes.shareIcon}>
              <img src={require('images/ic_home.svg')} alt="" />
            </div>
          </div>
          <div className={classes.doctorInfoGroup}>
            <div className={classes.infoRow}>
              <div className={classes.iconType}>
                <img src={require('images/ic_home.svg')} alt="" />
              </div>
              <div className={classes.details}>
                {doctorDetails.doctorQualification.map((qual: string) => {
                  return <p key={qual}>{qual}</p>;
                })}
              </div>
            </div>
            <div className={classes.infoRow}>
              <div className={classes.iconType}>
                <img src={require('images/ic_home.svg')} alt="" />
              </div>
              <div className={classes.details}>
                {doctorDetails.awards.map((award: string) => {
                  return <p key={award}>{award}</p>;
                })}
              </div>
            </div>
          </div>
          <div className={classes.doctorInfoGroup}>
            <div className={classes.infoRow}>
              <div className={classes.iconType}>
                <img src={require('images/ic_home.svg')} alt="" />
              </div>
              <div className={classes.details}>
                {doctorDetails.locations.map((location: string) => {
                  return <p key={location}>{location}</p>;
                })}
              </div>
            </div>
            <div className={`${classes.infoRow} ${classes.textCenter}`}>
              <div className={classes.iconType}>
                <img src={require('images/ic_home.svg')} alt="" />
              </div>
              <div className={classes.details}>
                {doctorDetails.languagesKnown.map((language: string) => {
                  return <span key={language}>{language},</span>;
                })}
              </div>
            </div>
          </div>
          <div className={classes.doctorInfoGroup}>
            {consultingOptions(doctorDetails.consultingOptions)}
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
};
