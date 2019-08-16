import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import _forEach from 'lodash/forEach';
import {
  AppointmentHistory as TypeAppointmentHistory,
  AppointmentHistory_getAppointmentHistory_appointmentsHistory as AppointmentHistory,
  AppointmentHistoryVariables,
} from 'graphql/types/AppointmentHistory';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { PATIENT_APPOINTMENT_HISTORY } from 'graphql/doctors';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useAllCurrentPatients } from 'hooks/authHooks';
import _findIndex from 'lodash/findIndex';
import { getTime } from 'date-fns/esm';
import { format } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      height: '100%',
      borderRadius: 5,
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
    },
    doctorInfo: {
      padding: '20px 5px 0 20px',
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
      paddingBottom: 5,
      marginBottom: 5,
      marginRight: 15,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
    },
    specialits: {
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 15,
      color: '#0087ba',
      textTransform: 'uppercase',
      position: 'relative',
      paddingRight: 40,
      marginRight: 15,
    },
    lineDivider: {
      paddingLeft: 5,
      paddingRight: 5,
    },
    doctorInfoGroup: {
      paddingBottom: 10,
      marginRight: 15,
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      [theme.breakpoints.down('xs')]: {
        marginBottom: 10,
      },
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
      borderBottom: 0,
      paddingBottom: 0,
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
      '& button': {
        color: '#fc9916',
        borderRadius: 10,
      },
    },
    joinInSection: {
      backgroundColor: 'rgba(0,135,186,0.1)',
      padding: 10,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
    },
    joinTime: {
      fontWeight: 600,
      marginLeft: 'auto',
    },
    buttonGroup: {
      paddingRight: 15,
      paddingTop: 30,
    },
    joinBtn: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white + '!important',
      borderRadius: '5px !important',
      '&:hover': {
        backgroundColor: '#ff748e',
        color: theme.palette.common.white + '!important',
      },
    },
    moreToggle: {
      position: 'absolute',
      right: 0,
      top: 0,
      cursor: 'pointer',
      fontSize: 12,
      color: '#fc9916',
      fontWeight: 'bold',
    },
    appointmentDetails: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      marginTop: 30,
      marginRight: 15,
    },
    sectionHead: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 5,
      marginTop: -5,
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
    },
    moreIcon: {
      marginLeft: 'auto',
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    noBorder: {
      border: 0,
      paddingBottom: 0,
    },
    invoiceBtn: {
      boxShadow: 'none',
      padding: 0,
      color: '#fc9916',
      fontSize: 12,
      fontWeight: 'bold',
      clear: 'both',
    },
    hideMore: {
      display: 'none',
    },
  };
});

interface ConsultDoctorProfileProps {
  doctorDetails: DoctorDetails;
  appointmentId: string;
}

const getTimestamp = (today: Date, slotTime: string) => {
  const hhmm = slotTime.split(':');
  return getTime(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hhmm[0], 10),
      parseInt(hhmm[1], 10),
      0,
      0
    )
  );
};

