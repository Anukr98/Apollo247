import React, { useEffect, useState } from 'react';
import { Theme, Grid, CircularProgress, Popover, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Specialties } from 'components/Specialties';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import { readableParam } from 'helpers/commonHelpers';
import _lowerCase from 'lodash/lowerCase';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { specialtyClickTracking } from 'webEngageTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    topSpeciality: {},
    startHead: {
      color: '#00a7b9',
      margin: '10px 0',
      fontSize: '16px !important',
      fontWeight: 'bold',
      [theme.breakpoints.down('sm')]: {
        margin: '20px 0 10px',
      },
    },
    sectionHeader: {
      padding: '10px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      '& h2': {
        fontSize: 14,
        fontWeight: 700,
        color: '#02475b',
        textTransform: 'uppercase',
        margin: 0,
      },
    },
    otherSpeciality: {
      '& >div': {
        '& >div': {
          '&:first-child': {
            display: 'block',
          },
        },
      },
    },
    tsContent: {
      padding: '20px 0',
    },
    osContainer: {
      padding: '20px 0',
    },
    specialityCard: {
      height: 180,
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 10,
      textAlign: 'center',
      position: 'relative',
      '& a': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'column',
        height: '100%',
      },
      '& h3': {
        fontSize: 14,
        fontWeight: 500,
      },
      '& img': {
        width: 40,
        margin: '10px 0',
      },
      '& p': {
        fontSize: 12,
        color: 'rgb(2, 71, 91, 0.6)',
        lineHeight: '12px',
        padding: '0 15px',
        fontWeight: 500,
      },
      [theme.breakpoints.down(700)]: {
        height: 180,
        '& h3': {
          fontSize: 12,
        },
        '& p': {
          padding: '0 10px',
        },
      },
    },
    symptoms: {
      fontSize: '10px !important',
      fontWeight: 500,
      color: '#02475b !important',
      padding: '0 !important',
      textAlign: 'center',
      [theme.breakpoints.down(700)]: {
        padding: '0 10px !important',
      },
    },
    specialityDetails: {},
    videoContainer: {
      height: 180,
      border: '1px solid #eee',
      borderRadius: 5,
      padding: 10,
    },
    card: {
      background: '#ffffff',
      borderRadius: 5,
      padding: 15,
      margin: '0 0 20px',
      '& h5': {
        fontSize: 16,
        fontWeight: 600,
        margin: '0 0 10px',
        lineHeight: '16px',
      },
    },
    cardList: {
      padding: '0 0 0 20px',
      margin: 0,
      '& li': {
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '24px',
      },
    },
    symptomContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      '& img': {
        margin: '0 10px 0 0',
      },
      '& h6': {
        fontSize: 14,
        fontWeight: 600,
        margin: '0 0 10px',
      },
      '& a': {
        fontSize: 13,
        color: '#fc9916',
        textTransform: 'uppercase',
        display: 'block',
        fontWeight: 700,
      },
    },
    appDetails: {
      '& h6': {
        color: '#0589bb',
        fontSize: 14,
        margin: '0 0 5px',
        fontWeight: 500,
      },
      '& p': {
        fontSize: 12,
        color: 'rgb(2, 71, 91, 0.6)',
        lineHeight: '18px',
      },
    },
    appDownload: {
      display: 'flex',
      alignItems: 'center',
      margin: '10px 0 0',
      fontWeight: 500,
      '& button': {
        color: '#fc9916',
        width: '100%',
        margin: '0 0 0 10px',
        maxWidth: 300,
      },
    },
    tabsContainer: {},
    tabRoot: {
      background: '#f7f8f5',
      padding: 10,
      boxShadow: ' 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      minWidth: 140,
      opacity: 1,
      position: 'relative',
      border: '1px solid transparent',
      minHeight: 'auto',
      overflow: 'visible',
      '&:first-child': {
        margin: '0 10px 0 0',
      },
      '& span': {
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'none',
        lineHeight: '15px',
        position: 'relative',
        zIndex: 5,
      },
      '&:before': {
        content: "''",
        position: 'absolute',
        bottom: -34,
        left: 0,
        right: 0,
        zIndex: 2,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
      '&:after': {
        content: "''",
        position: 'absolute',
        bottom: -35,
        left: 0,
        right: 0,
        zIndex: 1,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
      [theme.breakpoints.down('sm')]: {
        minWidth: 100,
        '&:first-child': {
          margin: '0 20px 0 0',
        },
      },
    },
    tabSelected: {
      borderColor: '#00b38e',
      '&:before': {
        borderTopColor: '#f7f8f5',
      },
      '&:after': {
        borderTopColor: '#00b38e',
      },
    },
    tabsRoot: {
      '& >div': {
        '& >div': {
          padding: '10px 0 30px',
        },
      },
    },
    tabsIndicator: {
      display: 'none',
    },
    tabContent: {},
    chatContainer: {},
    tabHead: {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        margin: '0 20px 0 0',
      },
      '& h6': {
        color: '#0589bb',
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: 600,
      },
    },
    tabBody: {
      padding: '20px 0',
      borderTop: '1px solid #eeeeee',
      borderBottom: '1px solid #eeeeee',
      margin: '20px 0',
    },
    tabList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      '& li': {
        padding: '5px 0',
        display: 'flex',
        alignItems: 'center',
        '& p': {
          fontSize: 12,
          color: 'rgb(2, 71, 91, 0.6)',
          margin: '0 0 0 15px',
          fontWeight: 500,
        },
      },
    },
    highlight: {
      '& p': {
        color: '#0589bb !important',
      },
    },
    sHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& h1': {
        fontsize: 20,
        color: '#007c93',
        fontWeight: 600,
      },
      [theme.breakpoints.down('sm')]: {
        '& a': {
          position: 'absolute',
          top: 15,
          right: 20,
          zIndex: 2,
        },
      },
      [theme.breakpoints.down(700)]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    specialitySearch: {
      padding: '10px 0 0',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down(700)]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
    locationContainer: {
      padding: 30,
      [theme.breakpoints.down(600)]: {
        padding: 20,
      },
    },
    dialogTitle: {
      textAlign: 'left',
      [theme.breakpoints.down(600)]: {
        '& h2': {
          fontSize: 14,
        },
      },
    },
    popularCities: {
      padding: '20px 0',
      '& h6': {
        fontSize: 14,
        fontWeight: 700,
        margin: '0 0 10px',
        color: '#02475b',
      },
      '& button': {
        margin: '0 15px 0 0',
        color: '#00b38e',
        borderRadius: 10,
        fontSize: 12,
        textTransform: 'none',
        [theme.breakpoints.down(500)]: {
          margin: '0 15px 15px 0',
        },
      },
    },
    btnContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      '& button': {
        width: 180,
        fontSize: 13,
        fontWeight: 700,
      },
    },
    sContent: {
      margin: '10px 0 0',
      padding: '15px 0 0',
      borderTop: '1px solid rgba(1,71,91,0.5)',
    },
  };
});

