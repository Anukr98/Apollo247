import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_PAST_SEARCHES } from 'graphql/pastsearches';
import { GetPastSearches } from 'graphql/types/getPastSearches';
import { SEARCH_TYPE } from 'graphql/types/globalTypes';
import _uniqueId from 'lodash/uniqueId';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      width: '100%',
    },
    searchList: {
      paddingBottom: 20,
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
    },
    bigAvatar: {
      width: 48,
      height: 48,
      margin: 'auto',
      marginTop: -20,
      marginBottom: 5,
    },
  });
});

interface PastSearchProps {
  speciality: (specialitySelected: string) => void;
  disableFilter: (disableFilters: boolean) => void;
}

export const PastSearches: React.FC<PastSearchProps> = (props) => {
  const classes = useStyles();
  const { data, loading, error } = useQueryWithSkip<GetPastSearches>(GET_PAST_SEARCHES);
  const { speciality, disableFilter } = props;

  if (loading) {
    return <LinearProgress variant="query" />;
  }
  if (error) {
    return <div>Error....</div>;
  }

  const pastSearches =
    data && data.getPastSearches ? (
      data.getPastSearches.map((searchDetails) => {
        return searchDetails && searchDetails.searchType === SEARCH_TYPE.DOCTOR ? (
          <Grid item xs={3} key={_uniqueId('psearch_doctor_')}>
            <Link to={`/doctor-details/${searchDetails.typeId}`}>
              <div className={classes.contentBox}>
                <Avatar
                  alt={(searchDetails && searchDetails.name) || ''}
                  src={(searchDetails && searchDetails.image) || ''}
                  className={classes.bigAvatar}
                />
                {(searchDetails && searchDetails.name) || ''}
              </div>
            </Link>
          </Grid>
        ) : (
          <Grid
            item
            xs={3}
            title={(searchDetails && searchDetails.name) || ''}
            onClick={(e) => {
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
      })
    ) : (
      <div>No data found....</div>
    );

  return (
    <div className={classes.root}>
      <div className={classes.searchList}>
        <Grid container spacing={2}>
          {pastSearches}
        </Grid>
      </div>
    </div>
  );
};
