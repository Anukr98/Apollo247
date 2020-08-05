import React from 'react';
import {
  Typography,
  List,
  ListItem,
  createMuiTheme,
  Grid,
  Icon,
  Card,
  CardContent,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { format } from 'date-fns';
import { GetCaseSheet_getCaseSheet_pastAppointments } from 'graphql/types/GetCaseSheet';
import { useAuth } from 'hooks/authHooks';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useMutation } from 'react-apollo-hooks';
import {
  MarkMessageToUnread,
  MarkMessageToUnreadVariables,
} from 'graphql/types/MarkMessageToUnread';
import { MARK_MESSAGE_TO_UNREAD } from 'graphql/profiles';
import { clientRoutes } from 'helpers/clientRoutes';
import { ApolloError } from 'apollo-client';
import moment from 'moment';

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
  countStyle: {
    paddingTop: 5,
    paddingBottom: 10,
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
  cursorStyle: {
    cursor: 'pointer',
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
      fontSize: '12px',
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
  const classes = useStyles({});
  const ischild: boolean = true;
  const sortedConsult =
    data && data.length > 0
      ? data.sort(
          (a, b) =>
            moment(b ? b.appointmentDateTime : new Date())
              .toDate()
              .getTime() -
            moment(a ? a.appointmentDateTime : new Date())
              .toDate()
              .getTime()
        )
      : [];
  return (
    <List className={isChild ? classes.childListStyle : classes.listStyle}>
      {sortedConsult ? (
        sortedConsult.map((item, idx) => (
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
        ))
      ) : (
        <span>No data Found</span>
      )}
    </List>
  );
};

interface AppointmentCardProps {
  data: GetCaseSheet_getCaseSheet_pastAppointments;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ data }) => {
  const classes = useStyles({});
  const {
    currentPatient,
  }: { currentPatient: GetDoctorDetails_getDoctorDetails | null } = useAuth();
  const mutationMarkMessageToUnread = useMutation<
    MarkMessageToUnread,
    MarkMessageToUnreadVariables
  >(MARK_MESSAGE_TO_UNREAD);

  const callMessageReadAction = (appointmentId: string, doctorId: string, patientId: string) => {
    mutationMarkMessageToUnread({
      variables: {
        eventId: appointmentId,
      },
    })
      .then((response) => {
        window.location.href = clientRoutes.ConsultTabs(appointmentId, patientId, '1');
      })
      .catch((e: ApolloError) => {
        console.log(e, 'erroe');
      });
  };
  return (
    <Card style={{ width: '100%', height: 55 }}>
      <CardContent>
        <div
          className={classes.cursorStyle}
          onClick={() => {
            if (data.unreadMessagesCount && data.unreadMessagesCount > 0) {
              callMessageReadAction(data.id, currentPatient.id, data.patientId);
            } else {
              window.location.href = clientRoutes.ConsultTabs(data.id, data.patientId, '1');
            }
          }}
        >
          {/* <Link to={`/consulttabs/${data.id}/${data.patientId}/0`} target="_blank"> */}
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
                      )} `}
                      <div className={classes.countStyle}>
                        {data.unreadMessagesCount && data.unreadMessagesCount > 0
                          ? 'Unread messages (' + data.unreadMessagesCount + ')'
                          : ''}
                      </div>
                    </Typography>
                  </div>
                </Grid>
              </Grid>

              {data &&
              data.caseSheet &&
              (data.caseSheet.length > 1 && data.caseSheet[1]!.doctorType !== 'JUNIOR')
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
                        {data.caseSheet[1]!.symptoms!.length > 3 && (
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
                data.caseSheet[1]!.doctorType !== 'JUNIOR') ? (
                <Grid lg={1} sm={1} xs={3} key={3} item>
                  <div>
                    <Icon aria-label="Video call" className={classes.videoIcon}>
                      {data &&
                      data.caseSheet &&
                      data.caseSheet.length > 1 &&
                      data.caseSheet[1]!.consultType === 'ONLINE' ? (
                        <img src={require('images/ic_video.svg')} alt="" />
                      ) : (
                        <img src={require('images/ic_physical_consult_icon.svg')} alt="" />
                      )}
                    </Icon>
                  </div>
                </Grid>
              ) : (
                <Grid lg={1} sm={1} xs={3} key={3} item>
                  <div>
                    <Icon aria-label="Video call" className={classes.videoIcon}>
                      {data &&
                      data.caseSheet &&
                      data.caseSheet.length > 0 &&
                      data.caseSheet[0] &&
                      data.caseSheet[0]!.consultType === 'ONLINE' ? (
                        <img src={require('images/ic_video.svg')} alt="" />
                      ) : (
                        <img src={require('images/ic_physical_consult_icon.svg')} alt="" />
                      )}
                    </Icon>
                  </div>
                </Grid>
              )}
            </Grid>
          </Grid>
        </div>
        {/* </Link> */}
      </CardContent>
    </Card>
  );
};
interface pastConsultationProps {
  pastAppointments: GetCaseSheet_getCaseSheet_pastAppointments[] | null;
}
export const PastConsultation: React.FC<pastConsultationProps> = (props) => {
  const pastAppointments = props.pastAppointments;
  const classes = useStyles({});
  const ischild: boolean = false;

  return (
    <ThemeProvider theme={theme}>
      <Typography component="div" className={classes.vaultContainer}>
        <Typography component="div">
          <PastAppointment data={pastAppointments} isChild={ischild} />
        </Typography>
      </Typography>
    </ThemeProvider>
  );
};
