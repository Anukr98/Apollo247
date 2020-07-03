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

    bigAvatar: {
      width: 60,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#dcdfcf',
      margin: '-40px auto 10px',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      '& img': {
        width: 40,
        height: 40,
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
      margin: '0 -10px',
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      '& li': {
        textAlign: 'center',
        padding: '50px 10px 10px',
        '& a': {
          padding: 10,
          background: '#ffffff',
          borderRadius: 10,
          boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
          color: '#02475b',
          fontSize: 12,
          display: 'block',
          fontWeight: 500,
          width: 150,
          height: 100,
        },
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        overflowX: 'auto',
        margin: 0,
        flexWrap: 'nowrap',
        padding: '20px 0',
        '& li': {
          padding: '0 8px',
          '& a': {
            padding: 12,
            color: '#fc9916 !important',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            minWidth: 150,
            width: 'auto !important',
            height: 'auto  !important',
          },
        },
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
        <ul className={classes.pastSearchList}>
          {data.getPatientPastSearches.map((searchDetails, index) => {
            return searchDetails ? (
              index < 4 && (
                <li key={`${_uniqueId('psearch_doctor_')}- ${searchDetails.typeId}`}>
                  <Link
                    to={`/doctors/${readableParam(searchDetails.name)}-${searchDetails.typeId}`}
                    title={searchDetails && `${_startCase(_toLower(searchDetails.name || ''))}`}
                  >
                    <Avatar
                      alt={(searchDetails && searchDetails.name) || ''}
                      src={(searchDetails && searchDetails.image) || ''}
                      className={`${classes.bigAvatar} ${classes.doctorAvatar}`}
                    />
                    {searchDetails && `${_startCase(_toLower(searchDetails.name || ''))}`}
                  </Link>
                </li>
              )
            ) : (
              <Route
                render={({ history }) =>
                  index < 4 && (
                    <li
                      title={(searchDetails && searchDetails.name) || ''}
                      onClick={(e) => {
                        const specialityUpdated = readableParam(`${e.currentTarget.title}`);
                        const encoded = encodeURIComponent(specialityUpdated);
                        history.push(clientRoutes.specialties(`${specialityUpdated}`));
                      }}
                      key={`${_uniqueId('psearch_spl_')}- ${searchDetails.typeId}`}
                    >
                      <Avatar
                        alt={(searchDetails && searchDetails.name) || ''}
                        src={(searchDetails && searchDetails.image) || ''}
                        className={classes.bigAvatar}
                      />
                      {(searchDetails && searchDetails.name) || ''}
                    </li>
                  )
                }
              />
            );
          })}
        </ul>
      </div>
    </div>
  ) : null;
};
