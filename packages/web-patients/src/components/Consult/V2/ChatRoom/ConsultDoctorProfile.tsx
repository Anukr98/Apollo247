import { Theme, Typography, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useRef, useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import _forEach from 'lodash/forEach';
import { useAllCurrentPatients } from 'hooks/authHooks';
import _find from 'lodash/find';
import format from 'date-fns/format';
import isTomorrow from 'date-fns/isTomorrow';
import { getIstTimestamp } from 'helpers/dateHelpers';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { clientRoutes } from 'helpers/clientRoutes';
import formatDistanceStrict from 'date-fns/formatDistance';
import { REQUEST_ROLES, STATUS } from 'graphql/types/globalTypes';
import { useMutation } from 'react-apollo-hooks';
import { cancelAppointment, cancelAppointmentVariables } from 'graphql/types/cancelAppointment';
import { CANCEL_APPOINTMENT } from 'graphql/profiles';
import { GET_CONSULT_INVOICE } from 'graphql/consult';
import { Alerts } from 'components/Alerts/Alerts';
import {
  isPastAppointment,
  getDiffInMinutes,
  getAvailableFreeChatDays,
} from 'helpers/commonHelpers';
import { useApolloClient } from 'react-apollo-hooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useParams } from 'hooks/routerHooks';
import { GetAppointmentData_getAppointmentData_appointmentsHistory as AppointmentHistory } from 'graphql/types/GetAppointmentData';

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
      alignItems: 'center',
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
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 10,
      },
      '& button': {
        textTransform: 'uppercase',
        color: '#fc9916',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        fontSize: 12,
        minWidth: 52,
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
      marginTop: 20,
    },
    doctorjoinSection: {
      backgroundColor: '#FF748E',
      color: '#fff',
      margin: '20px 0',
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'center',
      },
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
      padding: '8px 0 3px 0',
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
  appointmentDetails: AppointmentHistory;
  setRescheduleCount: (rescheduleCount: number | null) => void;
  handleRescheduleOpen: any;
  srDoctorJoined: boolean;
  isConsultCompleted: boolean;
}

type Params = { appointmentId: string; doctorId: string };

