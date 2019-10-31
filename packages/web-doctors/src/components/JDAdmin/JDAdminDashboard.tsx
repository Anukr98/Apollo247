import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useEffect, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { GET_JD_DASHBOARD } from 'graphql/doctors';
import { GetJuniorDoctorDashboard } from 'graphql/types/GetJuniorDoctorDashboard';
import { useApolloClient } from 'react-apollo-hooks';
import { useAuth } from 'hooks/authHooks';
import { ApolloError } from 'apollo-client';
import { CircularProgress } from '@material-ui/core';

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
  const { currentPatient, isSignedIn } = useAuth();
  const client = useApolloClient();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [JDAdminData, setJDAdminData] = useState<any>(null);

  useEffect(() => {
    if (isSignedIn) {
      client
        .query<GetJuniorDoctorDashboard>({
          query: GET_JD_DASHBOARD,
          fetchPolicy: 'no-cache',
          variables: { fromDate: '2019-10-31', toDate: '2019-10-31' },
        })
        .then((_data) => {
          if (_data.data && _data.data.getJuniorDoctorDashboard) {
            setJDAdminData(_data.data.getJuniorDoctorDashboard);
          }
        })
        .catch((error: ApolloError) => {
          console.log(error);
        })
        .finally(() => {
          setLoaded(true);
        });
    }
  }, []);

  if (JDAdminData != null) {
    console.log(JDAdminData.juniorDoctorDetails);
  }

  return (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      {!loaded && <CircularProgress className={classes.loading} />}
      {loaded && JDAdminData && (
        <div className={classes.container}>
          <div className={classes.pageContainer}>
            <div className={classes.pageHeader}>Admin Dashboard</div>
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
                  {JDAdminData &&
                    JDAdminData.juniorDoctorDetails &&
                    JDAdminData.juniorDoctorDetails.map((jd: any) => {
                      <TableRow>
                        <TableCell>123</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>{`${jd.salutation}. ${jd.firstName} ${jd.lastName}`}</TableCell>
                        <TableCell>
                          <span className={classes.userActive}>{jd.onlineStatus}</span>
                        </TableCell>
                        <TableCell align="right">01</TableCell>
                        <TableCell align="right">02</TableCell>
                      </TableRow>;
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
