import { BottomNavigation, Theme, Grid } from '@material-ui/core';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { ManageProfile } from 'components/ManageProfile';
import React, { useState, useEffect } from 'react';
import { DoctorsFilter } from 'components/DoctorsFilter';
import { PastSearches } from 'components/PastSearches';
import { Specialities } from 'components/Specialities';
import { DoctorCard } from 'components/DoctorCard';
import { DoctorsListing } from 'components/DoctorsListing';
import { PossibleSpecialitiesAndDoctors } from 'components/PossibleSpecialitiesAndDoctors';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

import { useQueryWithSkip } from 'hooks/apolloHooks';
import { SEARCH_DOCTORS_AND_SPECIALITY } from 'graphql/doctors';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
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
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    doctorListingSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: 20,
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      paddingLeft: 20,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingRight: 20,
        paddingTop: 14,
      },
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        paddingBottom: 16,
        marginBottom: 0,
      },
    },
    count: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 5,
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
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
          width: 'calc(100% + 16px)',
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

export interface SearchObject {
  searchKeyword: string;
  cityName: string[] | null;
  experience: string[] | null;
  availability: string[] | null;
  fees: string[] | null;
  gender: string[] | null;
  language: string[] | null;
}

const searchObject = {
  searchKeyword: '',
  cityName: [],
  experience: [],
  availability: [],
  fees: [],
  gender: [],
  language: [],
};

export const DoctorsLanding: React.FC = (props) => {
  const classes = useStyles();
  const [filterOptions, setFilterOptions] = useState<SearchObject>(searchObject);

  const [matchingSpecialities, setMatchingSpecialities] = useState<number>(0);
  const [specialitySelected, setSpecialitySelected] = useState<string>('');
  const [disableFilters, setDisableFilters] = useState<boolean>(true);
  const [showSearchAndPastSearch, setShowSearchAndPastSearch] = useState<boolean>(true);

  let showError = false,
    matchingDoctorsFound = 0,
    matchingSpecialitesFound = matchingSpecialities;

  useEffect(() => {
    if (specialitySelected.length > 0) {
      setFilterOptions({
        searchKeyword: specialitySelected,
        cityName: [],
        experience: [],
        availability: [],
        fees: [],
        gender: [],
        language: [],
      });
      setShowSearchAndPastSearch(false);
    }
  }, [specialitySelected]);

  const { data, loading } = useQueryWithSkip(SEARCH_DOCTORS_AND_SPECIALITY, {
    variables: { searchText: filterOptions.searchKeyword },
  });

  if (data && data.SearchDoctorAndSpecialty && !loading) {
    matchingDoctorsFound = data.SearchDoctorAndSpecialty.doctors.length;
    matchingSpecialitesFound = data.SearchDoctorAndSpecialty.specialties.length;
  }

  if (
    !loading &&
    matchingDoctorsFound === 0 &&
    matchingSpecialitesFound === 0 &&
    filterOptions.searchKeyword.length > 0 &&
    specialitySelected.length === 0
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
          <div className={classes.breadcrumbs}>
            <Link to={clientRoutes.welcome()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            Doctors / Specialities
          </div>
          <div className={classes.doctorListingSection}>
            <DoctorsFilter
              handleFilterOptions={(filterOptions) => setFilterOptions(filterOptions)}
              existingFilters={filterOptions}
              disableFilters={disableFilters}
              showError={showError}
              showNormal={(showSearchAndPastSearch) => {
                setShowSearchAndPastSearch(showSearchAndPastSearch);
              }}
              emptySpeciality={(specialitySelected) => setSpecialitySelected(specialitySelected)}
              manageFilter={(disableFilters) => {
                setDisableFilters(disableFilters);
              }}
            />

            <div className={classes.searchSection}>
              {filterOptions.searchKeyword.length <= 0 &&
              specialitySelected.length === 0 &&
              showSearchAndPastSearch ? (
                <>
                  <div className={classes.sectionHeader}>Your Past Searches</div>
                  <PastSearches
                    speciality={(specialitySelected) => setSpecialitySelected(specialitySelected)}
                    disableFilter={(disableFilters) => {
                      setDisableFilters(disableFilters);
                    }}
                  />
                </>
              ) : null}

              {specialitySelected.length > 0 ? (
                <DoctorsListing filter={filterOptions} specialityName={specialitySelected} />
              ) : (
                <>
                  {matchingDoctorsFound > 0 || matchingSpecialitesFound > 0 ? (
                    <>
                      {data &&
                      data.SearchDoctorAndSpecialty &&
                      filterOptions.searchKeyword.length > 0 &&
                      matchingDoctorsFound > 0 &&
                      showSearchAndPastSearch ? (
                        <>
                          <div className={classes.sectionHeader}>
                            <span>Matching Doctors</span>
                            <span className={classes.count}>
                              {matchingDoctorsFound > 0 && matchingDoctorsFound < 10
                                ? `0${matchingDoctorsFound}`
                                : matchingDoctorsFound}
                            </span>
                          </div>
                          <div className={classes.searchList}>
                            <Grid spacing={2} container>
                              {_map(data.SearchDoctorAndSpecialty.doctors, (doctorDetails) => {
                                return (
                                  <Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={6}
                                    key={_uniqueId('doctor_')}
                                  >
                                    <DoctorCard doctorDetails={doctorDetails} />
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </div>
                        </>
                      ) : null}
                      <Specialities
                        keyword={filterOptions.searchKeyword}
                        matched={(matchingSpecialities) =>
                          setMatchingSpecialities(matchingSpecialities)
                        }
                        speciality={(specialitySelected) =>
                          setSpecialitySelected(specialitySelected)
                        }
                        disableFilter={(disableFilters) => {
                          setDisableFilters(disableFilters);
                        }}
                        subHeading={
                          filterOptions.searchKeyword !== '' && showSearchAndPastSearch
                            ? 'Matching Specialities'
                            : 'Specialities'
                        }
                      />
                    </>
                  ) : (
                    <PossibleSpecialitiesAndDoctors
                      keyword={filterOptions.searchKeyword}
                      matched={(matchingSpecialities) =>
                        setMatchingSpecialities(matchingSpecialities)
                      }
                      speciality={(specialitySelected) => setSpecialitySelected(specialitySelected)}
                      disableFilter={(disableFilters) => {
                        setDisableFilters(disableFilters);
                      }}
                      subHeading=""
                    />
                  )}
                </>
              )}
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
