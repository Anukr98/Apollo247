import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover, CircularProgress } from '@material-ui/core';
import React from 'react';
import { AphSelect, AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

import { useMutation, useQuery } from 'react-apollo-hooks';
import { CANCEL_MEDICINE_ORDER, MEDICINE_ORDER_CANCEL_REASONS } from 'graphql/medicines';
import { GetMedicineOrderCancelReasons } from 'graphql/types/GetMedicineOrderCancelReasons';
import {
  CancelMedicineOrderOMS,
  CancelMedicineOrderOMSVariables,
} from 'graphql/types/CancelMedicineOrderOMS';

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
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
  };
});

interface CancelOrderProps {
  orderAutoId: number;
  setIsCancelOrderDialogOpen: (isCancelOrderDialogOpen: boolean) => void;
  setIsPopoverOpen: (isPopoverOpen: boolean) => void;
  setCancelOrderReasonText?: (cancelOrderReason: string) => void;
}

export const CancelOrder: React.FC<CancelOrderProps> = (props) => {
  const classes = useStyles({});

  const [selectedReasonCode, setSelectedReasonCode] = React.useState<string>('placeholder');
  const [showLoader, setShowLoader] = React.useState<boolean>(false);
  const [cancelOtherReasonText, setCancelOtherReasonText] = React.useState<string>('');

  const cancelOrderMutation = useMutation<CancelMedicineOrderOMS, CancelMedicineOrderOMSVariables>(
    CANCEL_MEDICINE_ORDER
  );
  const { data: cancelOrderReasons, loading, error } = useQuery<GetMedicineOrderCancelReasons>(
    MEDICINE_ORDER_CANCEL_REASONS
  );

  if (loading)
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress size={20} color="secondary" />
      </div>
    );

  if (error) return <div className={classes.circlularProgress}>No data is available</div>;

  const cancelReasonList = cancelOrderReasons.getMedicineOrderCancelReasons.cancellationReasons.filter(
    (reasonDetails) => {
      return reasonDetails.isUserReason;
    }
  );

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
                    value={selectedReasonCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const reasonCode = e.target.value as string;
                      const reasonCodeDetails = cancelReasonList.find(
                        (reasonDetails) => reasonDetails.reasonCode === reasonCode
                      );
                      if (cancelOtherReasonText.length > 0 && reasonCode !== 'R000188') {
                        setCancelOtherReasonText('');
                      }
                      setSelectedReasonCode(reasonCode);
                      props.setCancelOrderReasonText(reasonCodeDetails.displayMessage);
                    }}
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
                    {cancelReasonList.map((reasonDetails) => (
                      <MenuItem
                        value={reasonDetails.reasonCode}
                        classes={{ selected: classes.menuSelected }}
                        key={reasonDetails.reasonCode}
                      >
                        {reasonDetails.description}
                      </MenuItem>
                    ))}
                  </AphSelect>
                </div>
                {selectedReasonCode === 'R000188' && (
                  <div className={classes.formGroup}>
                    <label>Reason for cancelling this order</label>
                    <AphTextField
                      onChange={(e) => setCancelOtherReasonText(e.target.value)}
                      placeholder="Write your reason"
                      inputProps={{ maxLength: 500 }}
                    />
                  </div>
                )}
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
          disabled={
            selectedReasonCode.length === 0 ||
            (selectedReasonCode === 'R000188' && cancelOtherReasonText.trim().length === 0) ||
            selectedReasonCode === 'placeholder' ||
            showLoader
          }
          className={selectedReasonCode.length === 0 ? classes.buttonDisable : ''}
          onClick={() => {
            setShowLoader(true);
            cancelOrderMutation({
              variables: {
                medicineOrderCancelOMSInput: {
                  orderNo: props.orderAutoId,
                  cancelReasonCode: selectedReasonCode,
                  cancelReasonText: cancelOtherReasonText,
                },
              },
            })
              .then((response) => {
                if (
                  response &&
                  response.data &&
                  response.data.cancelMedicineOrderOMS &&
                  response.data.cancelMedicineOrderOMS.orderStatus
                ) {
                  setShowLoader(false);
                  const cancellationResponse = response.data.cancelMedicineOrderOMS.orderStatus;
                  if (cancellationResponse === 'CANCEL_REQUEST') {
                    props.setIsCancelOrderDialogOpen(false);
                    setShowLoader(false);
                    props.setIsPopoverOpen(true);
                  }
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
