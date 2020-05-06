import {
  createStyles,
  Theme,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import MessageIcon from '@material-ui/icons/Message';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    card: {
      width: '100%',
      margin: 10,
      height: 90,
      backgroundColor: '#fff',
      boxShadow: 'none',
      marginBottom: 16,
    },
    cardContent: {
      width: '90%',
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
    mainHeading: {
      color: '#02475b',
      fontWeight: 500,
      fontSize: 18,
      lineHeight: '25px',
      [theme.breakpoints.between('sm', 'md')]: {
        fontSize: 18,
      },
    },
    mainHeadingmini: {
      fontSize: 14,
      fontWeight: 'normal',
      color: 'rgba(2,71,91,0.6)',
    },
    mainHeadingconsult: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    bigAvatar: {
      width: 60,
      height: 60,
      borderRadius: '50%',
    },
    valign: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 !important',
    },
    bold: {
      fontWeight: 700,
    },
    chatSpan: {
      '& a': {
        width: 102,
        height: 32,
        paddingTop: 6,
        borderRadius: 16,
        backgroundColor: '#fc9916',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontSize: 14,
        display: 'inline-block',
        color: '#fff',
        '& svg': {
          width: 16,
          marginTop: -3,
        },
      },
    },
    chatIcon: {
      height: 10,
      width: 10,
      marginTop: -18,
      paddingRight: 15,
    },
  })
);

interface AllPatientProps {
  patientData: any;
  searchText: string;
}
interface PatientObject {
  id: string;
  name: string;
  avatar: string;
  numberOfConsult: number;
  lastConsultDate: string;
}
export const AllPatient: React.FC<AllPatientProps> = (props) => {
  const classes = useStyles({});
  const patientsList = props.patientData;
  const patientsHtml =
    patientsList.length > 0 ? (
      patientsList.map((_patient: any | [], index: number) => {
        const patient = _patient!;
        const lastConsult =
          patient! &&
          patient!.appointmentdatetime &&
          patient!.appointmentdatetime !== null &&
          patient!.appointmentdatetime !== ''
            ? new Date(patient!.appointmentdatetime)
            : '';
        const photoUrl =
          patient! && patient!.photoUrl && patient!.photoUrl !== null
            ? patient!.photoUrl
            : require('images/no_photo_icon_round.svg');
        return (
          <div key={patient.patientid}>
            <Card
              className={classes.card}
              classes={{
                root: 'cardRow',
              }}
            >
              <CardContent>
                <Grid item xs={12}>
                  <Grid item container spacing={2}>
                    <Grid item lg={4} sm={3} xs={3} key={1} container>
                      <Grid sm={3} xs={2} key={5} item>
                        <img
                          alt={`${patient.patientInfo!.firstName} ${patient.patientInfo!.lastName}`}
                          src={photoUrl}
                          className={classes.bigAvatar}
                        />
                      </Grid>
                      <Grid sm={9} xs={10} key={6} item className={classes.valign}>
                        <div className={classes.section2}>
                          <Typography gutterBottom variant="body1" className={classes.mainHeading}>
                            {`${patient.patientInfo!.firstName} ${patient.patientInfo!.lastName}`}
                          </Typography>
                        </div>
                      </Grid>
                    </Grid>
                    <Grid lg={3} sm={3} xs={3} key={2} item className={classes.valign}>
                      {lastConsult !== '' && (
                        <Typography
                          gutterBottom
                          variant="body1"
                          className={classes.mainHeadingmini}
                        >
                          {`Last Consult: ${lastConsult.getDate()}/${lastConsult.getMonth() +
                            1}/${lastConsult.getFullYear()}`}
                        </Typography>
                      )}
                      {lastConsult === '' && (
                        <Typography
                          gutterBottom
                          variant="body1"
                          className={classes.mainHeadingconsult}
                        >
                          Last Consult: N/A
                        </Typography>
                      )}
                    </Grid>
                    <Grid lg={3} sm={3} xs={3} key={3} item className={classes.valign}>
                      <Typography
                        gutterBottom
                        variant="body1"
                        className={classes.mainHeadingconsult}
                      >
                        {patient.appointmentids.length > 1
                          ? `${patient.appointmentids.length} Consults`
                          : `${patient.appointmentids.length} Consult`}
                      </Typography>
                    </Grid>
                    <Grid lg={2} sm={3} xs={3} key={4} className={classes.valign} item>
                      <span className={classes.chatSpan}>
                        <Link
                          to={`/consulttabs/${patient.appointmentids[0]}/${patient.patientid}/1`}
                        >
                          <IconButton aria-label="Navigate next" className={classes.chatIcon}>
                            <MessageIcon />
                          </IconButton>
                          {/* <img src={require('images/ic_chat_circle.svg')} alt="msgicon" /> */}
                          Chat
                        </Link>
                      </span>

                      <div className={classes.section2}>
                        <Link
                          to={`/patientlogdetailspage/${patient.appointmentids[0]}/${patient.consultscount}`}
                        >
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
        );
      })
    ) : (
      <Typography variant="h4">
        {props.searchText.trim().length !== 0 ? (
          <span>
            <span>No patient records could be found for </span>
            <span style={{ color: '#fc9916' }}>{props.searchText}</span>
            <span>. Please try checking your spelling or use another term.</span>
          </span>
        ) : (
          <span>No data found</span>
        )}
      </Typography>
    );
  return <div>{patientsHtml}</div>;
};
