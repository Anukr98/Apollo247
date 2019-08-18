import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
import React from 'react';
import { AphSelect, AphTextField } from '@aph/web-ui-components';

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
      padding: 10,
      paddingTop: 0,
      paddingBottom: 5,
      marginBottom: 10,
    },
    formGroup: {
      paddingBottom: 10,
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
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
  };
});

export const AddNewAddress: React.FC = (props) => {
  const classes = useStyles();
  const [name] = React.useState(1);

  return (
    <div className={classes.root}>
      <div className={classes.addressGroup}>
        <div className={classes.formGroup}>
          <AphSelect
            value={name}
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
            <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
              Surj Gupta
            </MenuItem>
          </AphSelect>
        </div>
        <div className={classes.formGroup}>
          <AphTextField placeholder="+91 9769354407" value="+91 9769354407" />
        </div>
        <div className={classes.formGroup}>
          <AphTextField placeholder="Address Line 1" value="" />
        </div>
        <div className={classes.formGroup}>
          <AphTextField placeholder="500033" value="500033" />
        </div>
        <div className={classes.formGroup}>Jubilee Hills, Hyderabad, Telangana</div>
      </div>
    </div>
  );
};
