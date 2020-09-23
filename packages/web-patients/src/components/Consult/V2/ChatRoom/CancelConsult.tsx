import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import React from 'react';
import { AphSelect, AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

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
  setIsCancelConsultationDialogOpen: (isCancelConsultationDialogOpen: boolean) => void;
  cancelAppointmentApi: () => void;
  setCancelReasonText: (cancelReasonText: string) => void;
}

export const CancelConsult: React.FC<CancelOrderProps> = (props) => {
  const classes = useStyles({});

  const [selectedReasonCode, setSelectedReasonCode] = React.useState<string>('placeholder');

  const cancelReasonList = [
    'Doctor did not join the consult',
    'Booked with wrong user details',
    'Doctor denied your prefarable mode of consult',
    'Audio Video Issues',
    'Others (Please specify)',
  ];

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <div className={classes.addressGroup}>
                <div className={classes.formGroup}>
                  <label>Why are you cancelling this consultation?</label>
                  <AphSelect
                    value={selectedReasonCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const reasonCode = e.target.value as string;
                      setSelectedReasonCode(reasonCode);
                      props.setCancelReasonText(reasonCode);
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
                    {cancelReasonList.map((reason) => (
                      <MenuItem
                        value={reason}
                        classes={{ selected: classes.menuSelected }}
                        key={reason}
                      >
                        {reason}
                      </MenuItem>
                    ))}
                  </AphSelect>
                </div>
                <div className={classes.formGroup}>
                  <label>Add Comments (Optional)</label>
                  <AphTextField
                    onChange={(e) => props.setCancelReasonText(e.target.value)}
                    placeholder="Enter your comments here…"
                  />
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.dialogActions}>
        <AphButton
          disabled={selectedReasonCode.length === 0 || selectedReasonCode === 'placeholder'}
          className={
            selectedReasonCode.length === 0 || selectedReasonCode === 'placeholder'
              ? classes.buttonDisable
              : ''
          }
          onClick={() => {
            props.cancelAppointmentApi();
            props.setIsCancelConsultationDialogOpen(false);
          }}
          color="primary"
        >
          {'Submit Request'}
        </AphButton>
      </div>
    </div>
  );
};
