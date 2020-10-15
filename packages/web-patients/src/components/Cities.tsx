import React, { useState } from 'react';
import { Theme, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import _lowerCase from 'lodash/lowerCase';
import { clientRoutes } from 'helpers/clientRoutes';
import { useParams } from 'hooks/routerHooks';
import PlacesAutocomplete from 'react-places-autocomplete';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    locationContainer: {
      width: 500,
      position: 'absolute',
      top: 50,
      left: 0,
      padding: 20,
      borderRadius: 10,
      background: '#fff',
      zIndex: 4,
      boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.3)',
      [theme.breakpoints.down(600)]: {
        padding: 20,
        width: 320,
      },
    },

    popularCities: {
      padding: '20px 0 0',
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
      '& input': {
        fontSize: 18,
        '&::placeholder': {
          fontSize: 18,
        },
      },
    },
    autoSearchPopover: {
      color: '#02475b',
      paddingTop: 10,
      '& ul': {
        margin: 0,
        padding: 0,
        '& li': {
          color: '#02475b',
          cursor: 'pointer',
          padding: '8px 0',
          fontSize: 16,
          fontWeight: 500,
          listStyleType: 'none',
          '&:last-child': {
            paddingBottom: 0,
          },
        },
      },
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

type SuggestionProps = {
  active: boolean;
  description: string;
  id: string;
  index: number;
  formattedSuggestion: {
    mainText: string;
    secondText: string;
  };
  matchedSubstrings: Array<{ length: number; offset: number }>;
};

type InputProps = {
  getInputProps: Function;
  suggestions: Array<SuggestionProps>;
  getSuggestionItemProps: Function;
  loading: boolean;
};

export const Cities: React.FC<CitiesProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<{
    city: string;
    specialty: string;
  }>();
  const { setLocationPopup, setSelectedCity, selectedCity } = props;

  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [address, setAddress] = React.useState<string>('');
  const history = useHistory();
  const populatCities = ['Hyderabad', 'Chennai', 'Mumbai', 'Kolkata', 'Bangalore'];

  const handleChange = (address: string) => {
    setAddress(address);
    address.length === 0 ? setShowDropdown(false) : setShowDropdown(true);
  };

  const handleSelect = (address: string) => {
    const citySelected = address.substring(0, address.indexOf(','));
    setSelectedCity(citySelected);
    setLocationPopup(false);
    setShowDropdown(false);
    history.push(
      clientRoutes.specialtyDetailsWithCity(params.specialty, citySelected.toLowerCase())
    );
  };

  const searchOptions = {
    componentRestrictions: { country: ['in'] },
  };

  const renderSuggestion = (text: string, matchedLength: number) => {
    return (
      <>
        <span style={{ fontWeight: 500 }}>{text.substring(0, matchedLength)}</span>
        <span style={{ fontWeight: 400 }}>{text.substring(matchedLength, text.length)}</span>
      </>
    );
  };

  return (
    <div className={classes.locationContainer}>
      <Helmet>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=places`}
        ></script>
      </Helmet>
      <PlacesAutocomplete
        value={address}
        onChange={handleChange}
        onSelect={handleSelect}
        searchOptions={searchOptions}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }: InputProps) => {
          return (
            <div className={classes.cityContainer}>
              <AphTextField
                placeholder="Search for a city"
                {...getInputProps()}
                onKeyDown={(e) => {
                  e.key === 'Enter' && e.preventDefault();
                }}
              />
              {loading ? (
                <div className={classes.progressLoader}>
                  <CircularProgress size={30} />
                </div>
              ) : (
                <div className={classes.autoSearchPopover}>
                  <ul>
                    {suggestions.map((suggestion: SuggestionProps) => {
                      return suggestion.index < 3 ? (
                        <li {...getSuggestionItemProps(suggestion)}>
                          {renderSuggestion(
                            suggestion.formattedSuggestion.mainText,
                            suggestion.matchedSubstrings[0].length
                          )}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        }}
      </PlacesAutocomplete>
      {!showDropdown && (
        <div className={classes.popularCities}>
          <Typography component="h6">Popular Cities</Typography>
          {populatCities.map((city: string) => (
            <AphButton
              key={city}
              className={
                selectedCity.toLowerCase() === city.toLowerCase() ? classes.buttonActive : ''
              }
              onClick={(e) => {
                setSelectedCity(city);
                setLocationPopup(false);
                history.push(
                  clientRoutes.specialtyDetailsWithCity(params.specialty, city.toLowerCase())
                );
              }}
            >
              {city}
            </AphButton>
          ))}
        </div>
      )}
    </div>
  );
};
