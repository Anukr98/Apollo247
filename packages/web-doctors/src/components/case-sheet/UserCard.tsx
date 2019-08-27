import React from 'react';
import { Card, CardMedia, CardContent, Typography, Divider } from '@material-ui/core';
import { GetCaseSheet } from 'graphql/types/GetCaseSheet';

interface CasesheetInfoProps {
  casesheetInfo: GetCaseSheet;
  appointmentId: string;
}
export const UserCard: React.FC<CasesheetInfoProps> = (props) => {
  return (
    props.casesheetInfo &&
    props.casesheetInfo.getCaseSheet &&
    props.casesheetInfo.getCaseSheet.patientDetails && (
      <Card>
        <CardMedia
          component="img"
          image={require('images/ic_patientchat.png')}
          title="patient name"
        />
        <CardContent>
          {props.casesheetInfo.getCaseSheet.patientDetails.firstName &&
            props.casesheetInfo.getCaseSheet.patientDetails.firstName !== '' &&
            props.casesheetInfo.getCaseSheet.patientDetails.lastName &&
            props.casesheetInfo.getCaseSheet.patientDetails.lastName !== '' && (
              <Typography gutterBottom variant="h4" component="h2">
                {props.casesheetInfo.getCaseSheet.patientDetails.firstName +
                  ' ' +
                  props.casesheetInfo.getCaseSheet.patientDetails.lastName}
              </Typography>
            )}
          <Typography variant="h5" color="textSecondary" component="h5">
            {/* {props.casesheetInfo.getCaseSheet.patientDetails.age ? props.casesheetInfo.getCaseSheet.patientDetails.age : ''}, */}
            {props.casesheetInfo.getCaseSheet.patientDetails.gender &&
              props.casesheetInfo.getCaseSheet.patientDetails.gender}
            ,
            {/* {props.casesheetInfo.getCaseSheet.patientDetails.location &&
              props.casesheetInfo.getCaseSheet.patientDetails.location !== '' &&
              props.casesheetInfo.getCaseSheet.patientDetails.location} */}
          </Typography>
          <Divider />
          {props.casesheetInfo.getCaseSheet.patientDetails.uhid &&
            props.casesheetInfo.getCaseSheet.patientDetails.uhid !== '' && (
              <Typography variant="h6" color="textSecondary" component="h6">
                UHID:{props.casesheetInfo.getCaseSheet.patientDetails.uhid}
              </Typography>
            )}

          <Typography variant="h6" color="textSecondary" component="h6">
            Appt ID:
            {props.appointmentId && props.appointmentId !== '' && props.appointmentId}
          </Typography>
        </CardContent>
      </Card>
    )
  );
};
