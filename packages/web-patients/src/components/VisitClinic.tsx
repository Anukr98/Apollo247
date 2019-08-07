import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';
import Scrollbars from 'react-custom-scrollbars';
import _uniqueId from 'lodash/uniqueId';

import { GetDoctorProfileById } from 'graphql/types/GetDoctorProfileById';
import {
  GetDoctorAvailableSlots,
  GetDoctorAvailableSlotsVariables,
} from 'graphql/types/GetDoctorAvailableSlots';
import { GET_DOCTOR_AVAILABLE_SLOTS } from 'graphql/doctors';
import { getTime } from 'date-fns/esm';
import { useQueryWithSkip } from 'hooks/apolloHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    consultGroup: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.text.primary,
      padding: 15,
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
      paddingTop: 10,
      paddingBottom: 10,
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
      padding: '30px 15px 15px 15px',
      '& button': {
        borderRadius: 10,
        textTransform: 'none',
      },
    },
    customScrollBar: {
      paddingTop: 10,
      paddingBottom: 10,
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
      borderLeft: '1px solid rgba(0,0,0,0.2)',
      paddingLeft: 15,
      width: '22%',
      textAlign: 'right',
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
  doctorDetails: GetDoctorProfileById;
}

export const VisitClinic: React.FC<VisitClinicProps> = (props) => {
  const classes = useStyles();
  const [dateSelected, setDateSelected] = useState<string>('');
  const [timeSelected, setTimeSelected] = useState<string>('');
  const [clinicSelected, setClinicSelected] = useState<string>('');
  const [clinicAddress, setClinicAddress] = useState<string>('');

  const { doctorDetails } = props;

  const currentTime = new Date().getTime();

  const doctorName =
    doctorDetails &&
    doctorDetails.getDoctorProfileById &&
    doctorDetails.getDoctorProfileById.profile
      ? doctorDetails.getDoctorProfileById.profile.firstName
      : '';

  const physicalConsultationFees =
    doctorDetails &&
    doctorDetails.getDoctorProfileById &&
    doctorDetails.getDoctorProfileById.profile
      ? doctorDetails.getDoctorProfileById.profile.physicalConsultationFees
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

  const doctorId = 'c91c5155-ce3a-488b-8865-654588fef776';

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorAvailableSlots,
    GetDoctorAvailableSlotsVariables
  >(GET_DOCTOR_AVAILABLE_SLOTS, {
    variables: {
      DoctorAvailabilityInput: { doctorId: doctorId, availableDate: apiDateFormat },
    },
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Unable to load Available slots.</div>;
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

  const clinics =
    doctorDetails &&
    doctorDetails.getDoctorProfileById &&
    doctorDetails.getDoctorProfileById.clinics &&
    doctorDetails.getDoctorProfileById.clinics.length > 0
      ? doctorDetails.getDoctorProfileById.clinics
      : [];

  const defaultClinicId = clinics.length > 0 ? clinics[0].id : '';
  const defaultClinicAddress =
    clinics.length > 0
      ? `${clinics[0].addressLine1},${clinics[0].addressLine2},${clinics[0].addressLine3}`
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
            >
              {clinics.map((clinicDetails) => {
                return clinicDetails.isClinic ? (
                  <MenuItem
                    classes={{ selected: classes.menuSelected }}
                    key={_uniqueId('clinic_')}
                    value={clinicDetails.id}
                  >
                    {clinicDetails.name}
                  </MenuItem>
                ) : null;
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
            ) : null}
          </div>
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton fullWidth color="primary" disabled={disableSubmit} onClick={() => {}}>
          PAY Rs. {physicalConsultationFees}
        </AphButton>
      </div>
    </div>
  );
};
