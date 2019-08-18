import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio, AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { ViewAllAddress } from 'components/Locations/ViewAllAddress';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '20px 10px 10px 10px',
      '& ul': {
        padding: 0,
        margin: 0,
      },
      '& li': {
        listStyleType: 'none',
        paddingBottom: 10,
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    radioLabel: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      alignItems: 'start',
      '& span:last-child': {
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    bottomActions: {
      display: 'flex',
      alignItems: 'center',
      '& button': {
        boxShadow: 'none',
        padding: 0,
        color: '#fc9916',
      },
    },
    viewAllBtn: {
      marginLeft: 'auto',
    },
    dialogContent: {
      paddingTop: 10,
    },
    backArrow: {
      cursor: 'pointer',
      position: 'absolute',
      left: 0,
      top: -2,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      '& button': {
        borderRadius: 10,
      },
    },
    customScrollBar: {
      paddingRight: 20,
      paddingLeft: 20,
    },
    shadowHide: {
      overflow: 'hidden',
    },
  };
});

export const HomeDelivery: React.FC = (props) => {
  const classes = useStyles();
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = React.useState<boolean>(false);
  const [isViewAllAddressDialogOpen, setIsViewAllAddressDialogOpen] = React.useState<boolean>(
    false
  );

  return (
    <div className={classes.root}>
      <ul>
        <li>
          <FormControlLabel
            className={classes.radioLabel}
            value="a"
            control={<AphRadio color="primary" />}
            checked
            label="27/A, Kalpataru Enclave Jubilee Hills Hyderabad, Telangana — 500033"
          />
        </li>
        <li>
          <FormControlLabel
            className={classes.radioLabel}
            value="b"
            control={<AphRadio color="primary" />}
            label="27/A, Kalpataru Enclave Jubilee Hills Hyderabad, Telangana — 500033"
          />
        </li>
      </ul>
      <div className={classes.bottomActions}>
        <AphButton onClick={() => setIsAddAddressDialogOpen(true)}>Add new address</AphButton>
        <AphButton
          onClick={() => setIsViewAllAddressDialogOpen(true)}
          className={classes.viewAllBtn}
        >
          View All
        </AphButton>
      </div>
      <AphDialog open={isAddAddressDialogOpen} maxWidth="sm">
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div>
          Add New Address
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
            <AphButton color="primary" fullWidth>
              Save & Use
            </AphButton>
          </div>
        </div>
      </AphDialog>
      <AphDialog open={isViewAllAddressDialogOpen} maxWidth="sm">
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div>
          Select Delivery Address
        </AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <ViewAllAddress />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton color="primary" fullWidth>
              Done
            </AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
