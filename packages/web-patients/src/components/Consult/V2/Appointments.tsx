import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, MenuItem, Popover, CircularProgress, Avatar } from '@material-ui/core';
import React, { useEffect } from 'react';
import Modal from '@material-ui/core/Modal';
import { History } from 'history';
import { Header } from 'components/Header';
import { useApolloClient } from 'react-apollo-hooks';

import { AphSelect, AphButton } from '@aph/web-ui-components';
import { AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { ConsultationsCard } from 'components/Consult/V2/ConsultationsCard';
import { NavigationBottom } from 'components/NavigationBottom';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { AddNewProfile } from 'components/MyAccount/AddNewProfile';
import { APPOINTMENT_TYPE, APPOINTMENT_STATE, STATUS } from 'graphql/types/globalTypes';
import { GetOrderInvoice } from 'graphql/types/GetOrderInvoice';
import { GET_PATIENT_ALL_APPOINTMENTS } from 'graphql/doctors';
import {
  GetPatientAllAppointments,
  GetPatientAllAppointmentsVariables,
} from 'graphql/types/GetPatientAllAppointments';
import { clientRoutes } from 'helpers/clientRoutes';
import { Route } from 'react-router-dom';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import _isEmpty from 'lodash/isEmpty';
import _capitalize from 'lodash/capitalize';
import { useAuth } from 'hooks/authHooks';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import moment from 'moment';
import _find from 'lodash/find';
import { getAppStoreLink } from 'helpers/dateHelpers';
import { GET_APPOINTMENT_DATA, GET_CONSULT_INVOICE } from 'graphql/consult';
import { PAYMENT_TRANSACTION_STATUS } from 'graphql/payments';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { gtmTracking } from '../../../gtmTracking';
import { OrderStatusContent } from 'components/OrderStatusContent';
import { readableParam, AppointmentFilterObject, isPastAppointment } from 'helpers/commonHelpers';
import { consultationBookTracking } from 'webEngageTracking';
import { getDiffInMinutes, getDiffInDays } from 'helpers/commonHelpers';
import { GetPatientAllAppointments_getPatientAllAppointments_appointments as AppointmentsType } from 'graphql/types/GetPatientAllAppointments';
import { AppointmentsFilter } from './AppointmentsFilter';
import { GetAppointmentData } from 'graphql/types/GetAppointmentData';
import { GetAppointmentData_getAppointmentData_appointmentsHistory as appointmentsHistoryType } from 'graphql/types/GetAppointmentData';
import { PaymentTransactionStatus_paymentTransactionStatus_appointment as paymentTransactionAppointmentType } from 'graphql/types/PaymentTransactionStatus';
import _uniq from 'lodash/uniq';

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
      borderRadius: '10px 10px 0 0',
      boxShadow: '0 10px 20px 0 rgba(128, 128, 128, 0.3)',
      paddingLeft: 20,
      paddingRight: 20,
      position: 'sticky',
      margin: '0 15px',
      top: 88,
      zIndex: 5,
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
      outline: 'none',
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
    filterIcon: {
      float: 'right',
      position: 'relative',
      top: -8,
      right: -22,
      cursor: 'pointer',
    },
    modalDialog: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
    },
    cardContainer: {
      '& h1': {
        color: '#0087BA',
        fontSize: 17,
        lineHeight: '22px',
        fontWeight: 'bold',
        margin: '45px 0 0 20px',
      },
    },
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;
interface AppointmentProps {
  history: History;
}
interface statusActionInterface {
  ctaText: string;
  info: string;
  callbackFunction: () => void;
}
interface statusMap {
  [name: string]: statusActionInterface;
}

const initialAppointmentFilterObject: AppointmentFilterObject = {
  consultType: [],
  appointmentStatus: [],
  availability: [],
  gender: [],
  doctorsList: [],
};

