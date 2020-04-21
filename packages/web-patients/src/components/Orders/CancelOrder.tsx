import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover, CircularProgress } from '@material-ui/core';
import React from 'react';
import { AphSelect, AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

import { SAVE_ORDER_CANCEL_STATUS } from 'graphql/profiles';
import { useMutation } from 'react-apollo-hooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 14,
      paddingBottom: 20,
    },
    addressGroup: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 16,
    },
    formGroup: {
      paddingBottom: 20,
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
      '& label': {
        fontSize: 14,
        fontWeight: 500,
        color: '#02475b',
      },
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& ul': {
        padding: '10px 20px',
        '& li': {
          fontSize: 16,
          fontWeight: 500,
          color: '#01475b',
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    dialogContent: {
      paddingTop: 10,
    },
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
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
  };
});

type CancelOrderProps = {
  orderAutoId: number;
  setIsCancelOrderDialogOpen: (isCancelOrderDialogOpen: boolean) => void;
  setIsPopoverOpen: (isPopoverOpen: boolean) => void;
};

export const CancelOrder: React.FC<CancelOrderProps> = (props) => {
  const classes = useStyles({});

  const [selectedReason, setSelectedReason] = React.useState<string>('placeholder');
  const [showLoader, setShowLoader] = React.useState<boolean>(false);

  const cancelOrder = useMutation(SAVE_ORDER_CANCEL_STATUS);

  const cancelReasonList = [
    'Placed order by mistake',
    'Higher discounts available on other app',
    'Delay in delivery',
    'Delay in order confirmation',
    'Do not require medicines any longer',
    'Already purchased',
  ];

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <div className={classes.formGroup}>
                  <label>Why are you cancelling this order?</label>
                  <AphSelect
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value as string)}
                    MenuProps={{
                      classes: { paper: classes.menuPopover },
                      anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                    }}
                  >
                    <MenuItem
                      value="placeholder"
                      classes={{ selected: classes.menuSelected }}
                      disabled
                    >
                      Select reason for cancelling
                    </MenuItem>
                    {cancelReasonList.map((reason) => (
                      <MenuItem value={reason} classes={{ selected: classes.menuSelected }}>
                        {reason}
                      </MenuItem>
                    ))}
                  </AphSelect>
                </div>
                <div className={classes.formGroup}>
                  <label>Add Comments (Optional)</label>
                  <AphTextField placeholder="Enter your comments here…" />
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.dialogActions}>
        <AphButton
          disabled={selectedReason.length === 0 || selectedReason === 'placeholder'}
          className={selectedReason.length === 0 ? classes.buttonDisable : ''}
          onClick={() => {
            setShowLoader(true);
            cancelOrder({
              variables: {
                orderCancelInput: {
                  orderNo:
                    typeof props.orderAutoId === 'string'
                      ? parseInt(props.orderAutoId)
                      : props.orderAutoId,
                  remarksCode: selectedReason,
                },
              },
            })
              .then(({ data }: any) => {
                if (
                  data &&
                  data.saveOrderCancelStatus &&
                  data.saveOrderCancelStatus.requestStatus === 'true'
                ) {
                  props.setIsCancelOrderDialogOpen(false);
                  setShowLoader(false);
                  props.setIsPopoverOpen(true);
                }
              })
              .catch((e) => console.log(e));
          }}
          color="primary"
        >
          {showLoader ? <CircularProgress size={20} color="secondary" /> : 'Submit Request'}
        </AphButton>
      </div>
    </div>
  );
};
