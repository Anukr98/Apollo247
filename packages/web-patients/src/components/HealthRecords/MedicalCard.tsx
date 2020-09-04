import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      padding: 10,
      border: '1px solid #f7f8f5',
      marginBottom: 28,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    doctorInfoGroup: {
      display: 'flex',
    },
    moreIcon: {
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      paddingRight: 16,
      width: 'calc(100% - 24px)',
    },
    doctorName: {
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
      wordBreak: 'break-word',
    },
    consultType: {
      fontSize: 12,
      color: 'rgba(2,71,91,0.6)',
      fontWeight: 500,
    },
    doctorService: {
      paddingTop: 8,
      paddingBottom: 8,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      letterSpacing: 0.04,
      color: '#02475b',
    },
    dialogBody: {
      padding: 20,
      color: '#01475b',
      fontWeight: 500,
      fontSize: 14,
      '& span': {
        fontWeight: 'bold',
      },
    },
    dialogActions: {
      padding: 16,
      textAlign: 'center',
      display: 'flex',
      '& button': {
        flex: 1,
        '&:first-child': {
          marginRight: 10,
        },
      },
    },
    activeCard: {
      border: '1px solid #00b38e',
      position: 'relative',
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: '100%',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        top: '50%',
        borderColor: 'transparent transparent transparent #00b38e',
        borderWidth: 9,
        marginTop: -9,
      },
      '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: '100%',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        top: '50%',
        borderColor: 'transparent transparent transparent #f7f8f5',
        borderWidth: 8,
        marginTop: -8,
        [theme.breakpoints.down('xs')]: {
          borderColor: 'transparent transparent transparent #fff',
        },
      },
    },
  };
});

type MedicalCardProps = {
  name: string;
  source: string;
  type: string;
  isActiveCard: boolean;
  deleteReport: (id: string, type: string) => void;
  id: string;
};

export const MedicalCard: React.FC<MedicalCardProps> = (props) => {
  const classes = useStyles({});
  const [showPopup, setShowPopup] = useState<boolean>(false);

  return (
    <div className={`${classes.root} ${props.isActiveCard ? classes.activeCard : ''}`}>
      <div className={classes.doctorInfoGroup}>
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>{props.name}</div>
        </div>
      </div>
      {props.source && props.source !== '-' && (
        <div className={classes.consultType}>{props.source}</div>
      )}
      <AphDialog
        open={showPopup}
        disableBackdropClick
        disableEscapeKeyDown
        onClose={() => setShowPopup(false)}
        maxWidth="sm"
      >
        <AphDialogTitle>Delete Report</AphDialogTitle>
        <div className={classes.dialogBody}>
          Are you sure you want to delete the selected record?
        </div>
        <div className={classes.dialogActions}>
          <AphButton
            color="default"
            onClick={() => {
              setShowPopup(false);
            }}
            autoFocus
          >
            Cancel
          </AphButton>
          <AphButton
            color="primary"
            onClick={() => {
              props.deleteReport(props.id, props.type);
              setShowPopup(false);
            }}
            autoFocus
          >
            Ok
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