export const ConsultDoctorProfile: React.FC<ConsultDoctorProfileProps> = (props) => {
  const classes = useStyles();

  const { doctorDetails, appointmentId } = props;
  const { allCurrentPatients } = useAllCurrentPatients();

  const [showMore, setShowMore] = useState<boolean>(true);

  const doctorId =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.id
      : '';

  const patientId = (allCurrentPatients && allCurrentPatients[0].id) || '';

  const { data, loading, error } = useQueryWithSkip<
    TypeAppointmentHistory,
    AppointmentHistoryVariables
  >(PATIENT_APPOINTMENT_HISTORY, {
    variables: { appointmentHistoryInput: { patientId: patientId, doctorId: doctorId } },
  });

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <></>;
  }

  const appointmentDetails: AppointmentHistory[] = [];
  let hospitalLocation = '';

  if (data && data.getAppointmentHistory && data.getAppointmentHistory.appointmentsHistory) {
    const previousAppointments = data.getAppointmentHistory.appointmentsHistory;
    const findAppointment = _findIndex(previousAppointments, { id: appointmentId });
    if (findAppointment > 0) {
      appointmentDetails.push(previousAppointments[findAppointment]);
    }
  }

  const firstName =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.firstName
      : '';
  const lastName =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.lastName
      : '';
  const speciality =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.specialty.name
      : '';
  const experience =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.experience
      : '';
  const education =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.qualification
      : '';
  const awards =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.awards
      : '';
  const languages =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.languages
      : '';
  const profileImage =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.photoUrl
      : '';
  const onlineConsultFees =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.onlineConsultationFees
      : '';
  const physicalConsultationFees =
    doctorDetails && doctorDetails.getDoctorDetailsById
      ? doctorDetails.getDoctorDetailsById.physicalConsultationFees
      : '';
  const appointmentTime =
    appointmentDetails && appointmentDetails.length > 0 && appointmentDetails[0].appointmentDateTime
      ? format(
          new Date(
            getTimestamp(
              new Date(appointmentDetails[0].appointmentDateTime || ''),
              appointmentDetails[0].appointmentDateTime.split('T')[1].substring(0, 5)
            )
          ),
          'h:mm a'
        )
      : '';

  // console.log('--------------->>>>>>>>>>>>>>>', appointmentDetails);

  if (
    doctorDetails &&
    doctorDetails.getDoctorDetailsById &&
    doctorDetails.getDoctorDetailsById.doctorHospital
  ) {
    _forEach(doctorDetails.getDoctorDetailsById.doctorHospital, (hospitalDetails) => {
      if (
        hospitalDetails.facility.facilityType === 'HOSPITAL' ||
        hospitalDetails.facility.facilityType === 'CLINIC'
      ) {
        hospitalLocation = hospitalDetails.facility.name;
      }
    });
  }

  return (
    <div className={classes.root}>
      <div className={classes.doctorProfile}>
        <div className={classes.doctorImage}>
          <img
            src={profileImage !== null ? profileImage : 'https://via.placeholder.com/328x138'}
            alt={firstName}
          />
        </div>
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>{`${firstName} ${lastName}`}</div>
          <div className={classes.specialits}>
            {speciality} <span className={classes.lineDivider}>|</span> {experience} Yrs
            <div
              className={classes.moreToggle}
              onClick={(e) => {
                const currentShowMore = showMore;
                setShowMore(!currentShowMore);
              }}
            >
              More
            </div>
          </div>
          <Scrollbars
            autoHide={true}
            autoHeight
            autoHeightMax={'calc(100vh - 514px'}
            className={showMore ? classes.hideMore : ''}
          >
            <div className={classes.doctorInfoGroup}>
              <div className={classes.infoRow}>
                <div className={classes.iconType}>
                  <img src={require('images/ic-edu.svg')} alt="" />
                </div>
                <div className={classes.details}>{education}</div>
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
                    <br />
                    Clinic Visit
                    {/* <div className={classes.doctorPriceIn}>Rs. 299</div> */}
                  </div>
                  <div className={classes.doctorPrice}>
                    Rs. {onlineConsultFees} <br />
                    Rs. {physicalConsultationFees}
                  </div>
                </div>
              </div>
            </div>
            {appointmentDetails ? (
              <div className={classes.appointmentDetails}>
                <div className={classes.sectionHead}>
                  <span>Appointment Details</span>
                  <span className={classes.moreIcon}>
                    <img src={require('images/ic_more.svg')} alt="" />
                  </span>
                </div>
                <div className={`${classes.doctorInfoGroup} ${classes.noBorder}`}>
                  <div className={`${classes.infoRow} ${classes.textCenter}`}>
                    <div className={classes.iconType}>
                      <img src={require('images/ic_calendar_show.svg')} alt="" />
                    </div>
                    <div className={classes.details}>Today, {appointmentTime}</div>
                  </div>
                  <div className={`${classes.infoRow} ${classes.textCenter}`}>
                    <div className={classes.iconType}>
                      <img src={require('images/ic-language.svg')} alt="" />
                    </div>
                    <div className={classes.details}>40 min average waiting time</div>
                  </div>
                  <div className={`${classes.infoRow}`}>
                    <div className={classes.iconType}>
                      <img src={require('images/ic-location.svg')} alt="" />
                    </div>
                    <div className={classes.details}>
                      Apollo Hospital
                      <br />
                      Road No 72, Film Nagar
                      <br />
                      Jubilee Hills, Hyderabad
                    </div>
                  </div>
                </div>
                <div className={classes.consultGroup}>
                  <div className={classes.infoRow}>
                    <div className={classes.iconType}>
                      <img src={require('images/ic-rupee.svg')} alt="" />
                    </div>
                    <div className={classes.details}>
                      Online Consultation
                      <br />
                      Clinic Visit
                      <br />
                      {/* <div className={classes.doctorPriceIn}>Rs. 299</div> */}
                      <AphButton className={classes.invoiceBtn}>Download Invoice</AphButton>
                    </div>
                    <div className={classes.doctorPrice}>
                      Rs. {onlineConsultFees} <br />
                      Rs. {physicalConsultationFees}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </Scrollbars>
          <div className={classes.buttonGroup}>
            <div className={classes.joinInSection}>
              <span>Doctor Joining In</span>
              <span className={classes.joinTime}>9 mins</span>
            </div>
            {/* <div className={classes.joinInSection}>
                <span>Time Remaining</span>
                <span className={classes.joinTime}>14 mins</span>
              </div> */}
          </div>
        </div>
        {/* <div className={classes.bottomActions}>
          <AphButton className={classes.joinBtn} fullWidth>
            Doctor has joined!
          </AphButton>
          <AphButton fullWidth>Reschedule</AphButton>
        </div> */}
      </div>
    </div>
  );
};
