import React, { Fragment, useContext } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  createMuiTheme,
  Grid,
  IconButton,
  Card,
  CardContent,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { format } from 'date-fns';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { GetCaseSheet_getCaseSheet_pastAppointments } from 'graphql/types/GetCaseSheet';

const useStyles = makeStyles(() => ({
  vaultContainer: {
    width: '100%',
    '& h5': {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.6)',
      padding: 0,
      marginTop: 15,
    },
    '& h4': {
      fontSize: 14,
      fontWeight: 600,
      color: '#0087ba',
      padding: 0,
    },
    '& h6': {
      fontSize: 10,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.6)',
      marginTop: 6,
    },
  },
  bigAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '5px',
    marginRight: '10px',
  },
  listContainer: {
    display: 'flex',
    flexFlow: 'row',
    flowWrap: 'wrap',
    width: '100%',
  },
  listItem: {
    width: '49%',
    marginRight: '1%',
    padding: 0,
  },
  stepperHeading: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 'normal',
    color: '#0087ba !important',
    position: 'relative',
    top: -5,
  },
  videoIcon: {
    position: 'absolute',
    top: 7,
    right: 15,
    '& img': {
      width: 20,
    },
  },
  circleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#02475b',
    position: 'absolute',
    left: -5,
  },
  listStyle: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'start',
    width: '100%',
    borderLeft: '1px solid #02475b',
  },
  childListStyle: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'start',
    width: '100%',
    borderLeft: 'none',
    paddingLeft: 0,
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0087ba',
    },
  },
  typography: {
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body2: {
      fontSize: '10px',
      fontWeight: 500,
      lineHeight: 1.2,
      color: 'rgba(2, 71, 91, 0.6)',
    },

    h5: {
      fontSize: '14px',
    },
  },
});

interface PastAppointmentProps {
  data: GetCaseSheet_getCaseSheet_pastAppointments[] | null;
  isChild: boolean;
}

const PastAppointment: React.FC<PastAppointmentProps> = ({ data, isChild }) => {
  const classes = useStyles();
  const ischild: boolean = true;
  return (
    <List className={isChild ? classes.childListStyle : classes.listStyle}>
      {data &&
        data.map((item, idx) => (
          <ListItem
            key={idx}
            style={{
              display: 'flex',
              flexFlow: 'column',
              paddingRight: 0,
              paddingLeft: 0,
              alignItems: 'start',
            }}
          >
            <AppointmentCard data={item} />
          </ListItem>
        ))}
    </List>
  );
};

