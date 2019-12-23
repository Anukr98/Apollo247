import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { SettingsCard } from 'components/Notifications/SettingsCard';

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
      position: 'relative',
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
    dialogContent: {
      paddingTop: 10,
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
    moreIcon: {
      position: 'absolute',
      right: 0,
      bottom: 2,
      cursor: 'pointer',
    },
  };
});

export const Settings: React.FC = (props) => {
  const classes = useStyles({});
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        Notification Settings
        <div className={classes.moreIcon}>
          <img src={require('images/ic_more.svg')} alt="" />
        </div>
      </div>
      <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 322px)' }}>
        <div className={classes.sectionBody}>
          <SettingsCard />
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton onClick={() => setIsAddAddressDialogOpen(true)} color="primary">
          Add a new Address
        </AphButton>
      </div>
      <AphDialog open={isAddAddressDialogOpen} maxWidth="sm">
        <AphDialogTitle>Add New Address</AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <AddNewAddress setIsAddAddressDialogOpen={setIsAddAddressDialogOpen} />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton color="primary">Save</AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
