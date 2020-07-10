import { Theme, Grid, CircularProgress, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState, useEffect } from 'react';
import { DoctorsFilter } from 'components/DoctorsFilter';
import { PastSearches } from 'components/PastSearches';
import { Specialties } from 'components/Specialties';
import { DoctorCard } from 'components/DoctorCard';
import { DoctorsListing } from 'components/DoctorsListing';
import { SearchObject } from 'components/DoctorsFilter';
// import { useQueryWithSkip } from 'hooks/apolloHooks';
import { SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME } from 'graphql/doctors';
import Scrollbars from 'react-custom-scrollbars';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { NavigationBottom } from 'components/NavigationBottom';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { AphButton } from '@aph/web-ui-components';
import {
  SearchDoctorAndSpecialtyByNameVariables,
  SearchDoctorAndSpecialtyByName,
} from 'graphql/types/SearchDoctorAndSpecialtyByName';
import _find from 'lodash/find';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import { MascotWithMessage } from './MascotWithMessage';
import { LocationContext } from './LocationProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { useApolloClient } from 'react-apollo-hooks';
import { useLocationDetails } from 'components/LocationProvider';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from '../helpers/onePrimaryUser';
import { gtmTracking } from '../gtmTracking';
import { BottomLinks } from 'components/BottomLinks';
import { useParams } from 'hooks/routerHooks';
import { GET_ALL_SPECIALITIES } from 'graphql/specialities';
import { History } from 'history';
import { readableParam } from 'helpers/commonHelpers';
import { MetaTagsComp } from 'MetaTagsComp';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 10,
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        zIndex: 99,
        width: '100%',
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
        padding: '20px 3px 20px 20px',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingRight: 3,
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
      marginRight: 20,
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
    },
    customScroll: {
      paddingLeft: 20,
      paddingRight: 17,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 14,
      },
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
    filterBtn: {
      boxShadow: 'none',
      padding: 0,
      minWidth: 'auto',
      marginLeft: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    hideMascot: {
      [theme.breakpoints.down('xs')]: {
        visibility: 'hidden',
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
  };
});

const searchObject: SearchObject = {
  searchKeyword: '',
  cityName: [],
  experience: [],
  availability: [],
  fees: [],
  gender: [],
  language: [],
  dateSelected: '',
  specialtyName: '',
  prakticeSpecialties: '',
};
interface DoctorsLandingProps {
  history: History;
}

