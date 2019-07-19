import { Theme, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { DoctorCard } from './doctorCard';
import { AphButton } from '@aph/web-ui-components';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';

import { useQueryWithSkip } from 'hooks/apolloHooks';
import { FILTER_DOCTORS } from 'graphql/doctors';
import { SearchObject } from 'components/DoctorsLanding';

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
  };
});

interface DoctorsListingProps {
  filter: SearchObject;
}

export const DoctorsListing: React.FC<DoctorsListingProps> = (props) => {
  const classes = useStyles();

  const { filter } = props;

  const apiVairables = {
    specialty: filter.searchKeyword,
    city: filter.cityName,
    experience: filter.experience,
    availability: filter.availability,
    gender: filter.gender,
    language: filter.language,
  };

  const { data, loading, error } = useQueryWithSkip(FILTER_DOCTORS, {
    variables: { filterInput: apiVairables },
  });

  console.log('apivars.....', apiVairables);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error! {error.message}</div>;
  }

  return (
    <>
      <Typography variant="h2">Okay!</Typography>
      <div className={classes.pageHeader}>
        <div>Here are our best General Physicians</div>
        <div className={classes.filterSection}>
          <AphButton className={`${classes.filterButton} ${classes.buttonActive}`}>
            All Consults
          </AphButton>
          <AphButton className={classes.filterButton}>Online Consult</AphButton>
          <AphButton className={classes.filterButton}>Clinic Visit</AphButton>
        </div>
      </div>

      <Grid container spacing={2}>
        <Grid item sm={12} md={6}>
          {_map(data.getSpecialtyDoctorsWithFilters.doctors, (doctorDetails) => {
            return <DoctorCard doctorDetails={doctorDetails} key={_uniqueId('dcListing_')} />;
          })}
        </Grid>
      </Grid>
    </>
  );
};
