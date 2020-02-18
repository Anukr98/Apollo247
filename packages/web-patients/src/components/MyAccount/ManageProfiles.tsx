import { Theme, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useRef, useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { AddNewProfile } from 'components/MyAccount/AddNewProfile';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      padding: '20px 5px 0 5px',
    },
    profileCard: {
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      padding: 16,
      display: 'flex',
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 10,
      cursor: 'pointer',
    },
    profileImg: {
      marginRight: 16,
      width: 80,
      height: 80,
      borderRadius: '50%',
      overflow: 'hidden',
      '& img': {
        maxWidth: 80,
      },
    },
    profileGroup: {
      width: 'calc(100% - 96px)',
    },
    userTopGroup: {
      display: 'flex',
      alignItems: 'center',
    },
    userName: {
      fontSize: 18,
      color: '#02475b',
      fontWeight: 600,
    },
    rightGroup: {
      marginLeft: 'auto',
      fontSize: 12,
      fontWeight: 500,
    },
    userBottomGroup: {
      display: 'flex',
      alignItems: 'center',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 6,
      marginTop: 6,
    },
    userId: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
    },
    userInfo: {
      color: '#0087ba',
    },
    bottomActions: {
      padding: 20,
      textAlign: 'center',
      '& button': {
        minWidth: 240,
      },
    },
    customScroll: {
      padding: '0 15px',
    },
    moreIcon: {
      position: 'absolute',
      right: 0,
      top: -2,
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    deleteBtn: {
      textTransform: 'none',
      color: '#02475b',
      fontSize: 16,
      fontWeight: 500,
    },
  };
});


export const ManageProfiles: React.FC = (props) => {
  const classes = useStyles({});
  const cancelAppointRef = useRef(null);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = React.useState<boolean>(false);
  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'100vh - 265px'}>
        <div className={classes.customScroll}>
          <div className={classes.profileCard}>
            <div className={classes.profileImg}>
              <img src={require('images/dp_06.png')} alt="" />
            </div>
            <div className={classes.profileGroup}>
              <div className={classes.userTopGroup}>
                <div className={classes.userName}>Surj Gupta</div>
                <div className={classes.rightGroup}><div className={classes.userInfo}>SELF | MALE | 31</div></div>
              </div>
              <div className={classes.userBottomGroup}>
                <div className={classes.userId}>UHID : APD2.0010783430</div>
                <div className={classes.rightGroup}>DOB : 18 Nov, 1989</div>
              </div>
            </div>
          </div>
          <div className={classes.profileCard}>
            <div className={classes.profileImg}>
              <img src={require('images/dp_03.png')} alt="" />
            </div>
            <div className={classes.profileGroup}>
              <div className={classes.userTopGroup}>
                <div className={classes.userName}>Preeti Gupta</div>
                <div className={classes.rightGroup}><div className={classes.userInfo}>WIFE   |   FEMALE   |   29</div></div>
              </div>
              <div className={classes.userBottomGroup}>
                <div className={classes.userId}>UHID : APD2.0010783430</div>
                <div className={classes.rightGroup}>DOB : 08 Oct, 1991</div>
              </div>
            </div>
          </div>
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton onClick={() => setIsAddNewProfileDialogOpen(true)} color="primary">
          Add New Profile
        </AphButton>
      </div>
      <AphDialog open={isAddNewProfileDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAddNewProfileDialogOpen(false)} />
        <AphDialogTitle>
          Add New Profile
          <div
            onClick={() => setIsDeletePopoverOpen(true)}
            ref={cancelAppointRef}            
            className={classes.moreIcon}>
            <img src={require('images/ic_more.svg')} alt="" />
          </div>
        </AphDialogTitle>
        <AddNewProfile />
      </AphDialog>
      <Popover
        open={isDeletePopoverOpen}
        anchorEl={cancelAppointRef.current}
        onClose={() => setIsDeletePopoverOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <AphButton className={classes.deleteBtn}>
          Delete Profile
        </AphButton>
      </Popover>
    </div>
  );
};