export const DoctorsLanding: React.FC<DoctorsLandingProps> = (props) => {
  const classes = useStyles({});
  const {
    currentPincode,
    currentLong,
    currentLat,
    getCurrentLocationPincode,
  } = useLocationDetails();
  const params = useParams<{
    specialty: string;
  }>();

  useEffect(() => {
    if (params && params.specialty) {
      const decoded = decodeURIComponent(params.specialty);
      const specialityName = readableParam(decoded);
      apolloClient
        .query({
          query: GET_ALL_SPECIALITIES,
          variables: {},
          fetchPolicy: 'no-cache',
        })
        .then((response) => {
          response.data &&
            response.data.getAllSpecialties &&
            response.data.getAllSpecialties.map((specialty: any) => {
              if (specialty && specialty.name && specialty.name.toLowerCase() === specialityName) {
                setSpecialtyId(specialty.id);
                setSpecialitySelected(specialty.name);
              }
            });
        });
    }
  }, []);

  useEffect(() => {
    if (!params.specialty) {
      setSpecialitySelected('');
      setFilterOptions(searchObject);
      setDisableFilters(true);
      setShowSearchAndPastSearch(true);
    }
  }, [params.specialty]);

  if (!currentPincode && currentLat && currentLong) {
    getCurrentLocationPincode && getCurrentLocationPincode(currentLat, currentLong);
  }

  const [filterOptions, setFilterOptions] = useState<SearchObject>(searchObject);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [failedPopupOpened, setIsFailedPopupOpened] = React.useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const urlParams = new URLSearchParams(window.location.search);
  const failedStatus = urlParams.get('status') ? String(urlParams.get('status')) : null;
  const prakticeSDKSpecialties = localStorage.getItem('symptomTracker');
  const [matchingSpecialities, setMatchingSpecialities] = useState<number>(0);
  const [specialitySelected, setSpecialitySelected] = useState<string>('');
  const [disableFilters, setDisableFilters] = useState<boolean>(true);
  const [specialtyId, setSpecialtyId] = useState<string>('');
  const [showSearchAndPastSearch, setShowSearchAndPastSearch] = useState<boolean>(true);
  const [showResponsiveFilter, setShowResponsiveFilter] = useState<boolean>(false);
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:900px)');
  const isLargeScreen = useMediaQuery('(min-width:901px)');
  const apolloClient = useApolloClient();
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  let showError = false;

  useEffect(() => {
    if (filterOptions.searchKeyword.length > 2 && specialitySelected.length === 0) {
      setLoading(true);
      apolloClient
        .query<SearchDoctorAndSpecialtyByName, SearchDoctorAndSpecialtyByNameVariables>({
          query: SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME,
          variables: {
            city: '',
            searchText: filterOptions.searchKeyword,
            patientId: currentPatient ? currentPatient.id : '',
            pincode: currentPincode ? currentPincode : localStorage.getItem('currentPincode') || '',
          },
          fetchPolicy: 'no-cache',
        })
        .then((response) => {
          setData(response.data);
          setLoading(false);
        });
    }
  }, [filterOptions.searchKeyword, specialitySelected, currentPincode]);

  useEffect(() => {
    if (specialitySelected.length > 0) {
      const specialityName = specialitySelected.split('_');
      setFilterOptions({
        searchKeyword: specialityName[0],
        specialtyName: specialityName[0], // this is used to disable filter if specialty selected and changed.
        cityName: [],
        experience: [],
        availability: [],
        fees: [],
        gender: [],
        language: [],
        dateSelected: '',
        prakticeSpecialties: '',
      });
      setShowSearchAndPastSearch(false);

      /**Gtm code start start */
      gtmTracking({
        category: 'Consultations',
        action: specialitySelected,
        label: 'Listing Page Viewed',
      });
      /**Gtm code start end */
    }
  }, [specialitySelected]);

  useEffect(() => {
    if (failedStatus && failedStatus === 'failed' && !failedPopupOpened) {
      setIsPopoverOpen(true);
      setIsFailedPopupOpened(true);
    }
  }, [failedStatus, failedPopupOpened]);

  // const { data, loading } = useQueryWithSkip<
  //   SearchDoctorAndSpecialtyByName,
  //   SearchDoctorAndSpecialtyByNameVariables
  // >(SEARCH_DOCTORS_AND_SPECIALITY_BY_NAME, {
  //   variables: {
  //     searchText: filterOptions.searchKeyword,
  //     patientId: currentPatient ? currentPatient.id : '',
  //   },
  //   fetchPolicy: 'no-cache',
  // });

  const specialityNames = specialitySelected.length > 0 ? specialitySelected.split('_') : '';

  // console.log(specialityNames, '----------------------');

  /*
  if (data && data.SearchDoctorAndSpecialtyByName) {
    // matchingDoctorsFound = data.SearchDoctorAndSpecialtyByName.doctors.length;
    otherDoctorsFound = data.SearchDoctorAndSpecialtyByName.otherDoctors
      ? data.SearchDoctorAndSpecialtyByName.otherDoctors.length
      : 0;
    matchingSpecialitesFound = data.SearchDoctorAndSpecialtyByName.specialties.length;
    derivedSpecialites = data.SearchDoctorAndSpecialtyByName.specialties;
    derivedSpecialityId = derivedSpecialites.length > 0 ? derivedSpecialites[0].id : '';
    doctorsNextAvailability = data.SearchDoctorAndSpecialtyByName.doctorsNextAvailability;
    otherDoctorsNextAvailability = data.SearchDoctorAndSpecialtyByName.otherDoctorsNextAvailability;
  }*/

  // let derivedSpecialityId = '';
  const matchingDoctorsFound =
    data && data.SearchDoctorAndSpecialtyByName && data.SearchDoctorAndSpecialtyByName.doctors
      ? data.SearchDoctorAndSpecialtyByName.doctors.length
      : 0;
  const matchingDoctorsList =
    data && data.SearchDoctorAndSpecialtyByName && data.SearchDoctorAndSpecialtyByName.doctors
      ? data.SearchDoctorAndSpecialtyByName.doctors
      : [];
  const otherDoctorsFound =
    data && data.SearchDoctorAndSpecialtyByName && data.SearchDoctorAndSpecialtyByName.otherDoctors
      ? data.SearchDoctorAndSpecialtyByName.otherDoctors.length
      : 0;
  const matchingSpecialitesFound =
    data && data.SearchDoctorAndSpecialtyByName && data.SearchDoctorAndSpecialtyByName.specialties
      ? data.SearchDoctorAndSpecialtyByName.specialties.length
      : 0;
  // const derivedSpecialites =
  //   data && data.SearchDoctorAndSpecialtyByName && data.SearchDoctorAndSpecialtyByName.specialties
  //     ? data.SearchDoctorAndSpecialtyByName.specialties
  //     : [];

  // if (derivedSpecialites && derivedSpecialites.length > 0) {
  //   const derivedSpeciality = derivedSpecialites[0];
  //   derivedSpecialityId = derivedSpeciality && derivedSpeciality.id ? derivedSpeciality.id : '';
  // }
  // console.log(derivedSpecialites, 'dervied specialities.....');
  // const derivedSpecialityId = '';
  // derivedSpecialites.length > 0 && derivedSpecialites[0] && derivedSpecialites[0].id
  //   ? derivedSpecialites[0].id
  //   : '';
  const doctorsNextAvailability =
    data &&
    data.SearchDoctorAndSpecialtyByName &&
    data.SearchDoctorAndSpecialtyByName.doctorsNextAvailability
      ? data.SearchDoctorAndSpecialtyByName.doctorsNextAvailability
      : [];
  const otherDoctors =
    data && data.SearchDoctorAndSpecialtyByName && data.SearchDoctorAndSpecialtyByName.otherDoctors
      ? data.SearchDoctorAndSpecialtyByName.otherDoctors
      : [];
  const otherDoctorsNextAvailability =
    data &&
    data.SearchDoctorAndSpecialtyByName &&
    data.SearchDoctorAndSpecialtyByName.otherDoctorsNextAvailability
      ? data.SearchDoctorAndSpecialtyByName.otherDoctorsNextAvailability
      : [];
  const possibleMatches =
    data &&
    data.SearchDoctorAndSpecialtyByName &&
    data.SearchDoctorAndSpecialtyByName.possibleMatches &&
    data.SearchDoctorAndSpecialtyByName.possibleMatches.doctors
      ? data.SearchDoctorAndSpecialtyByName.possibleMatches.doctors
      : [];
  const possibleMatchesNextAvailability =
    data &&
    data.SearchDoctorAndSpecialtyByName &&
    data.SearchDoctorAndSpecialtyByName.possibleMatches &&
    data.SearchDoctorAndSpecialtyByName.possibleMatches.doctors &&
    data.SearchDoctorAndSpecialtyByName.possibleMatches.doctorsNextAvailability
      ? data.SearchDoctorAndSpecialtyByName.possibleMatches.doctorsNextAvailability
      : [];
  const onePrimaryUser = hasOnePrimaryUser();
  // console.log('speciality id selected', specialtyId);

  if (
    !loading &&
    matchingDoctorsFound === 0 &&
    matchingSpecialitesFound === 0 &&
    filterOptions.searchKeyword.length > 0 &&
    specialitySelected.length === 0
  )
    showError = true;

  const metaTagProps = {
    title: 'Online Doctor Consultation 24|7 - Book Doctor Appointments Online - Apollo 247',
    description:
      'Online doctor consultation at Apollo 247. Book doctor appointments online in just a few clicks. Get all your need in one place at Apollo 247 - your one-stop solution for all medical needs.',
    canonicalLink: window && window.location && window.location.href,
  };
  return (
    <div className={classes.root}>
      <MetaTagsComp {...metaTagProps} />
      <LocationContext.Consumer>
        {() => (
          <>
            <Header />
            <div className={classes.container}>
              <div className={classes.doctorListingPage}>
                <div className={classes.breadcrumbs}>
                  <a
                    onClick={() => {
                      if (params.specialty) {
                        props.history.push(clientRoutes.doctorsLanding());
                        setSpecialitySelected('');
                        setFilterOptions(searchObject);
                        setDisableFilters(true);
                        setShowSearchAndPastSearch(true);
                      } else {
                        props.history.push(clientRoutes.welcome());
                      }
                      if (localStorage.getItem('symptomTracker')) {
                        localStorage.removeItem('symptomTracker');
                      }
                    }}
                  >
                    <div className={classes.backArrow} title={'Back to home page'}>
                      <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                      <img
                        className={classes.whiteArrow}
                        src={require('images/ic_back_white.svg')}
                      />
                    </div>
                  </a>
                  Doctors / Specialities
                  {specialitySelected.length > 0 ||
                  (prakticeSDKSpecialties && prakticeSDKSpecialties.length > 0) ? (
                    <AphButton
                      className={classes.filterBtn}
                      onClick={() => {
                        setShowResponsiveFilter(true);
                      }}
                    >
                      <img src={require('images/ic_filter.svg')} alt="" />
                    </AphButton>
                  ) : (
                    ''
                  )}
                </div>
                <div className={classes.doctorListingSection}>
                  <DoctorsFilter
                    handleFilterOptions={(filterOptions) => setFilterOptions(filterOptions)}
                    existingFilters={filterOptions}
                    disableFilters={disableFilters || loading}
                    showError={showError}
                    showNormal={(showSearchAndPastSearch) => {
                      setShowSearchAndPastSearch(showSearchAndPastSearch);
                    }}
                    emptySpeciality={(specialitySelected) =>
                      setSpecialitySelected(specialitySelected)
                    }
                    manageFilter={(disableFilters) => {
                      setDisableFilters(disableFilters);
                    }}
                    showResponsiveFilter={showResponsiveFilter}
                    setShowResponsiveFilter={(showResponsiveFilter: boolean) =>
                      setShowResponsiveFilter(showResponsiveFilter)
                    }
                  />
                  <div className={classes.searchSection}>
                    {!loading ? (
                      specialitySelected.length > 0 ||
                      (prakticeSDKSpecialties && prakticeSDKSpecialties.length > 0) ? (
                        <DoctorsListing
                          history={props.history}
                          filter={filterOptions}
                          specialityName={specialityNames[0]}
                          // specialityId={derivedSpecialityId}
                          specialityId={specialtyId}
                          prakticeSDKSpecialties={
                            prakticeSDKSpecialties && prakticeSDKSpecialties.length > 0
                              ? prakticeSDKSpecialties
                              : ''
                          }
                          disableFilter={(disableFilter: boolean) =>
                            setDisableFilters(disableFilter)
                          }
                        />
                      ) : (
                        <Scrollbars
                          autoHide={true}
                          autoHeight
                          autoHeightMax={
                            isMediumScreen
                              ? 'calc(100vh - 240px)'
                              : isLargeScreen
                              ? 'calc(100vh - 195px)'
                              : 'calc(100vh - 170px)'
                          }
                        >
                          <div className={classes.customScroll}>
                            {currentPatient &&
                            currentPatient.id &&
                            filterOptions.searchKeyword.length <= 0 &&
                            specialitySelected.length === 0 &&
                            showSearchAndPastSearch ? (
                              <PastSearches />
                            ) : null}
                            {matchingDoctorsFound > 0 || matchingSpecialitesFound > 0 ? (
                              <>
                                {data &&
                                data.SearchDoctorAndSpecialtyByName &&
                                filterOptions.searchKeyword.length > 0 &&
                                matchingDoctorsFound > 0 &&
                                showSearchAndPastSearch ? (
                                  <>
                                    <div className={classes.sectionHeader}>
                                      <span>Matching Doctors</span>
                                      <span className={classes.count}>
                                        {matchingDoctorsFound > 0
                                          ? matchingDoctorsFound.toString().padStart(2, '0')
                                          : matchingDoctorsFound}
                                      </span>
                                    </div>
                                    <div className={classes.searchList}>
                                      <Grid spacing={2} container>
                                        {_map(matchingDoctorsList, (doctorDetails) => {
                                          const nextAvailability = _find(
                                            doctorsNextAvailability,
                                            (availability) => {
                                              const availabilityDoctorId =
                                                availability && availability.doctorId
                                                  ? availability.doctorId
                                                  : '';
                                              const currentDoctorId =
                                                doctorDetails && doctorDetails.id
                                                  ? doctorDetails.id
                                                  : '';
                                              return availabilityDoctorId === currentDoctorId;
                                            }
                                          );
                                          const nextAvailabilityTime =
                                            nextAvailability && nextAvailability.onlineSlot
                                              ? nextAvailability.onlineSlot
                                              : null;
                                          return (
                                            <Grid
                                              item
                                              xs={12}
                                              sm={12}
                                              md={12}
                                              lg={6}
                                              key={_uniqueId('doctor_')}
                                            >
                                              <DoctorCard
                                                history={props.history}
                                                doctorDetails={doctorDetails}
                                                nextAvailability={nextAvailabilityTime}
                                              />
                                            </Grid>
                                          );
                                        })}
                                      </Grid>
                                    </div>
                                  </>
                                ) : null}

                                {/* show suggested doctors if only one doctor is returned.*/}
                                {matchingDoctorsFound === 1 &&
                                searchObject.searchKeyword.length > 0 ? (
                                  <>
                                    <div className={classes.sectionHeader}>
                                      <span>Other Suggested Doctors</span>
                                      <span className={classes.count}>
                                        {otherDoctorsFound > 0
                                          ? otherDoctorsFound.toString().padStart(2, '0')
                                          : otherDoctorsFound}
                                      </span>
                                    </div>
                                    <div className={classes.searchList}>
                                      <Grid spacing={2} container>
                                        {_map(otherDoctors, (doctorDetails) => {
                                          const nextAvailability = _find(
                                            otherDoctorsNextAvailability,
                                            (availability) => {
                                              const availabilityDoctorId =
                                                availability && availability.doctorId
                                                  ? availability.doctorId
                                                  : '';
                                              const currentDoctorId =
                                                doctorDetails && doctorDetails.id
                                                  ? doctorDetails.id
                                                  : '';
                                              return availabilityDoctorId === currentDoctorId;
                                            }
                                          );
                                          const nextAvailabilityTime =
                                            nextAvailability && nextAvailability.onlineSlot
                                              ? nextAvailability.onlineSlot
                                              : null;
                                          return (
                                            <Grid
                                              item
                                              xs={12}
                                              sm={12}
                                              md={12}
                                              lg={6}
                                              key={_uniqueId('doctor_')}
                                            >
                                              <DoctorCard
                                                history={props.history}
                                                doctorDetails={doctorDetails}
                                                nextAvailability={nextAvailabilityTime}
                                              />
                                            </Grid>
                                          );
                                        })}
                                      </Grid>
                                    </div>
                                  </>
                                ) : (
                                  <Specialties selectedCity="" />
                                )}
                              </>
                            ) : (
                              <>
                                {possibleMatches.length > 0 &&
                                filterOptions.searchKeyword.length > 0 ? (
                                  <>
                                    <div className={classes.sectionHeader}>
                                      <span>Possible Doctors</span>
                                      <span className={classes.count}>
                                        {possibleMatches.length > 0
                                          ? possibleMatches.length.toString().padStart(2, '0')
                                          : '0'}
                                      </span>
                                    </div>
                                    <div className={classes.searchList}>
                                      <Grid spacing={2} container>
                                        {_map(possibleMatches, (doctorDetails) => {
                                          const nextAvailability = _find(
                                            possibleMatchesNextAvailability,
                                            (availability) => {
                                              const availabilityDoctorId =
                                                availability && availability.doctorId
                                                  ? availability.doctorId
                                                  : '';
                                              const currentDoctorId =
                                                doctorDetails && doctorDetails.id
                                                  ? doctorDetails.id
                                                  : '';
                                              return availabilityDoctorId === currentDoctorId;
                                            }
                                          );
                                          const nextAvailabilityTime =
                                            nextAvailability && nextAvailability.onlineSlot
                                              ? nextAvailability.onlineSlot
                                              : null;
                                          return (
                                            <Grid
                                              item
                                              xs={12}
                                              sm={12}
                                              md={12}
                                              lg={6}
                                              key={_uniqueId('doctor_')}
                                            >
                                              <DoctorCard
                                                history={props.history}
                                                doctorDetails={doctorDetails}
                                                nextAvailability={nextAvailabilityTime}
                                              />
                                            </Grid>
                                          );
                                        })}
                                      </Grid>
                                    </div>
                                  </>
                                ) : null}

                                {/* {data &&
                                data.SearchDoctorAndSpecialtyByName &&
                                data.SearchDoctorAndSpecialtyByName.possibleMatches &&
                                data.SearchDoctorAndSpecialtyByName.possibleMatches.specialties ? (
                                ) : null} */}

                                <>
                                  {/*
                                  <div className={classes.sectionHeader}>
                                    <span>Specialities</span>
                                    {/* <span className={classes.count}>
                                      {data.SearchDoctorAndSpecialtyByName.possibleMatches
                                        .specialties.length > 0
                                        ? data.SearchDoctorAndSpecialtyByName.possibleMatches.specialties.length
                                            .toString()
                                            .padStart(2, '0')
                                        : '0'}
                                    </span>
                                  </div> */}
                                  {/* <Specialities 
                                    keyword=""
                                    matched={(matchingSpecialities) =>
                                      setMatchingSpecialities(matchingSpecialities)
                                    }
                                    speciality={(specialitySelected) =>
                                      setSpecialitySelected(specialitySelected)
                                    }
                                    specialityId={(specialityId: string) =>
                                      setSpecialtyId(specialityId)
                                    }
                                    disableFilter={(disableFilters) => {
                                      setDisableFilters(disableFilters);
                                    }}
                                    subHeading="Specialities"
                                    filteredSpecialties={[]}
                                  />*/}
                                </>
                              </>
                            )}
                          </div>
                        </Scrollbars>
                      )
                    ) : (
                      <div className={classes.circlularProgress}>
                        <CircularProgress />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <NavigationBottom />
            <Popover
              open={isPopoverOpen}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              classes={{ paper: classes.bottomPopover }}
            >
              <MascotWithMessage
                messageTitle="uh oh..:("
                message="Your payment wasn't successful due to bad network connectivity. Please try again."
                closeButtonLabel="OK, GOT IT"
                closeMascot={() => {
                  setIsPopoverOpen(false);
                }}
              />
            </Popover>
            {!onePrimaryUser && (
              <div className={classes.hideMascot}>
                <ManageProfile />
              </div>
            )}
          </>
        )}
      </LocationContext.Consumer>
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
    </div>
  );
};
