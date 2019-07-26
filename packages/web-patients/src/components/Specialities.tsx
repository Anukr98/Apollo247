import React from 'react';
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
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      width: '100%',
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    count: {
      marginLeft: 'auto',
    },
    searchList: {
      paddingBottom: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 14,
      },
      '& >div': {
        [theme.breakpoints.down('xs')]: {
          marginLeft: -8,
          marginRight: -8,
          width: 'calc(100% + 16px)',
        },
        '& >div': {
          [theme.breakpoints.down('xs')]: {
            padding: '8px !important',
          },
        },
      },
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
      [theme.breakpoints.down('xs')]: {
        fontSize: 13,
        color: '#fc9916',
        fontWeight: 'bold',
        marginTop: 0,
        height: '100%',
        padding: '12px 10px',
        textTransform: 'uppercase',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    bigAvatar: {
      width: 48,
      height: 48,
      margin: 'auto',
      marginTop: -20,
      marginBottom: 5,
      [theme.breakpoints.down('xs')]: {
        marginTop: 0,
        marginBottom: 10,
      },
    },
  });
});

export interface SpecialitiesProps {
  keyword: string;
  matched: (matchedSpecialities: number) => void;
  speciality: (specialitySelected: string) => void;
  disableFilter: (disableFilters: boolean) => void;
  subHeading: string;
}

export const Specialities: React.FC<SpecialitiesProps> = (props) => {
  const classes = useStyles();
  const { loading, error, data } = useQueryWithSkip<GetSpecialties>(GET_SPECIALITIES);
  const { keyword, matched, speciality, disableFilter, subHeading } = props;

  if (loading) {
    return <LinearProgress variant="query" />;
  }

  if (error) {
    return <div>Error! {error.message}</div>;
  }

  const filterValues = (data: GetSpecialties) => {
    const filteredValues = _filter(data.getSpecialties, (specialityDetails) =>
      _startsWith(_toLower(specialityDetails.name || ''), _toLower(keyword))
    );
    matched(filteredValues.length);
    return filteredValues;
  };

  if (data && data.getSpecialties) {
    const filterSpecialites =
      keyword !== '' && Object.keys(data) ? filterValues(data) : data.getSpecialties;
    return (
      <>
        <div className={classes.sectionHeader}>
          <span>{subHeading}</span>
          <span className={classes.count}>
            {filterSpecialites.length > 0 && filterSpecialites.length < 10
              ? `0${filterSpecialites.length}`
              : filterSpecialites.length}
          </span>
        </div>
        <div className={classes.root}>
          <div className={classes.searchList}>
            <Grid container spacing={2}>
              {_map(filterSpecialites, (specialityDetails) => {
                return (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={3}
                    key={_uniqueId('special_')}
                    title={specialityDetails.name || ''}
                    onClick={(e) => {
                      speciality(e.currentTarget.title);
                      disableFilter(false);
                    }}
                  >
                    <div className={classes.contentBox}>
                      <Avatar
                        alt={specialityDetails.name || ''}
                        src={specialityDetails.image || ''}
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
      </>
    );
    return <></>;
  } else {
    return <LinearProgress variant="query" />;
  }
};
