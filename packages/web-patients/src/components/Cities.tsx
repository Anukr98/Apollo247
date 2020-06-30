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
import { useQuery } from 'react-apollo-hooks';
import _lowerCase from 'lodash/lowerCase';
import { clientRoutes } from 'helpers/clientRoutes';
import { useParams } from 'hooks/routerHooks';

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
        margin: '0 15px 15px 0',
        color: '#00b38e',
        borderRadius: 10,
        fontSize: 12,
        textTransform: 'none',
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
    cityContainer: {
      position: 'relative',
    },
    autoSearchPopover: {
      padding: '15px 10px 15px 20px',
      position: 'absolute',
      top: 46,
      left: 0,
      right: 0,
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 1px 10px 0 rgba(128, 128, 128, 0.75)',
      borderRadius: 5,
      zIndex: 9,
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    searchList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      maxHeight: 120,
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: 8,
      },
      '&::-webkit-scrollbar-track': {
        background: '#fff',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#d8d8d8',
        borderRadius: 4,
      },
      '& li': {
        padding: '6px 0',
        flex: 1,
        fontSize: 16,
        fontWeight: 500,
        color: '#02475b',
      },
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: '#fff !important',
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
    disabledButton: {
      color: '#00b38e !important',
      opacity: 0.5,
    },
  };
});

interface CitiesProps {
  locationPopup: boolean;
  setLocationPopup: (locationPopup: boolean) => void;
  setSelectedCity: (selectedCity: string) => void;
  selectedCity: string;
}

export const Cities: React.FC<CitiesProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<{
    city: string;
    specialty: string;
  }>();
  const { locationPopup, setLocationPopup, setSelectedCity, selectedCity } = props;

  const { error, loading, data } = useQuery<getAllCities>(GET_ALL_CITIES);
  const [searchText, setSearchText] = useState<string>(selectedCity);
  const [cityName, setCityName] = useState<string>(selectedCity);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  if (error) {
    return <div>Error! </div>;
  }

  const citiesList = data && data.getAllCities && data.getAllCities.city;

  const populatCities = ['Hyderabad', 'Chennai', 'Mumbai', 'Kolkata', 'Bangalore'];

  const filteredCities =
    citiesList && citiesList.filter((city) => _lowerCase(city).includes(_lowerCase(searchText)));

  return (
    <div>
      <AphDialog open={locationPopup} maxWidth="md">
        <AphDialogClose onClick={() => setLocationPopup(false)} title={'Close'} />
        <AphDialogTitle className={classes.dialogTitle}>
          Select a city to see the recommended healthcare services
        </AphDialogTitle>
        <div className={classes.locationContainer}>
          <div className={classes.cityContainer}>
            <AphInput
              placeholder="Select for a city"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setShowDropdown(true);
              }}
            />
            {showDropdown &&
              searchText.length > 0 &&
              (loading ? (
                <div className={classes.progressLoader}>
                  <CircularProgress size={30} />
                </div>
              ) : (
                filteredCities &&
                filteredCities.length > 0 && (
                  <div className={classes.autoSearchPopover}>
                    <ul className={classes.searchList}>
                      {filteredCities.map(
                        (city: string) =>
                          _lowerCase(city).includes(_lowerCase(searchText)) && (
                            <li
                              style={{ cursor: 'pointer' }}
                              key={city}
                              onClick={() => {
                                setSearchText(city);
                                setCityName(city);
                                setShowDropdown(false);
                              }}
                            >
                              {city}
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                )
              ))}
          </div>
          <div className={classes.popularCities}>
            <Typography component="h6">Popular Cities</Typography>
            {populatCities.map((city: string) => (
              <AphButton
                key={city}
                className={cityName === city ? classes.buttonActive : ''}
                onClick={(e) => {
                  if (city === cityName) {
                    setCityName('');
                    setSearchText('');
                  } else {
                    setCityName(city);
                    setSearchText(city);
                  }
                  setShowDropdown(false);
                }}
              >
                {city}
              </AphButton>
            ))}
          </div>
          <div className={classes.btnContainer}>
            <AphButton
              className={cityName === '' ? classes.disabledButton : ''}
              disabled={cityName === ''}
              color="primary"
              onClick={() => {
                if (params.city && params.specialty) {
                  window.location.href = clientRoutes.citySpecialties(
                    cityName.toLowerCase(),
                    params.specialty
                  );
                } else {
                  setSelectedCity(cityName);
                  setLocationPopup(false);
                }
              }}
            >
              Okay
            </AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
