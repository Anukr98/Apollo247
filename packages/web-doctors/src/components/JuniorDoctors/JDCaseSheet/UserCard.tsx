import React, { useContext } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
} from '@material-ui/core';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { Gender } from 'graphql/types/globalTypes';

export const UserCard: React.FC = () => {
  const { loading, patientDetails, caseSheetId, appointmentInfo } = useContext(CaseSheetContextJrd);
  const userCardStrip = [];
  const displayId =
    appointmentInfo && appointmentInfo !== null && appointmentInfo.displayId !== null
      ? appointmentInfo!.displayId
      : '';
  if (
    patientDetails!.dateOfBirth &&
    patientDetails!.dateOfBirth !== null &&
    patientDetails!.dateOfBirth !== ''
  ) {
    userCardStrip.push(
      Math.abs(
        new Date(Date.now()).getUTCFullYear() -
          new Date(patientDetails!.dateOfBirth).getUTCFullYear()
      ).toString()
    );
  }
  if (patientDetails!.gender && patientDetails!.gender !== null) {
    if (patientDetails!.gender === Gender.FEMALE) {
      userCardStrip.push('F');
    }
    if (patientDetails!.gender === Gender.MALE) {
      userCardStrip.push('M');
    }
    if (patientDetails!.gender === Gender.OTHER) {
      userCardStrip.push('O');
    }
  }
  if (
    patientDetails &&
    patientDetails!.patientAddress &&
    patientDetails.patientAddress !== null &&
    patientDetails.patientAddress.length > 0 &&
    patientDetails!.patientAddress[0]!.city !== ''
  ) {
    userCardStrip.push(patientDetails!.patientAddress[0]!.city);
  }
  const photoUrl =
    patientDetails && patientDetails!.photoUrl && patientDetails!.photoUrl !== null
      ? patientDetails!.photoUrl
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
      </CardContent>
    </Card>
  );
};
