import { Theme, Typography, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import _forEach from 'lodash/forEach';
import { GET_PATIENT_APPOINTMENTS } from 'graphql/doctors';
import {
  GetPatientAppointments,
  GetPatientAppointmentsVariables,
} from 'graphql/types/GetPatientAppointments';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useAllCurrentPatients } from 'hooks/authHooks';
import _findIndex from 'lodash/findIndex';
import { format } from 'date-fns';
import isTomorrow from 'date-fns/isTomorrow';
import { getIstTimestamp } from 'helpers/dateHelpers';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { clientRoutes } from 'helpers/clientRoutes';
import formatDistanceStrict from 'date-fns/formatDistance';
import { REQUEST_ROLES } from 'graphql/types/globalTypes';
import { useMutation } from 'react-apollo-hooks';
import { cancelAppointment, cancelAppointmentVariables } from 'graphql/types/cancelAppointment';
import { CANCEL_APPOINTMENT } from 'graphql/profiles';

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
      position: 'relative',
    },
    moreProfileActions: {
      position: 'absolute',
      right: 10,
      top: 10,
      '& img': {
        verticalAlign: 'middle',
      },
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
      textTransform: 'none',
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

    canelAppointmentBtn: {
      position: 'absolute',
      right: 10,
      top: 10,
      '& button': {
        fontSize: 16,
        fontWeight: 500,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.4)',
        borderRadius: 10,
        textTransform: 'none',
        backgroundColor: theme.palette.common.white,
        color: '#02475b',
        minWidth: 200,
        justifyContent: 'left',
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
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
    actions: {
      padding: '10px 20px 20px 20px',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        minWidth: 156,
        '&:first-child': {
          color: '#fc9916',
        },
        '&:last-child': {
          marginLeft: 'auto',
        },
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
  };
});

interface ConsultDoctorProfileProps {
  doctorDetails: DoctorDetails;
  appointmentId: string;
  hasDoctorJoined: boolean;
}

