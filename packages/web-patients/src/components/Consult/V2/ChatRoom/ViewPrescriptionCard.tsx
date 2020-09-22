import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar, Modal, Paper, CircularProgress, Popover } from '@material-ui/core';
import React, { useState, useRef, useEffect } from 'react';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import moment from 'moment';
import { AphButton, AphDialogTitle } from '@aph/web-ui-components';
import { OnlineConsult } from 'components/OnlineConsult';
import {
  TRANSFER_INITIATED_TYPE,
  BookRescheduleAppointmentInput,
  APPOINTMENT_STATE,
} from 'graphql/types/globalTypes';
import { BOOK_APPOINTMENT_RESCHEDULE } from 'graphql/profiles';
import { useMutation } from 'react-apollo-hooks';
import { Alerts } from 'components/Alerts/Alerts';
import { removeGraphQLKeyword, consultWebengageEventsInfo } from 'helpers/commonHelpers';
import { GetAppointmentData_getAppointmentData_appointmentsHistory as AppointmentHistory } from 'graphql/types/GetAppointmentData';
import { prescriptionReceivedTracking } from 'webEngageTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    doctorCardMain: {
      paddingLeft: 15,
      position: 'relative',
    },
    doctorAvatar: {
      position: 'absolute',
      bottom: 10,
    },
    blueBubble: {
      backgroundColor: '#0087ba',
      color: theme.palette.common.white,
      marginBottom: 5,
    },
    petient: {
      color: '#fff',
      textAlign: 'left',
      padding: 12,
      fontWeight: theme.typography.fontWeightMedium,
      display: 'block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      backgroundColor: '#0087ba',
      fontSize: 15,
      maxWidth: 240,
      margin: '0 0 10px 45px',
      '& p': {
        margin: 0,
        padding: '5px 0 0 0',
      },
    },
    chatTime: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      color: 'rgba(255, 255, 255, 0.6)',
      margin: '10px 0 0 0',
    },
    avatar: {
      width: 40,
      height: 40,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    downloadBtn: {
      cursor: 'pointer',
      fontSize: 13,
      lineHeight: '24px',
      color: '#fff',
      minWidth: 101,
      fontWeight: 'bold',
      border: '2px solid #FCB715',
      height: 40,
      background: 'transparent',
      borderRadius: 10,
      margin: '10px 10px 0 0',
      textTransform: 'uppercase',
      '&:focus': {
        outline: 'none',
      },
      '&:disabled': {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
    viewBtn: {
      cursor: 'pointer',
      fontSize: 13,
      lineHeight: '24px',
      color: '#fff',
      minWidth: 94,
      border: '2px solid #FCB716',
      height: 40,
      borderRadius: 10,
      background: '#FCB716',
      margin: '10px 0 0 0',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      '&:focus': {
        outline: 'none',
      },
      '&:disabled': {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
    modalBox: {
      margin: 'auto',
      marginTop: 88,
      backgroundColor: theme.palette.common.white,
      position: 'relative',
      outline: 'none',
    },
    modalBoxClose: {
      position: 'absolute',
      right: -48,
      top: 0,
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: theme.palette.common.white,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        right: 0,
        top: -48,
      },
    },
    popupHeading: {
      padding: '20px 10px',
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'center',
        padding: '0 50px',
      },
    },
    dialogContent: {
      margin: 22,

      position: 'relative',
      '& h6': {
        fontSize: 15,
        fontWeight: 500,
        margin: 0,
        lineHeight: 'normal',
      },
    },
    dialogActions: {
      padding: 10,
      position: 'relative',
      fontSize: 14,
      fontWeight: 600,
      maxWidth: 170,
      display: 'inline-flex',
      '& button': {
        borderRadius: 10,
        minwidth: 130,
        padding: '8px 20px',
        fontSize: 14,
        fontWeight: 600,
      },
    },
    dialogActionsProgress: {
      marginLeft: 135,
    },
    primaryBtn: {
      backgroundColor: '#fc9916 !important',
      display: 'flex',
      flex: '0 0 100%',
    },
    secondaryBtn: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fc9916',
      backgroundColor: 'transparent',
      boxShadow: '0 2px 5px 0 rgba(0,0,0,0.2)',
      border: 'none',
      display: 'flex',
      flex: '0 0 100%',
      marginRight: 10,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
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
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        marginBottom: 0,
      },
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
        maxWidth: 80,
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
  };
});

