import { Theme, Grid, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useRef } from 'react';
import { AphDialogTitle, AphButton, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';

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
  const deleteAddRef = useRef(null);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = React.useState<boolean>(false);

  console.log('THE PROPS ARE: ', props);

  const addressDivs = props.addresses.map((address) => {
    return (
      <Grid item xs={12} key={address.id}>
        <div className={classes.root} onClick={() => setIsEditAddressDialogOpen(true)}>
          <div className={classes.addressType}>Home</div>
          {address.addressLine1}
          <br /> {address.addressLine2}
          <br /> {address.zipcode}
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
        <AddNewAddress setIsAddAddressDialogOpen={setIsEditAddressDialogOpen} />
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
        <AphButton className={classes.deleteBtn}>Delete Address</AphButton>
      </Popover>
    </Grid>
  );
};
