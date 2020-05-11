import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { LinearProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import { useQuery } from 'react-apollo-hooks';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import { GET_JD_DASHBOARD } from 'graphql/doctors';
import {
  GetJuniorDoctorDashboard,
  GetJuniorDoctorDashboardVariables,
} from 'graphql/types/GetJuniorDoctorDashboard';
import { format } from 'date-fns';
import { DOCTOR_ONLINE_STATUS } from 'graphql/types/globalTypes';

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
      position: 'relative',
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
            verticalAlign: 'top',
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
      fontSize: 16,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      marginBottom: 20,
      paddingBottom: 10,
    },
    topSection: {
      padding: 16,
      backgroundColor: theme.palette.common.white,
      marginBottom: 20,
      color: '#02475b',
    },
    consultQueue: {
      fontSize: 14,
      color: '#02475b',
    },
    count: {
      fontWeight: 'bold',
      fontSize: 15,
    },
    paginationRoot: {
      fontSize: 14,
    },
    pageCaption: {
      fontSize: 14,
    },
    buttonDisabled: {
      color: 'rgba(0,0,0,0.3) !important',
    },
    iconRoot: {
      color: '#02475b',
    },
    rootSelect: {
      marginRight: 20,
    },
    actionsRoot: {
      marginLeft: 10,
    },
    menuItemRoot: {
      backgroundColor: 'transparent !important',
      color: '#02475b',
    },
    resetButton: {
      position: 'absolute',
      right: 14,
      top: 16,
      cursor: 'pointer',
    },
  };
});

export const JDAdminDashboard: React.FC = (rops) => {
  const classes = useStyles({});
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const { data, loading, error } = useQuery<
    GetJuniorDoctorDashboard,
    GetJuniorDoctorDashboardVariables
  >(GET_JD_DASHBOARD, {
    variables: {
      fromDate: '2019-09-01',
      toDate: '2099-12-31',
      offset: 0,
      limit: 100,
    },
    pollInterval: 10 * 1000,
  });

  if (error) {
    return <div>An error occurred while loading Admin Dashboard :(</div>;
  }

  if (loading) {
    return <LinearProgress />;
  }

  if (data && data.getJuniorDoctorDashboard && data.getJuniorDoctorDashboard.juniorDoctorDetails) {
    return (
      <div className={classes.root}>
        <div className={classes.headerSticky}>
          <Header />
        </div>
        <div className={classes.container}>
          <div className={classes.pageContainer}>
            <div className={classes.pageHeader}>Admin Dashboard - Junior Doctors</div>
            <div className={classes.topSection}>
              <div className={classes.consultQueue}>
                <span>Number of Consults booked but not in queue to be allocated: </span>
                <span className={classes.count}>
                  {data.getJuniorDoctorDashboard.consultsBookedButNotInQueue}
                </span>
              </div>
              {/** 
              <div className={classes.consultQueue}>
                <span>Number of Consults in queue waiting to be allocated: </span>
                <span className={classes.count}>
                  {data.getJuniorDoctorDashboard.juniorDoctorQueueItems &&
                    data.getJuniorDoctorDashboard.juniorDoctorQueueItems.length > 0 &&
                    data.getJuniorDoctorDashboard.juniorDoctorQueueItems[0]!.queuedconsultscount}
                </span>
              </div>
              **/}
            </div>
            <div className={classes.tablePaper}>
              <div className={classes.resetButton}>
                <img
                  src={require('images/ic_reset.svg')}
                  alt=""
                  onClick={() => {
                    window.location.reload();
                  }}
                />
              </div>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No.</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>
                      Status <br />
                      <span>(Logged in or Away)</span>
                    </TableCell>
                    {/** 
                    <TableCell>
                      Active Consults <br /> <span>(count)</span>
                    </TableCell>
                     */}
                    <TableCell>
                      Queued Consults <br /> <span>(count)</span>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data &&
                    data.getJuniorDoctorDashboard &&
                    data.getJuniorDoctorDashboard.juniorDoctorDetails.map((jd, index) => {
                      const onlineStatus =
                        jd && jd.onlineStatus === DOCTOR_ONLINE_STATUS.ONLINE ? 'Online' : 'Away';
                      const userClassName =
                        jd && jd.onlineStatus === DOCTOR_ONLINE_STATUS.ONLINE
                          ? classes.userActive
                          : classes.userAway;
                      const jrFirstName = (jd && jd.firstName) || '';
                      const jrLastName = (jd && jd.lastName) || '';
                      const jdId = jd && jd.id;
                      const jrdConsultRow =
                        data &&
                        data.getJuniorDoctorDashboard &&
                        data.getJuniorDoctorDashboard.juniorDoctorQueueItems &&
                        data.getJuniorDoctorDashboard.juniorDoctorQueueItems.find((consult) => {
                          return consult && consult.doctorid === jdId;
                        });
                      return (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {jrFirstName}&nbsp;{jrLastName}
                          </TableCell>
                          <TableCell>
                            <span className={userClassName}>{onlineStatus}</span>
                          </TableCell>
                          {/** <TableCell>&nbsp;</TableCell> */}
                          <TableCell>
                            {(jrdConsultRow && jrdConsultRow.queuedconsultscount) || '--'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              <>
                {data &&
                data.getJuniorDoctorDashboard &&
                data.getJuniorDoctorDashboard.juniorDoctorDetails &&
                data.getJuniorDoctorDashboard.juniorDoctorDetails.length > 100 ? (
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    classes={{
                      root: classes.paginationRoot,
                      caption: classes.pageCaption,
                      selectIcon: classes.iconRoot,
                      selectRoot: classes.rootSelect,
                      actions: classes.actionsRoot,
                      menuItem: classes.menuItemRoot,
                    }}
                    component="div"
                    count={
                      data &&
                      data.getJuniorDoctorDashboard &&
                      data.getJuniorDoctorDashboard.juniorDoctorDetails &&
                      data.getJuniorDoctorDashboard.juniorDoctorDetails.length
                    }
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                      'aria-label': 'previous page',
                      classes: {
                        disabled: classes.buttonDisabled,
                      },
                    }}
                    nextIconButtonProps={{
                      'aria-label': 'next page',
                      classes: {
                        disabled: classes.buttonDisabled,
                      },
                    }}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                  />
                ) : null}
              </>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
