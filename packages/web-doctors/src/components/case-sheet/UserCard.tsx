import React, { useContext } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
} from '@material-ui/core';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { Gender } from 'graphql/types/globalTypes';
import { format } from 'date-fns';

export const UserCard: React.FC = () => {
  const { loading, patientDetails, appointmentInfo, jrdName, jrdSubmitDate } = useContext(
    CaseSheetContext
  );

  const userCardStrip = [];
  const displayId = (appointmentInfo && appointmentInfo.displayId) || '';
  if (patientDetails && patientDetails.dateOfBirth && patientDetails.dateOfBirth !== '') {
    userCardStrip.push(
      Math.abs(
        new Date(Date.now()).getUTCFullYear() -
          new Date(patientDetails.dateOfBirth).getUTCFullYear()
      ).toString()
    );
  }
  if (patientDetails && patientDetails.gender) {
    if (patientDetails.gender === Gender.FEMALE) {
      userCardStrip.push('F');
    }
    if (patientDetails.gender === Gender.MALE) {
      userCardStrip.push('M');
    }
    if (patientDetails.gender === Gender.OTHER) {
      userCardStrip.push('O');
    }
  }
  if (
    patientDetails &&
    patientDetails.patientAddress &&
    patientDetails.patientAddress.length > 0 &&
    patientDetails.patientAddress[0]!.city !== ''
  ) {
    userCardStrip.push(patientDetails.patientAddress[0]!.city);
  }
  const photoUrl =
    patientDetails && patientDetails.photoUrl
      ? patientDetails.photoUrl
      : require('images/no_person_icon.svg');
  return loading && !patientDetails ? (
    <CircularProgress />
  ) : (
    <Card>
      <CardMedia
        component="img"
        image={photoUrl}
        title={`${patientDetails!.firstName} ${patientDetails!.lastName}`}
      />
      <CardContent>
        {patientDetails!.firstName &&
          patientDetails!.firstName !== '' &&
          patientDetails!.lastName &&
          patientDetails!.lastName !== '' && (
            <Typography gutterBottom variant="h4" component="h2">
              {patientDetails!.firstName + ' ' + patientDetails!.lastName}
            </Typography>
          )}
        <Typography variant="h5" color="textSecondary" component="h5">
          {userCardStrip.join(', ')}
        </Typography>
        <Divider />
        {patientDetails!.uhid && patientDetails!.uhid !== '' && (
          <Typography variant="h6" color="textSecondary" component="h6">
            UHID: {patientDetails!.uhid}
          </Typography>
        )}
        <Typography variant="h6" color="textSecondary" component="h6">
          Appt ID: {displayId}
        </Typography>
        <Divider />

        <Typography variant="h6" color="textSecondary" component="h6">
          Submitted by Dr. {jrdName}
          {jrdSubmitDate &&
            ` on 
          ${format(new Date(jrdSubmitDate), 'dd/MM/yyyy hh:mm:ss')}`}
        </Typography>
      </CardContent>
    </Card>
  );
};
