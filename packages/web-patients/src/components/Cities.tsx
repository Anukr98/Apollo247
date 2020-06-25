import React, { useState, useEffect } from 'react';
import { Theme, Grid, CircularProgress, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  AphButton,
  AphDialog,
  AphDialogClose,
  AphDialogTitle,
  AphInput,
} from '@aph/web-ui-components';
import { GET_ALL_CITIES } from 'graphql/specialities';
import { getAllCities } from 'graphql/types/getAllCities';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import _lowerCase from 'lodash/lowerCase';

const useStyles = makeStyles((theme: Theme) => {
  return {
    locationContainer: {
      padding: 30,
      [theme.breakpoints.down(600)]: {
        padding: 20,
      },
    },
    dialogTitle: {
      textAlign: 'left',
      [theme.breakpoints.down(600)]: {
        '& h2': {
          fontSize: 14,
        },
      },
    },
    popularCities: {
      padding: '20px 0',
      '& h6': {
        fontSize: 14,
        fontWeight: 700,
        margin: '0 0 10px',
        color: '#02475b',
      },
      '& button': {
        margin: '0 15px 0 0',
        color: '#00b38e',
        borderRadius: 10,
        fontSize: 12,
        textTransform: 'none',
        [theme.breakpoints.down(500)]: {
          margin: '0 15px 15px 0',
        },
      },
    },
    btnContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      '& button': {
        width: 180,
        fontSize: 13,
        fontWeight: 700,
      },
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
    autoSearchPopover: {
      position: 'absolute',
      top: 53,
      left: 0,
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      width: '100%',
      zIndex: 9,
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    searchList: {
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          listStyleType: 'none',
          borderBottom: '0.5px solid rgba(2,71,91,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          '& a': {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 12px',
            flex: 1,
          },
          '&:hover': {
            backgroundColor: '#f7f8f5',
          },
          '&:focus': {
            backgroundColor: '#f7f8f5',
          },
          '&:last-child': {
            borderBottom: 0,
          },
        },
      },
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: '#02475b',
    },
  };
});

interface CitiesProps {
  locationPopup: boolean;
  setLocationPopup: (locationPopup: boolean) => void;
}

export const Cities: React.FC<CitiesProps> = (props) => {
  const classes = useStyles({});
  const { locationPopup, setLocationPopup } = props;

  const { error, loading, data } = useQueryWithSkip<getAllCities>(GET_ALL_CITIES);
  const [searchText, setSearchText] = useState<string>('');
  const [cityName, setCityName] = useState<string>('');

  if (error) {
    return <div>Error! </div>;
  }

  const citiesList = data && data.getAllCities && data.getAllCities.city;

  return (
    <div>
      <AphDialog open={locationPopup} maxWidth="md">
        <AphDialogClose onClick={() => setLocationPopup(false)} title={'Close'} />
        <AphDialogTitle className={classes.dialogTitle}>
          Select a city to see the recommended healthcare services
        </AphDialogTitle>
        <div className={classes.locationContainer}>
          <AphInput
            placeholder="Select for a city"
            onChange={(e) => {
              setCityName('');
              setSearchText(e.target.value);
            }}
          />

          <div className={classes.popularCities}>
            {loading ? (
              <div className={classes.circlularProgress}>
                <CircularProgress color="primary" />
              </div>
            ) : citiesList && citiesList.length > 0 ? (
              <>
                <Typography component="h6">Popular Cities</Typography>
                {citiesList.map((city: string) => (
                  <AphButton
                    className={cityName === city ? classes.buttonActive : ''}
                    onClick={(e) => setCityName(city)}
                  >
                    {city}
                  </AphButton>
                ))}
              </>
            ) : null}
          </div>
          <div className={classes.btnContainer}>
            <AphButton
              disabled={cityName === ''}
              color="primary"
              onClick={() => setLocationPopup(false)}
            >
              Okay
            </AphButton>
          </div>
        </div>
      </AphDialog>
      {searchText.length > 0 && (
        <Paper className={classes.autoSearchPopover}>
          {loading ? (
            <div className={classes.progressLoader}>
              <CircularProgress size={30} />
            </div>
          ) : (
            citiesList &&
            citiesList.length > 0 && (
              <div className={classes.searchList}>
                <ul>
                  {citiesList.map(
                    (city: string) =>
                      _lowerCase(city).includes(_lowerCase(searchText)) && (
                        <li
                          key={city}
                          onClick={() => {
                            setCityName(city);
                          }}
                        >
                          {city}
                        </li>
                      )
                  )}
                </ul>
              </div>
            )
          )}
        </Paper>
      )}
    </div>
  );
};
