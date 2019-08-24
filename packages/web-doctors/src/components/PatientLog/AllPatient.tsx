import {
  createStyles,
  Theme,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Avatar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import React from 'react';

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
      fontSize: 20,
      lineHeight: '25px',
      [theme.breakpoints.between('sm', 'md')]: {
        fontSize: 18,
      },
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
    }
  })
);

interface HelpProps {}
interface PatientObject {
  id: string;
  name: string;
  avatar: string;
  numberOfConsult: number;
  lastConsultDate: string;
}
export const AllPatient: React.FC<HelpProps> = (props) => {
  const classes = useStyles();
  const [patientsList, setPatientsList] = React.useState<PatientObject[]>([
    {
      id: '1',
      name: 'Seema singh',
      avatar: 'images/ic_patientchat.png',
      numberOfConsult: 2,
      lastConsultDate: '17/7/2019',
    },
    {
      id: '2',
      name: 'Rahul Mehta',
      avatar: 'images/ic_patientchat.png',
      numberOfConsult: 5,
      lastConsultDate: '21/7/2019',
    },
  ]);
  const patientsHtml = patientsList.map((_patient: PatientObject | null, index: number) => {
    const patient = _patient!;
    return (
      <div key={patient.id}>
        <Card
          className={classes.card}
          classes={{
            root: 'cardRow',
          }}
        >
          <CardContent>
            <Grid item xs={12}>
              <Grid item container spacing={2}>
                <Grid item lg={3} sm={3} xs={3} key={1} container>
                  <Grid sm={3} xs={2} key={5} item>
                   
                    <img
                      alt={patient.name}
                      src={require('images/ic_patientchat.png')}
                      className={classes.bigAvatar}
                    />
                  </Grid>
                  <Grid sm={9} xs={10} key={6} item className={classes.valign}>
                    <div className={classes.section2}>
                      <Typography gutterBottom variant="body1" className={classes.mainHeading}>
                       {patient.name}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
                <Grid lg={3} sm={3} xs={3} key={2} item className={classes.valign}>
                  <Typography gutterBottom variant="body1" className={classes.mainHeading}>
                  Last Consult: {patient.lastConsultDate}
                  </Typography>
                </Grid>
                <Grid lg={3} sm={3} xs={3} key={3} item className={classes.valign}>
                  <Typography gutterBottom variant="body1" className={classes.mainHeading}>
                  {patient.numberOfConsult} Consult
                  </Typography>
                </Grid>
                <Grid lg={3} sm={3} xs={3} key={4} className={classes.valign} item>
                  <div className={classes.section2}>
                    <IconButton aria-label="Video call">
                      <img src={require('images/ic_video.svg')} alt="" />
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
    );
  });
  return <div>{patientsHtml}</div>;
};
