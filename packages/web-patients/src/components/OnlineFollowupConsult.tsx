import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Grid } from '@material-ui/core';
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import Scrollbars from 'react-custom-scrollbars';
import { GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import {
  GetDoctorAvailableSlots,
  GetDoctorAvailableSlotsVariables,
} from 'graphql/types/GetDoctorAvailableSlots';
import { GET_DOCTOR_AVAILABLE_SLOTS, BOOK_APPOINTMENT } from 'graphql/doctors';
import { useMutation } from 'react-apollo-hooks';
import { AppointmentType, BOOKINGSOURCE, TRANSFER_INITIATED_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { getDeviceType, getDiffInMinutes, getAvailability } from 'helpers/commonHelpers';
import { GET_DOCTOR_NEXT_AVAILABILITY } from 'graphql/doctors';
import {
  makeAppointmentPayment,
  makeAppointmentPaymentVariables,
} from 'graphql/types/makeAppointmentPayment';
import { MAKE_APPOINTMENT_PAYMENT } from 'graphql/consult';
import format from 'date-fns/format';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from 'graphql/types/GetDoctorNextAvailableSlot';
import { usePrevious } from 'hooks/reactCustomHooks';
import moment from 'moment';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { VALIDATE_CONSULT_COUPON } from 'graphql/consult';
import {
  ValidateConsultCoupon,
  ValidateConsultCouponVariables,
} from 'graphql/types/ValidateConsultCoupon';
import { Alerts } from 'components/Alerts/Alerts';
import { gtmTracking, _cbTracking } from '../gtmTracking';
import { useApolloClient } from 'react-apollo-hooks';
import { ShowSlots } from './ShowSlots';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      overflow: 'hidden',
    },
    viewButton: {
      width: 'calc(50% - 5px)',
      marginLeft: 5,
      display: 'block',
      fontSize: 13,
      backgroundColor: '#fcb716',
      padding: 10,
      height: 40,
      borderRadius: 10,
      marginRight: 0,
      '&:hover': {
        backgroundColor: '#fcb716 !important',
      },
    },
    consultGroup: {
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      padding: 16,
      display: 'inline-block',
      width: '100%',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.35,
      color: theme.palette.secondary.light,
      borderRadius: 10,
      '& p': {
        marginTop: 0,
      },
    },
    consultNowInfo: {
      backgroundColor: '#fff',
      margin: '18px -16px 0 -16px !important',
      textAlign: 'center',
      padding: '5px 16px',
    },
    actions: {
      paddingTop: 5,
      paddingBottom: 4,
      marginLeft: -7,
      marginRight: -8,
    },
    button: {
      fontSize: 16,
      fontWeight: 500,
      marginLeft: 8,
      marginRight: 8,
      textTransform: 'none',
      borderRadius: 10,
      paddingLeft: 10,
      paddingRight: 10,
      letterSpacing: 'normal',
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
    },
    bottomActions: {
      padding: '10px 15px 15px 15px',
      position: 'relative',
      textAlign: 'center',
      '& button': {
        borderRadius: 10,
        textTransform: 'none',
        minWidth: 288,
      },
    },
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      padding: 6,
    },
    customScrollBar: {
      paddingTop: 20,
      paddingLeft: 20,
      paddingRight: 20,
    },
    timeSlots: {
      paddingTop: 0,
    },
    scheduleCalendar: {
      // display: 'none',
      padding: 10,
      minHeight: 278,
      marginBottom: 0,
    },
    scheduleTimeSlots: {
      // display: 'none',
      padding: 10,
      minHeight: 278,
      marginBottom: 0,
    },
    showCalendar: {
      display: 'inline-block',
    },
    showTimeSlot: {
      display: 'inline-block',
      paddingTop: 0,
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
    noDataAvailable: {
      padding: 20,
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
    },
    disabledButton: {
      color: '#00b38e !important',
      opacity: 0.5,
    },
    dialogBody: {
      padding: 20,
      color: '#01475b',
      fontWeight: 500,
      fontSize: 14,
      '& span': {
        fontWeight: 'bold',
      },
    },
    dialogActions: {
      padding: 16,
      textAlign: 'center',
      '& button': {
        minWidth: 288,
      },
    },
  };
});

const getYyMmDd = (ddmmyyyy: string) => {
  const splitString = ddmmyyyy.split('/');
  return `${splitString[2]}-${splitString[1]}-${splitString[0]}`;
};

interface OnlineFollwupConsultProps {
  setIsPopoverOpen: (openPopup: boolean) => void;
  doctorDetails: DoctorDetails;
  setSelectedSlot: (selectedSlot: string) => void;
}