interface ViewPrescriptionCardProps {
  message: string;
  duration: string;
  messageDetails: any;
  chatTime: string;
  appointmentDetails: AppointmentHistory;
}

export const ViewPrescriptionCard: React.FC<ViewPrescriptionCardProps> = (props) => {
  const classes = useStyles({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const mascotRef = useRef(null);
  const [isChangeSlot, setIsChangeSlot] = useState<boolean>(false);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [reschedulesRemaining, setReschedulesRemaining] = useState<number | null>(null);
  const [isRescheduleSuccess, setIsRescheduleSuccess] = useState<boolean>(false);
  const [rescheduledSlot, setRescheduledSlot] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const { messageDetails, chatTime, appointmentDetails } = props;

  const { currentPatient } = useAllCurrentPatients();
  const doctorDetail =
    messageDetails && messageDetails.transferInfo && messageDetails.transferInfo.doctorInfo;

  useEffect(() => {
    if (doctorDetail) {
      const eventInfo = consultWebengageEventsInfo(doctorDetail, currentPatient);
      prescriptionReceivedTracking(eventInfo);
    }
  }, [doctorDetail]);

  const bookAppointment = useMutation(BOOK_APPOINTMENT_RESCHEDULE);
  const rescheduleAPI = (
    bookRescheduleInput: BookRescheduleAppointmentInput,
    type: TRANSFER_INITIATED_TYPE
  ) => {
    const { transferInfo } = messageDetails;
    bookAppointment({
      variables: {
        bookRescheduleAppointmentInput: bookRescheduleInput,
      },
      fetchPolicy: 'no-cache',
    })
      .then((data: any) => {
        setIsModalOpen(false);
        setApiLoading(false);
        setReschedulesRemaining(
          type === TRANSFER_INITIATED_TYPE.PATIENT
            ? 3 - transferInfo.reschduleCount - 1
            : 3 - transferInfo.reschduleCount
        );
        setIsRescheduleSuccess(true);
        setRescheduledSlot(bookRescheduleInput.newDateTimeslot);
      })

      .catch((e) => {
        console.log(e);
        setApiLoading(false);
        setIsAlertOpen(true);
        setAlertMessage(
          `Error occured while rescheduling the appointment(${removeGraphQLKeyword(e)})`
        );
      });
  };

  const handleAcceptReschedule = () => {
    setApiLoading(true);
    const { appointmentId, doctorId, transferDateTime, reschduleId } = messageDetails.transferInfo;
    const bookRescheduleInput = {
      appointmentId,
      doctorId,
      newDateTimeslot: transferDateTime,
      initiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
      initiatedId: doctorId,
      patientId: (currentPatient && currentPatient.id) || '',
      rescheduledId: reschduleId,
    };
    rescheduleAPI(bookRescheduleInput, TRANSFER_INITIATED_TYPE.DOCTOR);
  };

  return (
    <div className={classes.doctorCardMain}>
      {/* <div className={classes.doctorAvatar}>
        <Avatar className={classes.avatar} src={require('images/ic_mascot_male.png')} alt="" />
      </div> */}
      <div className={`${classes.blueBubble} ${classes.petient} `}>
        <p>
          {messageDetails && messageDetails.message === '^^#followupconsult' && (
            <>
              <div>
                Hello <span>{currentPatient.firstName}</span>
              </div>
              <div>Hope your consultation went well… Here is your prescription.</div>
              <div>
                {messageDetails.transferInfo && messageDetails.transferInfo.pdfUrl && (
                  <a
                    href={messageDetails.transferInfo.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className={classes.downloadBtn}>Download</button>
                  </a>
                )}

                <Link to={clientRoutes.prescription(messageDetails.transferInfo.appointmentId)}>
                  <button className={classes.viewBtn}>View</button>
                </Link>
              </div>
            </>
          )}
          {messageDetails && messageDetails.message === '^^#rescheduleconsult' && (
            <>
              <div>
                {messageDetails.transferInfo &&
                messageDetails.transferInfo.reschduleCount &&
                messageDetails.transferInfo.reschduleCount > 2
                  ? `Since you have already rescheduled 3 times with 
                     Dr. ${messageDetails.transferInfo.doctorInfo &&
                       messageDetails.transferInfo.doctorInfo
                         .displayName}, we will consider this a new paid appointment.`
                  : "We're sorry that you have to reschedule. You can reschedule up to 3 times for free."}
              </div>
              {messageDetails.transferInfo && (
                <>
                  <div>
                    {`Next slot for ${messageDetails.transferInfo.doctorInfo &&
                      messageDetails.transferInfo.doctorInfo.displayName} is available on- `}
                  </div>
                  <div>
                    {moment(messageDetails.transferInfo.transferDateTime).format(
                      'Do MMMM, dddd \nhh:mm a'
                    )}
                  </div>
                </>
              )}

              <div>
                <button className={classes.downloadBtn} onClick={() => setIsModalOpen(true)}>
                  CHANGE SLOT
                </button>

                <button className={classes.viewBtn} onClick={() => handleAcceptReschedule()}>
                  {apiLoading ? (
                    <CircularProgress size={22} color="secondary" />
                  ) : (
                    <span>ACCEPT</span>
                  )}
                </button>
              </div>
            </>
          )}
          <div className={classes.chatTime}>{chatTime} </div>
        </p>
      </div>
      {messageDetails && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Paper className={classes.modalBox} style={{ width: isChangeSlot ? 700 : 328 }}>
            <div
              className={classes.modalBoxClose}
              onClick={() => {
                setIsModalOpen(false);
                setIsChangeSlot(false);
              }}
            >
              <img src={require('images/ic_cross_popup.svg')} alt="" />
            </div>
            <AphDialogTitle className={classes.popupHeading}>Reschedule</AphDialogTitle>
            <div>
              {isChangeSlot ? (
                <OnlineConsult
                  setIsPopoverOpen={setIsModalOpen}
                  doctorDetails={messageDetails.transferInfo.doctorInfo || null}
                  isRescheduleConsult={messageDetails.transferInfo.reschduleCount < 3}
                  appointmentId={messageDetails.transferInfo.appointmentId}
                  rescheduleAPI={rescheduleAPI}
                />
              ) : (
                <div>
                  <div className={classes.dialogContent}>
                    Dr.
                    {messageDetails.transferInfo &&
                      messageDetails.transferInfo.doctorInfo &&
                      messageDetails.transferInfo.doctorInfo.fullName}{' '}
                    has suggested the below slot for rescheduling this appointment —
                    {moment(messageDetails.transferInfo.transferDateTime).format(
                      'Do MMMM, dddd \nhh:mm a'
                    )}
                  </div>
                  <div className={classes.dialogActions}>
                    <>
                      <AphButton
                        className={classes.secondaryBtn}
                        color="primary"
                        onClick={() => setIsChangeSlot(true)}
                      >
                        {'CHANGE SLOT'}
                      </AphButton>

                      <AphButton
                        className={classes.primaryBtn}
                        color="primary"
                        onClick={() => {
                          handleAcceptReschedule();
                        }}
                      >
                        {apiLoading ? (
                          <CircularProgress size={22} color="secondary" />
                        ) : (
                          <span>ACCEPT</span>
                        )}
                      </AphButton>
                    </>
                  </div>
                </div>
              )}
            </div>
          </Paper>
        </Modal>
      )}
      {messageDetails && (
        <Popover
          open={isRescheduleSuccess}
          anchorEl={mascotRef.current}
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
                <img src={require('images/ic-mascot.png')} alt="" />
              </div>
              <div className={classes.windowBody}>
                <p>Hi! :)</p>
                <p>
                  Your appointment with Dr.
                  {` ${messageDetails.transferInfo &&
                    messageDetails.transferInfo.doctorInfo &&
                    messageDetails.transferInfo.doctorInfo.firstName} `}
                  has been rescheduled for -{' '}
                  {rescheduledSlot && moment(rescheduledSlot).format('Do MMMM, dddd \nhh:mm a')}
                </p>
                {reschedulesRemaining >= 0 && (
                  <p>You have {reschedulesRemaining} free reschedueles left</p>
                )}
              </div>
              <Link to={clientRoutes.appointments()}>
                <div className={classes.actions}>
                  <AphButton>OK, GOT IT</AphButton>
                </div>
              </Link>
            </div>
          </div>
        </Popover>
      )}
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
