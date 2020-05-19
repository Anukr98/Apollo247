import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, MenuItem, Popover, CircularProgress, Avatar } from '@material-ui/core';
import React, { useEffect } from 'react';
import Modal from '@material-ui/core/Modal';
import { History } from 'history';
import { Header } from 'components/Header';
import { AphSelect, AphButton } from '@aph/web-ui-components';
import { AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { ConsultationsCard } from 'components/ConsultRoom/ConsultationsCard';
import { NavigationBottom } from 'components/NavigationBottom';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { AddNewProfile } from 'components/MyAccount/AddNewProfile';
import { MEDICINE_ORDER_PAYMENT_TYPE } from 'graphql/types/globalTypes';
// import { GET_PATIENT_APPOINTMENTS, GET_PATIENT_ALL_APPOINTMENTS } from 'graphql/doctors';
import { GET_PATIENT_ALL_APPOINTMENTS } from 'graphql/doctors';
// import {
//   GetPatientAppointments,
//   GetPatientAppointmentsVariables,
// } from 'graphql/types/GetPatientAppointments';
import {
  GetPatientAllAppointments,
  GetPatientAllAppointmentsVariables,
} from 'graphql/types/GetPatientAllAppointments';
import { clientRoutes } from 'helpers/clientRoutes';
import { Route } from 'react-router-dom';
// import { APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import _isEmpty from 'lodash/isEmpty';
import { useAuth } from 'hooks/authHooks';
// import { STATUS } from 'graphql/types/globalTypes';
// import isToday from 'date-fns/isToday';
// import { TransferConsultMessage } from 'components/ConsultRoom/TransferConsultMessage';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import moment from 'moment';
// import { useApolloClient } from 'react-apollo-hooks';
import _find from 'lodash/find';
import { getAppStoreLink } from 'helpers/dateHelpers';
// import { GetAppointmentData, GetAppointmentDataVariables } from 'graphql/types/GetAppointmentData';
import { GET_APPOINTMENT_DATA } from 'graphql/consult';
import { PAYMENT_TRANSACTION_STATUS } from 'graphql/payments';
// import { getIstTimestamp } from 'helpers/dateHelpers';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { gtmTracking } from '../../gtmTracking';
import { OrderStatusContent } from 'components/OrderStatusContent';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    none: {
      display: 'none',
    },
    block: {
      display: 'block',
    },
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 0,
      boxShadow: '0 10px 20px 0 rgba(128, 128, 128, 0.3)',
      paddingLeft: 20,
      paddingRight: 20,
      position: 'sticky',
      top: 88,
      zIndex: 99,
      [theme.breakpoints.down('xs')]: {
        top: 70,
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
      padding: '14px 10px',
      textTransform: 'none',
      opacity: 0.5,
      lineHeight: 'normal',
    },
    tabSelected: {
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 3,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    consultPage: {
      backgroundColor: '#f7f8f5',
      paddingTop: 30,
      borderRadius: '0 0 10px 10px',
      marginBottom: 20,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        marginBottom: 0,
      },
    },
    consultationsHeader: {
      padding: '10px 40px 30px 40px',
      '& h1': {
        display: 'flex',
        fontSize: 50,
        [theme.breakpoints.down('xs')]: {
          fontSize: 30,
        },
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
          maxWidth: 'calc(100% - 55px)',
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: '#0087ba',
        margin: 0,
        paddingTop: 10,
      },
    },
    selectMenuRoot: {
      paddingRight: 55,
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 50,
      fontWeight: 600,
      lineHeight: '66px',
      paddingTop: 2,
      paddingBottom: 7,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      [theme.breakpoints.down('xs')]: {
        fontSize: 30,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      marginLeft: 30,
      paddingBottom: 0,
      paddingRight: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    bottomActions: {
      marginTop: 20,
      maxWidth: 201,
    },
    consultSection: {
      display: 'flex',
      padding: 20,
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      marginTop: -60,
    },
    rightSection: {
      width: 328,
      marginTop: -183,
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
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
    noAppointments: {
      backgroundColor: theme.palette.common.white,
      minWidth: 320,
      margin: 'auto',
      padding: 16,
      marginTop: 8,
      borderRadius: 10,
      display: 'flex',
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    leftGroup: {
      width: 'calc(100% - 52px)',
      '& h3': {
        margin: 0,
        padding: 0,
        fontSize: 16,
        color: '#02475b',
        fontWeight: 500,
      },
      '& button': {
        marginTop: 12,
      },
    },
    rightGroup: {
      paddingLeft: 16,
      '& img': {
        maxWidth: 36,
      },
    },
    pageLoader: {
      position: 'absolute',
      top: 0,
    },
    loader: {
      textAlign: 'center',
      padding: '20px 0',
    },
    messageBox: {
      padding: '10px 20px 25px 20px',
      '& p': {
        fontSize: 14,
        color: '#01475b',
        fontWeight: 500,
        lineHeight: '18px',
      },
    },
    appDownloadBtn: {
      backgroundColor: '#fcb716',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      padding: '9px 24px',
      display: 'block',
      textAlign: 'center',
    },
    confirmedDialog: {
      '& >div:nth-child(3)': {
        '& >div': {
          maxWidth: 385,
        },
      },
    },
    borderText: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 12,
      marginTop: 12,
    },
    doctorDetails: {
      boxShadow: '0 0px 5px 0 rgba(0, 0, 0, 0.3)',
      borderRadius: 10,
      border: 'solid 1px #979797',
      padding: 16,
      display: 'flex',
      alignItems: 'center',
    },
    doctorInfo: {
      display: 'flex',
      alignItems: 'center',
    },
    doctorText: {
      padding: 0,
    },
    drName: {
      fontSize: 14,
      color: '#01475b',
      fontWeight: 500,
    },
    specality: {
      fontSize: 10,
      color: '#01475b',
      fontWeight: 500,
    },
    appLogo: {
      marginLeft: 'auto',
      '& img': {
        maxWidth: 70,
      },
    },
    bigAvatar: {
      width: 66,
      height: 66,
      marginRight: 10,
    },
    contentGroup: {
      padding: 20,
      paddingTop: 0,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    bottomButtons: {
      display: 'flex',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        marginLeft: 'auto',
        fontWeight: 'bold',
        color: '#fc9916',
        padding: 0,
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#fc9916',
        },
      },
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;
interface AppointmentProps {
  history: History;
}
export const Appointments: React.FC<AppointmentProps> = (props) => {
  const pageUrl = window.location.href;
  const classes = useStyles({});
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const urlParams = new URLSearchParams(window.location.search);
  const successApptId = urlParams.get('apptid') ? String(urlParams.get('apptid')) : '';
  // const client = useApolloClient();
  // console.log(urlParams, 'url params.....', urlParams.get('apptidkkkk'));

  // const currentDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  const { isSigningIn } = useAuth();
  // const mascotRef = useRef(null);
  // const [isPopoverOpen] = React.useState<boolean>(false);
  const [tabValue, setTabValue] = React.useState<number>(0);
  const [isConfirmedPopoverOpen, setIsConfirmedPopoverOpen] = React.useState<boolean>(true);
  const [appointmentDoctorName, setAppointmentDoctorName] = React.useState<string>('');
  const [specialtyName, setSpecialtyName] = React.useState<string>('');
  const [photoUrl, setPhotoUrl] = React.useState<string>('');
  const [isConfirmPopupLoaded, setIsConfirmPopupLoaded] = React.useState<boolean>(false);
  const [isFailurePayment, setIsFailurePayment] = React.useState(pageUrl.includes('failed'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [appointmentDateTime, setAppointmentDateTime] = React.useState<string>('');
  const [appointmentType, setAppointmentType] = React.useState<string>('');
  const [doctorDetail, setDoctorDetail] = React.useState<any>({});
  const [paymentStatus, setPaymentStatus] = React.useState<string>('');
  const [bankTxnId, setBankTxnId] = React.useState<string>('');
  const [displayId, setDisplayId] = React.useState<number>(0);
  const [amountPaid, setAmountPaid] = React.useState<number>(0);
  const [doctorId, setDoctorId] = React.useState<string>('');

  // const { data, loading, error } = useQueryWithSkip<
  //   GetPatientAppointments,
  //   GetPatientAppointmentsVariables
  // >(GET_PATIENT_APPOINTMENTS, {
  //   variables: {
  //     patientAppointmentsInput: {
  //       patientId:
  //         (currentPatient && currentPatient.id) ||
  //         (allCurrentPatients && allCurrentPatients[0].id) ||
  //         '',
  //       appointmentDate: currentDate,
  //     },
  //   },
  //   fetchPolicy: 'no-cache',
  // });

  const getPaymentData = useQueryWithSkip(PAYMENT_TRANSACTION_STATUS, {
    variables: {
      appointmentId: successApptId || '',
    },
    fetchPolicy: 'no-cache',
  });

  const appointmentDetail = useQueryWithSkip(GET_APPOINTMENT_DATA, {
    variables: {
      appointmentId: successApptId || '',
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (!successApptId) {
      setIsLoading(false);
    }
    const paymentData =
      getPaymentData &&
      getPaymentData.data &&
      getPaymentData.data.paymentTransactionStatus &&
      getPaymentData.data.paymentTransactionStatus.appointment;
    const appointmentData =
      appointmentDetail &&
      appointmentDetail.data &&
      appointmentDetail.data.getAppointmentData &&
      appointmentDetail.data.getAppointmentData.appointmentsHistory[0];
    if (!_isEmpty(appointmentData) && !_isEmpty(paymentData)) {
      const { appointmentDateTime, appointmentType, doctorInfo, doctorId } = appointmentData;
      const { paymentStatus, bankTxnId, displayId, amountPaid } = paymentData;
      setAppointmentDateTime(appointmentDateTime);
      setAppointmentType(appointmentType);
      setDoctorDetail(doctorInfo);
      setPaymentStatus(paymentStatus);
      setBankTxnId(bankTxnId);
      setDoctorId(doctorId);

      setDisplayId(displayId);
      setAmountPaid(amountPaid);
      setIsLoading(false);
    }
  }, [getPaymentData, appointmentDetail]);

  const { data, loading, error } = useQueryWithSkip<
    GetPatientAllAppointments,
    GetPatientAllAppointmentsVariables
  >(GET_PATIENT_ALL_APPOINTMENTS, {
    variables: {
      patientId:
        (currentPatient && currentPatient.id) ||
        (allCurrentPatients && allCurrentPatients[0].id) ||
        '',
    },
    fetchPolicy: 'no-cache',
  });

  if (error) return <div>Unable to load Consults...</div>;

  const appointments =
    data && data.getPatientAllAppointments && data.getPatientAllAppointments.appointments
      ? data.getPatientAllAppointments.appointments
      : [];

  // filter appointments that are greater than current time.
  // const filterAppointments = appointments.filter(appointmentDetails => {
  //   const currentTime = new Date().getTime();
  //   const appointmentTime = new Date(
  //     appointmentDetails.appointmentDateTime
  //   ).getTime();
  //   if (appointmentTime > currentTime) {
  //     if (isToday(appointmentTime)) todaysConsultations++;

  //     return appointmentDetails;
  //   }
  // });
  interface statusActionInterface {
    ctaText: string;
    info: string;
    callbackFunction: () => void;
  }
  interface statusMap {
    [name: string]: statusActionInterface;
  }
  const statusActions: statusMap = {
    PAYMENT_PENDING: {
      ctaText: 'TRY AGAIN',
      info:
        'In case your account has been debited, you should get the refund in 10-14 working days.',
      callbackFunction: () => {
        props && props.history && props.history.push(clientRoutes.doctorDetails(doctorId));
      },
    },
    PAYMENT_SUCCESS: {
      ctaText: 'DOWNLOAD APP',
      info: '',
      callbackFunction: () => {
        window.open(getAppStoreLink(), '_blank');
      },
    },
    PAYMENT_FAILED: {
      ctaText: 'TRY AGAIN',
      info:
        'In case your account has been debited, you should get the refund in 10-14 working days.',
      callbackFunction: () => {
        props && props.history && props.history.push(clientRoutes.doctorDetails(doctorId));
      },
    },
  };

  const availableAppointments = appointments.filter((appointmentDetails) => {
    return moment(new Date(appointmentDetails.appointmentDateTime))
      .add(6, 'days')
      .startOf('day')
      .isSameOrAfter(moment(new Date()).startOf('day'));
    // const appointmentDate = moment(appointmentDetails.appointmentDateTime);
    // const currentDate = moment(new Date());
    // const diffDays = currentDate.diff(appointmentDate, 'days');
    // console.log(
    //   diffDays,
    //   'diff days....',
    //   moment(new Date(appointmentDetails.appointmentDateTime))
    //     .add(6, 'days')
    //     .startOf('day')
    //     .isSameOrAfter(moment(new Date()).startOf('day'))
    // );
    // return diffDays <= 7;
    // const currentDate = new Date();
    // console.log('diff in days..................', diffDays);
    // const compareDate = currentDate.setDate(currentDate.getDate() - 7);
    // const appointmentTime = new Date(appointmentDetails.appointmentDateTime).getTime();
  });

  const pastAppointments = appointments.filter((appointmentDetails) => {
    return moment(new Date(appointmentDetails.appointmentDateTime))
      .add(6, 'days')
      .startOf('day')
      .isBefore(moment(new Date()).startOf('day'));
    // const appointmentDate = moment(appointmentDetails.appointmentDateTime);
    // const currentDate = moment(new Date());
    // const diffDays = currentDate.diff(appointmentDate, 'days');
    // return diffDays > 7;
    // const currentDate = new Date();
    // const compareDate = currentDate.setDate(currentDate.getDate() - 7);
    // const appointmentTime = new Date(appointmentDetails.appointmentDateTime).getTime();
    // return compareDate >= appointmentTime;
  });

  // console.log(appointments, availableAppointments, pastAppointments);

  useEffect(() => {
    if (availableAppointments.length > 0 && successApptId !== '' && !isConfirmPopupLoaded) {
      const isAppointmentAvailable = _find(
        availableAppointments,
        (appointmentDetails) => appointmentDetails.id === successApptId
      );

      if (isAppointmentAvailable && Object.keys(isAppointmentAvailable).length > 0) {
        const doctorName =
          isAppointmentAvailable.doctorInfo && isAppointmentAvailable.doctorInfo.fullName
            ? isAppointmentAvailable.doctorInfo.fullName
            : '';
        const photoUrl =
          isAppointmentAvailable.doctorInfo && isAppointmentAvailable.doctorInfo.photoUrl
            ? isAppointmentAvailable.doctorInfo.photoUrl
            : '';
        const specialty =
          isAppointmentAvailable.doctorInfo &&
          isAppointmentAvailable.doctorInfo.specialty &&
          isAppointmentAvailable.doctorInfo.specialty.specialistSingularTerm
            ? isAppointmentAvailable.doctorInfo.specialty.specialistSingularTerm
            : '';
        setAppointmentDoctorName(doctorName);
        setSpecialtyName(specialty);
        setPhotoUrl(photoUrl);
        setIsConfirmedPopoverOpen(true);
        setIsConfirmPopupLoaded(true);
        // console.log(isAppointmentAvailable);
      }
    }
  }, [availableAppointments, successApptId, isConfirmPopupLoaded]);

  useEffect(() => {
    /**Gtm code start start */
    if (pageUrl.includes('failed')) {
      gtmTracking({
        category: 'Consultations',
        action: specialtyName,
        label: 'Failed / Cancelled',
      });
    } else if (pageUrl.includes('success')) {
      gtmTracking({
        category: 'Consultations',
        action: specialtyName,
        label: 'Order Success',
      });
    }
    /**Gtm code start end */
  }, [specialtyName]);

  // console.log(availableAppointments, 'available appointments....', pastAppointments);

  const appointmentText = () => {
    return appointments.filter((item) =>
      moment(new Date(item.appointmentDateTime), 'DD-MM-YYYY').add(6, 'days')
    ).length > -1 && tabValue === 0
      ? 'You have ' +
          (appointments.filter((item) =>
            moment(new Date(item.appointmentDateTime))
              .add(6, 'days')
              .startOf('day')
              .isSameOrAfter(moment(new Date()).startOf('day'))
          ).length || 'no') +
          ' active appointment(s)!'
      : 'You have ' +
          (appointments.filter((item) =>
            moment(new Date(item.appointmentDateTime))
              .add(6, 'days')
              .startOf('day')
              .isBefore(moment(new Date()).startOf('day'))
          ).length || 'no') +
          ' past appointment(s)!';
  };

  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.consultPage}>
          <div className={`${classes.consultationsHeader}`}>
            {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
              <Typography variant="h1">
                <span>hi</span>
                <AphSelect
                  value={currentPatient.id}
                  onChange={(e) => setCurrentPatientId(e.target.value as Patient['id'])}
                  classes={{
                    root: classes.selectMenuRoot,
                    selectMenu: classes.selectMenuItem,
                  }}
                >
                  {allCurrentPatients.map((patient) => {
                    const isSelected = patient.id === currentPatient.id;
                    const name = isSelected
                      ? (patient.firstName || '').toLocaleLowerCase()
                      : (patient.firstName || '').toLocaleLowerCase();
                    return (
                      <MenuItem
                        selected={isSelected}
                        value={patient.id}
                        classes={{ selected: classes.menuSelected }}
                        key={patient.id}
                      >
                        {name}
                      </MenuItem>
                    );
                  })}
                  <MenuItem classes={{ selected: classes.menuSelected }}>
                    <AphButton
                      color="primary"
                      classes={{ root: classes.addMemberBtn }}
                      onClick={() => {
                        setIsAddNewProfileDialogOpen(true);
                      }}
                    >
                      Add Member
                    </AphButton>
                  </MenuItem>
                </AphSelect>
              </Typography>
            ) : (
              <Typography variant="h1">hello there!</Typography>
            )}
            <p>{data && !loading && appointmentText()}</p>
            <AphDialog open={isAddNewProfileDialogOpen} maxWidth="sm">
              <AphDialogClose onClick={() => setIsAddNewProfileDialogOpen(false)} title={'Close'} />
              <AphDialogTitle>Add New Member</AphDialogTitle>
              <AddNewProfile
                closeHandler={(isAddNewProfileDialogOpen: boolean) =>
                  setIsAddNewProfileDialogOpen(isAddNewProfileDialogOpen)
                }
                isMeClicked={false}
                selectedPatientId=""
                successHandler={(isPopoverOpen: boolean) => setIsPopoverOpen(isPopoverOpen)}
                isProfileDelete={false}
              />
            </AphDialog>
          </div>
          <div>
            <Tabs
              value={tabValue}
              variant="fullWidth"
              classes={{
                root: classes.tabsRoot,
                indicator: classes.tabsIndicator,
              }}
              onChange={(e, newValue) => {
                setTabValue(newValue);
              }}
            >
              <Tab
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Active"
                title={'Active appointments'}
              />
              <Tab
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Past"
                title={'Past appointments'}
              />
            </Tabs>

            {tabValue === 0 && (
              <TabContainer>
                {availableAppointments && availableAppointments.length > 0 ? (
                  <ConsultationsCard appointments={availableAppointments} pastOrCurrent="current" />
                ) : loading || isSigningIn ? (
                  <div className={classes.loader}>
                    <CircularProgress />
                  </div>
                ) : (
                  <div className={classes.consultSection}>
                    <div className={classes.noAppointments}>
                      <div className={classes.leftGroup}>
                        <h3>Want to book an appointment?</h3>
                        <Route
                          render={({ history }) => (
                            <AphButton
                              color="primary"
                              onClick={() => {
                                history.push(clientRoutes.doctorsLanding());
                              }}
                              title={'Book an Appointment'}
                            >
                              Book an Appointment
                            </AphButton>
                          )}
                        />
                      </div>
                      <div className={classes.rightGroup}>
                        <img src={require('images/ic_doctor_consult.svg')} alt="" />
                      </div>
                    </div>
                  </div>
                )}
              </TabContainer>
            )}
            {tabValue === 1 && (
              <TabContainer>
                {pastAppointments && pastAppointments.length > 0 ? (
                  <ConsultationsCard appointments={pastAppointments} pastOrCurrent="past" />
                ) : loading || isSigningIn ? (
                  <div className={classes.loader}>
                    <CircularProgress />
                  </div>
                ) : (
                  <div className={classes.consultSection}>
                    <div className={classes.noAppointments}>
                      <div className={classes.leftGroup}>
                        <h3>Want to book an appointment?</h3>
                        <Route
                          render={({ history }) => (
                            <AphButton
                              color="primary"
                              onClick={() => {
                                history.push(clientRoutes.doctorsLanding());
                              }}
                              title={'Book an Appointment'}
                            >
                              Book an Appointment
                            </AphButton>
                          )}
                        />
                      </div>
                      <div className={classes.rightGroup}>
                        <img src={require('images/ic_doctor_consult.svg')} alt="" />
                      </div>
                    </div>
                  </div>
                )}
              </TabContainer>
            )}
          </div>
        </div>
      </div>

      {/* <AphDialog open={isConfirmedPopoverOpen} maxWidth="sm" className={classes.confirmedDialog}>
        <Route
          render={({ history }) => (
            <AphDialogClose
              onClick={() => {
                setIsConfirmedPopoverOpen(false);
                history.push(clientRoutes.appointments());
              }}
              title={'Close'}
            />
          )}
        />
        <AphDialogTitle>Confirmed</AphDialogTitle>
        <div className={classes.messageBox}>
          <div className={classes.doctorDetails}>
            <div className={classes.doctorInfo}>
              <Avatar
                alt=""
                src={photoUrl ? photoUrl : require('images/no_photo.png')}
                className={classes.bigAvatar}
              />
              <div className={classes.doctorText}>
                <div className={classes.drName}>{_startCase(_toLower(appointmentDoctorName))}</div>
                <div className={classes.specality}>{specialtyName}</div>
              </div>
            </div>
            <div className={classes.appLogo}>
              <img src={require('images/ic_logo.png')} />
            </div>
          </div>
          <p>
            Your consultation with {_startCase(_toLower(appointmentDoctorName))} is confirmed. Thank
            you for choosing Apollo 247.
          </p>
          <p className={classes.borderText}>
            We shared your details with {_startCase(_toLower(appointmentDoctorName))}'s team. Please
            download the app to continue with the consultation.
          </p>
          <a className={classes.appDownloadBtn} href={getAppStoreLink()} target="_blank">
            Download Apollo247 App
          </a>
        </div>
      </AphDialog> */}
      {successApptId && (
        <Modal
          open={isConfirmedPopoverOpen}
          onClose={() => {
            setIsConfirmedPopoverOpen(false);
            // history.push(clientRoutes.appointments());
          }}
          className={classes.modal}
          disableBackdropClick
          disableEscapeKeyDown
        >
          {isLoading ? (
            <div className={classes.loader}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <OrderStatusContent
                paymentStatus={
                  paymentStatus === 'PAYMENT_FAILED'
                    ? 'failed'
                    : paymentStatus === 'PAYMENT_PENDING'
                    ? 'pending'
                    : 'success'
                }
                paymentInfo={statusActions[paymentStatus].info}
                orderId={displayId}
                amountPaid={amountPaid}
                doctorDetail={doctorDetail}
                paymentRefId={bankTxnId}
                bookingDateTime={moment(appointmentDateTime)
                  .format('DD MMMM YYYY[,] LT')
                  .replace(/(A|P)(M)/, '$1.$2.')
                  .toString()}
                type={'consult'}
                consultMode={appointmentType}
                onClose={() => setIsConfirmedPopoverOpen(false)}
                ctaText={statusActions[paymentStatus].ctaText}
                orderStatusCallback={statusActions[paymentStatus].callbackFunction}
              />
            </>
          )}
        </Modal>
      )}
      {/* 
      <Popover
        open={isFailurePayment}
        anchorEl={anchorEl}
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
            <div className={classes.contentGroup}>
              <Typography variant="h3">Uh oh.. :)</Typography>
              <p> We're sorry but the payment failed</p>
              <div className={classes.bottomButtons}>
                <Route
                  render={({ history }) => (
                    <AphButton
                      color="primary"
                      onClick={() => {
                        setIsFailurePayment(false);
                        history.push(clientRoutes.appointments());
                      }}
                    >
                      OK, GOT IT
                    </AphButton>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </Popover> */}

      {/* <Popover
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
            <TransferConsultMessage />
          </div>
        </div>
      </Popover> */}
      <NavigationBottom />
    </div>
  );
};
