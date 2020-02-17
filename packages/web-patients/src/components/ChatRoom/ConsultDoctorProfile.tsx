import { Theme, Typography, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useRef, useState } from 'react';
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
      textAlign: 'center',
      '& img': {
        maxWidth: '100%',
        maxHeight: 138,
      },
    },
    moreProfileActions: {
      position: 'absolute',
      right: 10,
      top: 10,
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      padding: '20px 5px 20px 20px',
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
    consultationDetails: {
      width: '100%',
    },
    details: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      paddingLeft: 20,
      lineHeight: 1.5,
      display: 'flex',
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
      '& div:nth-child(2)': {
        margin: '0 0 0 auto',
      },
    },
    summaryDownloads: {
      margin: '0 0 0 auto',
      textAlign: 'right',
      '& button': {
        textTransform: 'uppercase',
        color: '#fc9916',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        fontSize: 12,
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
      paddingTop: 0,
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
      margin: '10px 15px 0 0',
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
    appoinmentDetails: {
      padding: '8px 0 10px 0',
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
      padding: '0 20px 20px 20px',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        color: '#fc9916',
        padding: 0,
        boxShadow: 'none',
        '&:last-child': {
          marginLeft: 'auto',
        },
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    cancelBtn: {
      textTransform: 'none',
      color: '#02475b',
      fontSize: 16,
      fontWeight: 500,
    },
    cancelPopover: {
      marginTop: -10,
    },
    doctorEducationInfo: {
      marginBottom: 15,
    },
  };
});

interface ConsultDoctorProfileProps {
  doctorDetails: DoctorDetails;
  appointmentId: string;
  hasDoctorJoined: boolean;
  jrDoctorJoined: boolean;
}

export const ConsultDoctorProfile: React.FC<ConsultDoctorProfileProps> = (props) => {
  const classes = useStyles({});

  const cancelAppointRef = useRef(null);
  const [isCancelPopoverOpen, setIsCancelPopoverOpen] = React.useState<boolean>(false);

  const { doctorDetails, appointmentId, hasDoctorJoined, jrDoctorJoined } = props;
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
            alt={firstName}
          />
          <div
            onClick={() => setIsCancelPopoverOpen(true)}
            ref={cancelAppointRef}
            className={classes.moreProfileActions}
          >
            <img src={require('images/ic_more.svg')} alt="" />
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
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 465px)'}>
            <div className={`${classes.doctorEducationInfo} ${showMore ? classes.hideMore : ''}`}>
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
                    </div>
                    <div className={classes.doctorPrice}>Rs. {onlineConsultFees}</div>
                  </div>
                </div>
                <div className={classes.consultGroup}>
                  <div className={classes.infoRow}>
                    <div className={classes.iconType}></div>
                    <div className={classes.details}>
                      Clinic visit
                    </div>
                    <div className={classes.doctorPrice}>Rs. {physicalConsultationFees}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.buttonGroup}>
              {!hasDoctorJoined && (
                <div className={classes.joinInSection}>
                  <span>Senior Doctor Joining In</span>
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
                  <div className={classes.appoinmentDetails}>Appointment Details</div>
                </div>
                <div className={`${classes.doctorInfoGroup} ${classes.noBorder}`}>
                  <div className={`${classes.infoRow} ${classes.textCenter}`}>
                    <div className={classes.iconType}>
                      <img src={require('images/ic_calendar_show.svg')} alt="" />
                    </div>
                    <div className={classes.details}>
                      {difference <= 15
                        ? `in ${difference} mins`
                        : otherDateMarkup(appointmentTime)}
                    </div>
                  </div>
                 <div className={`${classes.infoRow}`}>
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
                </div>
                </div>
                <div className={classes.consultGroup}>
                  <div className={`${classes.infoRow} ${classes.textCenter}`}>
                    <div className={classes.iconType}>
                      <img src={require('images/ic-rupee.svg')} alt="" />
                    </div>
                    <div className={classes.consultationDetails}>
                      <div className={classes.details}>
                        <div>Online Consultation</div>
                        <div> Rs. {onlineConsultFees}</div>
                      </div>
                      <div className={classes.details}>
                        <div>Clinic visit</div>
                        <div> Rs. {physicalConsultationFees}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={classes.summaryDownloads}>
                  <AphButton>order summary</AphButton>
                </div>
              </div>
            ) : null}
          </Scrollbars>
        </div>
        {hasDoctorJoined ? (
          <div className={classes.bottomActions}>
            <AphButton className={classes.joinBtn} fullWidth>
              Senior Doctor has joined!
            </AphButton>
          </div>
        ) : jrDoctorJoined ? (
          <div className={classes.bottomActions}>
            <AphButton className={classes.joinBtn} fullWidth>
              Junior Doctor has joined!
            </AphButton>
          </div>
        ) : null}
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
              <Typography variant="h2">hi! :)</Typography>
              <p>
                Since you’re cancelling 15 minutes before your appointment, we’ll issue you a full
                refund!
              </p>
            </div>
            <div className={classes.actions}>
              <AphButton>Reschedule Instead</AphButton>
              <AphButton onClick={() => cancelAppointmentApi()}>Cancel Consult</AphButton>
            </div>
          </div>
        </div>
      </Popover>
      <Popover
        open={isCancelPopoverOpen}
        anchorEl={cancelAppointRef.current}
        onClose={() => setIsCancelPopoverOpen(false)}
        classes={{
          paper: classes.cancelPopover,
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <AphButton onClick={() => setShowCancelPopup(true)} className={classes.cancelBtn}>
          Cancel Appointment
        </AphButton>
      </Popover>
    </div>
  );
};
