import React from 'react';
import { Card, CardMedia, CardContent, Typography, Divider } from '@material-ui/core';

export const UserCard: React.FC = () => {
  return (
    <Card>
      <CardMedia
        component="img"
        image={require('images/ic_patientchat.png')}
        title="patient name"
      />
      <CardContent>
        <Typography gutterBottom variant="h2">
          Seema Singh
        </Typography>
        <Typography variant="h5" color="textSecondary">
          56, F, Mumbai
        </Typography>
        <Divider />
        <Typography variant="h6" color="textSecondary">
          UHID: 012345
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Appt ID: 98765
        </Typography>
      </CardContent>
    </Card>
  );
};
