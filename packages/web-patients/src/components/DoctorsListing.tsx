import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState, useRef, useContext, useEffect } from 'react';
import { DoctorCard } from 'components/DoctorCard';
import { AphButton } from '@aph/web-ui-components';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _compact from 'lodash/compact';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_DOCTORS_BY_SPECIALITY_AND_FILTERS } from 'graphql/doctors';
import { SearchObject } from 'components/DoctorsFilter';
// import { format, addDays } from 'date-fns';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ConsultMode } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Scrollbars from 'react-custom-scrollbars';
import _find from 'lodash/find';
import { useLocationDetails } from 'components/LocationProvider';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
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
    pageHeader: {
      fontSize: 17,
      fontWeight: 500,
      color: '#0087ba',
      [theme.breakpoints.up('sm')]: {
        borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      },
      [theme.breakpoints.up(901)]: {
        display: 'flex',
        alignItems: 'flex-end',
      },
    },
    headerTitle: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    filterSection: {
      marginLeft: 'auto',
      marginBottom: 0.5,
      minWidth: 320,
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        marginLeft: -20,
        marginRight: -20,
        display: 'flex',
        position: 'relative',
        zIndex: 1,
      },
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
      borderBottom: '5px solid transparent',
      borderRadius: 0,
      paddingLeft: 0,
      paddingRight: 0,
      marginLeft: 10,
      marginRight: 10,
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0,
        marginRight: 0,
        fontSize: 14,
        fontWeight: 600,
        width: '33.333%',
      },
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
      [theme.breakpoints.down('xs')]: {
        marginTop: 44,
        backgroundColor: '#f7f8f5',
      },
      '& h2': {
        fontSize: 18,
        paddingBottom: 5,
        margin: 0,
        color: '#02475b',
      },
    },
    searchList: {
      paddingLeft: 20,
      paddingRight: 17,
      paddingTop: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 14,
      },
    },
    sectionHead: {
      paddingLeft: 20,
      paddingRight: 17,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: theme.palette.common.white,
        boxShadow: '0 15px 20px 0 rgba(0, 0, 0, 0.1)',
        marginLeft: -20,
        marginRight: -20,
        marginTop: -15,
      },
      '& h2': {
        [theme.breakpoints.down('xs')]: {
          paddingBottom: 10,
        },
      },
    },
    title: {
      color: '#02475b',
      fontSize: 36,
      fontWeight: 600,
      margin: 0,
      lineHeight: 1,
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
  };
});

