import { Theme, Grid, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useRef } from 'react';
import { AphDialogTitle, AphButton, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';
import { DELETE_PATIENT_ADDRESS } from 'graphql/address';
import { useMutation } from 'react-apollo-hooks';
import { MascotWithMessage } from '../MascotWithMessage';
import { PATIENT_ADDRESS_TYPE } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      padding: 16,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      color: '#01475b',
      cursor: 'pointer',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    addressType: {
      position: 'absolute',
      top: 0,
      right: 0,
      textAlign: 'center',
      padding: 6,
      textTransform: 'uppercase',
      backgroundColor: 'rgba(0,135,186,0.11)',
      borderRadius: 10,
      fontSize: 9,
      fontWeight: 'bold',
      color: '#02475b',
      minWidth: 115,
    },
    moreIcon: {
      position: 'absolute',
      right: 0,
      top: -2,
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    deleteBtn: {
      textTransform: 'none',
      color: '#01475b',
      fontSize: 16,
      fontWeight: 500,
    },
  };
});

interface AddressCardProps {
  addresses: Array<GetPatientAddressList_getPatientAddressList_addressList>;
}

export const AddressCard: React.FC<AddressCardProps> = (props) => {
  const classes = useStyles({});
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = React.useState<boolean>(false);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = React.useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = React.useState<
    GetPatientAddressList_getPatientAddressList_addressList
  >();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  const deleteAddRef = useRef(null);
  const deleteAddressMutation = useMutation(DELETE_PATIENT_ADDRESS);

  // console.log('THE PROPS ARE: ', props);

  const addressDivs = props.addresses.map((address) => {
    return (
      <Grid item xs={12} key={`${address.id}`}>
        <div
          className={classes.root}
          onClick={() => {
            setIsEditAddressDialogOpen(true);
            setCurrentAddress(address);
          }}
        >
          <div className={classes.addressType}>
            {address.addressType === PATIENT_ADDRESS_TYPE.OTHER
              ? address.otherAddressType
              : address.addressType}
          </div>
          {address.addressLine1}
          <br /> {`${address.addressLine2} - ${address.zipcode}`}
        </div>
      </Grid>
    );
  });

  return (
    <Grid container spacing={1}>
      {addressDivs}
      <AphDialog open={isEditAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsEditAddressDialogOpen(false)} />
        <AphDialogTitle>
          Edit Address
          <div
            onClick={() => setIsDeletePopoverOpen(true)}
            ref={deleteAddRef}
            className={classes.moreIcon}
          >
            <img src={require('images/ic_more.svg')} alt="" />
          </div>
        </AphDialogTitle>
        <AddNewAddress
          setIsAddAddressDialogOpen={setIsEditAddressDialogOpen}
          currentAddress={currentAddress}
          disableActions
        />
      </AphDialog>
      <Popover
        open={isDeletePopoverOpen}
        anchorEl={deleteAddRef.current}
        onClose={() => setIsDeletePopoverOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <AphButton
          className={classes.deleteBtn}
          onClick={() => {
            setIsEditAddressDialogOpen(false);
            setIsDeletePopoverOpen(false);
            deleteAddressMutation({ variables: { id: currentAddress && currentAddress.id } })
              .then(() => {
                setIsPopoverOpen(true);
              })
              .catch(() => {});
          }}
        >
          Delete Address
        </AphButton>
      </Popover>
      <Popover
        open={isPopoverOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <MascotWithMessage
          messageTitle=""
          message="Address deleted successfully."
          closeButtonLabel="OK"
          closeMascot={() => {
            setIsPopoverOpen(false);
          }}
          refreshPage
        />
      </Popover>
    </Grid>
  );
};
