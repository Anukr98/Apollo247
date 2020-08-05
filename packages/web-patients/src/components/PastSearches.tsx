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
import { readableParam } from 'helpers/commonHelpers';
import { useAuth } from 'hooks/authHooks';
import { specialtyClickTracking } from 'webEngageTracking';

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
      padding: '20px 0 10px',
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      overflowX: 'auto',
      '& li': {
        textAlign: 'center',
        padding: '0 8px',
        '& a': {
          padding: 10,
          background: '#ffffff',
          borderRadius: 10,
          boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
          color: '#fc9916',
          whiteSpace: 'nowrap',
          fontSize: 12,
          display: 'block',
          fontWeight: 600,
          textTransform: 'uppercase',
          minWidth: 150,
        },
      },
      '&::-webkit-scrollbar': {
        height: 4,
        borderRadius: 4,
      },
      '&::-webkit-scrollbar-track': {
        background: '#ccc',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#888',
      },
      [theme.breakpoints.down('sm')]: {
        margin: 0,
        padding: 20,
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
            return searchDetails && searchDetails.searchType === 'DOCTOR'
              ? index < 4 && (
                  <li key={`${_uniqueId('psearch_doctor_')}- ${searchDetails.typeId}`}>
                    <Link
                      to={`/doctors/${readableParam(searchDetails.name)}-${searchDetails.typeId}`}
                      title={searchDetails && `${_startCase(_toLower(searchDetails.name || ''))}`}
                    >
                      {/* <Avatar
                      alt={(searchDetails && searchDetails.name) || ''}
                      src={(searchDetails && searchDetails.image) || ''}
                      className={`${classes.bigAvatar} ${classes.doctorAvatar}`}
                    /> */}
                      {searchDetails && `${_startCase(_toLower(searchDetails.name || ''))}`}
                    </Link>
                  </li>
                )
              : index < 4 && (
                  <li
                    key={`${_uniqueId('psearch_spl_')}- ${searchDetails.typeId}`}
                    onClick={() => {
                      const patientAge =
                        new Date().getFullYear() -
                        new Date(currentPatient && currentPatient.dateOfBirth).getFullYear();
                      const eventData = {
                        patientAge: patientAge,
                        patientGender: currentPatient && currentPatient.gender,
                        specialtyId: searchDetails.typeId,
                        specialtyName: searchDetails.name,
                        relation: currentPatient && currentPatient.relation,
                      };
                      specialtyClickTracking(eventData);
                    }}
                  >
                    <Link
                      to={clientRoutes.specialties(readableParam(searchDetails.name))}
                      title={searchDetails && `${_startCase(_toLower(searchDetails.name || ''))}`}
                    >
                      {/* <Avatar
                      alt={(searchDetails && searchDetails.name) || ''}
                      src={(searchDetails && searchDetails.image) || ''}
                      className={`${classes.bigAvatar} ${classes.doctorAvatar}`}
                    /> */}
                      {searchDetails && `${_startCase(_toLower(searchDetails.name || ''))}`}
                    </Link>
                  </li>
                );
          })}
        </ul>
      </div>
    </div>
  ) : null;
};
