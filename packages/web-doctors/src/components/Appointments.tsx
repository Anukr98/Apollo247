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
  Tooltip,
} from '@material-ui/core';
import { format, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { STATUS, APPOINTMENT_TYPE } from 'graphql/types/globalTypes';
import { CircularProgress } from '@material-ui/core';
import _uniqueId from 'lodash/uniqueId';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet as caseSheetInfo } from 'graphql/types/GetDoctorAppointments';

export interface Appointment {
  id: string;
  patientId: string;
  startTime: number;
  endTime: number;
  isNew: boolean;
  type: string;
  status: string;
  caseSheet: any;
  details: {
    patientName: string;
    checkups: any;
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

      '& span': {
        maxWidth: 300,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'block',
      },
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        bottom: 10,
        left: 30,
      },
    },
    videoIcomm: {
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: -88,
        top: 5,
      },
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
        fontSize: 15,
      },
      [theme.breakpoints.down('xs')]: {
        fontSize: 17,
      },
    },
    section3: {
      margin: theme.spacing(3, 1, 1),
    },
    bigAvatar: {
      width: 60,
      height: 60,
      [theme.breakpoints.down('xs')]: {
        width: 40,
        height: 40,
      },
    },
    valign: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 !important',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    bold: {
      fontWeight: 700,
    },
    calendarContent: {
      backgroundColor: '#f7f7f7',
      paddingTop: 90,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
        paddingRight: 5,
      },
    },
    iconContainer: {
      '& text': {
        display: 'none',
      },
    },
    AppointmentTime: {
      position: 'relative',
      top: -65,
      marginLeft: 30,
      fontSize: 14,
      fontWeight: theme.typography.fontWeightBold,
      color: '#0087ba',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 8,
      },
    },
    step: {
      marginTop: -8,
      position: 'relative',
      '& .stepContent': {
        borderLeft: '2px solid #0087ba',
        marginTop: 0,
        marginLeft: 30,
        paddingLeft: 0,
        [theme.breakpoints.down('xs')]: {
          marginLeft: 20,
        },
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
        marginTop: 0,
        marginLeft: 19,
        [theme.breakpoints.down('xs')]: {
          marginLeft: 10,
        },
      },
      '& .cardRow': {
        border: '1px solid #0087ba',
        backgroundColor: '#fff',
        position: 'relative',
        top: -60,
        height: 96,
        marginLeft: '5%',
        marginBottom: 25,
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
    upcoming: {
      '& .stepIcon': {
        color: '#fff',
        border: '2px solid #ff748e',
      },
      '& .cardRow': {
        backgroundColor: '#fff',
        border: '1px solid #ff748e',
      },
      '& h5': {
        color: '#ff748e',
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
    completedIcon: {
      position: 'absolute',
      left: 21,
      top: 2,
    },
    popoverTile: {
      color: '#fcb716',
      fontWeight: 500,
    },
  })
);

const checkIfComplete = (status: string) =>
  status === STATUS.COMPLETED || status === STATUS.NO_SHOW;

const getActiveStep = (appointments: Appointment[]) => {
  return appointments.reduce((acc, appointment) => {
    if (checkIfComplete(appointment.status)) {
      return ++acc;
    }
    return acc;
  }, 0);
};

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
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const upcomingElement = useRef(null);

  useImperativeHandle(upcomingElement, () => {
    if (upcomingElement.current) {
      const elem = (upcomingElement!.current as unknown) as HTMLDivElement;
      elem.scrollIntoView({ block: 'start' });
      window.scrollTo(0, window.scrollY - 210);
    }

    return null;
  });

  let upcomingNextRendered: boolean = false;

  const showUpNext = (aptTime: number) => {
    if (aptTime > new Date().getTime() && !upcomingNextRendered) {
      upcomingNextRendered = true;
      return true;
    } else {
      return false;
    }
  };

  const getAppointmentStatusClass = (appointmentStatus: string) => {
    if (appointmentStatus === STATUS.NO_SHOW) return classes.missing;
    if (appointmentStatus === STATUS.COMPLETED) return classes.completed;
    return '';
  };

  const getSymptomTooltip = (appointment: any, symptomArr: any) => {
    let symptms: any = [];
    symptomArr.filter((value: any, index: number) => {
      if (index > 1) {
        symptms.push(value.symptom.toUpperCase());
      }
    });
    return (
      <Tooltip title={symptms.join(', ')} placement="top-start">
        <Typography gutterBottom variant="caption" className={classes.bold}>
          +{appointment.details.checkups.symptoms.length - 2}
        </Typography>
      </Tooltip>
    );
  };
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

  if (appointments && appointments.length && !isDialogOpen) {
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
          {appointments.map((appointment, idx) => {
            const jrdCaseSheet =
              appointment.caseSheet.length > 0
                ? appointment.caseSheet.filter(
                    (cdetails: caseSheetInfo) =>
                      cdetails.doctorType === 'JUNIOR' && cdetails.status === 'COMPLETED'
                  )
                : [];
            const appointmentCard = (
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
                      <Grid item lg={5} sm={5} xs={12} key={1} container>
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
                      {!!appointment.details.checkups &&
                      !!appointment.details.checkups.symptoms &&
                      !!appointment.details.checkups.symptoms.length ? (
                        <Grid lg={5} sm={5} xs={8} key={2} item className={classes.valign}>
                          <div className={classes.section1}>
                            {(appointment.details.checkups.symptoms.length > 2
                              ? appointment.details.checkups.symptoms.slice(0, 2)
                              : appointment.details.checkups.symptoms
                            ).map((checkup: any, idx: any) => (
                              <Chip
                                key={_uniqueId('chkup_')}
                                className={classes.chip}
                                label={checkup.symptom.toUpperCase()}
                              />
                            ))}
                            {appointment.details.checkups.symptoms.length > 2 &&
                              getSymptomTooltip(appointment, appointment.details.checkups.symptoms)}
                          </div>
                        </Grid>
                      ) : (
                        <Grid lg={5} sm={5} xs={8} key={2} item className={classes.valign}>
                          <div className={classes.section1}>
                            <Typography
                              gutterBottom
                              variant="caption"
                              className={classes.bold}
                            ></Typography>
                          </div>
                        </Grid>
                      )}
                      <Grid lg={2} sm={2} xs={3} key={3} className={classes.valign} item>
                        <div className={`${classes.section2} ${classes.videoIcomm}`}>
                          <IconButton aria-label="Video call">
                            {appointment.type === APPOINTMENT_TYPE.ONLINE ? (
                              <img src={require('images/ic_video.svg')} alt="" />
                            ) : (
                              <img src={require('images/ic_physical_consult.svg')} alt="" />
                            )}
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
            );

            return (
              <Step
                key={_uniqueId('apt_')}
                active={true}
                className={
                  appointment.startTime > new Date().getTime() && !upcomingNextRendered
                    ? classes.upcoming
                    : getAppointmentStatusClass(appointment.status)
                }
                classes={{
                  root: classes.step,
                }}
              >
                {appointment.status === STATUS.COMPLETED && (
                  <img
                    className={classes.completedIcon}
                    src={require('images/ic_completed.svg')}
                    alt=""
                  />
                )}
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
                      {`${showUpNext(appointment.startTime) ? 'UP NEXT: ' : ''}${format(
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
                    {jrdCaseSheet.length > 0 ? (
                      <Link to={`/consulttabs/${appointment.id}/${appointment.patientId}/0`}>
                        {appointmentCard}
                      </Link>
                    ) : (
                      <div
                        onClick={() => {
                          setIsDialogOpen(true);
                        }}
                      >
                        {appointmentCard}
                      </div>
                    )}
                  </div>
                </StepContent>
              </Step>
            );
          })}
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
        No consults scheduled
        {isToday(selectedDate) ? ' today' : ` for ${format(selectedDate, 'MMM, dd')}`}!
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.popoverTile}>Apollo 24x7</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can start this consultation only after Junior Doctor has filled the case sheet.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setIsDialogOpen(false);
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