export const ConsultDoctorProfile: React.FC<ConsultDoctorProfileProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const appointmentId = params.appointmentId;
  const cancelAppointRef = useRef(null);
  const [isCancelPopoverOpen, setIsCancelPopoverOpen] = React.useState<boolean>(false);

  const { doctorDetails, setRescheduleCount, handleRescheduleOpen, appointmentDetails } = props;

  const [showMore, setShowMore] = useState<boolean>(true);
  const [moreOrLessMessage, setMoreOrLessMessage] = useState<string>('MORE');

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [refreshTimer, setRefreshTimer] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const patientId = currentPatient ? currentPatient.id : '';
  let hospitalLocation = '';

  const downloadInvoice = (patientId: string, appointmentId: string) => {
    client
      .query({
        query: GET_CONSULT_INVOICE,
        variables: {
          patientId: patientId,
          appointmentId: appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }: any) => {
        if (data && data.getOrderInvoice && data.getOrderInvoice.length) {
          window.open(data.getOrderInvoice, '_blank');
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // redirect the user to consult room if any mismatch in appointment id.
  if (!appointmentDetails) {
    window.location.href = clientRoutes.appointments();
  } else {
    if (appointmentDetails.rescheduleCount) {
      setRescheduleCount(appointmentDetails.rescheduleCount);
    }
    const currentTime = new Date().getTime();
    const appointmentTime = new Date(appointmentDetails.appointmentDateTime);
    const differenceInWords = formatDistanceStrict(appointmentTime, currentTime);

    const {
      firstName,
      fullName,
      specialty,
      experience,
      qualification,
      awards,
      languages,
      photoUrl,
      onlineConsultationFees,
      physicalConsultationFees,
      doctorHospital,
    } = doctorDetails && doctorDetails.getDoctorDetailsById;

    const shouldRefreshComponent = (differenceInMinutes: number) => {
      const id = setInterval(() => {
        id && clearInterval(id);
        if (
          differenceInMinutes >= -15 &&
          (differenceInMinutes <= 30 || appointmentDetails.isSeniorConsultStarted)
        ) {
          setRefreshTimer(!refreshTimer);
        }
      }, 60000);
    };

    const differenceInMinutes = getDiffInMinutes(appointmentDetails.appointmentDateTime);
    shouldRefreshComponent(differenceInMinutes);
    const specialityName = (specialty && specialty.name) || '';

    if (doctorHospital) {
      _forEach(doctorHospital, (hospitalDetails) => {
        if (
          hospitalDetails.facility.facilityType === 'HOSPITAL' ||
          hospitalDetails.facility.facilityType === 'CLINIC'
        ) {
          hospitalLocation = hospitalDetails.facility.name;
        }
      });
    }

    const otherDateMarkup = (appointmentTime: Date) => {
      if (isTomorrow(appointmentTime)) {
        return `Tomorrow ${format(appointmentTime, 'h:mm a')}`;
      } else {
        return format(appointmentTime, 'dd MMM yyyy, h:mm a');
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
      setApiLoading(true);
      cancelMutation()
        .then((data: any) => {
          setApiLoading(false);
          setShowCancelPopup(false);
          window.location.href = clientRoutes.appointments();
        })
        .catch((e: string) => {
          setShowCancelPopup(false);
          setApiLoading(false);
          setIsAlertOpen(true);
          setAlertMessage(`Error occured while cancelling the appointment, ${e}`);
        });
    };

    return (
      <div className={classes.root}>
        <div className={classes.doctorProfile}>
          <div className={classes.doctorImage}>
            <img
              src={photoUrl !== null ? photoUrl || '' : require('images/no_photo.png')}
              alt={firstName || ''}
            />
            {appointmentDetails.status !== STATUS.COMPLETED &&
              appointmentDetails.status !== STATUS.CANCELLED &&
              !appointmentDetails.isSeniorConsultStarted &&
              !props.srDoctorJoined && (
                <div
                  onClick={() => setIsCancelPopoverOpen(true)}
                  ref={cancelAppointRef}
                  className={classes.moreProfileActions}
                >
                  <img src={require('images/ic_more.svg')} alt="" />
                </div>
              )}
          </div>
          <div className={classes.doctorInfo}>
            <div className={classes.doctorName}>{_startCase(_toLower(fullName || ''))}</div>
            <div className={classes.specialits}>
              {specialityName} <span className={classes.lineDivider}>|</span> {experience}
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
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 405px)'}>
              <div className={`${classes.doctorEducationInfo} ${showMore ? classes.hideMore : ''}`}>
                <div className={classes.doctorInfoGroup}>
                  {qualification && (
                    <div className={classes.infoRow}>
                      <div className={classes.iconType}>
                        <img src={require('images/ic-edu.svg')} alt="" />
                      </div>
                      <div className={classes.details}>{qualification}</div>
                    </div>
                  )}
                  {awards && (
                    <div className={classes.infoRow}>
                      <div className={classes.iconType}>
                        <img src={require('images/ic-awards.svg')} alt="" />
                      </div>
                      <div className={classes.details}>{awards.replace(/<\/?[^>]+(>|$)/g, '')}</div>
                    </div>
                  )}
                </div>
                <div className={`${classes.doctorInfoGroup} ${classes.opacityMobile}`}>
                  {hospitalLocation && (
                    <div className={classes.infoRow}>
                      <div className={classes.iconType}>
                        <img src={require('images/ic-location.svg')} alt="" />
                      </div>
                      <div className={classes.details}>{hospitalLocation}</div>
                    </div>
                  )}
                  {languages && (
                    <div className={`${classes.infoRow} ${classes.textCenter}`}>
                      <div className={classes.iconType}>
                        <img src={require('images/ic-language.svg')} alt="" />
                      </div>
                      <div className={classes.details}>{languages}</div>
                    </div>
                  )}
                </div>
                <div className={`${classes.doctorInfoGroup} ${classes.consultDoctorInfoGroup}`}>
                  <div className={classes.consultGroup}>
                    <div className={classes.infoRow}>
                      <div className={classes.iconType}>
                        <img src={require('images/ic-rupee.svg')} alt="" />
                      </div>
                      <div className={classes.details}>Online Consultation</div>
                      <div className={classes.doctorPrice}>Rs. {onlineConsultationFees || 0}</div>
                    </div>
                  </div>
                  {physicalConsultationFees && (
                    <div className={classes.consultGroup}>
                      <div className={classes.infoRow}>
                        <div className={classes.iconType}></div>
                        <div className={classes.details}>Clinic visit</div>
                        <div className={classes.doctorPrice}>Rs. {physicalConsultationFees}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={classes.buttonGroup}>
                {!isPastAppointment(appointmentDetails.appointmentDateTime) && // check for active and upcoming appointments
                  (appointmentDetails.status === STATUS.COMPLETED || props.isConsultCompleted ? (
                    <div className={classes.joinInSection}>
                      <span>
                        {getAvailableFreeChatDays(appointmentDetails.appointmentDateTime)}
                      </span>
                    </div>
                  ) : (
                    differenceInMinutes > -16 && // enables only for upcoming and active  appointments
                    (appointmentDetails.isSeniorConsultStarted || props.srDoctorJoined ? (
                      <div className={`${classes.joinInSection} ${classes.doctorjoinSection}`}>
                        <span>Doctor has joined!</span>
                      </div>
                    ) : (
                      <div className={classes.joinInSection}>
                        <span>Doctor Joining In</span>
                        <span className={classes.joinTime}>
                          {differenceInMinutes > 0 && differenceInMinutes <= 15
                            ? `${differenceInMinutes} minutes`
                            : differenceInWords}
                        </span>
                      </div>
                    ))
                  ))}
              </div>
              {appointmentDetails &&
              appointmentDetails.status !== STATUS.COMPLETED &&
              !props.srDoctorJoined &&
              !props.isConsultCompleted ? (
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
                        {differenceInMinutes <= 15 && differenceInMinutes > 0
                          ? `in ${differenceInMinutes} mins`
                          : otherDateMarkup(appointmentTime)}
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
                          <div>Amount Paid</div>
                          <div> Rs. {onlineConsultationFees || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={classes.summaryDownloads}>
                    <AphButton onClick={() => downloadInvoice(patientId, appointmentId)}>
                      Invoice
                    </AphButton>
                  </div>
                </div>
              ) : null}
            </Scrollbars>
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
          onBlur={() => {
            setShowCancelPopup(false);
            setIsCancelPopoverOpen(false);
          }}
          classes={{ paper: classes.bottomPopover }}
        >
          <div className={classes.successPopoverWindow}>
            <div className={classes.windowWrap}>
              <div className={classes.mascotIcon}>
                <img src={require('images/ic-mascot.png')} alt="" />
              </div>
              <div className={classes.windowBody}>
                <Typography variant="h2">hi! :)</Typography>
                <p>
                  Since you’re cancelling 15 minutes before your appointment, we’ll issue you a full
                  refund!
                </p>
              </div>
              <div className={classes.actions}>
                <AphButton
                  onClick={() => {
                    handleRescheduleOpen();
                    setShowCancelPopup(false);
                  }}
                >
                  Reschedule Instead
                </AphButton>

                <AphButton onClick={() => cancelAppointmentApi()}>
                  {apiLoading ? (
                    <CircularProgress size={22} color="secondary" />
                  ) : (
                    <span>Cancel Consult</span>
                  )}
                </AphButton>
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
        <Alerts
          setAlertMessage={setAlertMessage}
          alertMessage={alertMessage}
          isAlertOpen={isAlertOpen}
          setIsAlertOpen={setIsAlertOpen}
        />
      </div>
    );
  }
};
