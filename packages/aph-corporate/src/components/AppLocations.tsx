import React, { useRef, useContext, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import { AphTextField } from '@aph/web-ui-components';
import { LocationContext } from 'components/LocationProvider';
import PlacesAutocomplete from 'react-places-autocomplete';
import { Helmet } from 'react-helmet';
import { AllowLocation } from 'components/AllowLocation';
import { Alerts } from 'components/Alerts/Alerts';

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
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
        borderLeft: 'none',
        paddingTop: 15,
        paddingBottom: 15,
      },
    },
    locationWrap: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      maxWidth: 210,
      [theme.breakpoints.down('xs')]: {
        maxWidth: 180,
      },
      [theme.breakpoints.down(500)]: {
        maxWidth: 150,
      },
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
      overflow: 'hidden',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      [theme.breakpoints.down(390)]: {
        display: 'none',
      },
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
    iconDesktop: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    iconMobile: {
      marginLeft: 5,
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    locationPopWrap: {
      width: 240,
      padding: '16px 20px',
    },
    inputLabel: {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 500,
    },
    searchInput: {
      display: 'flex',
      '& >div:first-child': {
        width: 'calc(100% - 40px)',
      },
    },
    popLocationIcon: {
      textAlign: 'center',
      paddingTop: 8,
      paddingLeft: 16,
      '& img': {
        maxWidth: 24,
      },
    },
    locationAutoComplete: {
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
          borderBottom: '0.5px solid rgba(2,71,91,0.3)',
          listStyleType: 'none',
          '&:last-child': {
            paddingBottom: 0,
            borderBottom: 'none',
          },
        },
      },
    },
    popPaperRoot: {
      marginTop: -16,
    },
    dateLoader: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
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
  matchedSubstrings: Array<{ length: number; offset: number }>;
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
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const mascotRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

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

  useEffect(() => {
    if (!localStorage.getItem('currentAddress')) {
      navigator.permissions &&
        navigator.permissions.query({ name: 'geolocation' }).then((PermissionStatus) => {
          if (PermissionStatus.state === 'denied') {
            setIsAlertOpen(true);
            setAlertMessage('Location Permission was denied. Please allow browser settings.');
          } else if (PermissionStatus.state !== 'granted') {
            setIsPopoverOpen(true);
          }
          console.log(PermissionStatus);
        });
    }
  });

  const renderSuggestion = (text: string, matchedLength: number) => {
    return (
      <>
        <span style={{ fontWeight: 500 }}>{text.substring(0, matchedLength)}</span>
        <span style={{ fontWeight: 400 }}>{text.substring(matchedLength, text.length)}</span>
      </>
    );
  };

  const getAddressFromLocalStorage = () => {
    const currentAddress = localStorage.getItem('currentAddress');
    if (currentAddress) {
      return currentAddress.includes(',')
        ? currentAddress.substring(0, currentAddress.indexOf(','))
        : currentAddress;
    }
    return 'No location';
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
        title={'Location'}
      >
        <img
          className={`${classes.locationIcon} ${classes.iconDesktop}`}
          src={require('images/ic_location_on.svg')}
          alt=""
        />
        <span className={classes.selectedLocation}>
          {!isPopoverOpen && selectedAddress.length > 0
            ? selectedAddress
            : !isPopoverOpen && currentLocation && currentLocation.length > 0
            ? currentLocation
            : getAddressFromLocalStorage()}
        </span>
        <img
          className={`${classes.locationIcon} ${classes.iconMobile}`}
          src={require('images/ic_location_on.svg')}
          alt=""
        />
      </div>
      <Popover
        open={isLocationPopoverOpen}
        anchorEl={locationRef.current}
        onClose={() => setIsLocationPopoverOpen(false)}
        classes={{
          paper: classes.popPaperRoot,
        }}
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
            <div className={classes.locationPopWrap}>
              <label className={classes.inputLabel}>Current Location</label>
              <div className={classes.searchInput}>
                <AphTextField type="search" placeholder="Search Places..." {...getInputProps()} />
                <div className={classes.popLocationIcon}>
                  <img src={require('images/ic-location.svg')} alt="" />
                </div>
              </div>
              <div className={classes.locationAutoComplete}>
                {loading && <div className={classes.dateLoader}>Loading...</div>}
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
            </div>
          )}
        </PlacesAutocomplete>
      </Popover>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <AllowLocation
              setIsLocationPopoverOpen={setIsLocationPopoverOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              isPopoverOpen={isPopoverOpen}
            />
          </div>
        </div>
      </Popover>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
