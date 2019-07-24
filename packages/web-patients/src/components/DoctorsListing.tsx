import { Theme, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState } from 'react';
import { DoctorCard } from 'components/DoctorCard';
import { AphButton } from '@aph/web-ui-components';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import _filter from 'lodash/filter';

import { useQueryWithSkip } from 'hooks/apolloHooks';
import { DOCTORS_BY_SPECIALITY } from 'graphql/doctors';
import { SearchObject } from 'components/DoctorsLanding';

const useStyles = makeStyles((theme: Theme) => {
  return {
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
    noDataCard: {
      backgroundColor: 'rgba(255,255,255,0.5)',
      color: '#0087ba',
      fontSize: 14,
      lineHeight: '24px',
      padding: 20,
      borderRadius: 10,
      fontWeight: 600,
      marginTop: 115,
      '& h2': {
        fontSize: 18,
        paddingBottom: 5,
        margin: 0,
        color: '#02475b',
      },
    },
    searchList: {
      paddingBottom: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 14,
      },
      '& >div': {
        [theme.breakpoints.down('xs')]: {
          marginLeft: -8,
          marginRight: -8,
        },
        '& >div': {
          [theme.breakpoints.down('xs')]: {
            padding: '8px !important',
          },
        },
      },
    },
  };
});

interface DoctorsListingProps {
  filter: SearchObject;
  specialityName: string;
}

export const DoctorsListing: React.FC<DoctorsListingProps> = (props) => {
  const classes = useStyles();

  const { filter, specialityName } = props;
  const [selectedFilterOption, setSelectedFilterOption] = useState<string>('all');
  const consultOptions = { all: 'All Consults', online: 'Online Consult', clinic: 'Clinic Visit' };

  const apiVairables = {
    specialty: specialityName,
    city: filter.cityName,
    experience: filter.experience,
    availability: filter.availability,
    gender: filter.gender,
    language: filter.language,
  };

  const { data, loading, error } = useQueryWithSkip(DOCTORS_BY_SPECIALITY, {
    variables: { filterInput: apiVairables },
  });

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error....</div>;
  }

  let doctorsList = [];

  const consultErrorMessage = () => {
    const selectedConsultName =
      selectedFilterOption === 'online' ? 'Online Consultation' : ' Clinic Visit';
    const suggestedConsultName =
      selectedFilterOption === 'online' ? 'Clinic Visit' : ' Online Consultation';
    const noConsultFoundError = `There is no ${specialityName} available for ${selectedConsultName}. Please try
    ${suggestedConsultName}`;
    const noDoctorFoundError = `There is no ${specialityName} available to match your filters. Please try again with
    different filters.`;

    return (
      <Grid container spacing={2} justify="center">
        <Grid item sm={12} md={6} key={_uniqueId('consultGrid_')}>
          <div className={classes.noDataCard}>
            <h2>Uh oh! :(</h2>
            {data && data.getSpecialtyDoctorsWithFilters.doctors.length > 0
              ? noConsultFoundError
              : noDoctorFoundError}
          </div>
        </Grid>
      </Grid>
    );
  };

  if (data && data.getSpecialtyDoctorsWithFilters.doctors.length > 0) {
    doctorsList =
      selectedFilterOption === 'all'
        ? data.getSpecialtyDoctorsWithFilters.doctors
        : _filter(data.getSpecialtyDoctorsWithFilters.doctors, (doctors) => {
            if (selectedFilterOption === 'online' && doctors.availableForVirtualConsultation) {
              return true;
            } else if (
              selectedFilterOption === 'clinic' &&
              doctors.availableForPhysicalConsultation
            ) {
              return true;
            }
            return false;
          });
  }

  return (
    <>
      <Typography variant="h2">Okay!</Typography>
      <div className={classes.pageHeader}>
        <div>Here are our best {specialityName}</div>
        <div className={classes.filterSection}>
          {_map(consultOptions, (consultName, consultType) => {
            return (
              <AphButton
                className={
                  selectedFilterOption === consultType
                    ? `${classes.filterButton} ${classes.buttonActive}`
                    : `${classes.filterButton}`
                }
                onClick={(e) => {
                  setSelectedFilterOption(e.currentTarget.value);
                }}
                value={consultType}
                key={_uniqueId('cbutton_')}
              >
                {consultName}
              </AphButton>
            );
          })}
        </div>
      </div>

      {doctorsList.length > 0 ? (
        <div className={classes.searchList}>
          <Grid container spacing={2}>
            {_map(doctorsList, (doctorDetails) => {
              return (
                <Grid item xs={12} sm={12} md={12} lg={6} key={_uniqueId('consultGrid_')}>
                  <DoctorCard doctorDetails={doctorDetails} key={_uniqueId('dcListing_')} />
                </Grid>
              );
            })}
          </Grid>
        </div>
      ) : (
        consultErrorMessage()
      )}
    </>
  );
};
