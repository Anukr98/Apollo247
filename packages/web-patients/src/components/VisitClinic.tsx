import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';
import Scrollbars from 'react-custom-scrollbars';
import _uniqueId from 'lodash/uniqueId';
import {
  GetDoctorDetailsById as DoctorDetails,
  GetDoctorDetailsById_getDoctorDetailsById_doctorHospital as Facility,
} from 'graphql/types/GetDoctorDetailsById';
import {
  GetDoctorAvailableSlots,
  GetDoctorAvailableSlotsVariables,
} from 'graphql/types/GetDoctorAvailableSlots';
import { GET_DOCTOR_AVAILABLE_SLOTS, BOOK_APPOINTMENT } from 'graphql/doctors';
import { getTime } from 'date-fns/esm';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { Mutation } from 'react-apollo';
import { BookAppointment, BookAppointmentVariables } from 'graphql/types/BookAppointment';
import { APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { clientRoutes } from 'helpers/clientRoutes';
// import { Redirect } from 'react-router';
import _forEach from 'lodash/forEach';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      overflow: 'hidden',
    },
    consultGroup: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.text.primary,
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
      '& p': {
        marginTop: 0,
      },
    },
    actions: {
      paddingTop: 5,
      paddingBottom: 4,
      marginLeft: -8,
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
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
    bottomActions: {
      padding: '10px 15px 15px 15px',
      boxShadow: '0 -5px 20px 0 #f7f8f5',
      position: 'relative',
      '& button': {
        borderRadius: 10,
        textTransform: 'none',
      },
    },
    customScrollBar: {
      paddingTop: 10,
      paddingBottom: 30,
    },
    timeSlots: {
      paddingTop: 5,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontWeight: 600,
    },
    selectedAddress: {
      paddingTop: 20,
      paddingBottom: 15,
      display: 'flex',
    },
    clinicAddress: {
      fontSize: 13,
      fontWeight: 500,
      color: '#01475b',
      lineHeight: 1.54,
      letterSpacing: 0.33,
      paddingRight: 20,
      width: '78%',
    },
    clinicDistance: {
      marginLeft: 'auto',
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
      lineHeight: 1.54,
      letterSpacing: 0.33,
      borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      paddingLeft: 15,
      width: '22%',
      textAlign: 'right',
    },
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      paddingTop: 15,
      paddingBottom: 5,
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
    confirmationColor: {
      color: '#fcb716',
    },
  };
});

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

const getYyMmDd = (ddmmyyyy: string) => {
  const splitString = ddmmyyyy.split('/');
  return `${splitString[2]}-${splitString[1]}-${splitString[0]}`;
};

interface VisitClinicProps {
  doctorDetails: DoctorDetails;
}

