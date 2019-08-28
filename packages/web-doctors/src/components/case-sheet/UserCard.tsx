import React, { useContext } from 'react';
import { Card, CardMedia, CardContent, Typography, Divider } from '@material-ui/core';
import { CaseSheetContext } from 'context/CaseSheetContext';

export const UserCard: React.FC = () => {
  const { loading, patientDetails, caseSheetId } = useContext(CaseSheetContext);

  return loading && !patientDetails ? (
    <div></div>
  ) : (
    <Card>
      <CardMedia
        component="img"
        image={require('images/ic_patientchat.png')}
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
          {patientDetails!.dateOfBirth
            ? Math.abs(
                new Date(Date.now()).getUTCFullYear() -
                  new Date(patientDetails!.dateOfBirth).getUTCFullYear()
              )
            : ''}
          ,{patientDetails!.gender && patientDetails!.gender},
          {/* {props.casesheetInfo.getCaseSheet.patientDetails.location &&
              props.casesheetInfo.getCaseSheet.patientDetails.location !== '' &&
              props.casesheetInfo.getCaseSheet.patientDetails.location} */}
        </Typography>
        <Divider />
        {patientDetails!.uhid && patientDetails!.uhid !== '' && (
          <Typography variant="h6" color="textSecondary" component="h6">
            UHID:{patientDetails!.uhid}
          </Typography>
        )}

        <Typography variant="h6" color="textSecondary" component="h6">
          Appt ID:
          {caseSheetId && caseSheetId !== '' && caseSheetId}
        </Typography>
      </CardContent>
    </Card>
  );
};
