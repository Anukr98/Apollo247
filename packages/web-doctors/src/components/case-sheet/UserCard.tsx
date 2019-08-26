import React from 'react';
import { Card, CardMedia, CardContent, Typography, Divider } from '@material-ui/core';
interface UserInfoObject {
  patientId: string;
  image: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  uhid: string;
  appointmentId: string;
}
interface CasesheetInfoObj {
  userInfo: UserInfoObject;
}
interface CasesheetInfoProps {
  casesheetInfo: CasesheetInfoObj;
}
export const UserCard: React.FC<CasesheetInfoProps> = (props) => {
  return (
    (props.casesheetInfo && props.casesheetInfo.userInfo) &&
    (<Card>
      <CardMedia
        component="img"
        image={require('images/ic_patientchat.png')}
        title="patient name"
      />
      <CardContent>
        <Typography gutterBottom variant="h4" component="h2">
          {(props.casesheetInfo.userInfo.name && props.casesheetInfo.userInfo.name !== '')  &&  props.casesheetInfo.userInfo.name}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {(props.casesheetInfo.userInfo.age)  &&  props.casesheetInfo.userInfo.age}, 
          {(props.casesheetInfo.userInfo.gender && props.casesheetInfo.userInfo.gender !== '')  &&  props.casesheetInfo.userInfo.gender}, 
          {(props.casesheetInfo.userInfo.location && props.casesheetInfo.userInfo.location !== '')  &&  props.casesheetInfo.userInfo.location}
        </Typography>
        <Divider />
        <Typography variant="body2" color="textSecondary" component="p">
          UHID: {(props.casesheetInfo.userInfo.uhid && props.casesheetInfo.userInfo.uhid !== '')  &&  props.casesheetInfo.userInfo.uhid}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Appt ID:  {(props.casesheetInfo.userInfo.appointmentId && props.casesheetInfo.userInfo.appointmentId !== '')  &&  props.casesheetInfo.userInfo.appointmentId}
        </Typography>
      </CardContent>
    </Card>)
  );
};