export const Appointments: React.FC<AppointmentProps> = (props) => {
  const classes = useStyles({});
  const pageUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  const successApptId = urlParams.get('apptid') ? String(urlParams.get('apptid')) : '';
  const apolloClient = useApolloClient();
  const { isSigningIn } = useAuth();
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [tabValue, setTabValue] = React.useState<number>(0);
  const [isConfirmedPopoverOpen, setIsConfirmedPopoverOpen] = React.useState<boolean>(true);
  const [triggerInvoice, setTriggerInvoice] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<AppointmentFilterObject>(
    initialAppointmentFilterObject
  );
  const [isFilterOpen, setIsFilterOpen] = React.useState<boolean>(false);
  const [appointmentsList, setAppointmentsList] = React.useState<AppointmentsType[] | null>(null);
  const [filteredAppointmentsList, setFilteredAppointmentsList] = React.useState<
    AppointmentsType[] | null
  >(null);
  const [specialtyName, setSpecialtyName] = React.useState<string>('');
  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [mutationLoading, setMutationLoading] = React.useState<boolean>(false);
  const [mutationError, setMutationError] = React.useState<boolean>(false);
  const [doctorDetail, setDoctorDetail] = React.useState<any>({});
  const [doctorId, setDoctorId] = React.useState<string>('');
  const [
    appointmentHistory,
    setAppointmentHistory,
  ] = React.useState<appointmentsHistoryType | null>(null);
  const [paymentData, setPaymentData] = React.useState<paymentTransactionAppointmentType | null>(
    null
  );

  const doctorName = doctorDetail && doctorDetail.fullName;
  const readableDoctorname = (doctorName && doctorName.length && readableParam(doctorName)) || '';
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  const [filterDoctorsList, setFilterDoctorsList] = React.useState<string[]>([]);

  const getAppointmentHistory = (successApptId: string) => {
    if (!appointmentHistory) {
      apolloClient
        .query<GetAppointmentData>({
          query: GET_APPOINTMENT_DATA,
          variables: {
            appointmentId: successApptId || '',
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }: any) => {
          if (
            data &&
            data.getAppointmentData &&
            data.getAppointmentData.appointmentsHistory &&
            data.getAppointmentData.appointmentsHistory.length > 0
          ) {
            setAppointmentHistory(data.getAppointmentData.appointmentsHistory[0]);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const getPaymentData = (successApptId: string) => {
    if (!paymentData) {
      apolloClient
        .query<GetAppointmentData>({
          query: PAYMENT_TRANSACTION_STATUS,
          variables: {
            appointmentId: successApptId || '',
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }: any) => {
          if (data && data.paymentTransactionStatus && data.paymentTransactionStatus.appointment) {
            setPaymentData(data.paymentTransactionStatus.appointment);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  useEffect(() => {
    if (successApptId && successApptId.length) {
      getAppointmentHistory(successApptId);
      getPaymentData(successApptId);
    }
  }, [successApptId, appointmentHistory, paymentData]);

  useEffect(() => {
    if (triggerInvoice) {
      setIsLoading(true);
      apolloClient
        .query<GetOrderInvoice>({
          query: GET_CONSULT_INVOICE,
          variables: {
            appointmentId: successApptId,
            patientId: currentPatient && currentPatient.id,
          },
          fetchPolicy: 'cache-first',
        })
        .then(({ data }) => {
          setIsLoading(false);
          if (data && data.getOrderInvoice && data.getOrderInvoice.length) {
            window.open(data.getOrderInvoice, '_blank');
          }
        })
        .catch((e) => {
          setIsLoading(false);
          console.log(e);
        });
    }
  }, [triggerInvoice]);

  useEffect(() => {
    if (!successApptId) {
      setIsLoading(false);
    }
    if (!_isEmpty(appointmentHistory) && !_isEmpty(paymentData)) {
      const { appointmentDateTime, appointmentType, doctorInfo, doctorId, id } = appointmentHistory;
      const { displayId } = paymentData;
      setDoctorDetail(doctorInfo);
      setDoctorId(doctorId);
      setIsLoading(false);
      localStorage.setItem('consultBookDetails', '');
      const eventData = {
        category: doctorInfo ? doctorInfo.doctorType : '',
        consultDateTime: appointmentDateTime,
        consultId: id,
        consultMode: appointmentType,
        displayId: displayId,
        doctorName: doctorInfo ? doctorInfo.fullName : '',
        hospitalName:
          doctorInfo && doctorInfo.doctorHospital && doctorInfo.doctorHospital[0]
            ? doctorInfo.doctorHospital[0].facility.name
            : '',
        patientGender: currentPatient && currentPatient.gender,
        specialisation: doctorInfo && doctorInfo.specialty ? doctorInfo.specialty.name : '',
        relation: currentPatient && currentPatient.relation,
      };
      consultationBookTracking(eventData);
    }
  }, [paymentData, appointmentHistory]);

  useEffect(() => {
    if (currentPatient && currentPatient.id) {
      setMutationLoading(true);
      apolloClient
        .query<GetPatientAllAppointments, GetPatientAllAppointmentsVariables>({
          query: GET_PATIENT_ALL_APPOINTMENTS,
          variables: {
            patientId: currentPatient.id || (allCurrentPatients && allCurrentPatients[0].id) || '',
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }: any) => {
          if (
            data &&
            data.getPatientAllAppointments &&
            data.getPatientAllAppointments.appointments
          ) {
            const appointmentsListData = data.getPatientAllAppointments.appointments;
            const doctorsList = appointmentsListData.map((appointment: AppointmentsType) => {
              return appointment && appointment.doctorInfo && appointment.doctorInfo.fullName
                ? appointment.doctorInfo.fullName
                : null;
            });
            setFilterDoctorsList(doctorsList || []);
            setAppointmentsList(appointmentsListData);
            setFilteredAppointmentsList(appointmentsListData);
            setFilter(initialAppointmentFilterObject);
          } else {
            setAppointmentsList([]);
            setFilteredAppointmentsList([]);
          }
          setMutationError(false);
        })
        .catch((e) => {
          console.log(e);
          setMutationError(true);
        })
        .finally(() => {
          setMutationLoading(false);
        });
    }
  }, [currentPatient]);

  const statusActions: statusMap = {
    PAYMENT_PENDING: {
      ctaText: 'TRY AGAIN',
      info:
        'In case your account has been debited, you should get the refund in 10-14 working days.',
      callbackFunction: () => {
        props &&
          props.history &&
          props.history.push(clientRoutes.doctorDetails(readableDoctorname, doctorId));
      },
    },
    PAYMENT_SUCCESS: {
      ctaText: 'Go to Consult Room',
      info: '',
      callbackFunction: () => {
        props &&
          props.history &&
          props.history.push(clientRoutes.chatRoom(successApptId, doctorId));
      },
    },
    PAYMENT_FAILED: {
      ctaText: 'TRY AGAIN',
      info:
        'In case your account has been debited, you should get the refund in 10-14 working days.',
      callbackFunction: () => {
        props &&
          props.history &&
          props.history.push(clientRoutes.doctorDetails(readableDoctorname, doctorId));
      },
    },
    PAYMENT_ABORTED: {
      ctaText: 'TRY AGAIN',
      info:
        'In case your account has been debited, you should get the refund in 10-14 working days.',
      callbackFunction: () => {
        props &&
          props.history &&
          props.history.push(clientRoutes.doctorDetails(readableDoctorname, doctorId));
      },
    },
  };

  const getConsultTypeFilteredList = (
    consultType: string[],
    localFilteredAppointmentsList: AppointmentsType[]
  ) => {
    if (consultType.includes('Online') && consultType.includes('Clinic Visit')) {
      return localFilteredAppointmentsList || [];
    } else {
      const isPhysicalConsult = consultType.includes('Clinic Visit');
      const filteredList =
        localFilteredAppointmentsList.filter(
          (appointment) =>
            appointment.appointmentType ===
            (isPhysicalConsult ? APPOINTMENT_TYPE.PHYSICAL : APPOINTMENT_TYPE.ONLINE)
        ) || [];
      return filteredList;
    }
  };
  const handlePaymentModalClose = () => {
    setIsConfirmedPopoverOpen(false);
    window.location.href = clientRoutes.appointments();
  };

  const getAppointmentStatusFilteredList = (
    appointmentStatus: string[],
    localFilteredAppointmentsList: AppointmentsType[]
  ) => {
    let finalList: AppointmentsType[] = [];
    if (appointmentStatus.includes('New')) {
      finalList = localFilteredAppointmentsList.filter(
        (appointment) => appointment.appointmentState === APPOINTMENT_STATE.NEW
      );
    }
    if (appointmentStatus.includes('Rescheduled')) {
      const filteredList = localFilteredAppointmentsList.filter(
        (appointment) => appointment.appointmentState === APPOINTMENT_STATE.RESCHEDULE
      );
      finalList = [...finalList, ...filteredList];
    }
    if (appointmentStatus.includes('Cancelled')) {
      const filteredList = localFilteredAppointmentsList.filter(
        (appointment) => appointment.status === STATUS.CANCELLED
      );
      finalList = [...finalList, ...filteredList];
    }
    if (appointmentStatus.includes('Completed')) {
      const filteredList = localFilteredAppointmentsList.filter(
        (appointment) => appointment.status === STATUS.COMPLETED
      );
      finalList = [...finalList, ...filteredList];
    }
    if (appointmentStatus.includes('Follow-Up')) {
      const filteredList = localFilteredAppointmentsList.filter(
        (appointment) => appointment.isFollowUp !== 'false'
      );
      finalList = [...finalList, ...filteredList];
    }
    return _uniq(finalList);
  };

  const getGenericFilteredList = (
    list: string[],
    localFilteredAppointmentsList: AppointmentsType[],
    type: string
  ) => {
    const finalList = localFilteredAppointmentsList.filter((appointment) => {
      switch (type) {
        case 'doctor':
          return list.includes(appointment.doctorInfo.fullName);
        case 'gender':
          return list.includes(appointment.doctorInfo.gender);
        default:
          return false;
      }
    });
    return finalList;
  };

  const getAvailabilityFilteredList = (
    availabilityList: string[],
    localFilteredAppointmentsList: AppointmentsType[]
  ) => {
    let finalList: AppointmentsType[] = [];
    if (availabilityList.includes('Now')) {
      finalList = localFilteredAppointmentsList.filter((appointment) => {
        const diffInMinutes = getDiffInMinutes(appointment.appointmentDateTime);
        return diffInMinutes < 15 && diffInMinutes >= 0;
      });
    }
    if (
      availabilityList.includes('Today') ||
      availabilityList.includes('Tomorrow') ||
      availabilityList.includes('Next 3 days')
    ) {
      const tomorrowAvailabilityHourTime = moment('00:00', 'HH:mm');
      const tomorrowAvailabilityTime = moment()
        .add('days', 1)
        .set({
          hour: tomorrowAvailabilityHourTime.get('hour'),
          minute: tomorrowAvailabilityHourTime.get('minute'),
        });
      if (availabilityList.includes('Today')) {
        const filteredList = localFilteredAppointmentsList.filter((appointment) => {
          const diffInHoursForTomorrowAvailabilty = tomorrowAvailabilityTime.diff(
            moment(appointment.appointmentDateTime),
            'minutes'
          );
          return diffInHoursForTomorrowAvailabilty >= 0 && diffInHoursForTomorrowAvailabilty < 1440;
        });
        finalList = [...finalList, ...filteredList];
      }
      if (availabilityList.includes('Tomorrow')) {
        const filteredList = localFilteredAppointmentsList.filter((appointment) => {
          const diffInHoursForTomorrowAvailabilty = moment(appointment.appointmentDateTime).diff(
            tomorrowAvailabilityTime,
            'minutes'
          );
          return diffInHoursForTomorrowAvailabilty >= 0 && diffInHoursForTomorrowAvailabilty < 1440;
        });
        finalList = [...finalList, ...filteredList];
      }
      if (availabilityList.includes('Next 3 days')) {
        const filteredList = localFilteredAppointmentsList.filter((appointment) => {
          const differenceInDays = moment(appointment.appointmentDateTime).diff(
            tomorrowAvailabilityTime,
            'days'
          );
          const differenceInMinutes = moment(appointment.appointmentDateTime).diff(
            tomorrowAvailabilityTime,
            'minutes'
          );
          return differenceInMinutes >= 0 && differenceInDays < 4 && differenceInDays >= 0;
        });
        finalList = [...finalList, ...filteredList];
      }
    }
    return _uniq(finalList);
  };

  useEffect(() => {
    const { consultType, availability, gender, appointmentStatus, doctorsList } = filter;
    if (
      filter.appointmentStatus === [] &&
      filter.availability === [] &&
      filter.consultType === [] &&
      filter.doctorsList === [] &&
      filter.gender === []
    ) {
      setFilteredAppointmentsList(appointmentsList || []);
    } else {
      let localFilteredList: AppointmentsType[] = appointmentsList || [];
      if (consultType.length > 0) {
        localFilteredList = getConsultTypeFilteredList(consultType, localFilteredList);
      }
      if (appointmentStatus.length > 0) {
        localFilteredList = getAppointmentStatusFilteredList(appointmentStatus, localFilteredList);
      }
      if (availability.length > 0) {
        localFilteredList = getAvailabilityFilteredList(availability, localFilteredList);
      }
      if (doctorsList.length > 0) {
        localFilteredList = getGenericFilteredList(doctorsList, localFilteredList, 'doctor');
      }
      if (gender.length > 0) {
        localFilteredList = getGenericFilteredList(gender, localFilteredList, 'gender');
      }
      setFilteredAppointmentsList(localFilteredList);
    }
  }, [filter]);

  const upcomingAppointment: AppointmentsType[] = [];
  const todaysAppointments: AppointmentsType[] = [];
  const activeAppointments: AppointmentsType[] = [];
  const followUpAppointments: AppointmentsType[] = [];
  const pastAppointments: AppointmentsType[] = [];

  filteredAppointmentsList &&
    filteredAppointmentsList.forEach((appointmentDetails) => {
      if (
        appointmentDetails.status !== STATUS.CANCELLED &&
        !isPastAppointment(appointmentDetails.appointmentDateTime)
      ) {
        const tomorrowAvailabilityHourTime = moment('00:00', 'HH:mm');
        const tomorrowAvailabilityTime = moment()
          .add('days', 1)
          .set({
            hour: tomorrowAvailabilityHourTime.get('hour'),
            minute: tomorrowAvailabilityHourTime.get('minute'),
          });
        const diffInHoursForTomorrowAvailabilty = moment(
          appointmentDetails.appointmentDateTime
        ).diff(tomorrowAvailabilityTime, 'minutes');
        diffInHoursForTomorrowAvailabilty < 1
          ? todaysAppointments.push(appointmentDetails)
          : upcomingAppointment.push(appointmentDetails);
        if (diffInHoursForTomorrowAvailabilty < 1) {
          appointmentDetails.status === STATUS.COMPLETED
            ? followUpAppointments.push(appointmentDetails)
            : activeAppointments.push(appointmentDetails);
        }
      } else {
        pastAppointments.push(appointmentDetails);
      }
    });

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

  const appointmentText = () => {
    return todaysAppointments && todaysAppointments.length > 0
      ? `You have ${todaysAppointments.length || 0} active appointment(s)!`
      : upcomingAppointment && upcomingAppointment.length > 0
      ? `You have ${upcomingAppointment.length || 0} upcoming appointment(s)!`
      : `You have ${
          pastAppointments && pastAppointments.length > 0 ? pastAppointments.length : 0
        } past appointment(s)!`;
  };

  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        {mutationError ? (
          <div>Unable to load Consults...</div>
        ) : (
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
              <p>
                {filteredAppointmentsList && !mutationLoading && appointmentText()}{' '}
                <span className={classes.filterIcon} onClick={() => setIsFilterOpen(true)}>
                  <img src={require('images/ic_filterblack.svg')} alt="" />
                </span>
              </p>

              <AphDialog open={isAddNewProfileDialogOpen} maxWidth="sm">
                <AphDialogClose
                  onClick={() => setIsAddNewProfileDialogOpen(false)}
                  title={'Close'}
                />
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
                  label="Today"
                  title="Today appointments"
                />
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Upcoming"
                  title={'Upcoming appointments'}
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
                  {todaysAppointments && todaysAppointments.length > 0 ? (
                    <>
                      {activeAppointments && activeAppointments.length > 0 && (
                        <div className={classes.cardContainer}>
                          <h1>Active</h1>
                          <ConsultationsCard
                            appointments={activeAppointments}
                            pastOrCurrent="current"
                          />
                        </div>
                      )}
                      {followUpAppointments && followUpAppointments.length > 0 && (
                        <div className={classes.cardContainer}>
                          <h1>Follow - Up Chat</h1>
                          <ConsultationsCard
                            appointments={followUpAppointments}
                            pastOrCurrent="current"
                          />
                        </div>
                      )}
                    </>
                  ) : mutationLoading || isSigningIn ? (
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
                                  history.push(clientRoutes.specialityListing());
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
                  {upcomingAppointment && upcomingAppointment.length > 0 ? (
                    <ConsultationsCard
                      appointments={upcomingAppointment}
                      pastOrCurrent="upcoming"
                    />
                  ) : mutationLoading || isSigningIn ? (
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
                                  history.push(clientRoutes.specialityListing());
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
              {tabValue === 2 && (
                <TabContainer>
                  {pastAppointments && pastAppointments.length > 0 ? (
                    <ConsultationsCard appointments={pastAppointments} pastOrCurrent="past" />
                  ) : mutationLoading || isSigningIn ? (
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
                                  history.push(clientRoutes.specialityListing());
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
        )}
      </div>
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
              {paymentData && appointmentHistory && (
                <OrderStatusContent
                  paymentStatus={
                    paymentData.paymentStatus === 'PAYMENT_FAILED'
                      ? 'failed'
                      : paymentData.paymentStatus === 'PAYMENT_PENDING'
                      ? 'pending'
                      : paymentData.paymentStatus === 'PAYMENT_ABORTED'
                      ? 'aborted'
                      : 'success'
                  }
                  paymentInfo={statusActions[paymentData.paymentStatus].info}
                  orderId={paymentData.displayId}
                  amountPaid={paymentData.amountPaid}
                  doctorDetail={doctorDetail}
                  paymentRefId={paymentData.paymentRefId}
                  bookingDateTime={moment(appointmentHistory.appointmentDateTime)
                    .format('DD MMMM YYYY[,] LT')
                    .replace(/(A|P)(M)/, '$1.$2.')
                    .toString()}
                  type="consult"
                  consultMode={_capitalize(appointmentHistory.appointmentType)}
                  onClose={() => handlePaymentModalClose()}
                  ctaText={statusActions[paymentData.paymentStatus].ctaText}
                  orderStatusCallback={statusActions[paymentData.paymentStatus].callbackFunction}
                  fetchConsultInvoice={setTriggerInvoice}
                />
              )}
            </>
          )}
        </Modal>
      )}
      <Modal
        className={classes.modalDialog}
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      >
        <AppointmentsFilter
          filter={filter}
          setFilter={setFilter}
          setIsFilterOpen={setIsFilterOpen}
          filterDoctorsList={filterDoctorsList}
        />
      </Modal>
      <NavigationBottom />
    </div>
  );
};
