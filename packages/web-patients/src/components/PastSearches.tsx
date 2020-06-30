import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useQueryWithSkip } from 'hooks/apolloHooks';
// import { SEARCH_TYPE } from 'graphql/types/globalTypes';
import { PATIENT_PAST_SEARCHES } from 'graphql/pastsearches';
import {
  GetPatientPastSearches,
  GetPatientPastSearchesVariables,
} from 'graphql/types/GetPatientPastSearches';
import _uniqueId from 'lodash/uniqueId';
// import CircularProgress from '@material-ui/core/CircularProgress';
import { useAllCurrentPatients } from 'hooks/authHooks';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { clientRoutes } from 'helpers/clientRoutes';
import { Route } from 'react-router-dom';
import { readableParam } from 'helpers/commonHelpers';
import { useAuth } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      width: '100%',
    },
    searchList: {
      paddingBottom: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 14,
      },
    },
    contentBox: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      fontSize: 12,
      fontWeight: 500,
      marginTop: 5,
      color: '#02475b',
      textAlign: 'center',
      cursor: 'pointer',
      minHeight: 88,
      [theme.breakpoints.down('xs')]: {
        fontSize: 13,
        color: '#fc9916',
        fontWeight: 600,
        marginTop: 0,
        height: '100%',
        padding: '14px 12px',
        textTransform: 'uppercase',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        minHeight: 'auto',
        textAlign: 'left',
      },
    },
    bigAvatar: {
      width: 48,
      height: 48,
      margin: 'auto',
      marginTop: -20,
      marginBottom: 5,
      backgroundColor: '#dcdfcf',
      padding: 8,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      '& img': {
        verticalAlign: 'middle',
        height: 'auto',
        width: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
      },
    },
    doctorAvatar: {
      padding: 0,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    count: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 5,
      },
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
    pastSearch: {
      padding: '20px 0 0',
      '& h6': {
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    pastSearchList: {
      margin: 0,
      padding: '20px ',
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      '& li': {
        margin: '0 16px 0 0',
        minWidth: 150,
        textAlign: 'center',
        '& a': {
          padding: 12,
          background: '#ffffff',
          borderRadius: 10,
          boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
          color: '#fc9916',
          fontsize: 13,
          textTransform: 'uppercase',
          display: 'block',
          fontWeight: 'bold',
        },
        '& :last-child': {
          margin: 0,
        },
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        overflowX: 'auto',
      },
    },
  });
});

export const PastSearches: React.FC = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const { isSignedIn } = useAuth();

  const { data } = useQueryWithSkip<GetPatientPastSearches, GetPatientPastSearchesVariables>(
    PATIENT_PAST_SEARCHES,
    {
      variables: {
        patientId: (currentPatient && currentPatient.id) || '',
      },
      fetchPolicy: 'no-cache',
    }
  );

  return data && data.getPatientPastSearches && data.getPatientPastSearches.length > 0 ? (
    <div className={classes.root}>
      <div className={classes.pastSearch}>
        <Typography component="h6">{isSignedIn ? 'Past Searches' : ''}</Typography>
        <div className={classes.pastSearchList}>
          <div className={classes.searchList}>
            {/* <div className={classes.sectionHeader}>Your Past Searches</div> */}
            <Grid container spacing={2}>
              {data.getPatientPastSearches.map((searchDetails) => {
                return searchDetails && searchDetails ? (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={3}
                    key={`${_uniqueId('psearch_doctor_')}- ${searchDetails.typeId}`}
                  >
                    <Link
                      to={`/doctors/${readableParam(searchDetails.name)}-${searchDetails.typeId}`}
                      title={searchDetails && `${_startCase(_toLower(searchDetails.name || ''))}`}
                    >
                      <div className={classes.contentBox}>
                        <Avatar
                          alt={(searchDetails && searchDetails.name) || ''}
                          src={(searchDetails && searchDetails.image) || ''}
                          className={`${classes.bigAvatar} ${classes.doctorAvatar}`}
                        />
                        {searchDetails && `${_startCase(_toLower(searchDetails.name || ''))}`}
                      </div>
                    </Link>
                  </Grid>
                ) : (
                  <Route
                    render={({ history }) => (
                      <Grid
                        item
                        xs={6}
                        sm={6}
                        md={4}
                        lg={3}
                        title={(searchDetails && searchDetails.name) || ''}
                        onClick={(e) => {
                          const specialityUpdated = readableParam(`${e.currentTarget.title}`);
                          const encoded = encodeURIComponent(specialityUpdated);
                          history.push(clientRoutes.specialties(`${specialityUpdated}`));
                        }}
                        key={`${_uniqueId('psearch_spl_')}- ${searchDetails.typeId}`}
                      >
                        <div className={classes.contentBox}>
                          <Avatar
                            alt={(searchDetails && searchDetails.name) || ''}
                            src={(searchDetails && searchDetails.image) || ''}
                            className={classes.bigAvatar}
                          />
                          {(searchDetails && searchDetails.name) || ''}
                        </div>
                      </Grid>
                    )}
                  />
                );
              })}
            </Grid>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
