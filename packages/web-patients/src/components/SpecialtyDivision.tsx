import React from 'react';
import { Theme, Grid, CircularProgress, Popover, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Specialties } from 'components/Specialties';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';
import {
  GetAllSpecialties,
  GetAllSpecialties_getAllSpecialties as SpecialtyType,
} from 'graphql/types/GetAllSpecialties';
import { GET_ALL_SPECIALITIES } from 'graphql/specialities';
import { useQuery } from 'react-apollo-hooks';
import { getSymptoms } from 'helpers/commonHelpers';
import { readableParam } from 'helpers/commonHelpers';
import _lowerCase from 'lodash/lowerCase';

const useStyles = makeStyles((theme: Theme) => {
  return {
    topSpeciality: {},
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
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
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
}

export const SpecialtyDivision: React.FC<SpecialtyDivisionProps> = (props) => {
  const classes = useStyles({});
  const { selectedCity, doctorsCount } = props;
  const { loading, error, data } = useQuery<GetAllSpecialties>(GET_ALL_SPECIALITIES);

  const topSpecialtyListing = [
    {
      specialtyName: 'Paediatrics',
      image: 'https://apolloaphstorage.blob.core.windows.net/specialties/ic_paediatrics.png',
      description: "For your child's health problems",
      symptoms: 'Fever, cough, diarrhoea',
      slugName: 'Paediatrics',
    },
    {
      specialtyName: 'General Physician',
      image: 'https://apolloaphstorage.blob.core.windows.net/specialties/ic_general_medicine.png',
      description: 'For any common health issues',
      symptoms: 'Fever, headache, asthma',
      slugName: 'General Physician/ Internal Medicine',
    },
    {
      specialtyName: 'Dermatology',
      image: 'https://apolloaphstorage.blob.core.windows.net/specialties/ic_dermatology.png',
      description: 'For skin & hair problems',
      symptoms: 'Skin rash, acne, skin patch',
      slugName: 'Dermatology',
    },
    {
      specialtyName: 'Gynaecology',
      image:
        'https://apolloaphstorage.blob.core.windows.net/specialties/ic_obstetrics_and_gynaecology.png',
      description: "For women's health",
      symptoms: 'Irregular periods, Pregnancy',
      slugName: 'Obstetrics & Gynaecology',
    },
  ];

  const allSpecialties = data && data.getAllSpecialties;

  return (
    <>
      <Typography component="h2">
        Start your care now by choosing from {doctorsCount ? `${doctorsCount} doctors and ` : ''}
        {allSpecialties && allSpecialties.length} specialities
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
                <Grid key={specialityDetails.id} item xs={6} md={3}>
                  <div className={classes.specialityCard}>
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
                      <img src={specialityDetails.image} />
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
          {loading ? (
            <div className={classes.circlularProgress}>
              <CircularProgress color="primary" />
            </div>
          ) : error ? (
            <div>Error! </div>
          ) : (
            allSpecialties && <Specialties selectedCity={selectedCity} data={allSpecialties} />
          )}
        </div>
      </div>
    </>
  );
};
