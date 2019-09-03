import React from 'react';
import {
  Typography,
  List,
  ListItem,
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
  isChild: boolean;
}

const PastAppointment: React.FC<PastAppointmentProps> = ({ data, isChild }) => {
  const classes = useStyles();
  const ischild: boolean = true;
  return (
    <List className={isChild ? classes.childListStyle : classes.listStyle}>
      {data.map((item, idx) => (
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
          {!!item.child && !!item.child.length && (
            <PastAppointment data={item.child} isChild={ischild} />
          )}
        </ListItem>
      ))}
    </List>
  );
};

interface AppointmentCardProps {
  data: PastAppointmentData;
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
                    {`${format(new Date(data.timestamp), 'dd  MMMMMMMMMMMM yyyy, h:mm a')} ${
                      data.isFollowup ? `| Follow Up(${data.isFree ? 'Free' : 'Paid'})` : ''
                    }`}
                  </Typography>
                </div>
              </Grid>
            </Grid>
            {!!data.symptoms && !!data.symptoms.length && (
              <Grid lg={6} sm={6} xs={5} key={2} item>
                <div className={classes.stepperHeading}>
                  {(data.symptoms.length > 3 ? data.symptoms.slice(0, 2) : data.symptoms).join(
                    ', '
                  )}
                  {data.symptoms.length > 3 && (
                    <Typography gutterBottom variant="body1" component="span">
                      {`, +${data.symptoms.length - 2}`}
                    </Typography>
                  )}
                </div>
              </Grid>
            )}
            <Grid lg={1} sm={1} xs={3} key={3} item>
              <div>
                <IconButton aria-label="Video call" className={classes.videoIcon}>
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
export const PastConsultation: React.FC = () => {
  const classes = useStyles();
  const ischild: boolean = false;
  return (
    <ThemeProvider theme={theme}>
      <Typography component="div" className={classes.vaultContainer}>
        <Typography component="div">
          <PastAppointment data={pastConsultationData} isChild={ischild} />
        </Typography>
      </Typography>
    </ThemeProvider>
  );
};
