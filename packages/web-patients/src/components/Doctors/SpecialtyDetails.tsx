import React, { useEffect, useState } from 'react';
import { Theme, Grid, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Header } from 'components/Header';
import { BottomLinks } from 'components/BottomLinks';
import { AphButton } from '@aph/web-ui-components';
import { Filters } from 'components/Doctors/Filters';
import { InfoCard } from 'components/Doctors/InfoCard';
import { BookBest } from 'components/Doctors/BookBest';
import { FrequentlyQuestions } from 'components/Doctors/FrequentlyQuestions';
import { WhyApollo } from 'components/Doctors/WhyApollo';
import { HowItWorks } from 'components/Doctors/HowItWorks';
import { AddedFilters } from 'components/Doctors/AddedFilters';
import { useApolloClient } from 'react-apollo-hooks';
import { useParams } from 'hooks/routerHooks';
import { GET_DOCTORS_BY_SPECIALITY_AND_FILTERS } from 'graphql/doctors';
import {
  readableParam,
  DOCTORS_SORT_BY,
  DOCTOR_CATEGORY,
  SearchObject,
} from 'helpers/commonHelpers';
import { useLocationDetails } from 'components/LocationProvider';
import { GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor as docDetails } from 'graphql/types/GetDoctorDetailsById';
import { useAllCurrentPatients } from 'hooks/authHooks';
import moment from 'moment';
import _upperFirst from 'lodash/upperFirst';
import {
  GetDoctorsBySpecialtyAndFilters,
  GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors as DoctorDetails,
} from 'graphql/types/GetDoctorsBySpecialtyAndFilters';
import _find from 'lodash/find';
import { ConsultMode, DoctorType } from 'graphql/types/globalTypes';
import _filter from 'lodash/filter';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 10,
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
    breadcrumbLinks: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 13,
      color: '#007c93',
      fontWeight: 600,
      '& a': {
        paddingLeft: 5,
        paddingRight: 5,
        color: '#fca317',
      },
      '& span': {
        paddingLeft: 5,
        paddingRight: 5,
      },
    },
    pageContent: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: 20,
      },
    },
    leftGroup: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        width: 'calc(100% - 328px)',
        padding: 0,
        paddingRight: 20,
      },
    },
    rightBar: {
      [theme.breakpoints.up('sm')]: {
        width: 328,
      },
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 20,
        fontWeight: 600,
        lineHeight: '25px',
      },
      '& button': {
        marginLeft: 'auto',
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    tabsFilter: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      marginTop: 10,
      '& h4': {
        fontSize: 16,
        fontWeight: 600,
        margin: 0,
        color: '#00a7b9',
      },
    },
    filterButtons: {
      marginLeft: 'auto',
      '& button': {
        boxShadow: 'none',
        fontSize: 12,
        fontWeight: 500,
        color: '#658f9b',
        backgroundColor: 'transparent',
        textTransform: 'none',
        borderBottom: '5px solid transparent',
        borderRadius: 0,
        padding: 10,
      },
    },
    buttonActive: {
      borderBottom: '5px solid #00b38e !important',
      color: '#02475b !important',
    },
    stickyBlock: {
      position: 'sticky',
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
  };
});

interface Range {
  [index: number]: {
    minimum: number;
    maximum: number;
  };
}

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

let availableNow = {};
const convertAvailabilityToDate = (availability: String[], dateSelectedFromFilter: string) => {
  if (availability.length === 0) {
    availableNow = {};
  }
  const availabilityArray: String[] = [];
  const today = moment(new Date())
    .utc()
    .format('YYYY-MM-DD');
  if (availability.length > 0) {
    availability.forEach((value: String) => {
      if (value === 'Now') {
        availableNow = {
          availableNow: moment(new Date())
            .utc()
            .format('YYYY-MM-DD hh:mm'),
        };
      } else if (value === 'Today') {
        availabilityArray.push(today);
      } else if (value === 'Tomorrow') {
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
            .utc()
            .format('YYYY-MM-DD')
        );
      } else if (value === 'Next 3 days') {
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        );
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        );
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
          )
        );
      } else {
        availabilityArray.push(value);
      }
    });
  } else if (dateSelectedFromFilter !== '') {
    const filterDateSelected = moment(dateSelectedFromFilter, 'DD/MM/YYYY').format('YYYY-MM-DD');
    if (filterDateSelected !== '') {
      availabilityArray.push(filterDateSelected);
    }
  }
  return availabilityArray;
};

