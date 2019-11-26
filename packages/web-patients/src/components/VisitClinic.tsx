import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress, Grid } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { AphButton, AphSelect, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';
import Scrollbars from 'react-custom-scrollbars';
import _uniqueId from 'lodash/uniqueId';
import {
  GetDoctorDetailsById as DoctorDetails,
  GetDoctorDetailsById_getDoctorDetailsById_doctorHospital as Facility,
} from 'graphql/types/GetDoctorDetailsById';
import {
  GetDoctorPhysicalAvailableSlots,
  GetDoctorPhysicalAvailableSlotsVariables,
} from 'graphql/types/GetDoctorPhysicalAvailableSlots';
import { GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS, BOOK_APPOINTMENT } from 'graphql/doctors';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { Mutation } from 'react-apollo';
import { BookAppointment, BookAppointmentVariables } from 'graphql/types/BookAppointment';
import { APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
// import { Redirect } from 'react-router';
import _forEach from 'lodash/forEach';
import { getIstTimestamp } from 'helpers/dateHelpers';
import { usePrevious } from 'hooks/reactCustomHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      overflow: 'hidden',
    },
    consultGroup: {
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.text.primary,
      padding: 10,
      marginTop: 10,
      display: 'inline-block',
      width: '100%',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.35,
      color: theme.palette.secondary.light,
      minHeight: 278,
      borderRadius: 10,
      marginBottom: 10,
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
    customScrollBar: {
      paddingTop: 10,
      paddingLeft: 20,
      paddingRight: 20,
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
      padding: 6,
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

  const prevDateSelected = usePrevious(dateSelected);
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

  const morningTime = getIstTimestamp(new Date(apiDateFormat), '12:01');
  const afternoonTime = getIstTimestamp(new Date(apiDateFormat), '17:01');
  const eveningTime = getIstTimestamp(new Date(apiDateFormat), '21:01');

  const doctorId =
    doctorDetails && doctorDetails.getDoctorDetailsById && doctorDetails.getDoctorDetailsById.id
      ? doctorDetails.getDoctorDetailsById.id
      : '';

  const clinics: Facility[] = [];
  if (doctorDetails && doctorDetails.getDoctorDetailsById) {
    _forEach(doctorDetails.getDoctorDetailsById.doctorHospital, (hospitalDetails) => {
      if (
        hospitalDetails.facility.facilityType === 'CLINIC' ||
        hospitalDetails.facility.facilityType === 'HOSPITAL'
      ) {
        clinics.push(hospitalDetails);
      }
    });
  }

  const defaultClinicId =
    clinics.length > 0 && clinics[0] && clinics[0].facility ? clinics[0].facility.id : '';

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorPhysicalAvailableSlots,
    GetDoctorPhysicalAvailableSlotsVariables
  >(GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS, {
    variables: {
      DoctorPhysicalAvailabilityInput: {
        doctorId: doctorId,
        availableDate: apiDateFormat,
        facilityId: defaultClinicId,
      },
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (prevDateSelected !== dateSelected) setTimeSelected('');
  }, [dateSelected, prevDateSelected]);

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

  const availableSlots = (data && data.getDoctorPhysicalAvailableSlots.availableSlots) || [];
  availableSlots.map((slot) => {
    // const slotTimeUtc = new Date(new Date(`${apiDateFormat} ${slot}:00`).toISOString()).getTime();
    // const localTimeOffset = new Date().getTimezoneOffset() * 60000;
    // const slotTime = new Date(slotTimeUtc - localTimeOffset).getTime();
    const slotTime = new Date(slot).getTime();
    const currentTime = new Date(new Date().toISOString()).getTime();
    if (slotTime > currentTime) {
      if (slotTime < morningTime) morningSlots.push(slotTime);
      else if (slotTime >= morningTime && slotTime < afternoonTime) afternoonSlots.push(slotTime);
      else if (slotTime >= afternoonTime && slotTime < eveningTime) eveningSlots.push(slotTime);
      else lateNightSlots.push(slotTime);
    }
  });

  const disableSubmit =
    (morningSlots.length === 0 &&
      afternoonSlots.length === 0 &&
      eveningSlots.length === 0 &&
      lateNightSlots.length === 0) ||
    timeSelected === '';
  const defaultClinicAddress =
    clinics.length > 0 && clinics[0] && clinics[0].facility
      ? `${clinics[0].facility.streetLine1 ? clinics[0].facility.streetLine1 : ''} ${
          clinics[0].facility.streetLine2 ? `${clinics[0].facility.streetLine2}` : ''
        } ${clinics[0].facility.streetLine3 ? `${clinics[0].facility.streetLine3}` : ''}`
      : '';

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'55vh'}>
        <div className={classes.customScrollBar}>
          <Grid container spacing={2}>
            <Grid item sm={6}>
              <div className={classes.consultGroup}>
                <AphCalendar
                  getDate={(dateSelected: string) => setDateSelected(dateSelected)}
                  selectedDate={new Date(apiDateFormat)}
                />
              </div>
            </Grid>
            <Grid item sm={6}>
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
                        value={(clinicDetails.facility.id && clinicDetails.facility.id) || ''}
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
            </Grid>
          </Grid>
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <Mutation<BookAppointment, BookAppointmentVariables>
          mutation={BOOK_APPOINTMENT}
          variables={{
            bookAppointment: {
              patientId: currentPatient ? currentPatient.id : '',
              doctorId: doctorId,
              appointmentDateTime: new Date(
                `${apiDateFormat} ${timeSelected.padStart(5, '0')}:00`
              ).toISOString(),
              appointmentType: APPOINTMENT_TYPE.PHYSICAL,
              hospitalId: defaultClinicId,
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
              color="primary"
              disabled={disableSubmit || mutationLoading || isDialogOpen}
              onClick={(e) => {
                setMutationLoading(true);
                mutate();
              }}
              className={
                disableSubmit || mutationLoading || isDialogOpen ? classes.buttonDisable : ''
              }
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
      <AphDialog
        open={isDialogOpen}
        disableBackdropClick
        disableEscapeKeyDown
        onClose={() => setIsDialogOpen(false)} 
        maxWidth="sm"
      >
        <AphDialogTitle>Appointment Confirmation</AphDialogTitle>
        <div className={classes.dialogBody}>
          Your appointment has been successfully booked with <span>Dr. {doctorName}</span>
        </div>
        <div className={classes.dialogActions}>
         <AphButton
            color="primary"
            onClick={() => {
              setIsDialogOpen(false);
            }}
            autoFocus
          >
            Ok
          </AphButton>
        </div>
      </AphDialog>      
    </div>
  );
};
