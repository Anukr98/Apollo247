import React, { useState, useEffect } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import { Stepper, Step, StepLabel, Typography } from '@material-ui/core';
import { format, getTime, setSeconds, setMilliseconds } from 'date-fns';

interface Props {
  values: Array<any>;
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      // maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    card: {
      width: '100%',
      border: 'solid 1px rgba(2, 71, 91, 0.3)',
      backgroundColor: '#f0f4f5',
    },
    cardContent: {
      width: '90%',
    },
    chip: {
      marginRight: theme.spacing(1),
      backgroundColor: 'rgba(0,135,186,0.1)',
      minWidth: '60px',
      padding: '10px',
      borderRadius: '5px',
      color: '#0087ba',
      fontSize: 12,
      fontWeight: 700,
    },
    section1: {
      margin: theme.spacing(0, 2),
      color: '#0087ba',
      fontSize: 12,
    },
    section2: {
      margin: theme.spacing(0, 2),
      color: '#02475b',
      '& button': {
        color: '#02475b',
        marginRight: '40px',
        [theme.breakpoints.between('sm', 'md')]: {
          marginRight: '5px',
        },
      },
    },
    subHeading: {
      color: '#ff748e',
      fontWeight: 700,
      fontSize: '14px',
    },
    mainHeading: {
      color: '#02475b',
      fontWeight: 700,
      fontSize: '20px',
    },
    section3: {
      margin: theme.spacing(3, 1, 1),
    },
    bigAvatar: {
      width: 60,
      height: 60,
    },
    valign: {
      display: 'flex',
      alignItems: 'center',
    },
    bold: {
      fontWeight: 700,
    },
  })
);
let timeOutId;
const udpateActiveStep = (appointments, activeStep, setActiveStep) => {
  if (appointments.length && checkIfComplete(appointments[activeStep].endTime)) {
    activeStep += 1;
    setActiveStep(activeStep);
  }

  if (activeStep < appointments.length) {
    timeOutId = setTimeout(() => udpateActiveStep(appointments, activeStep, setActiveStep), 1000);
  }
};
const checkIfComplete = (appointmentEndTime) =>
  getTime(setSeconds(setMilliseconds(appointmentEndTime, 0), 0)) <=
  getTime(setSeconds(setMilliseconds(Date.now(), 0), 0));

const getActiveStep = (appointments) =>
  appointments.findIndex((appointment) => checkIfComplete(appointment.endTime));

export const Appointments: React.FC<Props> = (props) => {
  const classes = useStyles();
  const [appointments, setAppointments] = useState(props.values);
  const stepsCompleted = getActiveStep(appointments);
  const [activeStep, setActiveStep] = useState(stepsCompleted < 0 ? 0 : stepsCompleted);

  useEffect(() => {
    let activeStep = getActiveStep(props.values);
    activeStep = activeStep < 0 ? 0 : activeStep;

    setAppointments(props.values);
    setActiveStep(activeStep);
    clearTimeout(timeOutId);
    udpateActiveStep(props.values, activeStep, setActiveStep);
  }, [props.values]);

  return (
    <div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {appointments.map((appointment, idx) => (
          <Step key={idx}>
            <StepLabel>
              <Typography>
                {format(appointment.startTime, 'hh:mm')} - {format(appointment.endTime, 'hh:mm A')}
                <span>{appointment.details.patientName}</span>
                {/* card view start */}
                <div className={classes.root}>
                  <Card className={classes.card}>
                    <CardContent>
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid lg={4} sm={5} xs={4} key={1} container>
                            <Grid sm={3} xs={2} key={5} item>
                              <Avatar
                                alt="Remy Sharp"
                                src="https://images.unsplash.com/photo-1556909128-2293de4be38e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                                className={classes.bigAvatar}
                              />
                            </Grid>
                            <Grid sm={9} xs={10} key={6} item className={classes.valign}>
                              <div className={classes.section2}>
                                <Typography
                                  gutterBottom
                                  variant="caption"
                                  className={classes.subHeading}
                                >
                                  New
                                </Typography>
                                <Typography
                                  gutterBottom
                                  variant="body1"
                                  className={classes.mainHeading}
                                >
                                  Prateek Sharma
                                </Typography>
                              </div>
                            </Grid>
                          </Grid>
                          <Grid lg={5} sm={4} xs={5} key={2} item className={classes.valign}>
                            <div className={classes.section1}>
                              <Chip className={classes.chip} label="Cold" />
                              <Chip className={classes.chip} label="Cough" />
                              <Typography gutterBottom variant="caption" className={classes.bold}>
                                +3
                              </Typography>
                            </div>
                          </Grid>
                          <Grid lg={3} sm={3} xs={3} key={3} item>
                            <div className={classes.section2}>
                              <IconButton aria-label="Video call">
                                <VideoCallIcon />
                              </IconButton>
                              <IconButton aria-label="Navigate next">
                                <NavigateNextIcon />
                              </IconButton>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </div>
                {/* card view end */}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};
