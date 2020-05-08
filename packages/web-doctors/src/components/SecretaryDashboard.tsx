import React, { useState, useContext } from 'react';
import { Theme, Typography, Grid, Avatar, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import moment from 'moment';
import { startOfToday, isToday } from 'date-fns/esm';
import { format } from 'date-fns';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useAuth } from 'hooks/authHooks';
import { LOGGED_IN_USER_DETAILS } from 'graphql/profiles';
import Scrollbars from 'react-custom-scrollbars';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-apollo-hooks';
import { findLoggedinUserDetails } from 'graphql/types/findLoggedinUserDetails';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 70,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
    },
    tabHeading: {
      padding: '30px 40px 20px 40px',
      backgroundColor: theme.palette.secondary.contrastText,
      [theme.breakpoints.down('xs')]: {
        padding: '30px 15px 50px 15px',
      },
      '& h1': {
        display: 'flex',
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 28,
        fontWeight: 600,
        lineHeight: 1.36,
        [theme.breakpoints.down('xs')]: {
          fontSize: 20,
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        margin: 0,
        [theme.breakpoints.down('xs')]: {
          fontSize: 15,
        },
      },
    },
    contentGroup: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
    },
    doctorsGroup: {
      padding: 20,
      paddingTop: 30,
    },
    doctorCard: {
      padding: '15px 20px',
      display: 'flex',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
    },
    doctoImage: {
      paddingRight: 15,
    },
    avatar: {
      width: 80,
      height: 80,
    },
    doctorInfo: {
      width: 'calc(100% - 95px)',
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
    },
    doctorType: {
      color: '#0087ba',
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      paddingTop: 2,
    },
    address: {
      paddingTop: 10,
      color: '#658f9b',
      fontWeight: 500,
      fontSize: 10,
    },
  };
});

export const SecretaryDashboard: React.FC = (props) => {
  const today: Date = startOfToday();
  const classes = useStyles({});
  const [selectedDate] = useState<Date>(today);
  const [viewSelection] = useState<string>('day');
  const [monthSelected] = useState<string>(moment(today).format('MMMM'));
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const { data, error, loading } = useQuery<findLoggedinUserDetails>(LOGGED_IN_USER_DETAILS);

  const secretaryList =
    data &&
    data.findLoggedinUserDetails &&
    data.findLoggedinUserDetails.secretaryDetails &&
    data.findLoggedinUserDetails.secretaryDetails.doctorSecretary;
  if (loading) return <CircularProgress />;
  if (!data) return <div>error :(</div>;

  const setCurrentUserId = useAuthContext().setCurrentUserId!;

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 65px)' }}>
        <div className={classes.container}>
          <div className={classes.contentGroup}>
            <div className={classes.tabHeading}>
              <Typography variant="h1">
                {data &&
                  data.findLoggedinUserDetails &&
                  data.findLoggedinUserDetails.secretaryDetails &&
                  `hello ${(
                    (data &&
                      data.findLoggedinUserDetails &&
                      data.findLoggedinUserDetails.secretaryDetails!.name) ||
                    ''
                  ).toLowerCase()} :)`}
              </Typography>
              {viewSelection === 'day' ? (
                <p>{`choose which doctor’s portal you’d like to access`}</p>
              ) : (
                <p>
                  here’s your schedule for {monthSelected} {selectedDate.getFullYear()}
                </p>
              )}
            </div>
            <div className={classes.doctorsGroup}>
              <Grid spacing={2} container>
                {secretaryList && secretaryList.length > 0 ? (
                  secretaryList.map((item, index) => {
                    return (
                      <Grid item sm={4} key={index}>
                        <Link to={clientRoutes.calendar()}>
                          <div
                            className={classes.doctorCard}
                            onClick={() => {
                              setCurrentUserId(item!.doctor!.id!);
                            }}
                          >
                            <div className={classes.doctoImage}>
                              <Avatar
                                alt=""
                                src={
                                  item!.doctor!.photoUrl
                                    ? item!.doctor!.photoUrl
                                    : require('images/doctor_02.png')
                                }
                                className={classes.avatar}
                              />
                            </div>
                            <div className={classes.doctorInfo}>
                              <div className={classes.doctorName}>
                                {item!.doctor!.salutation &&
                                  item!.doctor!.salutation!.charAt(0).toUpperCase()}
                                {item!.doctor!.salutation!.slice(1).toLowerCase() + '.'}{' '}
                                {`${item!.doctor!.firstName!.split(' ')[0]} ${item!.doctor!
                                  .lastName!}`.length < 15
                                  ? `${item!.doctor!.firstName!.split(' ')[0]} ${
                                      item!.doctor!.lastName
                                    }`
                                  : `${
                                      item!.doctor!.firstName!.split(' ')[0]
                                    } ${item!.doctor!.lastName!.charAt(0)}.`}
                              </div>
                              <div className={classes.doctorType}>
                                <span>
                                  {item!.doctor!.specialty!.name.toUpperCase()} |{' '}
                                  {item!.doctor!.experience} YRS
                                </span>
                              </div>
                              <div className={classes.address}>
                                {item!.doctor!.qualification}
                                <br />
                                {item!.doctor!.doctorHospital[0]!.facility!.streetLine1
                                  ? item!.doctor!.doctorHospital[0]!.facility!.streetLine1 + ', '
                                  : ''}
                                {item!.doctor!.doctorHospital[0]!.facility!.streetLine2
                                  ? item!.doctor!.doctorHospital[0]!.facility!.streetLine2 + ', '
                                  : ''}
                                {item!.doctor!.doctorHospital[0]!.facility!.streetLine3
                                  ? item!.doctor!.doctorHospital[0]!.facility!.streetLine3 + ', '
                                  : ''}
                                {item!.doctor!.doctorHospital[0]!.facility!.city
                                  ? item!.doctor!.doctorHospital[0]!.facility!.city
                                  : ''}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </Grid>
                    );
                  })
                ) : (
                  <div className={classes.doctorName}>No Doctor found</div>
                )}
              </Grid>
            </div>
          </div>
        </div>
      </Scrollbars>
    </div>
  );
};
