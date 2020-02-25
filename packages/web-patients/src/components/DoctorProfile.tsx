import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import _forEach from 'lodash/forEach';
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { format } from 'date-fns';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DoctorType } from 'graphql/types/globalTypes';
// import { AphButton } from '@aph/web-ui-components';
import moment from 'moment';
import { getAppStoreLink } from 'helpers/dateHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 328,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    doctorProfile: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
    },
    doctorImage: {
      borderRadius: '5px 5px 0 0',
      overflow: 'hidden',
      textAlign: 'center',
      '& img': {
        maxWidth: '100%',
        maxHeight: 138,
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      padding: 20,
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
      paddingBottom: 5,
      marginBottom: 5,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
    },
    specialits: {
      fontSize: 12,
      fontWeight: 600,
      color: '#0087ba',
      textTransform: 'uppercase',
      position: 'relative',
      paddingRight: 40,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      paddingBottom: 10,
    },
    shareIcon: {
      position: 'absolute',
      right: 0,
      top: 0,
      cursor: 'pointer',
    },
    lineDivider: {
      paddingLeft: 5,
      paddingRight: 5,
    },
    doctorInfoGroup: {
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      [theme.breakpoints.down('xs')]: {
        marginBottom: 10,
      },
    },
    downloadApollo: {
      backgroundColor: '#fff',
      padding: '35px 0',
      textAlign: 'center',
      marginTop: 8,
      borderRadius: 5,
      fontSize: 18,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
    },
    downloadInfo: {
      marginBottom: 17,
      '& div': {
        marginBottom: 10,
      },
      '& span': {
        fontWeight: 'bold',
      },
    },
    downloadLink: {
      fontSize: 18,
      textTransform: 'capitalize',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#fcb716',
      color: '#fff',
      fontWeight: 'bold',
      padding: '9px 13px',
      display: 'inline-block',
      minWidth: 262,
    },
    infoRow: {
      display: 'flex',
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
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
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      paddingLeft: 20,
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
    doctorPrice: {
      marginLeft: 'auto',
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      lineHeight: 1.5,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    doctorPriceIn: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#02475b',
      lineHeight: 1.5,
      marginTop: 5,
      marginBottom: 10,
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
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
    consultGroup: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        borderRadius: 5,
        padding: 12,
        marginBottom: 10,
      },
    },
    consultDoctorInfoGroup: {
      paddingBottom: 0,
      borderBottom: 'none',
    },
    opacityMobile: {
      [theme.breakpoints.down('xs')]: {
        opacity: 0.5,
      },
    },
    noIcon: {
      opacity: 0,
    },
    bottomActions: {
      padding: 20,
    },
  };
});