export const VisitClinic: React.FC<VisitClinicProps> = (props) => {
  const classes = useStyles();
  const [dateSelected, setDateSelected] = useState<string>('');
  const [timeSelected, setTimeSelected] = useState<string>('');
  const [clinicSelected, setClinicSelected] = useState<string>('');
  const [clinicAddress] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  // const [mutationSuccess, setMutationSuccess] = React.useState(false);

  const { currentPatient } = useAllCurrentPatients();

  const { doctorDetails } = props;

  const currentTime = new Date().getTime();

  const doctorName =
    doctorDetails &&
    doctorDetails.getDoctorDetailsById &&
    doctorDetails.getDoctorDetailsById.firstName
      ? doctorDetails.getDoctorDetailsById.firstName
      : '';

  const physicalConsultationFees =
    doctorDetails &&
    doctorDetails.getDoctorDetailsById &&
    doctorDetails.getDoctorDetailsById.physicalConsultationFees
      ? doctorDetails.getDoctorDetailsById.physicalConsultationFees
      : '';

  const morningSlots: number[] = [],
    afternoonSlots: number[] = [],
    eveningSlots: number[] = [],
    lateNightSlots: number[] = [];

  const apiDateFormat =
    dateSelected === '' ? new Date().toISOString().substring(0, 10) : getYyMmDd(dateSelected);

  const morningTime = getTimestamp(new Date(apiDateFormat), '12:00');
  const afternoonTime = getTimestamp(new Date(apiDateFormat), '17:00');
  const eveningTime = getTimestamp(new Date(apiDateFormat), '21:00');

  const doctorId =
    doctorDetails && doctorDetails.getDoctorDetailsById && doctorDetails.getDoctorDetailsById.id
      ? doctorDetails.getDoctorDetailsById.id
      : '';

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorAvailableSlots,
    GetDoctorAvailableSlotsVariables
  >(GET_DOCTOR_AVAILABLE_SLOTS, {
    variables: {
      DoctorAvailabilityInput: { doctorId: doctorId, availableDate: apiDateFormat },
    },
  });

  if (loading) {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className={classes.noDataAvailable}>Unable to load Available slots.</div>;
  }

  const availableSlots = (data && data.getDoctorAvailableSlots.availableSlots) || [];
  availableSlots.map((slot) => {
    const slotTime = getTimestamp(new Date(apiDateFormat), slot);
    if (slotTime > currentTime) {
      if (slotTime < morningTime) morningSlots.push(slotTime);
      else if (slotTime >= morningTime && slotTime < afternoonTime) afternoonSlots.push(slotTime);
      else if (slotTime >= afternoonTime && slotTime < eveningTime) eveningSlots.push(slotTime);
      else lateNightSlots.push(slotTime);
    }
  });

  const disableSubmit =
    (morningSlots.length > 0 ||
      afternoonSlots.length > 0 ||
      eveningSlots.length > 0 ||
      lateNightSlots.length > 0) &&
    timeSelected !== ''
      ? false
      : true;

  // if (mutationSuccess) {
  //   return <Redirect to={clientRoutes.welcome()} />;
  // }

  // const clinics =
  //   doctorDetails &&
  //   doctorDetails.getDoctorDetailsById &&
  //   doctorDetails.getDoctorProfileById.clinics &&
  //   doctorDetails.getDoctorProfileById.clinics.length > 0
  //     ? doctorDetails.getDoctorProfileById.clinics
  //     : [];

  const clinics: Facility[] = [];
  if (doctorDetails && doctorDetails.getDoctorDetailsById) {
    _forEach(doctorDetails.getDoctorDetailsById.doctorHospital, (hospitalDetails) => {
      if (hospitalDetails.facility.facilityType === 'CLINIC') {
        clinics.push(hospitalDetails);
      }
    });
  }

  const defaultClinicId =
    clinics.length > 0 && clinics[0] && clinics[0].facility ? clinics[0].facility.city : '';

  const defaultClinicAddress =
    clinics.length > 0 && clinics[0] && clinics[0].facility
      ? `${clinics[0].facility.streetLine1 ? clinics[0].facility.streetLine1 : ''} ${
          clinics[0].facility.streetLine2 ? `${clinics[0].facility.streetLine2}` : ''
        } ${clinics[0].facility.streetLine3 ? `${clinics[0].facility.streetLine3}` : ''}`
      : '';

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'50vh'}>
        <div className={classes.customScrollBar}>
          <div className={classes.consultGroup}>
            <AphCalendar
              getDate={(dateSelected: string) => setDateSelected(dateSelected)}
              selectedDate={new Date(apiDateFormat)}
            />
          </div>
          <div className={`${classes.consultGroup} ${classes.timeSlots}`}>
            <AphSelect
              value={clinicSelected === '' ? defaultClinicId : clinicSelected}
              onChange={(e) => {
                setClinicSelected(e.target.value as string);
              }}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
              }}
            >
              {clinics.map((clinicDetails: Facility) => {
                return (
                  <MenuItem
                    classes={{ selected: classes.menuSelected }}
                    key={_uniqueId('clinic_')}
                    value={(clinicDetails.facility.city && clinicDetails.facility.city) || ''}
                  >
                    {clinicDetails.facility.name}
                  </MenuItem>
                );
              })}
            </AphSelect>
            <div className={classes.selectedAddress}>
              <div className={classes.clinicAddress}>
                {clinicAddress === '' ? defaultClinicAddress : clinicAddress}
              </div>
              <div className={classes.clinicDistance}>
                <img src={require('images/ic_location.svg')} alt="" />
                <br />
                2.5 Kms
              </div>
            </div>
            {morningSlots.length > 0 ||
            afternoonSlots.length > 0 ||
            eveningSlots.length > 0 ||
            lateNightSlots.length > 0 ? (
              <DayTimeSlots
                morningSlots={morningSlots}
                afternoonSlots={afternoonSlots}
                eveningSlots={eveningSlots}
                latenightSlots={lateNightSlots}
                doctorName={doctorName}
                timeSelected={(timeSelected) => setTimeSelected(timeSelected)}
              />
            ) : (
              <div className={classes.noSlotsAvailable}>
                Oops! No slots available with Dr. {doctorName} :(
              </div>
            )}
          </div>
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <Mutation<BookAppointment, BookAppointmentVariables>
          mutation={BOOK_APPOINTMENT}
          variables={{
            bookAppointment: {
              patientId: currentPatient ? currentPatient.id : '',
              doctorId: doctorId,
              appointmentDateTime: `${apiDateFormat}T${timeSelected.padStart(5, '0')}:00.000Z`,
              appointmentType: APPOINTMENT_TYPE.PHYSICAL,
              hospitalId: '',
            },
          }}
          onCompleted={() => {
            setMutationLoading(false);
            setIsDialogOpen(true);
          }}
          onError={(error) => {
            alert(error);
          }}
        >
          {(mutate) => (
            <AphButton
              fullWidth
              color="primary"
              disabled={disableSubmit}
              onClick={(e) => {
                setMutationLoading(true);
                mutate();
              }}
            >
              {mutationLoading ? (
                <CircularProgress size={22} color="secondary" />
              ) : (
                `PAY Rs. ${physicalConsultationFees}`
              )}
            </AphButton>
          )}
        </Mutation>
      </div>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.confirmationColor}>Appointment Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your appointment has been successfully booked with Dr. {doctorName}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setIsDialogOpen(false);
              // setMutationSuccess(true);
              window.location.href = clientRoutes.welcome();
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