export const ConsultDoctorProfile: React.FC<ConsultDoctorProfileProps> = (props) => {
  const classes = useStyles({});

  const { doctorDetails, appointmentId, hasDoctorJoined } = props;
  const currentDate = new Date().toISOString().substring(0, 10);

  const [showMore, setShowMore] = useState<boolean>(true);
  const [moreOrLessMessage, setMoreOrLessMessage] = useState<string>('MORE');

  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const patientId = currentPatient ? currentPatient.id : '';

  const { data, loading, error } = useQueryWithSkip<
    GetPatientAppointments,
    GetPatientAppointmentsVariables
  >(GET_PATIENT_APPOINTMENTS, {
    variables: {
      patientAppointmentsInput: {
        patientId: patientId || '',
        appointmentDate: currentDate,
      },
    },
  });

  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <div>Unable to load appointment information.</div>;
  }

  const appointmentDetails = [];
  let hospitalLocation = '',
    address1 = '',
    address2 = '',
    address3 = '';

  if (data && data.getPatinetAppointments && data.getPatinetAppointments.patinetAppointments) {
    const previousAppointments = data.getPatinetAppointments.patinetAppointments;
    const findAppointment = _findIndex(previousAppointments, {
      id: appointmentId,
    });
    if (findAppointment >= 0) {
      appointmentDetails.push(previousAppointments[findAppointment]);
    }
  }

  // redirect the user to consult room if any mismatch in appointment id.
  if (appointmentDetails.length === 0) {
    window.location.href = clientRoutes.appointments();
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
    doctorDetails &&
    doctorDetails.getDoctorDetailsById &&
    doctorDetails.getDoctorDetailsById.specialty
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
  const currentTime = new Date().getTime();

  const aptArray =
    appointmentDetails[0] && appointmentDetails[0].appointmentDateTime
      ? appointmentDetails[0].appointmentDateTime.split('T')
      : ['', ''];

  const appointmentTime = getIstTimestamp(new Date(aptArray[0]), aptArray[1].substring(0, 5));
  const difference = Math.round((appointmentTime - currentTime) / 60000);
  const differenceInWords = formatDistanceStrict(appointmentTime, currentTime);

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
        address1 = hospitalDetails.facility.streetLine1 || '';
        address2 = hospitalDetails.facility.streetLine2 || '';
        address3 = hospitalDetails.facility.streetLine3 || '';
      }
    });
  }

  const otherDateMarkup = (appointmentTime: number) => {
    if (isTomorrow(new Date(appointmentTime))) {
      return `Tomorrow ${format(new Date(appointmentTime), 'h:mm a')}`;
    } else {
      return format(new Date(appointmentTime), 'dd MMM yyyy, h:mm a');
    }
  };

  const cancelMutation = useMutation<cancelAppointment, cancelAppointmentVariables>(
    CANCEL_APPOINTMENT,
    {
      variables: {
        cancelAppointmentInput: {
          appointmentId: appointmentId,
          cancelReason: '',
          cancelledBy: REQUEST_ROLES.PATIENT,
          cancelledById: patientId,
        },
      },
      fetchPolicy: 'no-cache',
    }
  );

  const cancelAppointmentApi = () => {
    cancelMutation()
      .then((data: any) => {
        setShowCancelPopup(false);
        window.location.href = clientRoutes.appointments();
      })
      .catch((e: string) => {
        setShowCancelPopup(false);
        alert(`Error occured while cancelling the appointment, ${e}`);
      });
  };

  return (
    <div className={classes.root}>
      <div className={classes.doctorProfile}>
        <div className={classes.doctorImage}>
          <img
            src={profileImage !== null ? profileImage : 'https://via.placeholder.com/328x138'}
            height="300"
            width="300"
            alt={firstName}
          />
          <div className={classes.moreProfileActions}>
            <img src={require('images/ic_more.svg')} alt="" />
          </div>
          <div className={classes.canelAppointmentBtn}>
            <AphButton onClick={() => setShowCancelPopup(true)}>Cancel Appointment</AphButton>
          </div>
        </div>
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>{`Dr. ${_startCase(_toLower(firstName))} ${_startCase(
            _toLower(lastName)
          )}`}</div>
          <div className={classes.specialits}>
            {speciality} <span className={classes.lineDivider}>|</span> {experience}
            {parseInt(experience || '0', 10) > 1 ? ' Yrs' : ' Year'}
            <div
              className={classes.moreToggle}
              onClick={(e) => {
                const currentShowMore = showMore;
                const currentMoreOrLessMessage = moreOrLessMessage;
                setShowMore(!currentShowMore);
                setMoreOrLessMessage(currentMoreOrLessMessage === 'MORE' ? 'LESS' : 'MORE');
              }}
            >
              {moreOrLessMessage}
            </div>
          </div>
          {/* <Scrollbars
            autoHide={true}
            autoHeight
            autoHeightMax={"calc(100vh - 514px"}
          > */}
          <div className={showMore ? classes.hideMore : ''}>
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
          </div>
          {/* </Scrollbars> */}
          <div className={classes.buttonGroup}>
            {!hasDoctorJoined && (
              <div className={classes.joinInSection}>
                <span>Doctor Joining In</span>
                <span className={classes.joinTime}>{differenceInWords}</span>
              </div>
            )}
            {/* <div className={classes.joinInSection}>
                <span>Time Remaining</span>
                <span className={classes.joinTime}>14 mins</span>
              </div> */}
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
                  <div className={classes.details}>
                    {difference <= 15 ? `in ${difference} mins` : otherDateMarkup(appointmentTime)}
                  </div>
                </div>
                {/* <div className={`${classes.infoRow} ${classes.textCenter}`}>
                  <div className={classes.iconType}>
                    <img src={require("images/ic-language.svg")} alt="" />
                  </div>
                  <div className={classes.details}>
                    40 min average waiting time
                  </div>
                </div> */}
                {/* <div className={`${classes.infoRow}`}>
                  <div className={classes.iconType}>
                    <img src={require("images/ic-location.svg")} alt="" />
                  </div>
                  <div className={classes.details}>
                    {hospitalLocation}
                    <br />
                    {address1}
                    <br />
                    {`${address2} ${address3}`}
                  </div>
                </div> */}
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
        </div>
        <div className={classes.bottomActions}>
          {hasDoctorJoined && (
            <AphButton className={classes.joinBtn} fullWidth>
              Doctor has joined!
            </AphButton>
          )}

          {/* <AphButton fullWidth>Reschedule</AphButton> */}
        </div>
      </div>
      <Popover
        open={showCancelPopup}
        // anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            <div className={classes.windowBody}>
              <Typography variant="h2">Hi, Sankeerth :)</Typography>
              <p>
                Since you're cancelling 15 minutes before your appointment, we'll issuew you a full
                refund!
              </p>
            </div>
            <div className={classes.actions}>
              <AphButton>Reschedule Instead</AphButton>
              <AphButton color="primary" onClick={() => cancelAppointmentApi()}>
                Cancel Consult
              </AphButton>
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};
