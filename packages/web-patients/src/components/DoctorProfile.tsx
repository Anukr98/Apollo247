import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
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
    },
    bottomMenuRoot: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      bottom: 0,
      height: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& button': {
        padding: '10px 0',
      },
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
  showConsultPopup: (showConsultPopup: boolean) => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = (props) => {
  const classes = useStyles();

  const { doctorDetails, showConsultPopup } = props;

  const consultingOptions = (consultingOptions) => {
    return Object.values(consultingOptions).map((consultingOption: any) => (
      <div key={consultingOption.consultType}>
        <div>{consultingOption.consultType}</div>
        <div>
          <p>{consultingOption.fees}</p>
          <p>AVAILABLE IN {consultingOption.availableIn} MINS</p>
        </div>
      </div>
    ));
  };

  return (
    <div className={classes.welcome}>
      <div>
        <img src="https://placeimg.com/300/100/any" />
      </div>
      <div>
        {doctorDetails.doctorName} | {doctorDetails.doctorExperience}
      </div>
      <div>
        {doctorDetails.doctorQualification.map((qual: string) => {
          return <p key={qual}>{qual}</p>;
        })}
      </div>
      <div>
        {doctorDetails.awards.map((award: string) => {
          return <p key={award}>{award}</p>;
        })}
      </div>
      <div>
        {doctorDetails.locations.map((location: string) => {
          return <p key={location}>{location}</p>;
        })}
      </div>
      <div>
        {doctorDetails.languagesKnown.map((language: string) => {
          return <p key={language}>{language}</p>;
        })}
      </div>
      <div>{consultingOptions(doctorDetails.consultingOptions)}</div>
      <AphButton
        onClick={(e) => {
          showConsultPopup(true);
        }}
      >
        BOOK CONSULTATION
      </AphButton>
    </div>
  );
};
