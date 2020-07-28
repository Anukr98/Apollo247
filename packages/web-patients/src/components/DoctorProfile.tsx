import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState, useEffect } from 'react';
import { GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import _forEach from 'lodash/forEach';
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { format } from 'date-fns';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DoctorType } from 'graphql/types/globalTypes';
import moment from 'moment';
import { getAppStoreLink } from 'helpers/dateHelpers';
import { useApolloClient } from 'react-apollo-hooks';
import { gtmTracking } from '../gtmTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    doctorProfile: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
      },
    },
    doctorImage: {
      borderRadius: '5px 5px 0 0',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-start',
      [theme.breakpoints.up('sm')]: {
        width: 190,
      },
      '& img': {
        maxWidth: '100%',
        maxHeight: 138,
        verticalAlign: 'middle',
      },
    },
    otherDoctorType: {
      width: 80,
    },
    doctorInfo: {
      padding: '15px 20px 0 20px',
      [theme.breakpoints.up('sm')]: {
        width: 'calc(100% - 190px)',
      },
    },

    doctorName: {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      '& h1': {
        margin: 0,
        fontSize: 23,
        fontWeight: 600,
        color: '#02475b',
      },
      '& span': {
        marginLeft: 'auto',
        '& img': {
          verticalAlign: 'middle',
        },
      },
    },
    specialits: {
      padding: '8px 0',
      fontSize: 14,
      fontWeight: 600,
      color: '#0087ba',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
    },
    lineDivider: {
      paddingLeft: 5,
      paddingRight: 5,
    },
    doctorInfoGroup: {
      paddingBottom: 10,
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      [theme.breakpoints.down('xs')]: {
        marginBottom: 10,
      },
    },
    infoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: 10,
      [theme.breakpoints.up('sm')]: {
        width: '50%',
      },
    },
    iconType: {
      width: 25,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      '& img': {
        verticalAlign: 'middle',
      },
    },
    details: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      paddingLeft: 14,
      paddingRight: 10,
      lineHeight: 1.5,
      [theme.breakpoints.down('xs')]: {
        fontSize: 12,
        paddingLeft: 0,
        fontWeight: 600,
      },
      '& p': {
        margin: 0,
      },
      '& span': {
        paddingRight: 5,
      },
    },
    textCenter: {
      alignItems: 'center',
    },
    availability: {
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,135,186,0.11)',
      padding: '6px 12px',
      color: '#02475b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 10,
      marginTop: 5,
    },
    availableNow: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white,
    },
    aboutDoctor: {
      padding: 20,
    },
    sectionHeader: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      paddingBottom: 8,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
    },
    sectionBody: {
      fontSize: 12,
      lineHeight: '16px',
      paddingTop: 10,
    },
  };
});

