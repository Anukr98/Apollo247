import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
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
import { format, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { STATUS } from 'graphql/types/globalTypes';
import { CircularProgress } from '@material-ui/core';

export interface Appointment {
  id: string;
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
  loading: boolean;
  selectedDate: Date;
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
      borderRadius: 10,
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
      margin: '0 10px',
      color: '#02475b',
      [theme.breakpoints.between('sm', 'md')]: {
        margin: '0 2px',
      },
      '& button': {
        color: '#02475b',
        marginRight: 15,
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
    newAppointment: {
      backgroundColor: '#ff748e',
      color: '#fff',
      padding: '4px 8px',
      fontWeight: 700,
      fontSize: 10,
      textTransform: 'uppercase',
      borderRadius: '0 10px 10px 0',
      position: 'absolute',
      left: 0,
      top: 8,
    },
    mainHeading: {
      color: '#02475b',
      fontWeight: 500,
      fontSize: 20,
      lineHeight: '25px',
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
        border: '1px solid #0087ba',
        backgroundColor: '#fff',
        position: 'relative',
        top: -70,
        height: 96,
        marginLeft: '5%',
        width: '95%',
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.3)',
      },
      '&.upcoming': {
        '& .stepIcon': {
          color: '#fff',
          border: '2px solid #ff748e',
          borderRadius: '50%',
          backgroundColor: '#fff',
        },
        '& .cardRow': {
          border: '1px solid #ff748e',
          backgroundColor: '#fff',
          position: 'relative',
          top: -70,
          marginLeft: '5%',
          width: '95%',
          boxShadow: '0 2px 4px 0 rgba(0,0,0,0.3)',
        },
        '& .AppointmentTimeupcoming': {
          color: '#ff748e',
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
        boxShadow: 'none',
      },
    },
    missing: {},
    hide: {
      display: 'none',
    },
    noContent: {
      minHeight: 360,
      textAlign: 'center',
      color: 'rgba(2, 71, 91, 0.6)',
      fontSize: 16,
      fontWeight: 500,
      marginTop: -30,
      '& img': {
        width: 200,
        marginBottom: 35,
      },
    },
    loderContent: {
      textAlign: 'center',
      minHeight: 330,
      paddingTop: 100,
    },
  })
);

const checkIfComplete = (status: string) => status === STATUS.COMPLETED;

const getActiveStep = (appointments: Appointment[]) =>
  appointments.findIndex((appointment) => checkIfComplete(appointment.status));

export const Appointments: React.FC<AppointmentsProps> = ({
  values,
  loading: loadingData,
  selectedDate,
}) => {
  const classes = useStyles();
  const [appointments, setAppointments] = useState<Appointment[]>(values);
  const stepsCompleted = getActiveStep(appointments);
  const [activeStep, setActiveStep] = useState<number>(stepsCompleted < 0 ? 0 : stepsCompleted);
  const [loading, isLoading] = useState<boolean>(loadingData);
  const upcomingElement = useRef(null);

  useImperativeHandle(upcomingElement, () => {
    if (upcomingElement.current) {
      const elem = (upcomingElement!.current as unknown) as HTMLDivElement;
      elem.scrollIntoView({ block: 'start' });
      window.scrollTo(0, window.scrollY - 322);
    }

    return null;
  });

  useEffect(() => {
    let activeStep = getActiveStep(values);
    activeStep = activeStep < 0 ? 0 : activeStep;

    setAppointments(values);
    setActiveStep(activeStep);
  }, [values]);

  useEffect(() => {
    isLoading(loadingData);
  }, [loadingData]);

  if (loading) {
    return (
      <div className={classes.calendarContent}>
        <div className={classes.loderContent}>
          <CircularProgress />
        </div>
      </div>
    );
  }

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
                activeStep === idx
                  ? 'upcoming'
                  : activeStep - 1 >= idx
                  ? classes.completed
                  : appointment.status === STATUS.MISSED
                  ? classes.missing
                  : ''
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
                <Typography
                  variant="h5"
                  className={classes.AppointmentTime}
                  classes={{
                    root: 'AppointmentTimeupcoming',
                  }}
                >
                  <span>
                    {`${activeStep === idx ? 'UP NEXT: ' : ''}${format(
                      appointment.startTime,
                      'h:mm'
                    )} - ${format(appointment.endTime, 'h:mm aa')}`}
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
                    ref={activeStep === idx ? upcomingElement : null}
                    classes={{
                      root: 'cardRow',
                    }}
                  >
                    <CardContent>
                      <Grid item xs={12}>
                        <Grid item container spacing={2}>
                          <Grid item lg={5} sm={5} xs={4} key={1} container>
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
                                    className={classes.newAppointment}
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
                          {!!appointment.details.checkups && !!appointment.details.checkups.length && (
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
                          <Grid lg={2} sm={2} xs={3} key={3} className={classes.valign} item>
                            <div className={classes.section2}>
                              <IconButton aria-label="Video call">
                                <img src={require('images/ic_video.svg')} alt="" />
                              </IconButton>
                              <Link to={`/consultTabs/${appointment.id}`}>
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
        <div>
          <img src={require('images/no_data.svg')} alt="" />
        </div>
        No consults scheduled{' '}
        {isToday(selectedDate) ? 'today' : `for ${format(selectedDate, 'MMM, dd')}`}!
      </div>
    </div>
  );
};
