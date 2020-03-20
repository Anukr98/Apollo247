import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import {
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
  AphSelect,
} from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { AphCalendar } from 'components/AphCalendar';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    appointmentWrapper: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginTop: 5,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 8,
      },
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      paddingBottom: 8,
      marginBottom: 9,
      '& img': {
        marginRight: 22,
      },
    },
    appointmentInfo: {
      marginTop: 9,
      marginBottom: 14,
    },
    details: {
      display: 'flex',
      marginBottom: 4,
    },
    date: {
      marginLeft: 'auto',
    },
    time: {
      marginLeft: 'auto',
    },
    pickSlot: {
      textAlign: 'right',
      '& button': {
        padding: 0,
        color: '#fc9916',
        boxShadow: 'none',
        fontWeight: 'bold',
        paddingLeft: 20,
        marginLeft: 'auto',
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#fc9916',
        },
      },
    },
    rescheduleButton: {
      paddingTop: 8,
      display: 'flex',
      '& button': {
        color: '#fc9916',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: 'auto',
      },
    },
    wrapperCards: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        color: '#02475b',
        margin: 0,
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    doneButton: {
      padding: 16,
      marginBOttom: 16,
      '& button': {
        width: '100%',
      },
    },
    selectContainer: {
      '& > div': {
        paddingTop: 0,
      },
    },
  };
});

export const AppointmentsSlot: React.FC = (props) => {
  const classes = useStyles({});
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<string>();

  return (
    <div className={classes.root}>
      <div className={classes.appointmentWrapper}>
        <div className={classes.header}>
          <img src={require('images/ic_calendar_show.svg')} alt="" />
          <span>Appointment Slot</span>
        </div>
        <div className={classes.appointmentInfo}>
          <div className={classes.details}>
            <div>Date</div>
            <div className={classes.date}>12 March, 2020</div>
          </div>
          <div className={classes.details}>
            <div>Time</div>
            <div className={classes.time}>8:20 AM </div>
          </div>
        </div>
        <div className={classes.pickSlot}>
          <AphButton onClick={() => setIsUploadPreDialogOpen(true)}>Pick Another Slot</AphButton>
        </div>

        <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
          <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
          <AphDialogTitle>Schedule Appointment</AphDialogTitle>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'55vh'}>
            <div className={classes.wrapperCards}>
              <AphCalendar
                getDate={(dateSelected: string) => setDateSelected(dateSelected)}
                selectedDate={new Date()}
              />
            </div>
            <div className={classes.wrapperCards}>
              <p>Slot</p>
              <div className={classes.selectContainer}>
                <AphSelect>
                  <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                    6:00 am - 6:40 am
                  </MenuItem>
                  <MenuItem value={2}>6:00 am - 6:40 am</MenuItem>
                  <MenuItem value={3}>6:00 am - 6:40 am</MenuItem>
                </AphSelect>
              </div>
            </div>
          </Scrollbars>
          <div className={classes.doneButton}>
            <AphButton color="primary">Done</AphButton>
          </div>
        </AphDialog>
      </div>
    </div>
  );
};
