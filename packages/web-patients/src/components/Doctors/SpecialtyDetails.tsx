import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Theme, Grid, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Header } from 'components/Header';
import { BottomLinks } from 'components/BottomLinks';
import { AphButton } from '@aph/web-ui-components';
import { Filters } from 'components/Doctors/Filters';
import { InfoCard } from 'components/Doctors/InfoCard';
import { InfoCardPartner } from 'components/Doctors/InfoCardPartner';
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
  DOCTOR_CATEGORY,
  SearchObject,
  SPECIALTY_DETAIL_LISTING_PAGE_SIZE as PAGE_SIZE,
} from 'helpers/commonHelpers';
import { useLocationDetails } from 'components/LocationProvider';
import { GetDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor as docDetails } from 'graphql/types/GetDoctorDetailsById';
import { useAllCurrentPatients } from 'hooks/authHooks';
import moment from 'moment';
import _upperFirst from 'lodash/upperFirst';
import _merge from 'lodash/merge';
import {
  GetDoctorsBySpecialtyAndFilters,
  GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors as DoctorDetails,
} from 'graphql/types/GetDoctorsBySpecialtyAndFilters';
import _find from 'lodash/find';
import { ConsultMode, DoctorType } from 'graphql/types/globalTypes';
import _filter from 'lodash/filter';
import { MetaTagsComp } from 'MetaTagsComp';
import { GET_ALL_SPECIALITIES } from 'graphql/specialities';
import { NavigationBottom } from 'components/NavigationBottom';
import {
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors as DoctorsType,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties as SpecialtyType,
} from 'graphql/types/SearchDoctorAndSpecialtyByName';
import _lowerCase from 'lodash/lowerCase';
import { gtmTracking } from 'gtmTracking';
import { SpecialtySearch } from 'components/SpecialtySearch';
import { SchemaMarkup } from 'SchemaMarkup';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from 'helpers/onePrimaryUser';
// import Pagination from '@material-ui/lab/Pagination';
import fetchWrapper from 'helpers/fetchWrapper';
let currentPage = 1;
let apolloDoctorCount = 0;
let partnerDoctorCount = 0;
const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pastSearch: {
      padding: '20px 0 0',
      '& h6': {
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    doctorDetails: {},
    doctorListingPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f0f1ec',
        marginTop: -14,
      },
    },
    mHide: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
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
        width: '100%',
        position: 'fixed',
        zIndex: 99,
        top: 0,
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        boxShadow: '0 5px 10px 0 rgba(128, 128, 128, 0.3)',
        margin: 0,
        paddingLeft: 20,
        paddingRight: 50,
        paddingTop: 10,
        minHeight: 58,
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
        marginRight: 10,
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
      [theme.breakpoints.up('sm')]: {
        width: 'calc(100% - 328px)',
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 0,
      },
      '& h1': {
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
        [theme.breakpoints.down('xs')]: {
          position: 'fixed',
          zIndex: 99,
          right: 20,
          top: 18,
        },
      },
    },
    tabsFilter: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      marginTop: 10,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        marginTop: 0,
        display: 'block',
        paddingLeft: 20,
        paddingRight: 20,
      },
      '& h2': {
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
    topSearch: {
      display: 'flex',
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        display: 'block',
        padding: '10px 20px',
      },
    },
    selectCity: {
      width: 165,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 10,
      },
      '& >div:last-child': {
        paddingTop: 3,
        '& >div:first-child': {
          paddingLeft: 30,
        },
      },
    },
    inputSearch: {
      marginLeft: 10,
      flex: 1,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0,
      },
      '& input': {
        paddingLeft: 30,
      },
    },
    inputIcon: {
      position: 'absolute',
      left: 0,
      top: 10,
    },
    menuRoot: {
      backgroundColor: 'transparent !important',
      color: '#000',
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      '&:hover': {
        backgroundColor: 'transparent !important',
      },
    },
    doctorCards: {
      [theme.breakpoints.down('xs')]: {
        padding: '4px 20px 0 20px',
      },
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      padding: 20,
    },
    // pagination: {},
    // paginationUl: {
    //   '& li': {
    //     '& button': {
    //       fontsize: 14,
    //       fontWeight: 700,
    //       color: '#02475b',
    //       '&:hover': {
    //         background: '#00B38E',
    //       },
    //     },
    //   },
    // },
  };
});

