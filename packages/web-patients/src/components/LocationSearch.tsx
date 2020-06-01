import React, { useRef, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import { AphTextField } from '@aph/web-ui-components';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { AllowLocation } from 'components/AllowLocation';
import { useAuth } from 'hooks/authHooks';
import { useLocationDetails } from 'components/LocationProvider';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    userLocation: {
      borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      paddingLeft: 20,
      marginLeft: 40,
      paddingTop: 14,
      paddingBottom: 14,
      marginTop: 10,
      marginBottom: 10,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
        borderLeft: 'none',
        paddingTop: 15,
        paddingBottom: 15,
      },
    },
    locationWrap: {
      maxWidth: 210,
      cursor: 'pointer',
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
      fontSize: 14,
      fontWeight: 500,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      display: 'flex',
      alignItems: 'center',
      '& span:first-child': {
        borderBottom: '2px solid #00b38e',
      },
      '& span:last-child': {
        '& img': {
          verticalAlign: 'middle',
        },
      },
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      [theme.breakpoints.down(360)]: {
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
      overflow: 'initial',
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
      [theme.breakpoints.down('xs')]: {
        marginLeft: 5,
      },
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
    locationPopoverClose: {
      position: 'absolute',
      top: -10,
      height: 26,
      borderRadius: '50%',
      boxShadow: '1px 1px 2px 1px #eaeaea',
      left: -10,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
      },
    },
    userName: {
      fontSize: 12,
      color: '#01475b',
    },
    locationPopRoot: {
      overflow: 'initial',
      boxShadow: '0 0 3px 0 rgba(0, 0, 0, 0.2)',
      border: 'solid 1px #f7f8f5',
      '& ul': {
        margin: 0,
        padding: 0,
        '& li': {
          padding: '12px 20px',
          fontSize: 15,
          fontWeight: 500,
          borderBottom: 'solid 1px #f7f8f5',
          listStyleType: 'none',
          cursor: 'pointer',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      }
    },
    noService: {
      position: 'absolute',
      bottom: -2,
      fontSize: 11,
      color: '#890000',
      minWidth: 140,
    },
    pincodeData: {
      padding: 30,
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      '& h2': {
        fontSize: 32,
        lineHeight: '42px',
        fontWeight: 600,
        margin: 0,
      },
    },
    bottomActions: {
      textAlign: 'center',
      paddingTop: 16,
    },
    submitBtn: {
      backgroundColor: '#fcb716',
      color: '#fff',
      minWidth: 150,
      borderRadius: 10,
      '&:hover': {
        backgroundColor: '#fcb716',
        color: '#fff',        
      },
    },
    disabledBtn: {
      opacity: 0.6,
    },
    pincodeError: {
      fontSize: 13,
      color: '#890000',
      paddingTop: 8,
      fontWeight: 500,
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

export const LocationSearch: React.FC = (props) => {
  const classes = useStyles({});
  const locationRef = useRef(null);
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = React.useState<boolean>(false);
  const [isForceFullyClosePopover, setIsForceFullyClosePopover] = React.useState<boolean>(false);
  const [isLocationPopover, setIsLocationPopover] = React.useState<boolean>(false);

  const searchOptions = {
    componentRestrictions: { country: ['in'] },
  };

  const mascotRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  const [address, setAddress] = React.useState('');
  const [selectedAddress, setSelectedAddress] = React.useState('');
  const [isLocationDenied, setIsLocationDenied] = React.useState<boolean>(false);
  const [detectBy, setDetectBy] = React.useState<string | null>('');
  const [isPincodeDialogOpen, setIsPincodeDialogOpen] = React.useState<boolean>(false);

  const {
    currentLocation,
    setCurrentLat,
    setCurrentLong,
    setCurrentLocation,
    locateCurrentLocation,
    isUserDeniedLocationAccess,
    setIsUserDeniedLocationAccess,
  } = useLocationDetails();
  const { isSigningIn, isSignedIn } = useAuth();

  const closePopOver = () => {
    setIsForceFullyClosePopover(true);
    setIsPopoverOpen(false);
  };

  const handleChange = (address: string) => setAddress(address);

  const handleSelect = (address: string) => {
    geocodeByAddress(address)
      .then((results: any) => getLatLng(results[0]))
      .then((resObj: any) => {
        if (resObj) {
          localStorage.setItem('currentAddress', address);
          setCurrentLat(resObj.lat);
          setCurrentLong(resObj.lng);
          setCurrentLocation(address);
          setSelectedAddress(address.substring(0, address.indexOf(',')));
          setAddress('');
          setIsLocationPopoverOpen(false);
        }
      })
      .catch((error: any) => {
        setAddress('');
        setIsLocationPopoverOpen(false);
      });
  };

  useEffect(() => {
    if (
      !localStorage.getItem('currentAddress') &&
      !isSigningIn &&
      (!isUserDeniedLocationAccess || !isLocationDenied)
    ) {
      navigator.permissions &&
        navigator.permissions.query({ name: 'geolocation' }).then((PermissionStatus) => {
          if (PermissionStatus.state === 'denied') {
            setIsPopoverOpen(false);
            setIsLocationDenied(true);
            setIsUserDeniedLocationAccess(true);
            // setIsLocationPopoverOpen(true);
          } else if (
            PermissionStatus.state !== 'granted' &&
            !detectBy &&
            !isForceFullyClosePopover
          ) {
            setIsPopoverOpen(true);
          } else if (PermissionStatus.state === 'granted' && !detectBy) {
            locateCurrentLocation();
            setIsPopoverOpen(false);
          }
        });
    } else if (
      (isLocationDenied || isUserDeniedLocationAccess) &&
      !localStorage.getItem('currentAddress') &&
      !isSigningIn
    ) {
      // setIsLocationPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
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
      <div
        className={classes.locationWrap}
        ref={locationRef}
        onClick={() => setIsLocationPopover(true)}
        title={selectedAddress}
        id="locationId"
      >
        <div className={classes.userName}>
          Deliver to Divya
        </div>
        <div className={classes.selectedLocation}>
          <span>
            {!isPopoverOpen && selectedAddress.length > 0
              ? selectedAddress
              : !isPopoverOpen && currentLocation && currentLocation.length > 0
              ? currentLocation
              : getAddressFromLocalStorage()}
          </span>  
            <span>
              <img src={require('images/ic_dropdown_green.svg')} alt="" />
            </span>
        </div>
        <div className={classes.noService}>Sorry, not serviceable here.</div>
      </div>
      <Popover
        open={isLocationPopoverOpen}
        anchorEl={locationRef.current}
        onClose={() => {
          if (getAddressFromLocalStorage() !== 'No location') setIsLocationPopoverOpen(false);
        }}
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
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }: InputProps) => {
            return (
              <div className={classes.locationPopWrap}>
                <div
                  className={classes.locationPopoverClose}
                  onClick={() => {
                    setIsLocationPopoverOpen(false);
                  }}
                >
                  <img src={require('images/ic_cross_popup.svg')} alt="" />
                </div>
                <label className={classes.inputLabel} title={'Current Location'}>
                  Current Location
                </label>
                <div className={classes.searchInput}>
                  <AphTextField
                    type="search"
                    placeholder="Search Places..."
                    {...getInputProps()}
                    onKeyDown={(e) => {
                      e.key === 'Enter' && e.preventDefault();
                    }}
                    title={'Search Places...'}
                  />
                  <div className={classes.popLocationIcon}>
                    <img src={require('images/ic-location.svg')} alt="" title={'Location'} />
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
            );
          }}
        </PlacesAutocomplete>
      </Popover>
      <Popover
        open={isLocationPopover}
        anchorEl={locationRef.current}
        onClose={() => {
          setIsLocationPopover(false);
        }}
        classes={{
          paper: classes.locationPopRoot,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <ul>
          <li>Auto Select Location</li>
          <li
            onClick={() => {
              setIsLocationPopover(false);
              setIsPincodeDialogOpen(true);
            }}
          >
            Enter Delivery Pincode
          </li>
        </ul>
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
            <div className={classes.locationPopoverClose} onClick={closePopOver}>
              <img src={require('images/ic_cross_popup.svg')} alt="" />
            </div>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <AllowLocation
              setIsLocationPopoverOpen={setIsLocationPopoverOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              isPopoverOpen={isPopoverOpen}
              setDetectBy={setDetectBy}
            />
          </div>
        </div>
      </Popover>
      <AphDialog open={isPincodeDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsPincodeDialogOpen(false)} title={'Close'} />
        <div className={classes.pincodeData}>
          <h2>Hi! :)</h2>
          <p>Allow us to serve you better by entering your delivery pincode below.</p>
          <AphTextField placeholder="Enter pincode here" />
          <div className={classes.pincodeError}>Sorry, we are not servicing in your area currently. Call 1860 500 0101 for pharmacy store nearby.</div>
          <div className={classes.bottomActions}>
            <AphButton
              color="primary"
              classes={{
                root: classes.submitBtn,
                disabled: classes.disabledBtn,
              }}
            >
              Submit
            </AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
