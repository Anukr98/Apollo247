import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { SEARCH_TYPE } from 'graphql/types/globalTypes';
import { PATIENT_PAST_SEARCHES } from 'graphql/pastsearches';
import {
  GetPatientPastSearches,
  GetPatientPastSearchesVariables,
} from 'graphql/types/GetPatientPastSearches';
import _uniqueId from 'lodash/uniqueId';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAllCurrentPatients } from 'hooks/authHooks';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';

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
  });
});

interface PastSearchProps {
  speciality: (specialitySelected: string) => void;
  disableFilter: (disableFilters: boolean) => void;
  specialityId?: (specialityId: string) => void;
}

export const PastSearches: React.FC<PastSearchProps> = (props) => {
  const classes = useStyles();
  const { currentPatient } = useAllCurrentPatients();
  const { speciality, disableFilter, specialityId } = props;

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
      <div className={classes.searchList}>
        <div className={classes.sectionHeader}>Your Past Searches</div>
        <Grid container spacing={2}>
          {data.getPatientPastSearches.map((searchDetails) => {
            return searchDetails && searchDetails.searchType === SEARCH_TYPE.DOCTOR ? (
              <Grid item xs={6} sm={6} md={4} lg={3} key={_uniqueId('psearch_doctor_')}>
                <Link
                  to={`/doctor-details/${searchDetails.typeId}`}
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
              <Grid
                item
                xs={6}
                sm={6}
                md={4}
                lg={3}
                title={(searchDetails && searchDetails.name) || ''}
                onClick={(e) => {
                  specialityId && specialityId((searchDetails && searchDetails.typeId) || '');
                  speciality(e.currentTarget.title);
                  disableFilter(false);
                }}
                key={_uniqueId('psearch_spl_')}
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
            );
          })}
        </Grid>
      </div>
    </div>
  ) : null;
};