interface AppointmentCardProps {
  data: GetCaseSheet_getCaseSheet_pastAppointments;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ data }) => {
  const classes = useStyles();
  return (
    <Card style={{ width: '100%', height: 45 }}>
      <CardContent>
        <Grid item xs={12} style={{ width: '100%' }}>
          <Grid item container spacing={2}>
            <Grid item lg={5} sm={5} xs={4} key={1} container>
              <Grid lg={12} sm={12} xs={12} key={6} item>
                <div>
                  <Typography gutterBottom variant="body2">
                    <div className={classes.circleDot}></div>
                    {`${format(
                      new Date(data.appointmentDateTime),
                      'dd  MMMMMMMMMMMM yyyy, h:mm a'
                    )}`}
                  </Typography>
                </div>
              </Grid>
            </Grid>
            {data &&
            data.caseSheet &&
            (data.caseSheet.length > 1 && data.caseSheet[1]!.doctorType == 'JUNIOR')
              ? data &&
                data.caseSheet &&
                data.caseSheet.length > 0 &&
                !!data.caseSheet[1]!.symptoms &&
                !!data.caseSheet[1]!.symptoms.length && (
                  <Grid lg={6} sm={6} xs={5} key={2} item>
                    <div className={classes.stepperHeading}>
                      {(data.caseSheet[1]!.symptoms.length > 3
                        ? data.caseSheet[1]!.symptoms.slice(0, 2).map((data) => data!.symptom)
                        : data.caseSheet[1]!.symptoms.map((data) => data!.symptom)
                      ).join(', ')}
                      {data.caseSheet[0]!.symptoms!.length > 3 && (
                        <Typography gutterBottom variant="body1" component="span">
                          {`, +${data.caseSheet[1]!.symptoms.length - 2}`}
                        </Typography>
                      )}
                    </div>
                  </Grid>
                )
              : data &&
                data.caseSheet &&
                data.caseSheet.length > 0 &&
                !!data.caseSheet[0]!.symptoms &&
                !!data.caseSheet[0]!.symptoms.length && (
                  <Grid lg={6} sm={6} xs={5} key={2} item>
                    <div className={classes.stepperHeading}>
                      {(data.caseSheet[0]!.symptoms.length > 3
                        ? data.caseSheet[0]!.symptoms.slice(0, 2).map((data) => data!.symptom)
                        : data.caseSheet[0]!.symptoms.map((data) => data!.symptom)
                      ).join(', ')}
                      {data.caseSheet[0]!.symptoms!.length > 3 && (
                        <Typography gutterBottom variant="body1" component="span">
                          {`, +${data.caseSheet[0]!.symptoms.length - 2}`}
                        </Typography>
                      )}
                    </div>
                  </Grid>
                )}
            {data &&
            data.caseSheet &&
            (data.caseSheet.length > 1 &&
              data.caseSheet[1] &&
              data.caseSheet[1]!.doctorType == 'JUNIOR') ? (
              <Grid lg={1} sm={1} xs={3} key={3} item>
                <div>
                  <IconButton aria-label="Video call" className={classes.videoIcon}>
                    {data &&
                    data.caseSheet &&
                    data.caseSheet.length > 1 &&
                    data.caseSheet[1]!.consultType === 'ONLINE' ? (
                      <img src={require('images/ic_video.svg')} alt="" />
                    ) : (
                      <img src={require('images/ic_physical_consult_icon.svg')} alt="" />
                    )}
                  </IconButton>
                </div>
              </Grid>
            ) : (
              <Grid lg={1} sm={1} xs={3} key={3} item>
                <div>
                  <IconButton aria-label="Video call" className={classes.videoIcon}>
                    {data &&
                    data.caseSheet &&
                    data.caseSheet.length > 0 &&
                    data.caseSheet[0] &&
                    data.caseSheet[0]!.consultType === 'ONLINE' ? (
                      <img src={require('images/ic_video.svg')} alt="" />
                    ) : (
                      <img src={require('images/ic_physical_consult_icon.svg')} alt="" />
                    )}
                  </IconButton>
                </div>
              </Grid>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export const HealthVault: React.FC = () => {
  const classes = useStyles();
  const ischild: boolean = false;
  const { healthVault, pastAppointments } = useContext(CaseSheetContext);

  console.log(pastAppointments);
  return (
    <ThemeProvider theme={theme}>
      <Typography component="div" className={classes.vaultContainer}>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Photos uploaded by Patient
          </Typography>
          <List className={classes.listContainer}>
            {/*patientDetails
              patientDetails.healthVault &&
              patientDetails.healthVault.length > 0 &&
              patientDetails!.healthVault.map( */

            healthVault!.map((item, index) => (
              <ListItem key={index} className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar
                    alt={(item.imageUrls as unknown) as string}
                    src={(item.imageUrls as unknown) as string}
                    className={classes.bigAvatar}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Fragment>
                      <Typography component="h4" variant="h4" color="primary">
                        {item.imageUrls!.substr(item.imageUrls!.lastIndexOf('/') + 1)}
                      </Typography>
                    </Fragment>
                  }
                  secondary={
                    <Fragment>
                      <Typography component="h6" variant="h6">
                        {/* {'5MB'} | {'2019-01-01T11:30'} */}
                      </Typography>
                    </Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Typography>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Reports
          </Typography>
          <List className={classes.listContainer}>
            {/*patientDetails
              patientDetails.healthVault &&
              patientDetails.healthVault.length > 0 &&
              patientDetails!.healthVault.map( */
            healthVault!.map((item, index) => (
              <ListItem key={index} className={classes.listItem}>
                <ListItemAvatar>
                  <Link to={(item.reportUrls as unknown) as string} target="_blank">
                    <Avatar
                      alt={(item.reportUrls as unknown) as string}
                      src={(item.reportUrls as unknown) as string}
                      className={classes.bigAvatar}
                    />
                  </Link>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Fragment>
                      <Typography component="h4" variant="h4" color="primary">
                        {item.reportUrls!.substr(item.reportUrls!.lastIndexOf('/') + 1)}
                      </Typography>
                    </Fragment>
                  }
                  // secondary={
                  //   <Fragment>
                  //     <Typography component="h6" variant="h6">
                  //       {'5mb'} | {'2019-01-01T11:30'}
                  //     </Typography>
                  //   </Fragment>
                  // }
                />
              </ListItem>
            ))}
          </List>
        </Typography>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Past Consultations
          </Typography>
          <PastAppointment data={pastAppointments} isChild={ischild} />
        </Typography>
      </Typography>
    </ThemeProvider>
  );
};
