import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Grid, Button } from '@material-ui/core';
import React, { useState, useRef, useEffect } from 'react';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';
import Scrollbars from 'react-custom-scrollbars';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import {
  GetDoctorAvailableSlots,
  GetDoctorAvailableSlotsVariables,
} from 'graphql/types/GetDoctorAvailableSlots';
import moment from 'moment';
import { GET_DOCTOR_AVAILABLE_SLOTS } from 'graphql/doctors';
import { getIstTimestamp } from 'helpers/dateHelpers';
import { usePrevious } from 'hooks/reactCustomHooks';
import { useMutation } from 'react-apollo-hooks';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/profiles';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { GetDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';

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
    tabFooter: {
      background: 'white',
      position: 'absolute',
      height: 60,
      paddingTop: '10px',
      borderBottomLeftRadius: '10px',
      borderBottomRightRadius: '10px',
      width: '100%',
      bottom: '0px',
      textAlign: 'right',
      paddingRight: '20px',
      marginTop: 20,
    },
    ResheduleCosultButton: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fff',
      padding: '8px 16px',
      backgroundColor: '#fc9916',
      minWidth: 168,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#fc9916',
      },
      '&:disabled': {
        backgroundColor: 'rgba(252,153,22,0.3)',
      },
    },
    BackCosultButton: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fc9916',
      padding: '8px 16px',
      backgroundColor: '#fff',
      minWidth: 100,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      position: 'absolute',
      left: 20,
      '&:hover': {
        backgroundColor: '#fff',
      },
      '&:disabled': {
        color: 'rgba(252,153,22,0.3)',
      },
    },
    consultGroup: {
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      padding: 16,
      marginTop: 10,
      marginBottom: 10,
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
      paddingTop: 10,
      paddingLeft: 20,
      paddingRight: 20,
    },
    timeSlots: {
      paddingTop: 0,
    },
    scheduleCalendar: {
      padding: 10,
      minHeight: 278,
      marginBottom: 0,
    },
    scheduleTimeSlots: {
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
      margin: '0 0 70px 0',
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

interface AvailableSlotsProps {
  setIsPopoverOpen: (openPopup: boolean) => void;
  rescheduleConsultAction: () => void;
  doctorId: string;
  setTimeSelected: (timeSelected: string) => void;
  setDateSelected: (dateSelected: string) => void;
  dateSelected: string;
  timeSelected: string;
}

export const AvailableSlots: React.FC<AvailableSlotsProps> = (props) => {
  const classes = useStyles({});
  const calendarRef = useRef<HTMLDivElement>(null);

  const morningSlots: number[] = [],
    afternoonSlots: number[] = [],
    eveningSlots: number[] = [],
    lateNightSlots: number[] = [];

  const apiDateFormat =
    props.dateSelected === moment(new Date()).format('YYYY-MM-DD')
      ? moment(new Date()).format('YYYY-MM-DD')
      : props.dateSelected;

  const earlyMorningTime = getIstTimestamp(new Date(apiDateFormat), '06:01');
  const morningTime = getIstTimestamp(new Date(apiDateFormat), '12:01');
  const afternoonTime = getIstTimestamp(new Date(apiDateFormat), '17:01');
  const eveningTime = getIstTimestamp(new Date(apiDateFormat), '21:01');
  const prevDateSelected = usePrevious(props.dateSelected);
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);

  const getDoctorDetailsMutation = useMutation<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>(
    GET_DOCTOR_DETAILS_BY_ID,
    {
      variables: { id: props.doctorId },
    }
  );

  useEffect(() => {
    if (!doctorDetails) {
      getDoctorDetailsMutation()
        .then(({ data }: any) => {
          setDoctorDetails(data);
        })
        .catch((e) => console.log(e));
    }
  }, [doctorDetails]);

  useEffect(() => {
    if (prevDateSelected !== props.dateSelected) props.setTimeSelected('');
  }, [props.dateSelected, prevDateSelected]);

  // get available slots.
  const {
    data: availableSlotsData,
    loading: availableSlotsLoading,
    error: availableSlotsError,
  } = useQueryWithSkip<GetDoctorAvailableSlots, GetDoctorAvailableSlotsVariables>(
    GET_DOCTOR_AVAILABLE_SLOTS,
    {
      variables: {
        DoctorAvailabilityInput: {
          doctorId: props.doctorId,
          availableDate: apiDateFormat,
        },
      },
      fetchPolicy: 'no-cache',
    }
  );

  if (availableSlotsLoading) {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
  }

  if (availableSlotsError) {
    return <div className={classes.noDataAvailable}>Unable to load Available slots.</div>;
  }
  const availableSlots =
    (availableSlotsData && availableSlotsData.getDoctorAvailableSlots.availableSlots) || [];

  availableSlots.map((slot) => {
    const slotTime = new Date(slot).getTime();
    const currentTime = new Date(new Date().toISOString()).getTime();
    if (slotTime > currentTime) {
      if (slotTime >= earlyMorningTime && slotTime < morningTime) morningSlots.push(slotTime);
      else if (slotTime >= morningTime && slotTime < afternoonTime) afternoonSlots.push(slotTime);
      else if (slotTime >= afternoonTime && slotTime < eveningTime) eveningSlots.push(slotTime);
      else lateNightSlots.push(slotTime);
    }
  });

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'65vh'}>
        <div className={classes.customScrollBar}>
          <Grid container spacing={2}>
            <Grid item sm={6}>
              <div
                className={`${classes.consultGroup} ${classes.scheduleCalendar} ${classes.showCalendar}`}
                ref={calendarRef}
              >
                <AphCalendar
                  getDate={(dateSelected: string) => props.setDateSelected(dateSelected)}
                  selectedDate={new Date(apiDateFormat)}
                />
              </div>
            </Grid>
            <Grid item sm={6}>
              {morningSlots.length > 0 ||
              afternoonSlots.length > 0 ||
              eveningSlots.length > 0 ||
              lateNightSlots.length > 0 ? (
                <div
                  className={`${classes.consultGroup} ${classes.scheduleTimeSlots} ${classes.showTimeSlot}`}
                >
                  <DayTimeSlots
                    morningSlots={morningSlots}
                    afternoonSlots={afternoonSlots}
                    eveningSlots={eveningSlots}
                    latenightSlots={lateNightSlots}
                    doctorName={
                      doctorDetails && doctorDetails.getDoctorDetailsById
                        ? doctorDetails.getDoctorDetailsById.lastName
                        : ''
                    }
                    timeSelected={(timeSelected) => props.setTimeSelected(timeSelected)}
                    selectedTime={props.timeSelected}
                  />
                </div>
              ) : (
                <div className={classes.consultGroup}>
                  <div className={classes.noSlotsAvailable}>
                    Oops! No slots available with Dr.{' '}
                    {doctorDetails &&
                      doctorDetails.getDoctorDetailsById &&
                      doctorDetails.getDoctorDetailsById.lastName}{' '}
                    :(
                  </div>
                </div>
              )}
            </Grid>
          </Grid>
        </div>
      </Scrollbars>
      <div className={classes.tabFooter}>
        <Button
          className={classes.BackCosultButton}
          onClick={() => {
            props.setIsPopoverOpen(false);
          }}
        >
          Go Back
        </Button>
        <Button
          className={classes.ResheduleCosultButton}
          disabled={
            morningSlots.length === 0 &&
            afternoonSlots.length === 0 &&
            eveningSlots.length === 0 &&
            lateNightSlots.length === 0
          }
          onClick={() => {
            props.setIsPopoverOpen(false);
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
};