export const OnlineFollwupConsult: React.FC<OnlineFollwupConsultProps> = (props) => {
  const classes = useStyles({});
  const apolloClient = useApolloClient();
  const [dateSelected, setDateSelected] = useState<string>('');
  const [timeSelected, setTimeSelected] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const [nextAvailability, setNextAvailability] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableSlotsError, setAvailableSlotsError] = useState<boolean>(false);
  const [availableSlotsLoading, setAvailableSlotsLoading] = useState<boolean>(false);

  const { doctorDetails, setIsPopoverOpen, setSelectedSlot } = props;

  const prevDateSelected = usePrevious(dateSelected);
  useEffect(() => {
    if (prevDateSelected !== dateSelected) setTimeSelected('');
  }, [dateSelected, prevDateSelected]);

  const apiDateFormat =
    dateSelected === ''
      ? nextAvailability
        ? moment(nextAvailability).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD')
      : getYyMmDd(dateSelected);

  let disableSubmit = availableSlots && availableSlots.length === 0;

  const dateForScheduleLater =
    dateSelected.length > 0
      ? dateSelected.replace(/\//g, '-')
      : moment(apiDateFormat, 'YYYY-MM-DD').format('DD-MM-YYYY');
  const appointmentDateTime = moment(
    `${dateForScheduleLater} ${String(timeSelected).padStart(5, '0')}:00`,
    'DD-MM-YYYY HH:mm:ss'
  )
    .utc()
    .format();

  useEffect(() => {
    if (!nextAvailability) {
      setLoading(true);
      apolloClient
        .query<GetDoctorNextAvailableSlot, GetDoctorNextAvailableSlotVariables>({
          query: GET_DOCTOR_NEXT_AVAILABILITY,
          variables: {
            DoctorNextAvailableSlotInput: {
              doctorIds: [doctorDetails ? doctorDetails.id : ''],
              availableDate: format(new Date(), 'yyyy-MM-dd'),
            },
          },
        })
        .then(({ data }: any) => {
          if (
            data &&
            data.getDoctorNextAvailableSlot &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0].availableSlot
          ) {
            setNextAvailability(
              data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0].availableSlot
            );
          } else {
            setNextAvailability('');
          }
          setAvailableSlotsError(false);
        })
        .catch((e) => {
          setAvailableSlotsError(true);
          console.log(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [nextAvailability]);

  // get available slots.
  useEffect(() => {
    if (nextAvailability && nextAvailability.length && (!availableSlots || dateSelected)) {
      const availableTimeSlot =
        dateSelected === ''
          ? moment(nextAvailability).format('YYYY-MM-DD')
          : getYyMmDd(dateSelected);
      setAvailableSlotsLoading(true);
      apolloClient
        .query<GetDoctorAvailableSlots, GetDoctorAvailableSlotsVariables>({
          query: GET_DOCTOR_AVAILABLE_SLOTS,
          variables: {
            DoctorAvailabilityInput: {
              doctorId: doctorDetails ? doctorDetails.id : '',
              availableDate: availableTimeSlot,
            },
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }: any) => {
          if (data && data.getDoctorAvailableSlots && data.getDoctorAvailableSlots.availableSlots) {
            setAvailableSlots(data.getDoctorAvailableSlots.availableSlots);
          }
          setAvailableSlotsError(false);
        })
        .catch((e) => {
          console.log(e);
          setAvailableSlotsError(true);
        })
        .finally(() => {
          setAvailableSlotsLoading(false);
        });
    }
  }, [nextAvailability, dateSelected]);

  if (availableSlotsLoading || loading) {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={isSmallScreen ? '50vh' : '65vh'}>
        <div className={classes.customScrollBar}>
          <Grid container spacing={2}>
            <Grid item sm={6} xs={12}>
              <div
                className={`${classes.consultGroup} ${classes.scheduleCalendar} ${classes.showCalendar}`}
                ref={calendarRef}
              >
                {nextAvailability && (
                  <AphCalendar
                    getDate={(dateSelected: string) => setDateSelected(dateSelected)}
                    selectedDate={new Date(apiDateFormat)}
                  />
                )}
              </div>
            </Grid>
            <Grid item sm={6} xs={12}>
              <ShowSlots
                availableSlots={availableSlots}
                apiDateFormat={apiDateFormat}
                setTimeSelected={setTimeSelected}
                doctorName={doctorDetails ? doctorDetails.fullName : ''}
                showCalendar={true}
                scheduleLater={true}
                consultNowAvailable={false}
              />
            </Grid>
          </Grid>
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        {setSelectedSlot && (
          <AphButton
            color="primary"
            disabled={disableSubmit || mutationLoading || timeSelected === ''}
            onClick={() => {
              setMutationLoading(true);
              setSelectedSlot(appointmentDateTime);
              setMutationLoading(false);
              setIsPopoverOpen(false);
            }}
            className={
              disableSubmit || mutationLoading || timeSelected === '' ? classes.buttonDisable : ''
            }
            title={'Book Followup'}
          >
            {mutationLoading ? <CircularProgress size={22} color="secondary" /> : 'Book Followup'}
          </AphButton>
        )}
      </div>
    </div>
  );
};
