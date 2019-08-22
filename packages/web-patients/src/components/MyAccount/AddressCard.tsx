import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphDialogTitle, AphButton, AphDialog } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { AddNewAddress } from 'components/Locations/AddNewAddress';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      color: '#02475b',
      cursor: 'pointer',
    },
    dialogContent: {
      paddingTop: 10,
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      textAlign: 'center',
      '& button': {
        borderRadius: 10,
        width: 288,
      },
    },
    customScrollBar: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    shadowHide: {
      overflow: 'hidden',
    },
    moreIcon: {
      position: 'absolute',
      right: 0,
      top: -2,
      '& img': {
        verticalAlign: 'middle',
      },
    },
  };
});

export const AddressCard: React.FC = (props) => {
  const classes = useStyles();
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = React.useState<boolean>(false);

  return (
    <Grid container spacing={2}>
      <Grid item sm={6}>
        <div className={classes.root} onClick={() => setIsEditAddressDialogOpen(true)}>
          27/A, Kalpataru Enclave
          <br /> Jubilee Hills
          <br /> Hyderabad, Telangana — 500033
        </div>
      </Grid>
      <Grid item sm={6}>
        <div className={classes.root} onClick={() => setIsEditAddressDialogOpen(true)}>
          27/A, Kalpataru Enclave
          <br /> Jubilee Hills
          <br /> Hyderabad, Telangana — 500033
        </div>
      </Grid>
      <Grid item sm={6}>
        <div className={classes.root} onClick={() => setIsEditAddressDialogOpen(true)}>
          27/A, Kalpataru Enclave
          <br /> Jubilee Hills
          <br /> Hyderabad, Telangana — 500033
        </div>
      </Grid>
      <AphDialog open={isEditAddressDialogOpen} maxWidth="sm">
        <AphDialogTitle>
          Edit Address
          <div className={classes.moreIcon}>
            <img src={require('images/ic_more.svg')} alt="" />
          </div>
        </AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <AddNewAddress />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton color="primary">Done</AphButton>
          </div>
        </div>
      </AphDialog>
    </Grid>
  );
};
