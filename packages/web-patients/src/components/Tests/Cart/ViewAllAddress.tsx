import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useDiagnosticsCart } from '../DiagnosticsCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 14,
      paddingBottom: 20,
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
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
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
        wordBreak: 'break-word',
      },
    },
    addressGroup: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      paddingTop: 16,
      paddingBottom: 6,
      marginBottom: 10,
    },
    dialogContent: {
      paddingTop: 10,
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

interface ViewAllAddressProps {
  setIsViewAllAddressDialogOpen: (isViewAllAddressDialogOpen: boolean) => void;
  formatAddress: (address: any) => string;
}

export const ViewAllAddress: React.FC<ViewAllAddressProps> = (props) => {
  const classes = useStyles({});
  const { deliveryAddressId, setDeliveryAddressId, deliveryAddresses } = useDiagnosticsCart();

  const disableSubmit = deliveryAddressId === '';

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <ul>
                  {deliveryAddresses.map((addressDetails, index) => {
                    const addressId = addressDetails.id;
                    const address = `${addressDetails.addressLine1} - ${addressDetails.zipcode}`;
                    return (
                      <li key={index}>
                        <FormControlLabel
                          checked={deliveryAddressId === addressId}
                          className={classes.radioLabel}
                          value={addressId}
                          control={<AphRadio color="primary" />}
                          label={props.formatAddress(addressDetails)}
                          onChange={() => {
                            setDeliveryAddressId && setDeliveryAddressId(addressId);
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.dialogActions}>
        <AphButton
          color="primary"
          fullWidth
          disabled={disableSubmit}
          className={disableSubmit ? classes.buttonDisable : ''}
          onClick={() => props.setIsViewAllAddressDialogOpen(false)}
        >
          SAVE AND USE
        </AphButton>
      </div>
    </div>
  );
};
