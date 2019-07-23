import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import React from 'react';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    consultGroup: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.text.primary,
      padding: 15,
      marginTop: 10,
      marginBottom: 10,
      display: 'inline-block',
      width: '100%',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.35,
      color: theme.palette.secondary.light,
      '& p': {
        marginTop: 0,
      },
    },
    actions: {
      paddingTop: 10,
      paddingBottom: 10,
      marginLeft: -8,
      marginRight: -8,
    },
    button: {
      fontSize: 16,
      fontWeight: 500,
      marginLeft: 8,
      marginRight: 8,
      textTransform: 'none',
      borderRadius: 10,
      paddingLeft: 10,
      paddingRight: 10,
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
    bottomActions: {
      padding: '30px 15px 15px 15px',
    },
    customScrollBar: {
      paddingTop: 10,
      paddingBottom: 10,
      height: '50vh',
      overflow: 'auto',
    },
    timeSlots: {
      paddingTop: 5,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontWeight: 600,
    },
    selectedAddress: {
      paddingTop: 20,
      paddingBottom: 15,
      display: 'flex',
    },
    clinicAddress: {
      fontSize: 13,
      fontWeight: 500,
      color: '#01475b',
      lineHeight: 1.54,
      letterSpacing: 0.33,
      paddingRight: 20,
      width: '78%',
    },
    clinicDistance: {
      marginLeft: 'auto',
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
      lineHeight: 1.54,
      letterSpacing: 0.33,
      borderLeft: '1px solid rgba(0,0,0,0.2)',
      paddingLeft: 15,
      width: '22%',
      textAlign: 'right',
    },
  };
});

export const VisitClinic: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.customScrollBar}>
        <div className={classes.consultGroup}>
          <AphCalendar />
        </div>
        <div className={`${classes.consultGroup} ${classes.timeSlots}`}>
          <AphSelect value="Apollo Hospital">
            <MenuItem classes={{ selected: classes.menuSelected }}>Apollo Hospital</MenuItem>
          </AphSelect>
          <div className={classes.selectedAddress}>
            <div className={classes.clinicAddress}>Road No 72, Film Nagar, Jubilee Hills</div>
            <div className={classes.clinicDistance}>
              <img src={require('images/ic_location.svg')} alt="" />
              <br />
              2.5 Kms
            </div>
          </div>
          <DayTimeSlots />
        </div>
      </div>
      <div className={classes.bottomActions}>
        <AphButton fullWidth color="primary">
          PAY Rs. 499
        </AphButton>
      </div>
    </div>
  );
};
