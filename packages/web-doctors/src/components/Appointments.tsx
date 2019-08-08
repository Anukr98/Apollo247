import React, { useState, useEffect } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  StepContent,
  Typography,
} from '@material-ui/core';
import { format, getTime, setSeconds, setMilliseconds } from 'date-fns';
import { Link } from 'react-router-dom';

export interface Appointment {
  startTime: number;
  endTime: number;
  isNew: boolean;
  type: string;
  status: string;
  details: {
    patientName: string;
    checkups: string[];
    avatar: string;
  };
}

export interface AppointmentsProps {
  values: Appointment[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    card: {
      width: '100%',
      border: 'solid 1px rgba(2, 71, 91, 0.3)',
      backgroundColor: '#f0f4f5',
      boxShadow: 'none',
    },
    cardContent: {
      width: '90%',
    },
    chip: {
      marginRight: theme.spacing(1),
      backgroundColor: 'rgba(0,135,186,0.1)',
      minWidth: 60,
      padding: 10,
      borderRadius: 5,
      color: '#0087ba',
      fontSize: 12,
      fontWeight: 700,
      [theme.breakpoints.between('sm', 'md')]: {
        marginTop: 5,
      },
    },
    section1: {
      margin: theme.spacing(0, 2),
      color: '#0087ba',
      fontSize: 12,
    },
    section2: {
      margin: theme.spacing(0, 2),
      color: '#02475b',
      [theme.breakpoints.between('sm', 'md')]: {
        margin: '0 2px',
      },
      '& button': {
        color: '#02475b',
        marginRight: 40,
        [theme.breakpoints.between('sm', 'md')]: {
          marginRight: 5,
          padding: '10px 5px',
        },
      },
    },
    subHeading: {
      color: '#ff748e',
      fontWeight: 700,
      fontSize: 14,
    },
    mainHeading: {
      color: '#02475b',
      fontWeight: 700,
      fontSize: 20,
      [theme.breakpoints.between('sm', 'md')]: {
        fontSize: 18,
      },
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
      padding: '0 !important',
    },
    bold: {
      fontWeight: 700,
    },
    calendarContent: {
      backgroundColor: '#f7f7f7',
      paddingTop: 90,
    },
    iconContainer: {
      '& text': {
        display: 'none',
      },
    },
    AppointmentTime: {
      position: 'relative',
      top: -70,
      marginLeft: '5%',
      fontSize: 14,
      fontWeight: theme.typography.fontWeightBold,
      color: '#0087ba',
    },
    step: {
      '& .stepContent': {
        borderLeft: '2px solid #0087ba',
      },
      '&:last-child': {
        '& .stepContent': {
          borderLeft: 'none',
        },
      },
      '& .stepIcon': {
        color: '#fff',
        border: '2px solid #0087ba',
        borderRadius: '50%',
      },
      '& .cardRow': {
        border: '2px solid #0087ba',
        backgroundColor: '#fff',
        position: 'relative',
        top: -70,
        marginLeft: '5%',
        width: '95%',
      },
      '&.upcoming': {
        '& .stepIcon': {
          color: '#fff',
          border: '2px solid #ff748e',
          borderRadius: '50%',
        },
        '& .cardRow': {
          border: '2px solid #ff748e',
          backgroundColor: '#fff',
          position: 'relative',
          top: -70,
          marginLeft: '5%',
          width: '95%',
        },
      },
    },
    completed: {
      '& .stepIcon': {
        color: '#0087ba',
        border: 'none',
      },
      '& .cardRow': {
        backgroundColor: '#f0f4f5',
        border: 'solid 1px rgba(2, 71, 91, 0.1)',
      },
    },
    hide: {
      display: 'none',
    },
    noContent: {
      'min-height': 320,
      'text-align': 'center',
      color: 'rgba(2, 71, 91, 0.6)',
      fontSize: 16,
      fontWeight: 600,
      '& img' :{
        width: 200,
        marginBottom: 60,
      }
    },
  })
);

let timeOutId: number;
const udpateActiveStep = (
  appointments: Appointment[],
  activeStep: number,
  setActiveStep: React.Dispatch<number>
) => {
  if (appointments.length && checkIfComplete(appointments[activeStep].endTime)) {
    activeStep += 1;
    setActiveStep(activeStep);
  }

  if (activeStep < appointments.length) {
    timeOutId = window.setTimeout(
      () => udpateActiveStep(appointments, activeStep, setActiveStep),
      1000
    );
  }
};
const checkIfComplete = (appointmentEndTime: number) =>
  getTime(setSeconds(setMilliseconds(appointmentEndTime, 0), 0)) <=
  getTime(setSeconds(setMilliseconds(Date.now(), 0), 0));

