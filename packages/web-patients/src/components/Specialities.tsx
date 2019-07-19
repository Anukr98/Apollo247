import React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _startsWith from 'lodash/startsWith';
import _toLower from 'lodash/toLower';
import { GET_SPECIALITIES } from 'graphql/specialities';
import { GetSpecialties } from 'graphql/types/GetSpecialties';
import { useQueryWithSkip } from 'hooks/apolloHooks';

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
      marginTop: 5,
      fontWeight: 500,
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

interface SpecialitiesProps {
  keyword: string;
  matched: (matchedSpecialities: number) => void;
  speciality: (specialitySelected: string) => void;
  disableFilter: (disableFilters: boolean) => void;
}

export const Specialities: React.FC<SpecialitiesProps> = (props) => {
  const classes = useStyles();
  const { loading, error, data } = useQueryWithSkip<GetSpecialties>(GET_SPECIALITIES);
  const { keyword, matched, speciality, disableFilter } = props;

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error! {error.message}</div>;
  }

  const filterValues = (specialities: any) => {
    const filteredValues = _filter(specialities, (specialityDetails) =>
      _startsWith(_toLower(specialityDetails.name || ''), _toLower(keyword))
    );
    console.log(filteredValues, keyword);
    matched(filteredValues.length);
    return filteredValues;
  };

  if (data && data.getSpecialties) {
    const filterSpecialites =
      keyword !== '' && Object.keys(data) ? filterValues(data.getSpecialties) : data.getSpecialties;

    return (
      <div className={classes.root}>
        <div className={classes.searchList}>
          <Grid container spacing={2}>
            {_map(filterSpecialites, (specialityDetails) => {
              return (
                <Grid
                  item
                  xs={3}
                  key={_uniqueId('special_')}
                  title={specialityDetails.name}
                  onClick={(e) => {
                    speciality(e.currentTarget.title);
                    disableFilter(false);
                  }}
                >
                  <div className={classes.contentBox}>
                    <Avatar
                      alt={specialityDetails.name}
                      src={specialityDetails.image}
                      className={classes.bigAvatar}
                    />
                    {specialityDetails.name}
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </div>
    );
  } else {
    return <Grid>Loading...</Grid>;
  }
};
