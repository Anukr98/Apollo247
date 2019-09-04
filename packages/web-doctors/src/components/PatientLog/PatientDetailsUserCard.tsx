import React, { useContext } from 'react';
import { Card, CardMedia, CardContent, Typography } from '@material-ui/core';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { Gender } from 'graphql/types/globalTypes';

import { GetCaseSheet_getCaseSheet_patientDetails } from 'graphql/types/GetCaseSheet';

interface PatientDetailsProps {
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
}
export const PatientDetailsUserCard: React.FC<PatientDetailsProps> = (props) => {
  const { loading } = useContext(CaseSheetContext);
  const userCardStrip = [];
  const patientDetails = props.patientDetails;
  if (
    patientDetails! &&
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
  if (patientDetails && patientDetails!.gender && patientDetails!.gender !== null) {
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
      : require('images/ic_patientchat.png');
  return loading && !patientDetails ? (
    <div>loading....</div>
  ) : (
    <Card>
      <CardMedia
        component="img"
        image={photoUrl}
        title={`${patientDetails!.firstName} ${patientDetails!.lastName}`}
      />
      <CardContent>
        {patientDetails &&
          patientDetails!.firstName &&
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
      </CardContent>
    </Card>
  );
};
