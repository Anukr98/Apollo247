import React, { useRef, useContext } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Popover, TextField, List, ListItem, Divider } from '@material-ui/core';
import { LocationContext } from 'components/LocationProvider';
import PlacesAutocomplete from 'react-places-autocomplete';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    userLocation: {
      borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      paddingLeft: 20,
      marginLeft: 40,
      paddingTop: 22,
      paddingBottom: 22,
      marginTop: 10,
      marginBottom: 10,
    },
    locationWrap: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    iconType: {
      width: 25,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      display: 'inline-block',
      marginTop: 41,
      right: 2,
    },
    selectedLocation: {
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.secondary.light,
      textTransform: 'uppercase',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
      fontSize: 12,
      display: 'inline-block',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    locationIcon: {
      color: '#00b38e',
      marginRight: 5,
    },
  });
});

type SuggestionProps = {
  active: boolean;
  description: string;
  id: string;
  index: number;
  formattedSuggestion: {
    mainText: string;
    secondText: string;
  };
};

type InputProps = {
  getInputProps: Function;
  suggestions: Array<SuggestionProps>;
  getSuggestionItemProps: Function;
  loading: boolean;
};

export const AppLocations: React.FC = (props) => {
  const classes = useStyles({});
  const locationRef = useRef(null);
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = React.useState<boolean>(false);
  const searchOptions = {
    componentRestrictions: { country: ['in'] },
  };

  const [address, setAddress] = React.useState('');
  const [selectedAddress, setSelectedAddress] = React.useState('');

  const handleChange = (address: string) => setAddress(address);
  const { currentLocation } = useContext(LocationContext);

  const handleSelect = (address: string) => {
    localStorage.setItem('currentAddress', address);
    setSelectedAddress(address.substring(0, address.indexOf(',')));
    setAddress('');
    setIsLocationPopoverOpen(false);
  };

  return (
    <div className={classes.userLocation}>
      <Helmet>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.PLACE_API_KEY}&libraries=places`}
        ></script>
      </Helmet>
      <div
        className={classes.locationWrap}
        ref={locationRef}
        onClick={() => setIsLocationPopoverOpen(true)}
      >
        <img className={classes.locationIcon} src={require('images/ic_location_on.svg')} alt="" />
        <span className={classes.selectedLocation}>
          {selectedAddress.length > 0
            ? selectedAddress
            : currentLocation && currentLocation.length > 0
            ? currentLocation
            : 'No location'}
        </span>
      </div>
      <Popover
        open={isLocationPopoverOpen}
        anchorEl={locationRef.current}
        onClose={() => setIsLocationPopoverOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <PlacesAutocomplete
          value={address}
          onChange={handleChange}
          onSelect={handleSelect}
          searchOptions={searchOptions}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }: InputProps) => (
            <div>
              {/* <input
                {...getInputProps({
                  placeholder: "Search Places ...",
                  className: "location-search-input"
                })}
              /> */}
              <TextField
                id="outlined-search"
                label="Current Location"
                type="search"
                className={classes.textField}
                margin="normal"
                {...getInputProps({
                  placeholder: 'Search Places ...',
                  className: 'location-search-input',
                })}
              />
              <div className={classes.iconType}>
                <img src={require('images/ic-location.svg')} alt="" />
              </div>
              <div className="autocomplete-dropdown-container">
                {loading && <div>Loading...</div>}
                {suggestions.map((suggestion: SuggestionProps) => {
                  const className = suggestion.active
                    ? 'suggestion-item--active'
                    : 'suggestion-item';
                  // inline style for demonstration purpose
                  const style = {
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'black',
                  };
                  return suggestion.index < 3 ? (
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className,
                        style,
                      })}
                    >
                      <List component="nav" aria-label="main mailbox folders">
                        <ListItem button>{suggestion.formattedSuggestion.mainText}</ListItem>
                        <Divider />
                      </List>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
      </Popover>
    </div>
  );
};
