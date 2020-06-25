import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar, CircularProgress } from '@material-ui/core';
import _uniqueId from 'lodash/uniqueId';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _startsWith from 'lodash/startsWith';
import _toLower from 'lodash/toLower';
import {
  GetAllSpecialties,
  GetAllSpecialties_getAllSpecialties as SpecialtyType,
} from 'graphql/types/GetAllSpecialties';
import { GET_ALL_SPECIALITIES } from 'graphql/specialities';
import { SAVE_PATIENT_SEARCH } from 'graphql/pastsearches';
import { SEARCH_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useQuery } from 'react-apollo-hooks';
import { useLocationDetails } from 'components/LocationProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { Route } from 'react-router-dom';
import { readableParam } from 'helpers/commonHelpers';
import { useMutation } from 'react-apollo-hooks';

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
      color: '#02475b',
      alignItems: 'center',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        fontSize: 14,
        marginTop: 0,
        padding: '14px 16px',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        minHeight: 'auto',
      },
    },
    bigAvatar: {
      width: 48,
      height: 48,
      marginRight: 15,
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
    },
    specialityDetails: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
      paddingTop: 5,
    },
  });
});

export const Specialities: React.FC = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();

  const { loading, error, data } = useQuery<GetAllSpecialties>(GET_ALL_SPECIALITIES);

  if (error) {
    return <div>Error! </div>;
  }

  const saveSearchMutation = useMutation(SAVE_PATIENT_SEARCH);

  return loading ? (
    <div className={classes.circlularProgress}>
      <CircularProgress color="primary" />
    </div>
  ) : data && data.getAllSpecialties && data && data.getAllSpecialties.length > 0 ? (
    <>
      <div className={classes.root}>
        <div className={classes.searchList}>
          <Grid container spacing={1}>
            {data.getAllSpecialties.map(
              (specialityDetails: SpecialtyType) =>
                specialityDetails && (
                  <Route
                    render={({ history }) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        title={specialityDetails.name}
                        onClick={(e) => {
                          saveSearchMutation({
                            variables: {
                              saveSearchInput: {
                                type: SEARCH_TYPE.SPECIALTY,
                                typeId: specialityDetails.id,
                                patient: currentPatient ? currentPatient.id : '',
                              },
                            },
                          });
                          const specialityUpdated = readableParam(`${e.currentTarget.title}`);
                          history.push(clientRoutes.specialties(`${specialityUpdated}`));
                        }}
                      >
                        <div className={classes.contentBox}>
                          <Avatar
                            alt={specialityDetails.name || ''}
                            src={specialityDetails.image || ''}
                            className={classes.bigAvatar}
                          />
                          <div>
                            <div>{specialityDetails.name}</div>
                            <div className={classes.specialityDetails}>
                              {/* {specialityDetails.userFriendlyNomenclature} */}
                              {specialityDetails.shortDescription}
                            </div>
                          </div>
                          <div className={classes.specialityDetails}>
                            {specialityDetails.symptoms}
                          </div>
                          <span className={classes.rightArrow}>
                            <img src={require('images/ic_arrow_right.svg')} />
                          </span>
                        </div>
                      </Grid>
                    )}
                  />
                )
            )}
          </Grid>
        </div>
      </div>
    </>
  ) : (
    <p>No results found</p>
  );
};
