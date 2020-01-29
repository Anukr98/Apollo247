import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _startsWith from 'lodash/startsWith';
import _toLower from 'lodash/toLower';
import { GET_ALL_SPECIALITIES } from 'graphql/specialities';
import { GetAllSpecialties } from 'graphql/types/GetAllSpecialties';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Mutation } from 'react-apollo';
import { SaveSearch, SaveSearchVariables } from 'graphql/types/SaveSearch';
import { SAVE_PATIENT_SEARCH } from 'graphql/pastsearches';
import { SEARCH_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      width: '100%',
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
      marginTop: 5,
      fontWeight: 500,
      color: '#02475b',
      textAlign: 'center',
      cursor: 'pointer',
      minHeight: 88,
      [theme.breakpoints.down('xs')]: {
        fontSize: 14,
        marginTop: 0,
        padding: '14px 16px',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        minHeight: 'auto',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'left',
      },
    },
    bigAvatar: {
      width: 48,
      height: 48,
      marginRight: 15,
      [theme.breakpoints.up('sm')]: {
        width: 40,
        height: 40,
        margin: 'auto',
        marginTop: -20,
        marginBottom: 5,
        padding: 8,
        backgroundColor: '#dcdfcf',
      },
      '& img': {
        verticalAlign: 'middle',
        height: 'auto',
        width: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
      },
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
    rightArrow: {
      marginLeft: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
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
  const { loading, error, data } = useQueryWithSkip<GetAllSpecialties>(GET_ALL_SPECIALITIES);
  const { keyword, matched, speciality, disableFilter, subHeading } = props;

  const { currentPatient } = useAllCurrentPatients();

  if (loading) {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error! {error.message}</div>;
  }

  const filterValues = (data: GetAllSpecialties) => {
    const filteredValues = _filter(data.getAllSpecialties, (specialityDetails) =>
      _startsWith(_toLower(specialityDetails.name || ''), _toLower(keyword))
    );
    matched(filteredValues.length);
    return filteredValues;
  };

  if (data && data.getAllSpecialties) {
    const filterSpecialites =
      keyword !== '' && Object.keys(data) ? filterValues(data) : data.getAllSpecialties;
    return (
      <>
        {subHeading !== '' ? (
          <div className={classes.sectionHeader}>
            <span>{subHeading}</span>
            <span className={classes.count}>
              {filterSpecialites.length > 0
                ? filterSpecialites.length.toString().padStart(2, '0')
                : filterSpecialites.length}
            </span>
          </div>
        ) : null}
        <div className={classes.root}>
          <div className={classes.searchList}>
            <Grid container spacing={2}>
              {_map(filterSpecialites, (specialityDetails) => {
                return (
                  <Mutation<SaveSearch, SaveSearchVariables>
                    mutation={SAVE_PATIENT_SEARCH}
                    variables={{
                      saveSearchInput: {
                        type: SEARCH_TYPE.SPECIALTY,
                        typeId: specialityDetails.id,
                        patient: currentPatient ? currentPatient.id : '',
                      },
                    }}
                    onCompleted={(data) => {
                      // console.log(data);
                    }}
                    onError={(error) => {
                      // console.log(error);
                    }}
                    key={_uniqueId('special_')}
                  >
                    {(mutation) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        title={specialityDetails.name || ''}
                        onClick={(e) => {
                          mutation();
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
                          <span>{specialityDetails.name}</span>
                          <span className={classes.rightArrow}>
                            <img src={require('images/ic_arrow_right.svg')} />
                          </span>
                        </div>
                      </Grid>
                    )}
                  </Mutation>
                );
              })}
            </Grid>
          </div>
        </div>
      </>
    );
    return <></>;
  } else {
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );
  }
};