interface SpecialityProps {
  history: any;
}

export const SpecialtyDetails: React.FC<SpecialityProps> = (props) => {
  const classes = useStyles({});
  const {
    currentPincode,
    currentLong,
    currentLat,
    getCurrentLocationPincode,
  } = useLocationDetails();
  const { currentPatient } = useAllCurrentPatients();
  const params = useParams<{
    specialty: string;
  }>();
  const prakticeSDKSpecialties = localStorage.getItem('symptomTracker');
  const apolloClient = useApolloClient();
  const [data, setData] = useState<GetDoctorsBySpecialtyAndFilters | null>(null);
  const [structuredJSON, setStructuredJSON] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [filter, setFilter] = useState<SearchObject>(searchObject);
  const [filteredDoctorData, setFilteredDoctorData] = useState<DoctorDetails[] | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorDetails[] | null>(null);
  const [isOnlineSelected, setIsOnlineSelected] = useState<boolean>(false);
  const [isPhysicalSelected, setIsPhysicalSelected] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<DOCTORS_SORT_BY>(DOCTORS_SORT_BY.AVAILAIBILITY);
  const [doctorType, setDoctorType] = useState<DOCTOR_CATEGORY>(DOCTOR_CATEGORY.APOLLO);

  const specialtyLen = params.specialty.length;
  const specialtyId = params.specialty.slice(specialtyLen - 36);
  const specialtyName = params.specialty.slice(0, specialtyLen - 36);

  let expRange: Range = [],
    feeRange: Range = [];

  if (filter.experience && filter.experience.length > 0) {
    expRange = filter.experience.map((experience) => {
      const expRangeMinimum = parseInt(experience.split('-')[0], 10);
      const expRangeMaximum = parseInt(experience.split('-')[1], 10);
      return { minimum: expRangeMinimum, maximum: expRangeMaximum };
    });
  } else {
    expRange = [];
  }

  if (filter.fees && filter.fees.length > 0) {
    feeRange = filter.fees.map((fees) => {
      const feeRangeMinimum = parseInt(fees.split('-')[0], 10);
      const feeRangeMaximum = parseInt(fees.split('-')[1], 10);
      return { minimum: feeRangeMinimum, maximum: feeRangeMaximum };
    });
  } else {
    feeRange = [];
  }

  const apiVairables = {
    patientId: currentPatient ? currentPatient.id : '',
    specialty: prakticeSDKSpecialties && prakticeSDKSpecialties.length > 0 ? '' : specialtyId,
    city: filter.cityName,
    experience: expRange,
    availability: convertAvailabilityToDate(filter.availability || [], filter.dateSelected),
    fees: feeRange,
    gender: filter.gender,
    language: filter.language,
    ...availableNow,
    geolocation: {
      latitude: currentLat && currentLat.length > 0 ? parseFloat(currentLat) : 0,
      longitude: currentLong && currentLong.length > 0 ? parseFloat(currentLong) : 0,
    },
    specialtyName:
      prakticeSDKSpecialties && prakticeSDKSpecialties.length > 0
        ? decodeURI(prakticeSDKSpecialties).split(',')
        : [],
    specialtySearchType:
      prakticeSDKSpecialties && prakticeSDKSpecialties.length > 0 ? 'NAME' : 'ID',
    pincode: currentPincode ? currentPincode : localStorage.getItem('currentPincode') || '',
  };

  useEffect(() => {
    setLoading(true);
    apolloClient
      .query({
        query: GET_DOCTORS_BY_SPECIALITY_AND_FILTERS,
        variables: { filterInput: apiVairables },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        let potentialActionSchema: any[] = [];
        if (
          response &&
          response.data &&
          response.data.getDoctorsBySpecialtyAndFilters &&
          response.data.getDoctorsBySpecialtyAndFilters.doctors
        ) {
          const doctors = response.data.getDoctorsBySpecialtyAndFilters.doctors;
          setDoctorData(doctors || []);
          const finalList = getFilteredDoctorList(doctors || []);
          setFilteredDoctorData(finalList);
          doctors.map((doctorDetails: docDetails) => {
            doctorDetails &&
              doctorDetails.fullName &&
              potentialActionSchema.push({
                '@type': 'EntryPoint',
                name: doctorDetails.fullName,
                url: params.specialty
                  ? `${window.location.origin}${clientRoutes.specialtyDoctorDetails(
                      params.specialty,
                      readableParam(doctorDetails.fullName),
                      doctorDetails.id
                    )}`
                  : `${window.location.origin}${clientRoutes.doctorDetails(
                      readableParam(doctorDetails.fullName),
                      doctorDetails.id
                    )}`,
              });
          });
        }
        setStructuredJSON({
          '@context': 'https://schema.org/',
          '@type': 'MedicalSpecialty',
          name: readableParam(specialtyName),
          description: `Find the best ${readableParam(
            specialtyName
          )} doctors & specialists and consult with them instantly on Apollo24|7`,
          potentialAction: {
            '@type': 'ViewAction',
            target: potentialActionSchema,
          },
        });
        setData(response.data);
        setLoading(false);
      });
  }, [currentLat, currentLong, filter]);

  const getFilteredDoctorList = (data: DoctorDetails[]) => {
    return _filter(data, (doctor: DoctorDetails) => {
      if (doctorType === DOCTOR_CATEGORY.APOLLO) {
        return doctor.doctorType !== DoctorType.DOCTOR_CONNECT;
      } else {
        return doctor.doctorType === DoctorType.DOCTOR_CONNECT;
      }
    });
  };

  const getConsultModeDoctorList = (data: DoctorDetails[]) => {
    return _filter(data, (doctor: DoctorDetails) => {
      const consultMode =
        doctor.consultHours &&
        doctor.consultHours.length > 0 &&
        doctor.consultHours[0] &&
        doctor.consultHours[0].consultMode
          ? doctor.consultHours[0].consultMode
          : '';
      if (isOnlineSelected && isPhysicalSelected) {
        return consultMode === ConsultMode.BOTH;
      } else if (isOnlineSelected) {
        return consultMode === ConsultMode.ONLINE;
      } else if (isPhysicalSelected) {
        return consultMode === ConsultMode.PHYSICAL;
      }
      return false;
    });
  };
  useEffect(() => {
    if (doctorData) {
      setLoading(true);
      let filterDoctorsData = doctorData;
      if (isOnlineSelected || isPhysicalSelected) {
        filterDoctorsData = getConsultModeDoctorList(filterDoctorsData);
      }
      if (doctorType) {
        filterDoctorsData = getFilteredDoctorList(filterDoctorsData);
      }
      setFilteredDoctorData(filterDoctorsData);
      setLoading(false);
    }
  }, [isOnlineSelected, isPhysicalSelected, doctorType, doctorData]); // have to add sortBY

  const getDoctorsCount = (data: DoctorDetails[], type: DOCTOR_CATEGORY) => {
    return _filter(data, (doctor: DoctorDetails) => {
      return type === DOCTOR_CATEGORY.PARTNER
        ? doctor.doctorType === DoctorType.DOCTOR_CONNECT
        : doctor.doctorType !== DoctorType.DOCTOR_CONNECT;
    }).length;
  };

  const doctorsNextAvailability =
    data &&
    data.getDoctorsBySpecialtyAndFilters &&
    data.getDoctorsBySpecialtyAndFilters.doctorsNextAvailability
      ? data.getDoctorsBySpecialtyAndFilters.doctorsNextAvailability
      : [];

  const doctorsAvailability =
    data &&
    data.getDoctorsBySpecialtyAndFilters &&
    data.getDoctorsBySpecialtyAndFilters.doctorsAvailability
      ? data.getDoctorsBySpecialtyAndFilters.doctorsAvailability
      : [];

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.breadcrumbs}>
            <Link to={clientRoutes.doctorsLanding()}>
              <div className={classes.backArrow} title={'Back to home page'}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            <div className={classes.breadcrumbLinks}>
              <Link to={clientRoutes.welcome()}>Home</Link>
              <img src={require('images/triangle.svg')} alt="" />
              <Link to={clientRoutes.doctorsLanding()}>Specialty</Link>
              <img src={require('images/triangle.svg')} alt="" />
              <span>{readableParam(specialtyName)}</span>
            </div>
          </div>
          <div className={classes.pageContent}>
            <div className={classes.leftGroup}>
              <div className={classes.sectionHeader}>
                <h3>Book Best Doctors - {_upperFirst(readableParam(specialtyName))}</h3>
                <AphButton>
                  <img src={require('images/ic-share-green.svg')} alt="" />
                </AphButton>
              </div>
              <div className={classes.tabsFilter}>
                <h4>
                  {filteredDoctorData ? filteredDoctorData.length : 0} Doctors found near Madhapur
                </h4>
                <div className={classes.filterButtons}>
                  <AphButton
                    onClick={() => {
                      setDoctorType(DOCTOR_CATEGORY.APOLLO);
                    }}
                    className={doctorType === DOCTOR_CATEGORY.APOLLO ? classes.buttonActive : ''}
                  >
                    Apollo Doctors ({getDoctorsCount(doctorData || [], DOCTOR_CATEGORY.APOLLO)})
                  </AphButton>
                  <AphButton
                    className={doctorType === DOCTOR_CATEGORY.PARTNER ? classes.buttonActive : ''}
                    onClick={() => {
                      setDoctorType(DOCTOR_CATEGORY.PARTNER);
                    }}
                  >
                    Doctor Partners ({getDoctorsCount(doctorData || [], DOCTOR_CATEGORY.PARTNER)})
                  </AphButton>
                </div>
              </div>
              <Filters
                setSortBy={setSortBy}
                sortBy={sortBy}
                isOnlineSelected={isOnlineSelected}
                setIsOnlineSelected={setIsOnlineSelected}
                isPhysicalSelected={isPhysicalSelected}
                setIsPhysicalSelected={setIsPhysicalSelected}
                setFilter={setFilter}
                filter={filter}
              />
              {(filter.language.length > 0 ||
                filter.availability.length > 0 ||
                filter.experience.length > 0 ||
                filter.fees.length > 0 ||
                filter.gender.length > 0) && <AddedFilters filter={filter} />}
              {loading ? (
                <div className={classes.circlularProgress}>
                  <CircularProgress />
                </div>
              ) : filteredDoctorData && filteredDoctorData.length ? (
                <>
                  <Grid container spacing={2}>
                    {filteredDoctorData.map((doctor: DoctorDetails) => {
                      let availableMode = '';
                      let nextAvailabilityString = '';
                      const nextAvailability = _find(doctorsNextAvailability, (availability) => {
                        const availabilityDoctorId =
                          availability && availability.doctorId ? availability.doctorId : '';
                        const currentDoctorId = doctor && doctor.id ? doctor.id : '';
                        return availabilityDoctorId === currentDoctorId;
                      });
                      const availableModes = _find(doctorsAvailability, (availability) => {
                        const availabilityDoctorId =
                          availability && availability.doctorId ? availability.doctorId : '';
                        const currentDoctorId = doctor && doctor.id ? doctor.id : '';
                        return availabilityDoctorId === currentDoctorId;
                      });
                      if (
                        availableModes &&
                        availableModes.availableModes &&
                        availableModes.availableModes.length > 0
                      ) {
                        availableMode = availableModes.availableModes[0];
                      } else {
                        availableMode = 'ONLINE';
                      }
                      if (availableMode === 'ONLINE' || availableMode === 'BOTH') {
                        nextAvailabilityString = nextAvailability && nextAvailability.onlineSlot;
                      } else if (availableMode === 'PHYSICAL') {
                        nextAvailabilityString = nextAvailability && nextAvailability.physicalSlot;
                      }
                      return (
                        <Grid key={doctor.id} item xs={12} sm={12} md={12} lg={6}>
                          <InfoCard doctorInfo={doctor} nextAvailability={nextAvailabilityString} />
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              ) : (
                'no results found'
              )}
              <BookBest />
              <FrequentlyQuestions />
            </div>
            <div className={classes.rightBar}>
              <div className={classes.stickyBlock}>
                <WhyApollo />
                <HowItWorks />
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomLinks />
    </div>
  );
};
