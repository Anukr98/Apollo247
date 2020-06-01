import React, { useRef } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import { AphTextField, AphButton, AphDialog, AphDialogClose } from '@aph/web-ui-components';

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
      padding: '9px 13px 9px 13px',
      fontSize: 13,
      fontWeight: 'bold',
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

export const MedicineLocationSearch: React.FC = (props) => {
  const classes = useStyles({});
  const locationRef = useRef(null);
  const [isLocationPopover, setIsLocationPopover] = React.useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = React.useState('');
  const [isPincodeDialogOpen, setIsPincodeDialogOpen] = React.useState<boolean>(false);

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
            Lucknow 226001
          </span>  
            <span>
              <img src={require('images/ic_dropdown_green.svg')} alt="" />
            </span>
        </div>
        <div className={classes.noService}>Sorry, not serviceable here.</div>
      </div>
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
