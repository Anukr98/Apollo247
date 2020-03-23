import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { createMuiTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    dialogBox: {
      '& > div': {
        display: 'flex',
        '& div': {
          marginTop: 0,
        },
      },
    },
    backDrop: {
      backgroundColor: 'transparent',
    },
    defaultWrapper: {
      width: 466,
      boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.5)',
      backgroundColor: '#f7f8f5',
      textAlign: 'center',
      borderRadius: 10,
      '& h3': {
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        padding: 15,
        fontSize: 16,
        fontWeight: 500,
        color: '#ffffff',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        margin: 0,
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 26,
        marginTop: 0,
      },
      '& button': {
        minWidth: 106,
        fontSize: 13,
        fontWeight: 600,
        padding: '2px 13px',
      },
    },
    errorAlertWrapper: {
      '& h3': {
        backgroundColor: '#890000',
      },
      '& p': {
        color: '#890000',
      },
      '& button': {
        '&:first-child': {
          color: '#890000',
        },
        '&:last-child': {
          backgroundColor: '#890000',
          color: '#fff',
        },
      },
    },
    successAlertWrapper: {
      '& h3': {
        backgroundColor: '#00b38e',
      },
      '& p': {
        color: '#00b38e',
      },
      '& button': {
        '&:first-child': {
          color: '#00b38e',
        },
        '&:last-child': {
          backgroundColor: '#00b38e',
          color: '#fff',
        },
      },
    },
    contentWrapper: {
      padding: 22,
    },
    buttonsWrapper: {
      display: 'flex',
      justifyContent: 'space-evenly',
    },
  };
});
export const Alerts: React.FC = (props) => {
  const classes = useStyles({});
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(true);
  return (
    <div>
      <AphDialog
        className={classes.dialogBox}
        open={isAlertOpen}
        maxWidth="md"
        BackdropProps={{
          classes: {
            root: classes.backDrop,
          },
        }}
      >
        <div
          className={`${classes.defaultWrapper} ${classes.errorAlertWrapper} ${classes.successAlertWrapper}`}
        >
          <h3>Success</h3>
          <div className={classes.contentWrapper}>
            <p>The file was uploaded successfully.</p>
            <div className={classes.buttonsWrapper}>
              <AphButton onClick={() => setIsAlertOpen(false)} title={'Close'}>
                Ignore
              </AphButton>
              <AphButton onClick={() => setIsAlertOpen(false)} title={'Close'}>
                Done
              </AphButton>
            </div>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