interface SpecialtyDivisionProps {
  selectedCity: string;
  doctorsCount: number;
}

interface TopSpecialtyType {
  specialtyName: string;
  image: string;
  description: string;
  symptoms: string;
  slugName: string;
  id: string;
}

const image_url = process.env.SPECIALTY_IMAGE_SOURCE;

export const SpecialtyDivision: React.FC<SpecialtyDivisionProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const { selectedCity, doctorsCount } = props;
  const [specialtyCount, setSpecialtyCount] = useState<number>(0);
  const topSpecialtyListing = [
    {
      specialtyName: 'Paediatrics',
      image: `${image_url}/ic_paediatrics.png`,
      description: "For your child's health problems",
      symptoms: 'Fever, Cough, Diarrhoea',
      slugName: 'Paediatrics',
      id: '91cee893-55cf-41fd-9d6b-73157c6518a9',
    },
    {
      specialtyName: 'General Physician',
      image: `${image_url}/ic_general_medicine.png`,
      description: 'For any common health issues',
      symptoms: 'Fever, Headache, Asthma',
      slugName: 'General Physician/ Internal Medicine',
      id: '4dc1c5de-e062-4b3b-aec9-090389687865',
    },
    {
      specialtyName: 'Dermatology',
      image: `${image_url}/ic_dermatology.png`,
      description: 'For skin & hair problems',
      symptoms: 'Skin rash, Acne, Skin patch',
      slugName: 'Dermatology',
      id: 'fba32e11-eb1c-4e18-8d45-8c25f45d7672',
    },
    {
      specialtyName: 'Gynaecology',
      image: `${image_url}/ic_obstetrics_and_gynaecology.png`,
      description: "For women's health",
      symptoms: 'Irregular periods, Pregnancy',
      slugName: 'Obstetrics & Gynaecology',
      id: '3b69e637-684d-4545-aace-91810bc5739d',
    },
  ];

  return (
    <>
      <Typography component="h3" className={classes.startHead}>
        Start your care now by choosing from {doctorsCount ? `${doctorsCount} doctors and ` : ''}
        {specialtyCount} specialities
      </Typography>
      <div className={classes.topSpeciality}>
        <div className={classes.sectionHeader}>
          <Typography component="h2">Top Specialties</Typography>
        </div>
        <div className={classes.tsContent}>
          <Grid container spacing={2}>
            {topSpecialtyListing &&
              topSpecialtyListing.length > 0 &&
              topSpecialtyListing.map((specialityDetails: TopSpecialtyType) => (
                <Grid key={specialityDetails.specialtyName} item xs={6} md={3}>
                  <div
                    className={classes.specialityCard}
                    onClick={() => {
                      const patientAge =
                        new Date().getFullYear() -
                        new Date(currentPatient && currentPatient.dateOfBirth).getFullYear();
                      const eventData = {
                        patientAge: patientAge,
                        patientGender: currentPatient && currentPatient.gender,
                        specialtyId: specialityDetails.id,
                        specialtyName: specialityDetails.slugName,
                        relation: currentPatient && currentPatient.relation,
                      };
                      specialtyClickTracking(eventData);
                    }}
                  >
                    <Link
                      to={
                        selectedCity === ''
                          ? clientRoutes.specialties(readableParam(specialityDetails.slugName))
                          : clientRoutes.citySpecialties(
                              _lowerCase(selectedCity),
                              readableParam(specialityDetails.slugName)
                            )
                      }
                    >
                      <Typography component="h3">{specialityDetails.specialtyName}</Typography>
                      <img
                        src={specialityDetails.image}
                        title={`Online Doctor Consultation - ${specialityDetails.specialtyName}`}
                        alt={`Online Doctor Consultation - ${specialityDetails.specialtyName}`}
                      />
                      <Typography>{specialityDetails.description}</Typography>
                      <Typography className={classes.symptoms}>
                        {specialityDetails.symptoms}
                      </Typography>
                    </Link>
                  </div>
                </Grid>
              ))}
          </Grid>
        </div>
      </div>
      <div className={classes.otherSpeciality}>
        <div className={classes.sectionHeader}>
          <Typography component="h2">Other Specialties</Typography>
        </div>
        <div className={classes.osContainer}>
          <Specialties selectedCity={selectedCity} setSpecialtyCount={setSpecialtyCount} />
        </div>
      </div>
    </>
  );
};
