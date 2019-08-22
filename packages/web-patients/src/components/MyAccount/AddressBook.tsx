import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import { AddressCard } from 'components/MyAccount/AddressCard';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 16,
      marginLeft: 10,
      display: 'flex',
      alignItems: 'center',
      marginRight: 15,
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        paddingBottom: 16,
        marginBottom: 0,
      },
    },
    count: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 5,
      },
    },
    sectionBody: {
      paddingBottom: 20,
      paddingRight: 15,
      paddingLeft: 10,
    },
    bottomActions: {
      boxShadow: '0 -5px 20px 0 #f7f8f5',
      paddingTop: 10,
      paddingLeft: 20,
      paddingRight: 15,
      paddingBottom: 20,
      textAlign: 'center',
      '& button': {
        width: 288,
        borderRadius: 10,
      },
    },
  };
});

export const AddressBook: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        Address Book
        <div className={classes.count}>03</div>
      </div>
      <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 322px)' }}>
        <div className={classes.sectionBody}>
          <AddressCard />
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton color="primary">Add a new Address</AphButton>
      </div>
    </div>
  );
};