interface DoctorsListingProps {
  filter: SearchObject;
  specialityName: string;
  specialityId: string;
  prakticeSDKSpecialties?: string;
  disableFilter?: (disableFilter: boolean) => void;
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
      if (value === 'now') {
        availableNow = {
          availableNow: moment(new Date())
            .utc()
            .format('YYYY-MM-DD hh:mm'),
        };
      } else if (value === 'today') {
        availabilityArray.push(today);
      } else if (value === 'tomorrow') {
        availabilityArray.push(
          moment(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
            .utc()
            .format('YYYY-MM-DD')
        );
      } else if (value === 'next3') {
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

export const DoctorsListing: React.FC<DoctorsListingProps> = (props) => {
  const classes = useStyles({});
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:900px)');
  const isLargeScreen = useMediaQuery('(min-width:901px)');
  const mascotRef = useRef(null);

  const {
    currentPincode,
    currentLong,
    currentLat,
    getCurrentLocationPincode,
  } = useLocationDetails();

  const { filter, specialityName, specialityId, prakticeSDKSpecialties, disableFilter } = props;
  const [selectedFilterOption, setSelectedFilterOption] = useState<string>('all');
  const { currentPatient } = useAllCurrentPatients();
  const [tabValue, setTabValue] = useState('All Consults');

  const consultOptions = {
    all: 'All Consults',
    ONLINE: 'Online Consult',
    PHYSICAL: 'Clinic Visit',
  };

  type Range = {
    [index: number]: {
      minimum: number;
      maximum: number;
    };
  };

  let expRange: Range = [],
    feeRange: Range = [];

  if (!currentPincode && currentLat && currentLong) {
    getCurrentLocationPincode && getCurrentLocationPincode(currentLat, currentLong);
  }

  if (filter.experience && filter.experience.length > 0) {
    expRange = filter.experience.map((experience) => {
      const expRangeMinimum = parseInt(experience.split('_')[0], 10);
      const expRangeMaximum = parseInt(experience.split('_')[1], 10);
      return { minimum: expRangeMinimum, maximum: expRangeMaximum };
    });
  }

  if (filter.fees && filter.fees.length > 0) {
    feeRange = filter.fees.map((fees) => {
      const feeRangeMinimum = parseInt(fees.split('_')[0], 10);
      const feeRangeMaximum = parseInt(fees.split('_')[1], 10);
      return { minimum: feeRangeMinimum, maximum: feeRangeMaximum };
    });
  }

  let geolocation = {} as any;
  if (currentLat && currentLong) {
    geolocation['geolocation'] = {
      latitude: parseFloat(currentLat.toString()),
      longitude: parseFloat(currentLong.toString()),
    };
  }

  const apiVairables = {
    patientId: currentPatient ? currentPatient.id : '',
    specialty: prakticeSDKSpecialties && prakticeSDKSpecialties.length > 0 ? '' : specialityId,
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

  const { data, loading, refetch } = useQueryWithSkip(GET_DOCTORS_BY_SPECIALITY_AND_FILTERS, {
    variables: { filterInput: apiVairables },
    fetchPolicy: 'no-cache',
  });

  if (loading) disableFilter && disableFilter(true);
  else if (currentPatient && currentPatient.id.length > 0) disableFilter && disableFilter(false);

  useEffect(() => {
    if (currentLat || currentLong) {
      refetch();
    }
  }, [currentLat, currentLong]);

  if (loading)
    <div className={classes.circlularProgress}>
      <CircularProgress />
    </div>;

  let doctorsList = [];

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

  const specialistPlural =
    data &&
    data.getDoctorsBySpecialtyAndFilters &&
    data.getDoctorsBySpecialtyAndFilters.specialty &&
    data.getDoctorsBySpecialtyAndFilters.specialty.specialistPluralTerm
      ? data.getDoctorsBySpecialtyAndFilters.specialty.specialistPluralTerm
      : '';

  const specialitySingular =
    data &&
    data.getDoctorsBySpecialtyAndFilters &&
    data.getDoctorsBySpecialtyAndFilters.specialty &&
    data.getDoctorsBySpecialtyAndFilters.specialty.specialistSingularTerm
      ? data.getDoctorsBySpecialtyAndFilters.specialty.specialistSingularTerm
      : '';

  const consultErrorMessage = () => {
    const selectedConsultName =
      selectedFilterOption === 'online' ? 'Online Consultation' : 'Physical Consult';

    const suggestedConsultName =
      selectedFilterOption === 'online' ? 'Clinic Visit' : ' Online Consultation';

    const noConsultFoundError = `There is no ${specialityName} available for ${selectedConsultName}. Please try
    ${suggestedConsultName}`;

    const noDoctorFoundError = `There is no ${specialitySingular} available to match your filters. Please try again with
    different filters.`;

    const suggestedClinicName =
      selectedFilterOption === 'Clinic Visit' ? 'Clinic Visit' : 'Online Consultation';

    const noDoctorFoundClinicError = `There is no ${specialitySingular} available for ${selectedConsultName}. Please you try
    ${suggestedClinicName}.`;

    return (
      <Grid container spacing={2} justify="center">
        <Grid item xs={8} sm={6} md={6} key={_uniqueId('consultGrid_')}>
          <div className={classes.noDataCard}>
            <h2>Uh oh! :(</h2>
            {data &&
            data.getDoctorsBySpecialtyAndFilters &&
            data.getDoctorsBySpecialtyAndFilters.doctors &&
            data.getDoctorsBySpecialtyAndFilters.doctors.length > 0
              ? noConsultFoundError
              : tabValue == 'Clinic Visit'
              ? noDoctorFoundClinicError
              : noDoctorFoundError}
          </div>
        </Grid>
      </Grid>
    );
  };

  if (
    data &&
    data.getDoctorsBySpecialtyAndFilters &&
    data.getDoctorsBySpecialtyAndFilters.doctors &&
    !loading
  ) {
    doctorsList =
      selectedFilterOption === 'all'
        ? data.getDoctorsBySpecialtyAndFilters.doctors
        : _filter(data.getDoctorsBySpecialtyAndFilters.doctors, (doctors) => {
            const consultMode =
              doctors.consultHours &&
              doctors.consultHours.length > 0 &&
              doctors.consultHours[0] &&
              doctors.consultHours[0].consultMode
                ? doctors.consultHours[0].consultMode
                : '';
            if (consultMode === selectedFilterOption || consultMode === ConsultMode.BOTH) {
              return true;
            }
            return false;
          });
  }

  // console.log(doctorsNextAvailability, doctorsAvailability, 'next availability api....');
  return (
    <div className={classes.root}>
      <div className={classes.sectionHead} ref={mascotRef}>
        <div className={classes.pageHeader}>
          <div className={classes.headerTitle}>
            <h2 className={classes.title}>Okay!</h2>
            {specialistPlural ? `Here are our best ${specialistPlural}` : ''}
          </div>
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
                    setTabValue(consultName);
                  }}
                  value={consultType}
                  key={_uniqueId('cbutton_')}
                  title={'View ' + consultName}
                >
                  {consultName}
                </AphButton>
              );
            })}
          </div>
        </div>
      </div>

      {doctorsList.length > 0 ? (
        <Scrollbars
          autoHide={true}
          autoHeight
          autoHeightMax={
            isMediumScreen
              ? 'calc(100vh - 345px)'
              : isLargeScreen
              ? 'calc(100vh - 280px)'
              : 'calc(100vh - 170px)'
          }
        >
          <div className={classes.searchList}>
            <Grid container spacing={2}>
              {_map(doctorsList, (doctorDetails) => {
                let availableMode = '';
                let nextAvailabilityString = '';
                const nextAvailability = _find(doctorsNextAvailability, (availability) => {
                  const availabilityDoctorId =
                    availability && availability.doctorId ? availability.doctorId : '';
                  const currentDoctorId = doctorDetails && doctorDetails.id ? doctorDetails.id : '';
                  return availabilityDoctorId === currentDoctorId;
                });
                const availableModes = _find(doctorsAvailability, (availability) => {
                  const availabilityDoctorId =
                    availability && availability.doctorId ? availability.doctorId : '';
                  const currentDoctorId = doctorDetails && doctorDetails.id ? doctorDetails.id : '';
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

                // nextAvailabilityString =
                //   availableMode === 'ONLINE'
                //     ? nextAvailability && nextAvailability.onlineSlot
                //       ? nextAvailability.onlineSlot
                //       : ''
                //     : '';
                // const availableMode =
                // console.log(nextAvailability, 'next availability....');
                return (
                  <Grid item xs={12} sm={12} md={12} lg={6} key={_uniqueId('consultGrid_')}>
                    <DoctorCard
                      doctorDetails={doctorDetails}
                      key={_uniqueId('dcListing_')}
                      nextAvailability={nextAvailabilityString}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </div>
        </Scrollbars>
      ) : (
        <>
          {!loading && data ? (
            consultErrorMessage()
          ) : (
            <div className={classes.circlularProgress}>
              <CircularProgress />
            </div>
          )}
        </>
      )}
    </div>
  );
};

{
  /* <Popover
              open={isPopoverOpen}
              onClose={(e, reason) => {
                // console.log('hello', e, reason);
              }}
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
              {show20SecPopup ? (
                <MascotWithMessage
                  messageTitle="hi! :)"
                  message="These doctors are best suited for your needs, please select from list."
                  closeButtonLabel="OK, GOT IT"
                  closeMascot={() => setIsPopoverOpen(false)}
                />
              ) : show40SecPopup ? (
                <MascotWithMessage
                  messageTitle="relax :)"
                  message="We're selecting the best doctor suitable for your symptoms."
                  closeButtonLabel="NO, WAIT"
                  closeMascot={() => setIsPopoverOpen(false)}
                />
              ) : null}
            </Popover> */
}
