import { Theme, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState, useRef, useEffect } from 'react';
import { DoctorCard } from 'components/DoctorCard';
import { AphButton } from '@aph/web-ui-components';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_DOCTORS_BY_SPECIALITY_AND_FILTERS } from 'graphql/doctors';
import { SearchObject } from 'components/DoctorsFilter';

import Popover from '@material-ui/core/Popover';
import { MascotWithMessage } from 'components/MascotWithMessage';
import { format, addDays } from 'date-fns';

import CircularProgress from '@material-ui/core/CircularProgress';

import { ConsultMode } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    mascotCircle: {
      cursor: 'pointer',
      [theme.breakpoints.up('sm')]: {
        marginLeft: 'auto',
        position: 'fixed',
        bottom: 10,
        right: 15,
      },
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
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
    pageHeader: {
      fontSize: 17,
      fontWeight: 500,
      color: '#0087ba',
      marginBottom: 20,
      [theme.breakpoints.up('sm')]: {
        borderBottom: '0.5px solid rgba(2,71,91,0.3)',
        display: 'flex',
        alignItems: 'center',
      },
    },
    filterSection: {
      marginLeft: 'auto',
      marginBottom: 0.5,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        marginLeft: -20,
        marginRight: -20,
        marginTop: 20,
        display: 'flex',
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
      borderBottom: '5px solid #f7f8f5',
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
    sectionHead: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: theme.palette.common.white,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
        marginLeft: -20,
        marginRight: -20,
        marginTop: -14,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
      },
      '& h2': {
        [theme.breakpoints.down('xs')]: {
          paddingBottom: 10,
        },
      },
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
}

const convertAvailabilityToDate = (availability: String[]) => {
  return _map(availability, (ava) => {
    if (ava === 'now') return 'NOW';
    if (ava === 'today') return format(new Date(), 'yyyy-MM-dd');
    if (ava === 'tomorrow') return format(addDays(new Date(), 1), 'yyyy-MM-dd');
    if (ava === 'next3') return format(addDays(new Date(), 3), 'yyyy-MM-dd');
  });
};

export const DoctorsListing: React.FC<DoctorsListingProps> = (props) => {
  const classes = useStyles();

  const { filter, specialityName, specialityId } = props;
  const [selectedFilterOption, setSelectedFilterOption] = useState<string>('all');
  const consultOptions = {
    all: 'All Consults',
    ONLINE: 'Online Consult',
    PHYSICAL: 'Clinic Visit',
  };

  const [show20SecPopup, setShow20SecPopup] = useState<boolean>(false);
  const [show40SecPopup, setShow40SecPopup] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  const mascotRef = useRef(null);

  type Range = {
    [index: number]: {
      minimum: number;
      maximum: number;
    };
  };

  let expRange: Range = [],
    feeRange: Range = [];

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

  const apiVairables = {
    specialty: specialityId,
    city: filter.cityName,
    experience: expRange,
    fees: feeRange,
    availability: convertAvailabilityToDate(filter.availability || []),
    gender: filter.gender,
    language: filter.language,
  };

  // console.log(specialityId);

  const { data, loading, error } = useQueryWithSkip(GET_DOCTORS_BY_SPECIALITY_AND_FILTERS, {
    variables: { filterInput: apiVairables },
    fetchPolicy: 'network-only',
  });

  // this effect will watch for data loaded and triggers popup after 20 and 40 secs.
  // useEffect(() => {
  //   if (data) {
  //     const timer1 = setTimeout(() => {
  //       setShow20SecPopup(true);
  //       setIsPopoverOpen(true);
  //     }, 20000);
  //     const timer2 = setTimeout(() => {
  //       setShow40SecPopup(true);
  //       setShow20SecPopup(false);
  //       setIsPopoverOpen(true);
  //     }, 40000);
  //     // this will clear Timeout when component unmount like in willComponentUnmount
  //     return () => {
  //       clearTimeout(timer1);
  //       clearTimeout(timer2);
  //     };
  //   }
  // }, [data]);

  if (loading) {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
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
        <Grid item xs={8} sm={6} md={6} key={_uniqueId('consultGrid_')}>
          <div className={classes.noDataCard}>
            <h2>Uh oh! :(</h2>
            {data && data.getDoctorsBySpecialtyAndFilters.doctors.length > 0
              ? noConsultFoundError
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

  return (
    <>
      <div className={classes.sectionHead} ref={mascotRef}>
        {doctorsList.length > 0 ? <Typography variant="h2">Okay!</Typography> : ''}
        <div className={classes.pageHeader}>
          {doctorsList.length > 0 ? <div>Here are our best {specialityName}</div> : ''}
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

          <Popover
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
          </Popover>
        </div>
      ) : (
        consultErrorMessage()
      )}
    </>
  );
};
