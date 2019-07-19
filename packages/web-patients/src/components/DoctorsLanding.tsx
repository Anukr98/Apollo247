import { BottomNavigation, Theme, Grid } from '@material-ui/core';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { ManageProfile } from 'components/ManageProfile';
import React, { useState, useEffect } from 'react';
import { DoctorsFilter } from 'components/DoctorsFilter';
import { PastSearches } from 'components/PastSearches';
import { Specialities } from 'components/Specialities';
import { DoctorCard } from './doctorCard';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';

import { useQueryWithSkip } from 'hooks/apolloHooks';
import { SEARCH_DOCTORS_AND_SPECIALITY } from 'graphql/doctors';

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
  };
});

export interface SearchObject {
  searchKeyword: string;
  cityName: string | null;
  experience: string | null;
  availability: string | null;
  fees: string | null;
  gender: string | null;
  language: string | null;
}

const searchObject = {
  searchKeyword: '',
  cityName: '',
  experience: '',
  availability: '',
  fees: '',
  gender: '',
  language: '',
};

export const DoctorsLanding: React.FC = (props) => {
  const classes = useStyles();
  const [filterOptions, setFilterOptions] = useState<SearchObject>(searchObject);

  const [matchingSpecialities, setMatchingSpecialities] = useState<number>(0);
  const [specialitySelected, setSpecialitySelected] = useState<string>('');
  const [disableFilters, setDisableFilters] = useState<boolean>(true);

  let showError = false;
  let matchingDoctors = 0;

  useEffect(() => {
    if (specialitySelected.length > 0) {
      setFilterOptions({
        searchKeyword: specialitySelected,
        cityName: '',
        experience: '',
        availability: '',
        fees: '',
        gender: '',
        language: '',
      });
    }
  }, [specialitySelected]);

  const { data, loading } = useQueryWithSkip(SEARCH_DOCTORS_AND_SPECIALITY, {
    variables: { searchText: filterOptions.searchKeyword },
  });

  if (data && data.SearchDoctorAndSpecialty && !loading)
    matchingDoctors = data.SearchDoctorAndSpecialty.doctors.length;

  if (
    !loading &&
    matchingDoctors === 0 &&
    matchingSpecialities === 0 &&
    filterOptions.searchKeyword.length > 0
  )
    showError = true;

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.breadcrumbs}>Doctors / Specialities</div>
          <div className={classes.doctorListingSection}>
            <DoctorsFilter
              handleFilterOptions={(filterOptions) => setFilterOptions(filterOptions)}
              existingFilters={filterOptions}
              disableFilters={disableFilters}
              showError={showError}
            />

            <div className={classes.searchSection}>
              {filterOptions.searchKeyword.length <= 0 ? (
                <>
                  <div className={classes.sectionHeader}>Your Past Searches</div>
                  <PastSearches />
                </>
              ) : null}

              {data && data.SearchDoctorAndSpecialty && filterOptions.searchKeyword.length > 0 ? (
                <>
                  <div className={classes.sectionHeader}>
                    <span>Matching Doctors</span>
                    <span className={classes.count}>
                      {matchingDoctors > 0 && matchingDoctors < 10
                        ? `0${matchingDoctors}`
                        : matchingDoctors}
                    </span>
                  </div>
                  <Grid spacing={2} container>
                    {_map(data.SearchDoctorAndSpecialty.doctors, (doctorDetails) => {
                      return (
                        <Grid item sm={6} key={_uniqueId('doctor_')}>
                          <DoctorCard doctorDetails={doctorDetails} />
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              ) : null}

              <div className={classes.sectionHeader}>
                <span>
                  {filterOptions.searchKeyword !== '' ? 'Matching Specialities' : 'Specialities'}
                </span>
                <span className={classes.count}>
                  {filterOptions.searchKeyword !== ''
                    ? matchingSpecialities > 0 && matchingSpecialities < 10
                      ? `0${matchingSpecialities}`
                      : matchingSpecialities
                    : ''}
                </span>
              </div>
              <Specialities
                keyword={filterOptions.searchKeyword}
                matched={(matchingSpecialities) => setMatchingSpecialities(matchingSpecialities)}
                speciality={(specialitySelected) => setSpecialitySelected(specialitySelected)}
                disableFilter={(disableFilters) => {
                  setDisableFilters(disableFilters);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation showLabels className={classes.bottomMenuRoot}>
        <BottomNavigationAction
          label="Consult Room"
          icon={<img src={require('images/ic_consultroom.svg')} />}
          classes={{
            root: classes.labelRoot,
            label: classes.iconLabel,
            selected: classes.iconSelected,
          }}
        />
        <BottomNavigationAction
          label="Health Records"
          icon={<img src={require('images/ic_myhealth.svg')} />}
          classes={{
            root: classes.labelRoot,
            label: classes.iconLabel,
            selected: classes.iconSelected,
          }}
        />
        <BottomNavigationAction
          label="Tests & Medicines"
          icon={<img src={require('images/ic_orders.svg')} />}
          classes={{
            root: classes.labelRoot,
            label: classes.iconLabel,
            selected: classes.iconSelected,
          }}
        />
        <BottomNavigationAction
          label="My Account"
          icon={<img src={require('images/ic_account_dark.svg')} />}
          classes={{
            root: classes.labelRoot,
            label: classes.iconLabel,
            selected: classes.iconSelected,
          }}
        />
      </BottomNavigation>
      <ManageProfile />
    </div>
  );
};