interface Range {
  [index: number]: {
    minimum: number;
    maximum: number;
  };
}

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

const SpecialtyDetails: React.FC<SpecialityProps> = (props) => {
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
  const classes = useStyles({});
  const onePrimaryUser = hasOnePrimaryUser();
  const scrollToRef = useRef<HTMLDivElement>(null);
  const { currentPincode, currentLong, currentLat } = useLocationDetails();
  const { currentPatient } = useAllCurrentPatients();
  const params = useParams<{
    city: string;
    specialty: string;
  }>();
  const prakticeSDKSpecialties = localStorage.getItem('symptomTracker');
  const apolloClient = useApolloClient();
  const [data, setData] = useState<GetDoctorsBySpecialtyAndFilters | null>(null);
  const [structuredJSON, setStructuredJSON] = useState(null);
  const [breadcrumbJSON, setBreadcrumbJSON] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [intialLoad, setInitalLoad] = useState<boolean>(true);
  const [filter, setFilter] = useState<SearchObject>(searchObject);
  const [filteredDoctorData, setFilteredDoctorData] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<DoctorDetails[] | null>(null);
  const [isOnlineSelected, setIsOnlineSelected] = useState<boolean>(true);
  const [isPhysicalSelected, setIsPhysicalSelected] = useState<boolean>(true);
  const [doctorType, setDoctorType] = useState<DOCTOR_CATEGORY>(DOCTOR_CATEGORY.APOLLO);
  const [onlyFilteredCount, setOnlyFilteredCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const [specialtyId, setSpecialtyId] = useState<string>('');
  const [specialtyName, setSpecialtyName] = useState<string>('');
  const [locationPopup, setLocationPopup] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>(
    params && params.city ? params.city : ''
  );
  const [searchSpecialty, setSearchSpecialty] = useState<SpecialtyType[] | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchDoctors, setSearchDoctors] = useState<DoctorsType[] | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [slugName, setSlugName] = useState<string>('');
  const [faqData, setFaqData] = useState<any>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!intialLoad) {
      setIsFetching(true);
      apolloClient
        .query({
          query: GET_DOCTORS_BY_SPECIALITY_AND_FILTERS,
          variables: { filterInput: _merge(apiVariables, { pageNo, pageSize: PAGE_SIZE }) },
          fetchPolicy: 'no-cache',
        })
        .then((response) => {
          let potentialActionSchema: any[] = [];
          setStructuredJSON({
            '@context': 'https://schema.org/',
            '@type': 'MedicalSpecialty',
            name: specialtyName,
            description: `Find the best ${specialtyName} doctors & specialists and consult with them instantly on Apollo24|7`,
            potentialAction: {
              '@type': 'ViewAction',
              target: potentialActionSchema,
            },
          });
          setBreadcrumbJSON({
            '@context': 'https://schema.org/',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'HOME',
                item: 'https://www.apollo247.com/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'SPECIALTIES',
                item: 'https://www.apollo247.com/specialties',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: specialtyName,
                item: `https://www.apollo247.com/specialties/${readableParam(specialtyName)}`,
              },
            ],
          });
          if (
            response &&
            response.data &&
            response.data.getDoctorsBySpecialtyAndFilters &&
            response.data.getDoctorsBySpecialtyAndFilters.doctors
          ) {
            const doctors = response.data.getDoctorsBySpecialtyAndFilters.doctors;
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
            const filteredObj = getDoctorObject(doctorData.concat(doctors));
            setDoctorData(doctorData.concat(doctors) || []);
            setOnlyFilteredCount(onlyFilteredCount + doctors.length || 0);
            setFilteredDoctorData(filteredObj);
          }
          currentPage = currentPage + 1;
          const newData: any = {
            getDoctorsBySpecialtyAndFilters: {
              doctors: data['getDoctorsBySpecialtyAndFilters'].doctors.concat(
                response.data['getDoctorsBySpecialtyAndFilters'].doctors
              ),
              doctorsAvailability: data[
                'getDoctorsBySpecialtyAndFilters'
              ].doctorsAvailability.concat(
                response.data['getDoctorsBySpecialtyAndFilters'].doctorsAvailability
              ),
              doctorsNextAvailability: data[
                'getDoctorsBySpecialtyAndFilters'
              ].doctorsNextAvailability.concat(
                response.data['getDoctorsBySpecialtyAndFilters'].doctorsNextAvailability
              ),
            },
          };
          setData(newData);
        })
        .catch((e) => console.log(e))
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [pageNo]);

  const getDoctorObject = (data: any) => {
    const apolloDoctors = data.filter(
      (doctor: DoctorDetails) => doctor.doctorType.toLowerCase() !== 'doctor_connect'
    );
    const otherDoctors = data.filter(
      (doctor: DoctorDetails) => doctor.doctorType.toLowerCase() === 'doctor_connect'
    );
    return {
      APOLLO: apolloDoctors,
      PARTNER: otherDoctors,
    };
  };

  const incrementPageNo = () => setPageNo(currentPage);

  const handleOnScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight * 0.5) {
      if (!isFetching) {
        if (
          doctorType === DOCTOR_CATEGORY.APOLLO &&
          (currentPage - 1) * PAGE_SIZE < apolloDoctorCount + partnerDoctorCount
        ) {
          incrementPageNo();
        }
      }
    }
  }, []);
  useEffect(() => {
    if (scrollRef && scrollRef.current) {
      window.addEventListener('scroll', handleOnScroll);
    }
  }, [scrollRef]);

  /* Gtm code start */
  useEffect(() => {
    if (doctorData && doctorData.length > 0) {
      let ecommItems: any[] = [];
      doctorData.map((doctorDetails: any, ind: number) => {
        doctorDetails &&
          doctorDetails.fullName &&
          ecommItems.push({
            item_name: doctorDetails.fullName,
            item_id: doctorDetails.id,
            item_category: 'Consultations',
            item_category_2: doctorDetails.specialty && doctorDetails.specialty.name,
            item_category_3:
              doctorDetails.doctorHospital &&
              doctorDetails.doctorHospital.length &&
              doctorDetails.doctorHospital[0].facility &&
              doctorDetails.doctorHospital[0].facility.city,
            // 'item_category_4': '', // Future USe
            item_variant: 'Virtual / Physcial',
            index: ind + 1,
            quantity: '1',
          });
      });

      gtmTracking({
        category: 'Consultations',
        action: 'Specialty Page',
        label: 'Specialty Details Page Viewed',
        value: null,
        ecommObj: {
          event: 'view_item_list',
          ecommerce: {
            items: ecommItems,
          },
        },
      });
    }
  }, [doctorData]);
  /* Gtm code end */

  useEffect(() => {
    if (searchKeyword.length > 1) {
      const doctorsSearch = doctorData.filter((doctorDetail: DoctorDetails) => {
        return doctorDetail.fullName.toLowerCase().includes(searchKeyword.toLowerCase());
      });
      setSearchDoctors(doctorsSearch);
    }
  }, [searchKeyword]);

  useEffect(() => {
    if (params && params.specialty) {
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
              if (
                specialty &&
                specialty.name &&
                readableParam(specialty.name) === params.specialty
              ) {
                setSpecialtyId(specialty.id);
                setSpecialtyName(specialty.name);
                setSlugName(specialty.slugName);
              }
            });
        });
    }
  }, [params.specialty]);

  useEffect(() => {
    if (slugName !== '') {
      fetchWrapper
        .get(`${process.env.CMS_BASE_URL}/api/specialty-details/${readableParam(specialtyName)}`, {
          Authorization: process.env.CMS_TOKEN,
        })
        .then((res: any) => {
          if (res && res.data && res.data.success) {
            setFaqData(res && res.data && res.data.data);
          }
        });
    }
  }, [slugName]);

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

  const apiVariables = {
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
    if (specialtyId || specialtyName) {
      scrollToRef &&
        scrollToRef.current &&
        scrollToRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      apolloClient
        .query({
          query: GET_DOCTORS_BY_SPECIALITY_AND_FILTERS,
          variables: { filterInput: _merge(apiVariables, { pageNo: 1, pageSize: PAGE_SIZE }) },
          fetchPolicy: 'no-cache',
        })
        .then((response) => {
          let potentialActionSchema: any[] = [];
          setStructuredJSON({
            '@context': 'https://schema.org/',
            '@type': 'MedicalSpecialty',
            name: specialtyName,
            description: `Find the best ${specialtyName} doctors & specialists and consult with them instantly on Apollo24|7`,
            potentialAction: {
              '@type': 'ViewAction',
              target: potentialActionSchema,
            },
          });
          setBreadcrumbJSON({
            '@context': 'https://schema.org/',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'HOME',
                item: 'https://www.apollo247.com/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'SPECIALTIES',
                item: 'https://www.apollo247.com/specialties',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: specialtyName,
                item: `https://www.apollo247.com/specialties/${readableParam(specialtyName)}`,
              },
            ],
          });
          if (
            response &&
            response.data &&
            response.data.getDoctorsBySpecialtyAndFilters &&
            response.data.getDoctorsBySpecialtyAndFilters.doctors
          ) {
            apolloDoctorCount = response.data.getDoctorsBySpecialtyAndFilters.apolloDoctorCount;
            partnerDoctorCount = response.data.getDoctorsBySpecialtyAndFilters.partnerDoctorCount;
            const doctors = response.data.getDoctorsBySpecialtyAndFilters.doctors;
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
            setDoctorData(doctors || []);
            setOnlyFilteredCount(doctors.length || 0);
            const filteredObj = getDoctorObject(doctors);
            setFilteredDoctorData(filteredObj);
          }
          setData(response.data);
        })
        .catch((e) => console.log(e))
        .finally(() => {
          setLoading(false);
          currentPage = 2;
          setInitalLoad(false);
        });
    }
  }, [currentLat, currentLong, filter, specialtyId, specialtyName]);

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
        return consultMode !== ConsultMode.PHYSICAL;
      } else if (isPhysicalSelected) {
        return consultMode !== ConsultMode.ONLINE;
      }
      return false;
    });
  };
  useEffect(() => {
    if (doctorData) {
      setLoading(true);
      let filterDoctorsData = searchKeyword.length > 1 ? searchDoctors : doctorData;
      if (isOnlineSelected || isPhysicalSelected) {
        filterDoctorsData = getConsultModeDoctorList(filterDoctorsData);
      }
      if (doctorType) {
        filterDoctorsData = getFilteredDoctorList(filterDoctorsData);
      }
      const filteredObj = getDoctorObject(filterDoctorsData);

      setFilteredDoctorData(filteredObj);
      setLoading(false);
    }
  }, [isOnlineSelected, isPhysicalSelected, doctorData, searchKeyword, searchDoctors]);

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

  const metaTagProps = {
    title: (faqData && faqData[0].specialtyMetaTitle) || '',
    description: (faqData && faqData[0].specialtyMetaDescription) || '',
    canonicalLink:
      (faqData && faqData[0].canonicalUrl) || (window && window.location && window.location.href),
  };

  return (
    <div className={classes.root}>
      <MetaTagsComp {...metaTagProps} />

      {structuredJSON && <SchemaMarkup structuredJSON={structuredJSON} />}
      {breadcrumbJSON && <SchemaMarkup structuredJSON={breadcrumbJSON} />}
      <div className={classes.mHide}>
        <Header />
      </div>
      <div className={classes.container} ref={scrollRef}>
        <div className={classes.doctorListingPage}>
          <div className={classes.breadcrumbs} ref={scrollToRef}>
            <Link to={clientRoutes.specialityListing()}>
              <div className={classes.backArrow} title={'Back to home page'}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            {faqData && faqData[0].breadCrumbTitle && (
              <div className={classes.breadcrumbLinks}>
                <Link to={clientRoutes.welcome()}>Home</Link>
                <img src={require('images/triangle.svg')} alt="" />
                <Link to={clientRoutes.specialityListing()}>Specialties</Link>
                <img src={require('images/triangle.svg')} alt="" />
                <span>{faqData && faqData[0].breadCrumbTitle}</span>
              </div>
            )}
          </div>
          <div className={classes.pageContent}>
            <div className={classes.leftGroup}>
              <div className={classes.sectionHeader}>
                <h1>{faqData && faqData[0].specialtyHeading}</h1>
              </div>
              <SpecialtySearch
                setSearchKeyword={setSearchKeyword}
                searchKeyword={searchKeyword}
                selectedCity={selectedCity}
                searchSpecialty={searchSpecialty}
                searchDoctors={searchDoctors}
                searchLoading={searchLoading}
                setLocationPopup={setLocationPopup}
                locationPopup={locationPopup}
                setSelectedCity={setSelectedCity}
              />
              <div className={classes.tabsFilter}>
                <h2>
                  {filteredDoctorData ? filteredDoctorData[doctorType].length : 0} Doctors found
                </h2>
                <div className={classes.filterButtons}>
                  <AphButton
                    onClick={() => {
                      setDoctorType(DOCTOR_CATEGORY.APOLLO);
                    }}
                    className={doctorType === DOCTOR_CATEGORY.APOLLO ? classes.buttonActive : ''}
                  >
                    Apollo Doctors ({apolloDoctorCount})
                  </AphButton>
                  <AphButton
                    className={doctorType === DOCTOR_CATEGORY.PARTNER ? classes.buttonActive : ''}
                    onClick={() => {
                      setDoctorType(DOCTOR_CATEGORY.PARTNER);
                    }}
                  >
                    Doctor Partners ({partnerDoctorCount})
                  </AphButton>
                </div>
              </div>
              <Filters
                isOnlineSelected={isOnlineSelected}
                setIsOnlineSelected={setIsOnlineSelected}
                isPhysicalSelected={isPhysicalSelected}
                setIsPhysicalSelected={setIsPhysicalSelected}
                setFilter={setFilter}
                filter={filter}
                onlyFilteredCount={onlyFilteredCount}
              />
              <div className={classes.doctorCards}>
                {(filter.language.length > 0 ||
                  filter.availability.length > 0 ||
                  filter.experience.length > 0 ||
                  filter.fees.length > 0 ||
                  filter.gender.length > 0) && <AddedFilters filter={filter} />}
                {loading ? (
                  <div className={classes.circlularProgress}>
                    <CircularProgress />
                  </div>
                ) : filteredDoctorData && Object.keys(filteredDoctorData).length > 0 ? (
                  <>
                    <Grid container spacing={2}>
                      {filteredDoctorData[doctorType].map((doctor: DoctorDetails) => {
                        if (doctor && doctor.id) {
                          const nextAvailability = doctorsNextAvailability.find(
                            (nextAvailabilitySlot) => nextAvailabilitySlot.doctorId === doctor.id
                          );

                          const availabiltyMode = doctorsAvailability.find(
                            (availability) => availability.doctorId === doctor.id
                          );

                          const doctorAvailableMode =
                            availabiltyMode && availabiltyMode.availableModes[0];

                          return (
                            doctorAvailableMode && (
                              <Grid key={doctor.id} item xs={12} sm={12} md={12} lg={6}>
                                {doctorType.toLowerCase() === 'apollo' ? (
                                  <InfoCardPartner
                                    doctorInfo={doctor}
                                    doctorType={doctorType}
                                    nextAvailability={nextAvailability}
                                    consultMode={doctorAvailableMode}
                                    specialityType={(faqData && faqData[0].title) || ''}
                                  />
                                ) : (
                                  <InfoCard
                                    doctorInfo={doctor}
                                    doctorType={doctorType}
                                    nextAvailability={nextAvailability}
                                    consultMode={doctorAvailableMode}
                                    specialityType={(faqData && faqData[0].title) || ''}
                                  />
                                )}
                              </Grid>
                            )
                          );
                        }
                      })}
                    </Grid>
                  </>
                ) : (
                  'no results found'
                )}
              </div>
              {/* {pageNo < Math.ceil((apolloDoctorCount + partnerDoctorCount) / PAGE_SIZE) && (
                <div className={classes.paginationContainer}>
                  <Pagination
                    count={Math.ceil((apolloDoctorCount + partnerDoctorCount) / PAGE_SIZE)}
                    color="primary"
                    page={pageNo}
                    onChange={() => window.location.reload()}
                    classes={{ root: classes.pagination, ul: classes.paginationUl }}
                  />
                </div>
              )} */}

              {faqData && faqData.length > 0 && (
                <>
                  <BookBest faqData={faqData[0]} specialityName={specialtyName} />
                  <FrequentlyQuestions faqData={faqData[0].specialityFaq} />
                </>
              )}
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
      <NavigationBottom />
      {!onePrimaryUser && <ManageProfile />}
    </div>
  );
};

export default SpecialtyDetails;