interface DoctorProfileProps {
  doctorDetails: DoctorDetails;
  avaPhy: boolean;
  avaOnline: boolean;
  getDoctorAvailableSlots: (GetDoctorNextAvailableSlot: any) => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = (props) => {
  const classes = useStyles({});
  const { doctorDetails, getDoctorAvailableSlots } = props;
  const apolloClient = useApolloClient();
  const [data, setData] = useState<GetDoctorNextAvailableSlot>();
  const [loading, setLoading] = useState<boolean>(false);

  const doctorId = doctorDetails && doctorDetails.id ? doctorDetails.id : '';

  useEffect(() => {
    setLoading(true);
    /**Gtm code start start */
    const speciality =
      (doctorDetails && doctorDetails.specialty && doctorDetails.specialty.name) || null;

    if (doctorDetails) {
      const {
        city,
        fullName,
        id,
        doctorType,
        doctorHospital,
        onlineConsultationFees,
        physicalConsultationFees,
      } = doctorDetails;
      let items = [],
        count = 0;
      onlineConsultationFees &&
        items.push({
          item_name: fullName,
          item_id: id,
          price: Number(onlineConsultationFees),
          item_brand:
            doctorType && doctorType.toLocaleLowerCase() === 'apollo'
              ? 'Apollo'
              : 'Partner Doctors',
          item_category: 'Consultations',
          item_category_2: speciality,
          item_category_3:
            city ||
            (doctorHospital &&
              doctorHospital.length &&
              doctorHospital[0].facility &&
              doctorHospital[0].facility.city),
          // 'item_category_4': '', // For Future
          item_variant: 'Virtual',
          index: ++count,
          quantity: 1,
        });
      physicalConsultationFees &&
        items.push({
          item_name: fullName,
          item_id: id,
          price: Number(physicalConsultationFees),
          item_brand:
            doctorType && doctorType.toLocaleLowerCase() === 'apollo'
              ? 'Apollo'
              : 'Partner Doctors',
          item_category: 'Consultations',
          item_category_2: speciality,
          item_category_3:
            city ||
            (doctorHospital &&
              doctorHospital.length &&
              doctorHospital[0].facility &&
              doctorHospital[0].facility.city),
          // 'item_category_4': '', // For Future
          item_variant: 'Physcial',
          index: ++count,
          quantity: 1,
        });
      gtmTracking({
        category: 'Consultations',
        action: speciality,
        label: `${city || null} Doctor Profile Viewed`,
        ecommObj: {
          event: 'view_item',
          ecommerce: {
            items,
          },
        },
      });
    }

    /**Gtm code start end */
    apolloClient
      .query<GetDoctorNextAvailableSlot, GetDoctorNextAvailableSlotVariables>({
        query: GET_DOCTOR_NEXT_AVAILABILITY,
        variables: {
          DoctorNextAvailableSlotInput: {
            doctorIds: [doctorId],
            availableDate: format(new Date(), 'yyyy-MM-dd'),
          },
        },
        fetchPolicy: 'network-only',
      })
      .then((response) => {
        setData(response.data);
        getDoctorAvailableSlots(response.data);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return <LinearProgress />;
  }

  // ----------------timeDifferenceMinutes-----------------

  const timeDifferenceMinutes = () => {
    if (
      data &&
      data.getDoctorNextAvailableSlot &&
      data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    ) {
      const availableSlots = data.getDoctorNextAvailableSlot.doctorAvailalbeSlots;
      let firstAvailableSLot = availableSlots[0];
      if (
        firstAvailableSLot &&
        firstAvailableSLot.availableSlot !== '' &&
        firstAvailableSLot.availableSlot.length > 0
      ) {
        const nextAvailabilityTime =
          firstAvailableSLot.availableSlot && moment(firstAvailableSLot.availableSlot);
        const currentTime = moment(new Date());
        const differenceInMinutes = currentTime.diff(nextAvailabilityTime, 'minutes') * -1;
        return differenceInMinutes + 1;
      }
    }
  };
  const timeDifferenceMinutesPhysical = () => {
    if (
      data &&
      data.getDoctorNextAvailableSlot &&
      data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    ) {
      const physicalAvailableSlotTime = data.getDoctorNextAvailableSlot.doctorAvailalbeSlots;
      let physicalAvailableSlot = physicalAvailableSlotTime[0];
      if (physicalAvailableSlot && physicalAvailableSlot.physicalAvailableSlot !== '') {
        const nextAvailabilityTime =
          physicalAvailableSlot.physicalAvailableSlot &&
          moment(physicalAvailableSlot.physicalAvailableSlot);
        const currentTime = moment(new Date());
        const differenceInMinutes = currentTime.diff(nextAvailabilityTime, 'minutes') * -1;
        return differenceInMinutes + 1;
      }
    }
  };
  // --------------------differenceInHours----------------------

  const differenceInHours = () => {
    if (
      data &&
      data.getDoctorNextAvailableSlot &&
      data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    ) {
      const availableSlots = data.getDoctorNextAvailableSlot.doctorAvailalbeSlots;
      let firstAvailableSLot = availableSlots[0];

      if (firstAvailableSLot && firstAvailableSLot.availableSlot !== '') {
        const nextAvailabilityTime =
          firstAvailableSLot.availableSlot && moment(firstAvailableSLot.availableSlot);
        const currentTime = moment(new Date());
        const differenceInHours = currentTime.diff(nextAvailabilityTime, 'hours') * -1;
        return Math.round(differenceInHours) + 1;
      }
    }
  };
  const differenceInHoursPhysical = () => {
    if (
      data &&
      data.getDoctorNextAvailableSlot &&
      data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    ) {
      const physicalAvailableSlotTime = data.getDoctorNextAvailableSlot.doctorAvailalbeSlots;
      let physicalAvailableSlot = physicalAvailableSlotTime[0];

      if (physicalAvailableSlot && physicalAvailableSlot.physicalAvailableSlot !== '') {
        const nextAvailabilityTime =
          physicalAvailableSlot.physicalAvailableSlot &&
          moment(physicalAvailableSlot.physicalAvailableSlot);
        const currentTime = moment(new Date());
        const differenceInHours = currentTime.diff(nextAvailabilityTime, 'hours') * -1;
        return Math.round(differenceInHours) + 1;
      }
    }
  };

  // ------------------------differenceInDays--------------------

  const differenceInDays = () => {
    if (
      data &&
      data.getDoctorNextAvailableSlot &&
      data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    ) {
      const availableSlots = data.getDoctorNextAvailableSlot.doctorAvailalbeSlots;
      let firstAvailableSLot = availableSlots[0];

      if (firstAvailableSLot && firstAvailableSLot.availableSlot !== '') {
        const nextAvailabilityTime =
          firstAvailableSLot.availableSlot && moment(firstAvailableSLot.availableSlot);
        const currentTime = moment(new Date());
        const differenceInDays = currentTime.diff(nextAvailabilityTime, 'days') * -1;
        return Math.round(differenceInDays) + 1;
      }
    }
  };
  const differenceInDaysPhysical = () => {
    if (
      data &&
      data.getDoctorNextAvailableSlot &&
      data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    ) {
      const physicalAvailableSlotTime = data.getDoctorNextAvailableSlot.doctorAvailalbeSlots;
      let physicalAvailableSlot = physicalAvailableSlotTime[0];

      if (physicalAvailableSlot && physicalAvailableSlot.physicalAvailableSlot !== '') {
        const nextAvailabilityTime =
          physicalAvailableSlot.physicalAvailableSlot &&
          moment(physicalAvailableSlot.physicalAvailableSlot);
        const currentTime = moment(new Date());
        const differenceInDays = currentTime.diff(nextAvailabilityTime, 'days') * -1;
        return Math.round(differenceInDays) + 1;
      }
    }
  };

  // ------------------------availabilityMarkupOnline/Physical------------------------

  const availabilityMarkupOnline = () => {
    if (
      data &&
      data.getDoctorNextAvailableSlot &&
      data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    ) {
      const differenceInMinutes = timeDifferenceMinutes();

      if (differenceInMinutes === 0) {
        return (
          <div className={`${classes.availability} ${classes.availableNow}`}>AVAILABLE NOW</div>
        );
      } else if (differenceInMinutes && differenceInMinutes > 0 && differenceInMinutes <= 15) {
        return (
          <div className={`${classes.availability} ${classes.availableNow}`}>
            AVAILABLE IN {differenceInMinutes} {differenceInMinutes === 1 ? 'MIN' : 'MINS'}
          </div>
        );
      } else if (differenceInMinutes && differenceInMinutes > 15 && differenceInMinutes <= 60) {
        return (
          <div className={`${classes.availability}`}>AVAILABLE IN {differenceInMinutes} MINS</div>
        );
      } else if (differenceInMinutes && differenceInMinutes >= 60 && differenceInMinutes < 1380) {
        return (
          <div className={`${classes.availability}`}>AVAILABLE IN {differenceInHours()} HOURS</div>
        );
      } else if (differenceInMinutes && differenceInMinutes >= 1380) {
        return (
          <div className={`${classes.availability}`}>AVAILABLE IN {differenceInDays()} DAYS</div>
        );
      }
    } else {
      return null;
    }
  };

  const availabilityMarkupPhysical = () => {
    if (
      data &&
      data.getDoctorNextAvailableSlot &&
      data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
    ) {
      const differenceInMinutes = timeDifferenceMinutesPhysical();

      if (differenceInMinutes === 0) {
        return (
          <div className={`${classes.availability} ${classes.availableNow}`}>AVAILABLE NOW</div>
        );
      } else if (differenceInMinutes && differenceInMinutes > 0 && differenceInMinutes <= 15) {
        return (
          <div className={`${classes.availability} ${classes.availableNow}`}>
            AVAILABLE IN {differenceInMinutes} {differenceInMinutes === 1 ? 'MIN' : 'MINS'}
          </div>
        );
      } else if (differenceInMinutes && differenceInMinutes > 15 && differenceInMinutes <= 60) {
        return (
          <div className={`${classes.availability}`}>AVAILABLE IN {differenceInMinutes} MINS</div>
        );
      } else if (differenceInMinutes && differenceInMinutes >= 60 && differenceInMinutes < 1380) {
        return (
          <div className={`${classes.availability}`}>
            AVAILABLE IN {differenceInHoursPhysical()} HOURS
          </div>
        );
      } else if (differenceInMinutes && differenceInMinutes >= 1380) {
        return (
          <div className={`${classes.availability}`}>
            AVAILABLE IN {differenceInDaysPhysical()} DAYS
          </div>
        );
      }
    } else {
      return null;
    }
  };

  // ----------------------------------------------------------------------------

  if (doctorDetails) {
    let hospitalLocation = '';
    let speciality;

    if (doctorDetails.specialty) {
      speciality = doctorDetails.specialty.name;
    }
    const education = doctorDetails.qualification;
    const profileImage = doctorDetails.photoUrl;

    const { awards, experience, firstName, fullName, languages } = doctorDetails;

    const isConnectDoctor = doctorDetails.doctorType === DoctorType.DOCTOR_CONNECT;

    _forEach(doctorDetails.doctorHospital, (hospitalDetails) => {
      if (hospitalDetails.facility.facilityType === 'HOSPITAL') {
        hospitalLocation = hospitalDetails.facility.name + ',' + hospitalDetails.facility.city;
      }
    });

    return (
      <div className={classes.root}>
        <div className={classes.doctorProfile}>
          <div className={classes.doctorImage} title={fullName || ''}>
            <img src={profileImage || require('images/no_photo.png')} alt={firstName || ''} />
          </div>
          <div className={classes.doctorInfo}>
            <div className={classes.doctorName} title={'Doctor Name'}>
              <h1>{fullName}</h1>
              <span>
                <img
                  className={isConnectDoctor ? classes.otherDoctorType : ''}
                  src={require(isConnectDoctor ? 'images/partner_doc.png' : 'images/ic_apollo.svg')}
                  alt=""
                />
              </span>
            </div>
            <div className={classes.specialits}>
              <span title={'Speciality'}>{speciality}</span>{' '}
              <span className={classes.lineDivider}>|</span>{' '}
              <span title={'Experience'}>{experience} Yrs</span>
            </div>
            <div className={classes.doctorInfoGroup}>
              {education && (
                <div className={classes.infoRow}>
                  <div className={classes.iconType} title={'Education Details'}>
                    <img src={require('images/ic-edu.svg')} alt="" />
                  </div>
                  <div className={classes.details}>
                    {education && education.includes(';') ? (
                      education.split(';').map((edu, idx) => <div key={idx}>{edu}</div>)
                    ) : (
                      <div>{education}</div>
                    )}
                  </div>
                </div>
              )}
              {awards && (
                <div className={classes.infoRow}>
                  <div className={classes.iconType} title={'Awards'}>
                    <img src={require('images/ic-awards.svg')} alt="" />
                  </div>
                  <div className={classes.details}>
                    {awards && awards.replace(/<\/?[^>]+(>|$)/g, '')}
                  </div>
                </div>
              )}
              {hospitalLocation && (
                <div className={classes.infoRow}>
                  <div className={classes.iconType} title={'Location'}>
                    <img src={require('images/ic-location.svg')} alt="" />
                  </div>
                  <div className={classes.details}>{hospitalLocation}</div>
                </div>
              )}
              {languages && (
                <div className={`${classes.infoRow} ${classes.textCenter}`}>
                  <div className={classes.iconType} title={'Languages'}>
                    <img src={require('images/ic-language.svg')} alt="" />
                  </div>
                  <div className={classes.details}>{languages}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/*
        <div className={classes.aboutDoctor}>
          <div className={classes.sectionHeader}>About Dr. {fullName}</div>
           <div className={classes.sectionBody}>
            Insert Bio of the doctor here. Include a summary of work experience, education, and any
            other outstanding achievement as a doctor. Insert Bio of the doctor here. Include a
            summary of work experience, education, and any other outstanding achievement as a
            doctor.
          </div> 
        </div>*/}
      </div>
    );
  } else {
    return <div>Invalid doctor id</div>;
  }
};
