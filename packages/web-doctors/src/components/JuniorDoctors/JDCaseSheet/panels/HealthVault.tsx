import React, { useContext } from 'react';
import { List, ListItem, Avatar, IconButton, Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { format } from 'date-fns';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments } from 'graphql/types/GetJuniorDoctorCaseSheet';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  sectionGroup: {
    paddingBottom: 4,
  },
  sectionTitle: {
    opacity: 0.6,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: 0.02,
    paddingBottom: 5,
    color: '#02475b',
  },
  listContainer: {
    paddingBottom: 16,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    width: '90%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    overFlow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 10,
  },
  bigAvatar: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 8,
  },
  listData: {
    padding: 0,
    '& span:last-child': {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
  },
  fileName: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 0.02,
    color: '#0087ba',
  },
  noDataFound: {
    borderRadius: 5,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 16,
    paddingTop: 14,
    color: '#02475b',
  },
  appointmentCardRoot: {
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: theme.palette.common.white,
    borderRadius: '0 5px 5px 0',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    padding: '14px 16px',
    position: 'relative',
    '&:before': {
      position: 'absolute',
      content: '""',
      left: -10,
      top: '50%',
      marginTop: -10,
      width: 18,
      height: 18,
      backgroundColor: '#02475b',
      border: '2px solid #fff',
      borderRadius: '50%',
    },
  },
  appointmentDate: {
    fontSize: 10,
    fontWeight: 500,
    color: 'rgba(2, 71, 91, 0.6)',
    paddingRight: 8,
  },
  symptomsList: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 500,
    color: '#0087ba',
    paddingLeft: 8,
  },
  iconButton: {
    marginLeft: 'auto',
    '& button': {
      padding: 0,
    },
  },
  listStyle: {
    borderLeft: '1px solid #02475b',
    width: '100%',
    padding: 0,
    margin: 0,
    '& li': {
      padding: 0,
      position: 'relative',
    },
    '& li:first-child': {
      '& >div': {
        borderRadius: '5px 5px 5px 0',
      },
    },
    '& li:last-child': {
      '& >div': {
        borderRadius: '0 5px 5px 5px',
        marginBottom: 0,
      },
    },
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

interface PastAppointmentProps {
  data: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments[] | null;
  isChild: boolean;
}

const PastAppointment: React.FC<PastAppointmentProps> = ({ data, isChild }) => {
  const classes = useStyles();
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
  data: GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_pastAppointments;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ data }) => {
  const classes = useStyles();
  return (
    <div className={classes.appointmentCardRoot}>
      <div className={`${classes.appointmentDate}`}>{`${format(
        new Date(data.appointmentDateTime),
        'dd  MMMMMMMMMMMM yyyy, h:mm a'
      )}`}</div>
      {data &&
      data.caseSheet &&
      (data.caseSheet.length > 1 && data.caseSheet[1]!.doctorType !== 'JUNIOR')
        ? data &&
          data.caseSheet &&
          data.caseSheet.length > 0 &&
          !!data.caseSheet[1]!.symptoms &&
          !!data.caseSheet[1]!.symptoms.length && (
            <div className={`${classes.symptomsList}`}>
              {(data.caseSheet[1]!.symptoms.length > 3
                ? data.caseSheet[1]!.symptoms.slice(0, 2).map((data) => data!.symptom)
                : data.caseSheet[1]!.symptoms.map((data) => data!.symptom)
              ).join(', ')}
              {data.caseSheet[1]!.symptoms!.length > 3 && (
                <span>{`, +${data.caseSheet[1]!.symptoms.length - 2}`}</span>
              )}
            </div>
          )
        : data &&
          data.caseSheet &&
          data.caseSheet.length > 0 &&
          !!data.caseSheet[0]!.symptoms &&
          !!data.caseSheet[0]!.symptoms.length && (
            <div className={`${classes.symptomsList}`}>
              {(data.caseSheet[0]!.symptoms.length > 3
                ? data.caseSheet[0]!.symptoms.slice(0, 2).map((data) => data!.symptom)
                : data.caseSheet[0]!.symptoms.map((data) => data!.symptom)
              ).join(', ')}
              {data.caseSheet[0]!.symptoms!.length > 3 && (
                <span>{`, +${data.caseSheet[0]!.symptoms.length - 2}`}</span>
              )}
            </div>
          )}
      {data &&
      data.caseSheet &&
      (data.caseSheet.length > 1 &&
        data.caseSheet[1] &&
        data.caseSheet[1]!.doctorType !== 'JUNIOR') ? (
        <div className={`${classes.iconButton}`}>
          <IconButton aria-label="Video call">
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
      ) : (
        <div className={`${classes.iconButton}`}>
          <IconButton aria-label="Video call">
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
      )}
    </div>
  );
};
export const HealthVault: React.FC = () => {
  const classes = useStyles();
  const ischild: boolean = false;
  const { healthVault, appointmentDocuments, pastAppointments } = useContext(CaseSheetContextJrd);

  return (
    <div className={classes.root}>
      <div className={classes.sectionGroup}>
        <div className={classes.sectionTitle}>Photos uploaded by Patient</div>
        <div className={classes.listContainer}>
          {appointmentDocuments && appointmentDocuments.length > 0 ? (
            appointmentDocuments!.map((item, index) => (
              <div key={index} className={classes.listItem}>
                <Avatar
                  alt={(item.documentPath as unknown) as string}
                  src={(item.documentPath as unknown) as string}
                  className={classes.bigAvatar}
                />
                <div className={classes.listData}>
                  <span className={classes.fileName}>
                    bloodtest.pdf
                    {item.documentPath!.substr(item.documentPath!.lastIndexOf('/') + 1)}
                  </span>
                  <span>5 MB | 5 Aug 2019, 11.05 AM {/* {'5MB'} | {'2019-01-01T11:30'} */}</span>
                </div>
              </div>
            ))
          ) : (
            <div className={classes.noDataFound}>No data Found</div>
          )}
        </div>
      </div>
      <div className={classes.sectionGroup}>
        <div className={classes.sectionTitle}>Reports</div>
        {/* <div className={classes.listContainer}>
          {appointmentDocuments && appointmentDocuments.length > 0 ? (
            appointmentDocuments!.map((item, index) => (
              <div key={index} className={classes.listItem}>
                <Link to={(item.reportUrls as unknown) as string} target="_blank">
                  <Avatar
                    alt={(item.reportUrls as unknown) as string}
                    src={(item.reportUrls as unknown) as string}
                    className={classes.bigAvatar}
                  />
                </Link>
                {item.reportUrls!.substr(item.reportUrls!.lastIndexOf('/') + 1)}
              </div>
            ))
          ) : (
            <div className={classes.noDataFound}>No data Found</div>
          )}
        </div> */}
      </div>
      <div className={classes.sectionGroup}>
        <div className={classes.sectionTitle}>Past Consultations</div>
        <PastAppointment data={pastAppointments} isChild={ischild} />
      </div>
    </div>
  );
};
