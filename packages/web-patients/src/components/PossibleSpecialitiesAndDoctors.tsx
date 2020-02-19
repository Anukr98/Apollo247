import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { DoctorCard } from 'components/DoctorCard';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import LinearProgress from '@material-ui/core/LinearProgress';

import { useQueryWithSkip } from 'hooks/apolloHooks';
import { SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME } from 'graphql/doctors';
import { SpecialitiesProps } from 'components/Specialities';
import { Specialities } from 'components/Specialities';

const useStyles = makeStyles((theme: Theme) => {
  return {
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    count: {
      marginLeft: 'auto',
    },
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
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 15,
      paddingBottom: 10,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
    },
    doctorListingSection: {
      display: 'flex',
      padding: 20,
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      paddingLeft: 20,
    },
    pageHeader: {
      fontSize: 17,
      fontWeight: 500,
      color: '#0087ba',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      marginBottom: 20,
    },
    filterSection: {
      marginLeft: 'auto',
      '& button:last-child': {
        marginRight: 0,
      },
    },
    filterButton: {
      boxShadow: 'none',
      fontSize: 12,
      fontWeight: 500,
      color: '#658f9b',
      backgroundColor: 'transparent',
      textTransform: 'none',
      borderBottom: '5px solid #f7f8f5',
      borderRadius: 0,
      paddingLeft: 0,
      paddingRight: 0,
      marginLeft: 10,
      marginRight: 10,
    },
    buttonActive: {
      borderBottom: '5px solid #00b38e',
      color: '#02475b',
    },
    searchList: {
      paddingBottom: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 14,
      },
      '& >div': {
        [theme.breakpoints.down('xs')]: {
          marginLeft: -6,
          marginRight: -6,
          width: 'calc(100% + 12px)',
        },
        '& >div': {
          [theme.breakpoints.down('xs')]: {
            padding: '6px !important',
          },
        },
      },
    },
  };
});

export const PossibleSpecialitiesAndDoctors: React.FC<SpecialitiesProps> = (props) => {
  const classes = useStyles();

  const { matched, speciality, disableFilter } = props;
  const { data, loading } = useQueryWithSkip(SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME, {
    variables: { searchText: '' },
  });

  if (loading) {
    return <LinearProgress variant="query" />;
  }

  if (data && data.SearchDoctorAndSpecialty && !loading) {
    const matchingDoctors = data.SearchDoctorAndSpecialty.doctors.length;
    return (
      <>
        <div className={classes.sectionHeader}>
          <span>Possible Doctors</span>
          <span className={classes.count}>
            {matchingDoctors > 0 && matchingDoctors < 10 ? `0${matchingDoctors}` : matchingDoctors}
          </span>
        </div>
        <div className={classes.searchList}>
          <Grid spacing={2} container>
            {_map(data.SearchDoctorAndSpecialty.doctors, (doctorDetails) => {
              return (
                <Grid item sm={6} key={_uniqueId('doctor_')}>
                  <DoctorCard doctorDetails={doctorDetails} nextAvailability="" />
                </Grid>
              );
            })}
          </Grid>
        </div>
        <Specialities
          keyword=""
          matched={matched}
          speciality={speciality}
          disableFilter={disableFilter}
          subHeading="Possible Specialities"
          // filteredSpecialties={[]}
        />
      </>
    );
  } else {
    return <></>;
  }
};