const getActiveStep = (appointments: Appointment[]) =>
  appointments.findIndex((appointment) => checkIfComplete(appointment.endTime));

export const Appointments: React.FC<AppointmentsProps> = ({ values }) => {
  const classes = useStyles();
  const [appointments, setAppointments] = useState<Appointment[]>(values);
  const stepsCompleted = getActiveStep(appointments);
  const [activeStep, setActiveStep] = useState<number>(stepsCompleted < 0 ? 0 : stepsCompleted);

  useEffect(() => {
    let activeStep = getActiveStep(values);
    activeStep = activeStep < 0 ? 0 : activeStep;

    setAppointments(values);
    setActiveStep(activeStep);
    clearTimeout(timeOutId);
    udpateActiveStep(values, activeStep, setActiveStep);
  }, [values]);

  if (appointments && appointments.length) {
    return (
      <div>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          connector={
            <StepConnector
              classes={{
                line: classes.hide,
              }}
            />
          }
          className={classes.calendarContent}
        >
          {appointments.map((appointment, idx) => (
            <Step
              key={idx}
              active={true}
              className={
                activeStep === idx ? 'upcoming' : activeStep - 1 >= idx ? classes.completed : ''
              }
              classes={{
                root: classes.step,
              }}
            >
              <StepLabel
                classes={{ iconContainer: classes.iconContainer }}
                StepIconProps={{
                  classes: {
                    root: 'stepIcon',
                  },
                }}
              >
                <Typography variant="h5" className={classes.AppointmentTime}>
                  <span>
                    {`${format(appointment.startTime, 'hh:mm')} - ${format(
                      appointment.endTime,
                      'hh:mm aa'
                    )}`}
                  </span>
                </Typography>
              </StepLabel>
              <StepContent
                classes={{
                  root: 'stepContent',
                }}
              >
                <div>
                  <Card
                    className={classes.card}
                    classes={{
                      root: 'cardRow',
                    }}
                  >
                    <CardContent>
                      <Grid item xs={12}>
                        <Grid item container spacing={2}>
                          <Grid item lg={4} sm={5} xs={4} key={1} container>
                            <Grid sm={3} xs={2} key={5} item>
                              <Avatar
                                alt={appointment.details.patientName}
                                src={appointment.details.avatar}
                                className={classes.bigAvatar}
                              />
                            </Grid>
                            <Grid sm={9} xs={10} key={6} item className={classes.valign}>
                              <div className={classes.section2}>
                                {appointment.isNew && (
                                  <Typography
                                    gutterBottom
                                    variant="caption"
                                    className={classes.subHeading}
                                  >
                                    New
                                  </Typography>
                                )}
                                <Typography
                                  gutterBottom
                                  variant="body1"
                                  className={classes.mainHeading}
                                >
                                  {appointment.details.patientName}
                                </Typography>
                              </div>
                            </Grid>
                          </Grid>
                          {appointment.details.checkups && appointment.details.checkups.length && (
                            <Grid lg={5} sm={5} xs={5} key={2} item className={classes.valign}>
                              <div className={classes.section1}>
                                {(appointment.details.checkups.length > 3
                                  ? appointment.details.checkups.slice(0, 2)
                                  : appointment.details.checkups
                                ).map((checkup, idx) => (
                                  <Chip
                                    key={idx}
                                    className={classes.chip}
                                    label={checkup.toUpperCase()}
                                  />
                                ))}
                                {appointment.details.checkups.length > 3 && (
                                  <Typography
                                    gutterBottom
                                    variant="caption"
                                    className={classes.bold}
                                  >
                                    +{appointment.details.checkups.length - 2}
                                  </Typography>
                                )}
                              </div>
                            </Grid>
                          )}
                          <Grid lg={3} sm={2} xs={3} key={3} className={classes.valign} item>
                            <div className={classes.section2}>
                              <IconButton aria-label="Video call">
                                <img src={require('images/ic_video.svg')} alt="" />
                              </IconButton>
                              <Link to="/consultTabs">
                                <IconButton aria-label="Navigate next">
                                  <NavigateNextIcon />
                                </IconButton>
                              </Link>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </div>
    );
  }

  return (
    <div className={classes.calendarContent}>
      <div className={classes.noContent}>
      <div><img src={require('images/no_data.svg')} alt="" /></div>
        No consults scheduled today!
        </div>
    </div>
  );
};
