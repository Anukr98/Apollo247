import React, { useState, useRef, useEffect } from 'react';
import { Theme, Modal, Popover, Typography, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { clientRoutes } from 'helpers/clientRoutes';
import { ChatWindow } from 'components/Consult/V2/ChatRoom/ChatWindow';
import { ConsultDoctorProfile } from 'components/Consult/V2/ChatRoom/ConsultDoctorProfile';
import { OnlineConsult } from 'components/OnlineConsult';
import { useParams } from 'hooks/routerHooks';
import { useAuth } from 'hooks/authHooks';
import { GET_DOCTOR_DETAILS_BY_ID, GET_SECRETARY_DETAILS_BY_DOCTOR_ID } from 'graphql/doctors';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import { AphButton, AphTextField, AphRadio, AphDialogTitle } from '@aph/web-ui-components';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import {
  TRANSFER_INITIATED_TYPE,
  BookRescheduleAppointmentInput,
  STATUS,
} from 'graphql/types/globalTypes';
import { BOOK_APPOINTMENT_RESCHEDULE } from 'graphql/profiles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useMutation } from 'react-apollo-hooks';
import Scrollbars from 'react-custom-scrollbars';
import { Alerts } from 'components/Alerts/Alerts';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from '../../../../helpers/onePrimaryUser';
import CircularProgress from '@material-ui/core/CircularProgress';
import { GET_APPOINTMENT_DATA } from 'graphql/consult';
import { GetAppointmentData, GetAppointmentDataVariables } from 'graphql/types/GetAppointmentData';
import { GetAppointmentData_getAppointmentData_appointmentsHistory as AppointmentHistory } from 'graphql/types/GetAppointmentData';
import { removeGraphQLKeyword } from 'helpers/commonHelpers';
import {
  getSecretaryDetailsByDoctorId,
  getSecretaryDetailsByDoctorIdVariables,
} from 'graphql/types/getSecretaryDetailsByDoctorId';
import { reschedulePatientTracking } from 'webEngageTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
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
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    doctorListingSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    leftSection: {
      width: 328,
      [theme.breakpoints.down('xs')]: {
        width: '95%',
        padddingRight: '5%',
        paddingBottom: 20,
      },
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      [theme.breakpoints.down('xs')]: {
        width: 'calc(100% - 10px)',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
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
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      margin: '0 20px',
      textTransform: 'uppercase',
    },
    caseNumber: {
      margin: '15px 0 0 0',
    },
    headerActions: {
      margin: '-9px 0 2px auto',
      display: 'flex',
      '& a': {
        display: 'inline-block',
        '& img': {
          verticalAlign: 'middle',
        },
      },
      '& a:last-child': {
        marginLeft: 40,
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
    popoverBottom: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: 'auto !important',
        bottom: 0,
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
    modalBox: {
      margin: 'auto',
      marginTop: 88,
      backgroundColor: theme.palette.common.white,
      position: 'relative',
      outline: 'none',
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
    highlightedText: {
      color: '#0087BA',
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
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: '10px 10px 0 0',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'center',
      color: 'rgba(2,71,91,0.5)',
      padding: '14px 10px',
      textTransform: 'none',
      minWidth: '50%',
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    rootTabContainer: {
      padding: 0,
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
    viewButton: {
      marginLeft: 5,
      display: 'block',
      fontSize: 13,
      padding: '8px 15px',
      borderRadius: 10,
      marginRight: 0,
      color: '#fc9916',
      fontWeight: 'bold',
      lineHeight: 1.85,
      backgroundColor: '#fff',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      minWidth: 135,
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    disabledButton: {
      opacity: 0.7,
      color: '#fc9916 !important',
    },
    mascotIconFeedback: {
      position: 'fixed',
      bottom: 0,
      right: 0,
      marginLeft: 'auto',
      marginRight: 15,
      marginBottom: 12,
      cursor: 'pointer',
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
      },
    },
    feedbackWindow: {
      paddingBottom: 20,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        borderRadius: 0,
      },
    },
    doctorProfile: {
      backgroundColor: '#f7f8f5',
      display: 'flex',
      padding: 12,
      marginBottom: 20,
      borderRadius: 10,
    },
    doctorPic: {
      maxWidth: 40,
      marginRight: 16,
      objectFit: 'cover',
    },
    doctorDetails: {
      flex: 1,
    },
    doctorName: {
      color: '#01475b',
      fontSize: 16,
      fontWeight: 500,
    },
    consultationTime: {
      color: 'rgba(2,71,91,0.6)',
      fontSize: 12,
      fontWeight: 500,
      display: 'flex',
    },
    chatIcon: {
      marginLeft: 'auto',
      '& img': {
        maxWidth: 16,
      },
    },
    feedbackImages: {
      display: 'flex',
      cursor: 'pointer',
      justifyContent: 'space-evenly',
      paddingTop: 15,
    },
    feedWrapper: {
      '& div': {
        color: '#02475b',
        fontSize: 14,
        fontWeight: 600,
        textAlign: 'center',
        textTransform: 'uppercase',
      },
    },
    onActive: {
      display: 'none',
    },
    feedbackDetailed: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 16,
    },
    checkboxOptions: {
      display: 'flex',
      marginBottom: 12,
      '& label': {
        verticalAlign: 'middle',
        alignItems: 'center',
      },
      '& div': {
        fontSize: 14,
        color: '#01475b',
        fontWeight: 500,
      },
    },
    radioLabel: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      alignItems: 'start',
      '& span:last-child': {
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    toImprove: {
      marginBottom: 8,
    },
    submitButton: {
      padding: '0 20px 0px 20px',
      background: '#fff',
      '& button': {
        width: '100%',
        marginTop: 20,
      },
    },
    note: {
      color: '#6d7278',
      fontSize: 13,
      fontStyle: 'italic',
    },
    sendNoteActions: {
      display: 'flex',
      marginTop: 40,
      '& button': {
        flexGrow: 1,
        flexBasis: 0,
        '&:first-child': {
          marginRight: 8,
          color: '#fcb716',
        },
        '&:last-child': {
          marginLeft: 8,
        },
      },
    },
  };
});

type Params = { appointmentId: string; doctorId: string };

const ChatRoom: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const appointmentId = params.appointmentId;
  const doctorId = params.doctorId;
  const { isSignedIn } = useAuth();
  const mascotRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [jrDoctorJoined, setJrDoctorJoined] = useState<boolean>(false);
  const [srDoctorJoined, setSrDoctorJoined] = useState<boolean>(false);
  const [nextSlotAvailable, setNextSlotAvailable] = useState<string>('');
  const [isRescheduleSuccess, setIsRescheduleSuccess] = useState<boolean>(false);
  const [rescheduledSlot, setRescheduledSlot] = useState<string | null>(null);
  const [isChangeSlot, setIsChangeSlot] = useState<boolean>(false);
  const [isNextSlotLoading, setIsNextSlotLoading] = useState<boolean>(false);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [rescheduleCount, setRescheduleCount] = useState<number | null>(null);
  const [reschedulesRemaining, setReschedulesRemaining] = useState<number | null>(null);
  const [isConsultCompleted, setIsConsultCompleted] = useState<boolean>(false);
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const patientId = (currentPatient && currentPatient.id) || '';

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorDetailsById,
    GetDoctorDetailsByIdVariables
  >(GET_DOCTOR_DETAILS_BY_ID, {
    variables: { id: doctorId },
  });

  const {
    data: patientAppointmentData,
    loading: appointmentLoading,
    error: appointmentError,
  } = useQueryWithSkip<GetAppointmentData, GetAppointmentDataVariables>(GET_APPOINTMENT_DATA, {
    variables: {
      appointmentId: appointmentId,
    },
    fetchPolicy: 'no-cache',
  });

  const {
    data: secretaryData,
    loading: secretaryDataLoading,
    error: secretaryDataError,
  } = useQueryWithSkip<getSecretaryDetailsByDoctorId, getSecretaryDetailsByDoctorIdVariables>(
    GET_SECRETARY_DETAILS_BY_DOCTOR_ID,
    {
      variables: { doctorId },
    }
  );

  const bookAppointment = useMutation(BOOK_APPOINTMENT_RESCHEDULE);

  const { fullName, mobileNumber } =
    data && data.getDoctorDetailsById
      ? data.getDoctorDetailsById
      : { fullName: '', mobileNumber: '' };
  const { mobileNumber: secretaryNumber, name: secretaryName } = (secretaryData &&
    secretaryData.getSecretaryDetailsByDoctorId) || { name: '', mobileNumber: '' };

  const rescheduleAPI = (bookRescheduleInput: BookRescheduleAppointmentInput) => {
    bookAppointment({
      variables: {
        bookRescheduleAppointmentInput: bookRescheduleInput,
      },
      fetchPolicy: 'no-cache',
    })
      .then((data: any) => {
        setIsPopoverOpen(false);
        setIsModalOpen(false);
        setApiLoading(false);
        setReschedulesRemaining(3 - rescheduleCount - 1);
        setIsRescheduleSuccess(true);
        setRescheduledSlot(bookRescheduleInput.newDateTimeslot);
        reschedulePatientTracking({
          doctorName: fullName,
          patientName:
            (currentPatient && `${currentPatient.firstName} ${currentPatient.lastName}`) || '',
          secretaryName: secretaryName || '',
          doctorNumber: mobileNumber,
          patientNumber: (currentPatient && currentPatient.mobileNumber) || '',
          secretaryNumber: secretaryNumber || '',
        });
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

  const availableSlot = (slotDoctorId: string, todayDate: any) =>
    client.query<GetDoctorNextAvailableSlot, GetDoctorNextAvailableSlotVariables>({
      query: GET_DOCTOR_NEXT_AVAILABILITY,
      variables: {
        DoctorNextAvailableSlotInput: {
          doctorIds: [slotDoctorId],
          availableDate: moment(todayDate).format('YYYY-MM-DD'),
        },
      },
    });

  const nextAvailableSlot = (slotDoctorId: string, date: Date) => {
    setIsNextSlotLoading(true);
    const todayDate = moment
      .utc(date)
      .local()
      .format('YYYY-MM-DD');
    availableSlot(slotDoctorId, todayDate)
      .then(({ data }: any) => {
        try {
          if (
            data &&
            data.getDoctorNextAvailableSlot &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
          ) {
            setNextSlotAvailable(
              data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0].availableSlot
            );
            setIsNextSlotLoading(false);
          }
        } catch (error) {
          setNextSlotAvailable('');
          setIsAlertOpen(true);
          setAlertMessage(error);
        }
      })
      .catch((e: string) => {
        setIsAlertOpen(true);
        setAlertMessage('something went wrong');
        console.log(e);
      });
  };

  const onePrimaryUser = hasOnePrimaryUser();

  const handleRescheduleOpen = () => {
    nextAvailableSlot(params.doctorId, new Date());
    setIsModalOpen(true);
  };

  const handleAcceptReschedule = () => {
    setApiLoading(true);
    const bookRescheduleInput = {
      appointmentId: params.appointmentId,
      doctorId: params.doctorId,
      newDateTimeslot: nextSlotAvailable,
      initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
      initiatedId: patientId,
      patientId: patientId,
      rescheduledId: '',
    };
    rescheduleCount < 3 ? rescheduleAPI(bookRescheduleInput) : setIsChangeSlot(true);
  };

  let displayId: number | null = null;
  let appointmentDetails: AppointmentHistory | null = null;

  if (
    patientAppointmentData &&
    patientAppointmentData.getAppointmentData &&
    patientAppointmentData.getAppointmentData.appointmentsHistory &&
    patientAppointmentData.getAppointmentData.appointmentsHistory.length > 0
  ) {
    appointmentDetails = patientAppointmentData.getAppointmentData.appointmentsHistory[0];
    displayId = appointmentDetails.displayId;
  }

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        {!isSignedIn || appointmentLoading || loading || secretaryDataLoading ? (
          <LinearProgress />
        ) : appointmentDetails && data ? (
          <div className={classes.doctorListingPage}>
            <div className={classes.breadcrumbs}>
              <a onClick={() => (window.location.href = clientRoutes.appointments())}>
                <div className={classes.backArrow}>
                  <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                  <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
                </div>
              </a>
              Consult Room
            </div>
            <div className={classes.doctorListingSection}>
              <div className={classes.leftSection}>
                {data && appointmentDetails && (
                  <ConsultDoctorProfile
                    setRescheduleCount={setRescheduleCount}
                    handleRescheduleOpen={handleRescheduleOpen}
                    doctorDetails={data}
                    appointmentDetails={appointmentDetails}
                    srDoctorJoined={srDoctorJoined}
                    isConsultCompleted={isConsultCompleted}
                    secretaryData={secretaryData}
                  />
                )}
              </div>
              <div className={classes.rightSection}>
                <div className={classes.sectionHeader}>
                  {displayId && <span className={classes.caseNumber}>Case #{displayId} </span>}
                  {appointmentDetails &&
                    appointmentDetails.status !== STATUS.CANCELLED &&
                    appointmentDetails.status !== STATUS.COMPLETED &&
                    !srDoctorJoined && (
                      <div className={classes.headerActions}>
                        <AphButton
                          disabled={appointmentDetails.isSeniorConsultStarted || srDoctorJoined}
                          classes={{
                            root: classes.viewButton,
                            disabled: classes.disabledButton,
                          }}
                          onClick={() => {
                            handleRescheduleOpen();
                          }}
                        >
                          Reschedule
                        </AphButton>
                      </div>
                    )}
                </div>

                {data && appointmentDetails && (
                  <ChatWindow
                    doctorDetails={data}
                    jrDoctorJoined={jrDoctorJoined}
                    setSrDoctorJoined={setSrDoctorJoined}
                    setJrDoctorJoined={setJrDoctorJoined}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    nextSlotAvailable={nextSlotAvailable}
                    availableNextSlot={nextAvailableSlot}
                    rescheduleAPI={rescheduleAPI}
                    appointmentDetails={appointmentDetails}
                    setIsConsultCompleted={setIsConsultCompleted}
                    secretaryData={secretaryData}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          (appointmentError || error) && (
            <div className={classes.doctorListingPage}>Unable to load appointment information.</div>
          )
        )}
      </div>
      {!onePrimaryUser && <ManageProfile />}
      {data && (
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
                  doctorDetails={data.getDoctorDetailsById}
                  isRescheduleConsult={rescheduleCount < 3}
                  appointmentId={params.appointmentId}
                  rescheduleAPI={rescheduleAPI}
                />
              ) : (
                <div>
                  <div className={classes.dialogContent}>
                    {rescheduleCount < 3 ? (
                      <h6>
                        We’re sorry that you have to reschedule. You can reschedule up to 3 times
                        for free.
                      </h6>
                    ) : (
                      <h6>
                        {'Since you have already rescheduled 3 times with Dr. '}
                        {`${data &&
                          data.getDoctorDetailsById &&
                          data.getDoctorDetailsById.fullName}`}{' '}
                        {`, We will consider this a new paid appointment.`}
                      </h6>
                    )}
                    <br />
                    <h6>
                      Next slot for Dr.{' '}
                      {`${data && data.getDoctorDetailsById && data.getDoctorDetailsById.fullName}`}{' '}
                      is available on -
                    </h6>
                    <br />
                    {!isNextSlotLoading && (
                      <h6 className={classes.highlightedText}>
                        {moment(nextSlotAvailable).format('Do MMMM, dddd \nhh:mm a')}
                      </h6>
                    )}
                  </div>
                  <div className={classes.dialogActions}>
                    {isNextSlotLoading ? (
                      <div className={classes.dialogActionsProgress}>
                        <CircularProgress size={22} color="primary" />
                      </div>
                    ) : (
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
                    )}
                  </div>
                </div>
              )}
            </div>
          </Paper>
        </Modal>
      )}

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
                {` ${data && data.getDoctorDetailsById && data.getDoctorDetailsById.firstName} `}
                has been rescheduled for -{' '}
                {rescheduledSlot && moment(rescheduledSlot).format('Do MMMM, dddd \nhh:mm a')}
              </p>
              {reschedulesRemaining >= 0 && (
                <p>You have {reschedulesRemaining} free reschedueles left</p>
              )}
            </div>
            <div className={classes.actions}>
              <AphButton onClick={() => (window.location.href = clientRoutes.appointments())}>
                OK, GOT IT
              </AphButton>
            </div>
          </div>
        </div>
      </Popover>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};

{
  /* {data && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Paper className={classes.modalBox}>
            <div className={classes.modalBoxClose} onClick={() => setIsModalOpen(false)}>
              <img src={require('images/ic_cross_popup.svg')} alt="" />
            </div>
          </Paper>
        </Modal>
      )} */
}

{
  /* <Popover
        open={isPopoverOpen}
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
              <p>
                We’re sorry that you have to reschedule. You can reschedule up to 3 times for free.
              </p>
              <p>
                Next slot for Dr.{' '}
                {`${data && data.getDoctorDetailsById && data.getDoctorDetailsById.firstName}`} is
                available on -{moment(nextSlotAvailable).format('Do MMMM, dddd \nhh:mm a')}
              </p>
            </div>
            <div className={classes.actions}>
              <AphButton onClick={() => setIsModalOpen(true)}>CHANGE SLOT</AphButton>
              <AphButton
                onClick={() => {
                  const bookRescheduleInput = {
                    appointmentId: params.appointmentId,
                    doctorId: params.doctorId,
                    newDateTimeslot: nextSlotAvailable,
                    initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
                    initiatedId: patientId,
                    patientId: patientId,
                    rescheduledId: '',
                  };
                  rescheduleAPI(bookRescheduleInput);
                }}
              >
                ACCEPT
              </AphButton>
            </div>
          </div>
        </div>
      </Popover> */
}

{
  /* <Popover
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
                {` ${data && data.getDoctorDetailsById && data.getDoctorDetailsById.firstName} `}
                has been rescheduled for{' '}
                {rescheduledSlot && moment(rescheduledSlot).format('Do MMMM, dddd \nhh:mm a')}
              </p>
            </div>
            <div className={classes.actions}>
              <AphButton onClick={() => (window.location.href = clientRoutes.appointments())}>
                OK, GOT IT
              </AphButton>
            </div>
          </div>
        </div>
      </Popover> */
}

{
  /* <div className={classes.headerActions}>
        <div
          onClick={() => {
            setIsFeedbackPopoverOpen(true);
          }}
        >
          <div className={classes.mascotIconFeedback}>
            <img src={require('images/ic-mascot.png')} alt="" />
          </div>
        </div>
      </div> */
}

{
  /* <Popover
        open={isFeedbackPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.popoverBottom }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={`${classes.windowWrap} ${classes.feedbackWindow}`}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 200px)'}>
              <div className={classes.windowBody}>
                <Typography variant="h2">We value your feedback! :)</Typography>
                <p>How was your overall experience with the following consultation — </p>
                <div className={classes.doctorProfile}>
                  <div>
                    <img className={classes.doctorPic} src={require('images/doctordp_01.png')} />
                  </div>
                  <div className={classes.doctorDetails}>
                    <div className={classes.doctorName}>Dr. Simran Rai</div>
                    <div className={classes.consultationTime}>
                      <span>Today, 6:30 pm</span>
                      <div className={classes.chatIcon}>
                        <img src={require('images/ic_chat_icon_gray.svg')} alt="" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={classes.feedbackImages}>
                  <div className={classes.feedWrapper}>
                    <img src={require('images/ic_poor.svg')} />
                    <img className={classes.onActive} src={require('images/ic_poor_filled.svg')} />
                    <div>Poor</div>
                  </div>
                  <div className={classes.feedWrapper}>
                    <img src={require('images/ic_okay.svg')} />
                    <div>okay</div>
                  </div>
                  <div className={classes.feedWrapper}>
                    <img src={require('images/ic_good.svg')} />
                    <div>good</div>
                  </div>
                  <div className={classes.feedWrapper}>
                    <img src={require('images/ic_great.svg')} />
                    <div>great</div>
                  </div>
                </div>
                <div className={classes.feedbackDetailed}>
                  <p>What went wrong?</p>
                  <div>
                    <div className={classes.checkboxOptions}>
                      <FormControlLabel
                        className={classes.radioLabel}
                        control={<AphRadio color="primary" />}
                        label="Doctor didn’t ask enough questions"
                      />
                    </div>
                    <div className={classes.checkboxOptions}>
                      <FormControlLabel
                        className={classes.radioLabel}
                        control={<AphRadio color="primary" />}
                        label="Doctor was not polite"
                      />
                    </div>
                    <div className={classes.checkboxOptions}>
                      <FormControlLabel
                        className={classes.radioLabel}
                        control={<AphRadio color="primary" />}
                        label="Doctor didn’t share prescription"
                      />
                    </div>
                    <div className={classes.checkboxOptions}>
                      <FormControlLabel
                        className={classes.radioLabel}
                        control={<AphRadio color="primary" />}
                        label="Doctor hurried through the chat"
                      />
                    </div>
                    <div className={classes.checkboxOptions}>
                      <FormControlLabel
                        className={classes.radioLabel}
                        control={<AphRadio color="primary" />}
                        label="Doctor replied late"
                      />
                    </div>
                  </div>
                </div>
                <p className={classes.toImprove}>What can be improved? </p>
                <AphTextField placeholder="Write your suggestion here..." />
              </div>
            </Scrollbars>
            <div
              className={classes.submitButton}
              onClick={() => {
                setIsSubmitPopoverOpen(true);
                setIsFeedbackPopoverOpen(false);
              }}
            >
              <AphButton color="primary">Submit Feedback</AphButton>
            </div>
          </div>
        </div>
      </Popover>


      <Popover
        open={isSubmitPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.popoverBottom }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={`${classes.windowWrap} ${classes.feedbackWindow}`}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <div className={classes.windowBody}>
              <Typography variant="h2">Send Note</Typography>
              <p>Write a thank you note for your Doctor!</p>
              <AphTextField placeholder="Write your note here..." />
              <div className={classes.note}>*This note would be viewed only by your Doctor</div>
              <div className={classes.sendNoteActions}>
                <AphButton
                  color="default"
                  onClick={() => {
                    setIsSubmitPopoverOpen(false);
                  }}
                >
                  SKIP
                </AphButton>
                <AphButton color="primary">SEND NOTE</AphButton>
              </div>
            </div>
          </div>
        </div>
      </Popover> */
}

{
  /* <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      /> */
}

export default ChatRoom;