interface DoctorProfileProps {
  doctorDetails: DoctorDetails;
  avaPhy: boolean;
  avaOnline: boolean;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = (props) => {
  const classes = useStyles({});
  const { doctorDetails } = props;

  const doctorId =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.id
      : '';

  const { data, loading } = useQueryWithSkip<
    GetDoctorNextAvailableSlot,
    GetDoctorNextAvailableSlotVariables
  >(GET_DOCTOR_NEXT_AVAILABILITY, {
    variables: {
      DoctorNextAvailableSlotInput: {
        doctorIds: [doctorId],
        availableDate: format(new Date(), 'yyyy-MM-dd'),
      },
    },
    fetchPolicy: 'network-only',
  });

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
      } else if (differenceInMinutes && differenceInMinutes >= 1 && differenceInMinutes <= 15) {
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
      } else if (differenceInMinutes && differenceInMinutes >= 1 && differenceInMinutes <= 15) {
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

  if (doctorDetails && doctorDetails.getDoctorDetailsById) {
    let hospitalLocation = '';
    let speciality;

    if (doctorDetails.getDoctorDetailsById.specialty) {
      speciality = doctorDetails.getDoctorDetailsById.specialty.name;
    }
    const education = doctorDetails.getDoctorDetailsById.qualification;
    const profileImage = doctorDetails.getDoctorDetailsById.photoUrl;

    const {
      awards,
      experience,
      firstName,
      fullName,
      languages,
      lastName,
      onlineConsultationFees,
      physicalConsultationFees,
    } = doctorDetails.getDoctorDetailsById;

    const isStarDoctor =
      doctorDetails.getDoctorDetailsById.doctorType === DoctorType.STAR_APOLLO ? true : false;

    _forEach(doctorDetails.getDoctorDetailsById.doctorHospital, (hospitalDetails) => {
      if (hospitalDetails.facility.facilityType === 'HOSPITAL') {
        hospitalLocation = hospitalDetails.facility.name + ',' + hospitalDetails.facility.city;
      }
    });

    return (
      <div className={classes.root}>
        <div className={classes.doctorProfile}>
          <div className={classes.doctorImage}>
            <img
              src={profileImage || 'https://via.placeholder.com/328x138'}
              alt={firstName || ''}
            />
          </div>
          <div className={classes.doctorInfo}>
            <div className={classes.doctorName}>{fullName}</div>
            <div className={classes.specialits}>
              {speciality} <span className={classes.lineDivider}>|</span> {experience} Yrs
              <div className={classes.shareIcon}>
                <img src={require('images/ic-share-green.svg')} alt="" />
              </div>
            </div>
            <div className={classes.doctorInfoGroup}>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
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
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic-awards.svg')} alt="" />
                </div>
                <div className={classes.details}>
                  {awards && awards.replace(/<\/?[^>]+(>|$)/g, '')}
                </div>
              </div>
            </div>
            <div className={`${classes.doctorInfoGroup} ${classes.opacityMobile}`}>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic-location.svg')} alt="" />
                </div>
                <div className={classes.details}>{hospitalLocation}</div>
              </div>
              <div className={`${classes.infoRow} ${classes.textCenter}`}>
                <div className={classes.iconType}>
                  <img src={require('images/ic-language.svg')} alt="" />
                </div>
                <div className={classes.details}>{languages}</div>
              </div>
            </div>
            <div className={`${classes.doctorInfoGroup} ${classes.consultDoctorInfoGroup}`}>
              <div className={classes.consultGroup}>
                <div className={classes.infoRow}>
                  <div className={classes.iconType}>
                    <img src={require('images/ic-rupee.svg')} alt="" />
                  </div>
                  <div className={classes.details}>
                    Online Consultation
                    <div className={classes.doctorPriceIn}>Rs.{onlineConsultationFees}</div>
                    {availabilityMarkupOnline()}
                  </div>
                  <div className={classes.doctorPrice}>Rs.{onlineConsultationFees}</div>
                </div>
              </div>
              <div className={classes.consultGroup}>
                <div className={classes.infoRow}>
                  <div className={`${classes.iconType} ${classes.noIcon}`}>
                    <img src={require('images/ic-rupee.svg')} alt="" />
                  </div>
                  <div className={classes.details}>
                    Clinic Visit
                    <div className={classes.doctorPriceIn}>Rs.{physicalConsultationFees}</div>
                    {availabilityMarkupPhysical()}
                  </div>
                  <div className={classes.doctorPrice}>Rs.{physicalConsultationFees}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.downloadApollo}>
          <div className={classes.downloadInfo}>
            <div>To enjoy enhanced</div>
            <span>consultation experience</span>
          </div>
          <a
            href={getAppStoreLink()}
            target="_blank"
            color="primary"
            className={classes.downloadLink}
          >
            Download Apollo247 App
          </a>
        </div>
      </div>
    );
  } else {
    return <div>Invalid doctor id</div>;
  }
};

// it must be always one record or we return only first record.
// if (
//   data &&
//   data.getDoctorNextAvailableSlot &&
//   data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
// ) {
//   const availableSlots = data.getDoctorNextAvailableSlot.doctorAvailalbeSlots;
//   const currentTime = new Date(new Date().toISOString()).getTime();
//   const firstAvailableSLot = availableSlots[0];
//   if (firstAvailableSLot) {
//     if (firstAvailableSLot.availableSlot !== '') {
//       const slotTime = new Date(firstAvailableSLot.availableSlot).getTime();
//       if (slotTime > currentTime) {
//         const difference = slotTime - currentTime;
//         availableIn = Math.round(difference / 60000);
//       }
//     } else {
//       availableIn = -1;
//     }
//     const physicalAvailableSlotTime = new Date(
//       firstAvailableSLot.physicalAvailableSlot
//     ).getTime();
//     if (physicalAvailableSlotTime > currentTime) {
//       const difference = physicalAvailableSlotTime - currentTime;
//       physicalAvailableIn = Math.round(difference / 60000);
//     } else {
//       physicalAvailableIn = -1;
//     }
//   }
// }

// const availabilityMarkup = (availableIn: number) => {
//   if (availableIn === 0) {
//     return <div className={`${classes.availability} ${classes.availableNow}`}>AVAILABLE NOW</div>;
//   } else if (availableIn > 0 && availableIn <= 15) {
//     return (
//       <div className={`${classes.availability} ${classes.availableNow}`}>
//         AVAILABLE IN {availableIn} MINS
//       </div>
//     );
//   } else if (availableIn > 15 && availableIn <= 45) {
//     return <div className={`${classes.availability}`}>AVAILABLE IN {availableIn} MINS</div>;
//   } else if (availableIn > 45 && availableIn <= 60) {
//     return <div className={`${classes.availability}`}>AVAILABLE IN 1 HOUR</div>;
//   } else if (availableIn > 60) {
//     return (
//       <div className={`${classes.availability}`}>
//         TODAY {format(new Date(availableSlot), 'h:mm a')}
//       </div>
//     );
//   }
// };
