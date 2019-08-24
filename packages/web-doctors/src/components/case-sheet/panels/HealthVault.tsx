import React, { Fragment } from 'react';
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
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { format } from 'date-fns';

const useStyles = makeStyles(() => ({
  vaultContainer: {
    width: '100%',
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
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0087ba',
    },
  },
  typography: {
    body2: {
      fontSize: '10px',
    },
    h5: {
      fontSize: '14px',
    },
  },
});

const photoData = [
  {
    fileName: 'image001.jpg',
    size: '5MB',
    timestamp: '2019-08-05T11:05',
    thumbnail: require('images/patient_01.png'),
  },
  {
    fileName: 'image002.jpg',
    size: '4.5MB',
    timestamp: '2019-08-05T11:03',
    thumbnail: require('images/patient_01.png'),
  },
];

const reportData = [
  {
    fileName: 'bloodtest.pdf',
    size: '5MB',
    timestamp: '2019-08-05T11:05',
    thumbnail: require('images/patient_01.png'),
  },
];

const pastConsultationData = [
  {
    timestamp: '2019-06-27T18:30',
    symptoms: ['Fever', 'Back Pain', 'Cough'],
    isOnline: true,
    child: [
      {
        timestamp: '2019-07-02T18:30',
        isFree: true,
        isOnline: true,
        isFollowup: true,
      },
    ],
  },
  {
    timestamp: '2019-03-03T10:30',
    symptoms: ['Headache', 'Vomiting'],
    isOnline: false,
  },
  {
    timestamp: '2018-12-09T10:30',
    symptoms: ['Chest Pain', 'Breathlessness', 'Cough', 'Something Else'],
    isOnline: false,
    child: [
      {
        timestamp: '2018-12-15T12:30',
        isFree: true,
        isOnline: true,
        isFollowup: true,
      },
      {
        timestamp: '2019-01-01T11:30',
        isFree: false,
        isOnline: true,
        isFollowup: true,
      },
    ],
  },
];

interface PastAppointmentData {
  timestamp: string;
  symptoms?: string[];
  isOnline: boolean;
  isFree?: boolean;
  isFollowup?: boolean;
  child?: PastAppointmentData[];
}

interface PastAppointmentProps {
  data: PastAppointmentData[];
}

const PastAppointment: React.FC<PastAppointmentProps> = ({ data }) => {
  return (
    <List style={{ display: 'flex', flexFlow: 'column', alignItems: 'start', width: '100%' }}>
      {data.map((item, idx) => (
        <ListItem key={idx} style={{ display: 'flex', flexFlow: 'column', alignItems: 'start' }}>
          <AppointmentCard data={item} />
          {!!item.child && !!item.child.length && <PastAppointment data={item.child} />}
        </ListItem>
      ))}
    </List>
  );
};

interface AppointmentCardProps {
  data: PastAppointmentData;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ data }) => {
  return (
    <Card style={{ width: '100%' }}>
      <CardContent>
        <Grid item xs={12} style={{ width: '100%' }}>
          <Grid item container spacing={2}>
            <Grid item lg={5} sm={5} xs={4} key={1} container>
              <Grid sm={9} xs={10} key={6} item>
                <div>
                  <Typography gutterBottom variant="body1">
                    {`${format(new Date(data.timestamp), 'dd  MMMMMMMMMMMM yyyy, h:mm a')} ${
                      data.isFollowup ? `| Follow Up(${data.isFree ? 'Free' : 'Paid'})` : ''
                    }`}
                  </Typography>
                </div>
              </Grid>
            </Grid>
            {!!data.symptoms && !!data.symptoms.length && (
              <Grid lg={5} sm={5} xs={5} key={2} item>
                <div>
                  {(data.symptoms.length > 3 ? data.symptoms.slice(0, 2) : data.symptoms).join(
                    ', '
                  )}
                  {data.symptoms.length > 3 && (
                    <Typography gutterBottom variant="caption">
                      {`, +${data.symptoms.length - 2}`}
                    </Typography>
                  )}
                </div>
              </Grid>
            )}
            <Grid lg={2} sm={2} xs={3} key={3} item>
              <div>
                <IconButton aria-label="Video call">
                  <img src={require('images/ic_video.svg')} alt="" />
                </IconButton>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const HealthVault: React.FC = () => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Typography component="div" className={classes.vaultContainer}>
        <Typography component="div">
          <Typography component="h5" variant="h5">
            Photos uploaded by Patient
          </Typography>
          <List className={classes.listContainer}>
            {photoData.map((item, idx) => (
              <ListItem key={idx} className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar alt={item.fileName} src={item.thumbnail} className={classes.bigAvatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Fragment>
                      <Typography component="h5" variant="h5" color="primary">
                        {item.fileName}
                      </Typography>
                    </Fragment>
                  }
                  secondary={
                    <Fragment>
                      <Typography component="span" variant="body2">
                        {item.size} | {format(new Date(item.timestamp), 'd MMM yyyy, h:mm a')}
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
            {reportData.map((item, idx) => (
              <ListItem key={idx} className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar alt={item.fileName} src={item.thumbnail} className={classes.bigAvatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Fragment>
                      <Typography component="h5" variant="h5" color="primary">
                        {item.fileName}
                      </Typography>
                    </Fragment>
                  }
                  secondary={
                    <Fragment>
                      <Typography component="span" variant="body2">
                        {item.size} | {format(new Date(item.timestamp), 'd MMM yyyy, h:mm a')}
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
            Past Consultations
          </Typography>
          <PastAppointment data={pastConsultationData} />
        </Typography>
      </Typography>
    </ThemeProvider>
  );
};
