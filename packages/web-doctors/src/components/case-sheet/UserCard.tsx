import React from 'react';
import { Card, CardMedia, CardContent, Typography, Divider } from '@material-ui/core';
import { GetJuniorDoctorCaseSheet } from 'graphql/types/GetJuniorDoctorCaseSheet';

interface CasesheetInfoProps {
  casesheetInfo: GetJuniorDoctorCaseSheet;
  appointmentId: string;
}
export const UserCard: React.FC<CasesheetInfoProps> = (props) => {
  console.log(
    props.casesheetInfo && props.casesheetInfo.getJuniorDoctorCaseSheet
      ? props.casesheetInfo.getJuniorDoctorCaseSheet
      : ''
  );
  return (
    props.casesheetInfo &&
    props.casesheetInfo.getJuniorDoctorCaseSheet &&
    props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails && (
      <Card>
        <CardMedia
          component="img"
          image={require('images/ic_patientchat.png')}
          title="patient name"
        />
        <CardContent>
          {props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.firstName &&
            props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.firstName !== '' &&
            props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.lastName &&
            props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.lastName !== '' && (
              <Typography gutterBottom variant="h4" component="h2">
                {props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.firstName +
                  ' ' +
                  props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.lastName}
              </Typography>
            )}
          <Typography variant="h5" color="textSecondary" component="h5">
            {/* {props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.age ? props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.age : ''}, */}
            {props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.gender &&
              props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.gender}
            ,
            {/* {props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.location &&
              props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.location !== '' &&
              props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.location} */}
          </Typography>
          <Divider />
          {props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.uhid &&
            props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.uhid !== '' && (
              <Typography variant="h6" color="textSecondary" component="h6">
                UHID:{props.casesheetInfo.getJuniorDoctorCaseSheet.patientDetails.uhid}
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
