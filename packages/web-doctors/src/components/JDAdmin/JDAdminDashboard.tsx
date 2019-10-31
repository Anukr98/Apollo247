import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { GET_JD_DASHBOARD } from 'graphql/doctors';
import {
  GetJuniorDoctorDashboard,
  GetJuniorDoctorDashboardVariables,
} from 'graphql/types/GetJuniorDoctorDashboard';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 65,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 9999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      padding: 20,
    },
    loading: {
      position: 'absolute',
      left: '50%',
      top: '45%',
    },
    tablePaper: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
    },
    table: {
      width: '100%',
      color: '#01475b',
      '& thead': {
        '& tr': {
          '& th': {
            fontSize: 14,
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            lineHeight: '14px',
            '& span': {
              fontSize: 11,
              fontWeight: 400,
            },
          },
        },
      },
      '& tbody': {
        '& tr': {
          '& td': {
            fontSize: 14,
            color: '#01475b',
          },
        },
      },
    },
    userActive: {
      color: '#00b38e',
      fontWeight: 600,
    },
    userAway: {
      color: '#fc9916',
      fontWeight: 600,
    },
    userInActive: {
      color: '#890000',
      fontWeight: 600,
    },
    pageHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      marginBottom: 20,
      paddingBottom: 10,
    },
  };
});

export const JDAdminDashboard: React.FC = (props) => {
  const classes = useStyles();

  const { data, loading, error } = useQuery<
    GetJuniorDoctorDashboard,
    GetJuniorDoctorDashboardVariables
  >(GET_JD_DASHBOARD, {
    variables: {
      fromDate: '2019-10-31',
      toDate: '2019-10-31',
    },
    pollInterval: 10 * 1000,
  });
  if (error) {
    return <div>Error :(</div>;
  }
  if (loading) {
    return <CircularProgress />;
  }

  if (data && data.getJuniorDoctorDashboard && data.getJuniorDoctorDashboard.juniorDoctorDetails) {
    return (
      <div className={classes.root}>
        <div className={classes.headerSticky}>
          <Header />
        </div>
        <div className={classes.container}>
          <div className={classes.pageContainer}>
            <div className={classes.pageHeader}>Admin Dashboard</div>
            <span className={classes.pageHeader}>
              Number of Consults booked but not in queue to be allocated
            </span>{' '}
            <span className={classes.pageHeader}>
              {data.getJuniorDoctorDashboard.consultsBookedButNotInQueue}
            </span>
            <br />
            <span className={classes.pageHeader}>
              Number of Consults in queue waiting to be allocated
            </span>{' '}
            <span className={classes.pageHeader}>
              {data.getJuniorDoctorDashboard.juniorDoctorQueueItems &&
                data.getJuniorDoctorDashboard.juniorDoctorQueueItems.length > 0 &&
                data.getJuniorDoctorDashboard.juniorDoctorQueueItems[0]!.queuedconsultscount}
            </span>
            <div className={classes.tablePaper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No.</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>
                      Status <br />
                      <span>(Logged in, Away or Logged Out)</span>
                    </TableCell>
                    <TableCell>
                      Active Consults <br /> <span>(count)</span>
                    </TableCell>
                    <TableCell>
                      Queued Consults <br /> <span>(count)</span>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data &&
                    data.getJuniorDoctorDashboard &&
                    data.getJuniorDoctorDashboard.juniorDoctorDetails.map((jd, index) => {
                      return (
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{jd && jd.firstName}</TableCell>
                          <TableCell>{jd && jd.onlineStatus}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
