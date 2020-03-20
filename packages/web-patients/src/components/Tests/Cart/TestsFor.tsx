import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import { AphSelect, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: '0 14px 10px 14px',
      marginBottom: 10,
      position: 'relative',
    },
    medicineInformation: {
      paddingRight: 10,
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
    testsInfo: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      paddingTop: 8,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& ul': {
        padding: '10px 20px',
        maxHeight: '65vh',
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
          '&:first-child': {
            borderBottom: 'none',
            padding: 0,
          },
        },
      },
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      marginLeft: 30,
      paddingBottom: 0,
      paddingRight: 0,
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

export const TestsFor: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        <span>Who Are These Tests For?</span>
      </div>
      <div className={classes.medicineStrip}>
        <div className={classes.medicineInformation}>
          <AphSelect>
            <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
              Surj
            </MenuItem>
            <MenuItem value={2} classes={{ selected: classes.menuSelected }}>
              Preeti
            </MenuItem>
            <MenuItem value={3} classes={{ selected: classes.menuSelected }}>
              Gaurav
            </MenuItem>
            <MenuItem classes={{ selected: classes.menuSelected }}>
              <AphButton
                color="primary"
                classes={{ root: classes.addMemberBtn }}
                title={'Add New Profile'}
              >
                Add New Profile
              </AphButton>
            </MenuItem>
          </AphSelect>
          <div className={classes.testsInfo}>
            All the tests must be for one person. Tests for multiple profiles will require separate
            purchases.
          </div>
        </div>
      </div>
    </div>
  );
};
