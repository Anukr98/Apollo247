import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Card, CardMedia, CardContent, Typography, Divider } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return {
    caseSheet: {
      minHeight: 'calc(100vh - 360px)',
      display: 'flex',
    },
  };
});

export const CaseSheet: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.caseSheet}>
      <section>
        <Card>
          <CardMedia
            component="img"
            image={require('images/ic_patientchat.png')}
            title="patient name"
          />
          <CardContent>
            <Typography gutterBottom variant="h4" component="h2">
              Seema Singh
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              56, F, Mumbai
            </Typography>
            <Divider />
            <Typography variant="body2" color="textSecondary" component="p">
              UHID: 012345
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Appt ID: 98765
            </Typography>
          </CardContent>
        </Card>
      </section>
      <section></section>
    </div>
  );
};
