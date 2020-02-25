import { Theme, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useRef, useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { AddNewProfile } from 'components/MyAccount/AddNewProfile';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useAllCurrentPatients } from 'hooks/authHooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import moment from 'moment';
import { useAuth } from 'hooks/authHooks';
import { MascotWithMessage } from '../MascotWithMessage';
import { DELETE_PROFILE } from 'graphql/profiles';
import { useMutation } from 'react-apollo-hooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      padding: '20px 5px 0 5px',
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
        boxShadow: 'none',
        backgroundColor: 'transparent',
        minHeight: 'auto',
      },
      [theme.breakpoints.up(768)]: {
        minHeight: 'calc(100vh - 195px)',
      },
      [theme.breakpoints.up(901)]: {
        minHeight: 'calc(100vh - 154px)',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
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
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
      },
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
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 6,
      marginTop: 6,
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
      },
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
    scrollBars: {
      [theme.breakpoints.down('xs')]: {
        maxHeight: '100% !important',
        '& >div': {
          maxHeight: '100% !important',
        },
        '& >div:nth-child(2)': {
          display: 'none',
        },
        '& >div:nth-child(3)': {
          display: 'none',
        },
      },
      [theme.breakpoints.up(768)]: {
        maxHeight: 'calc(100vh - 278px) !important',
        '& >div': {
          maxHeight: 'calc(100vh - 278px) !important',
        },
      },
      [theme.breakpoints.up(901)]: {
        maxHeight: 'calc(100vh - 236px) !important',
        '& >div': {
          maxHeight: 'calc(100vh - 236px) !important',
        },
      },
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
  };
});

export const ManageProfiles: React.FC = (props) => {
  const classes = useStyles({});
  const cancelAppointRef = useRef(null);
  const profileCreateMessage = 'Profile created successfully.';
  const profileUpdateMessage = 'Profile updated successfully.';
  const profileDeleteMessage = 'Profile deleted successfully.';

  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = useState<boolean>(false);
  const [updatingPatientId, setUpdatingPatientId] = useState<string>('');
  const [isProfileDelete, setIsProfileDelete] = useState<boolean>(false);

  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const { allCurrentPatients } = useAllCurrentPatients();
  const { isSigningIn } = useAuth();

  const deleteProfileMutation = useMutation(DELETE_PROFILE);

  return isSigningIn ? (
    <div className={classes.circlularProgress}>
      <CircularProgress />
    </div>
  ) : (
    <div className={classes.root}>
      <Scrollbars
        autoHide={true}
        autoHeight
        className={classes.scrollBars}
        renderView={(props) =>
          isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
        }
      >
        {allCurrentPatients &&
          allCurrentPatients.map((accountDetails) => {
            const firstName = _startCase(
              _toLower(accountDetails && accountDetails.firstName ? accountDetails.firstName : '')
            );
            const lastName = _startCase(
              _toLower(accountDetails && accountDetails.lastName ? accountDetails.lastName : '')
            );
            const relation = accountDetails.relation === 'ME' ? 'SELF' : accountDetails.relation;
            const gender = accountDetails && accountDetails.gender ? accountDetails.gender : null;
            const uhid = accountDetails.uhid;
            const age =
              accountDetails && accountDetails.dateOfBirth
                ? moment().diff(accountDetails.dateOfBirth, 'years')
                : null;
            const dob =
              accountDetails && accountDetails.dateOfBirth ? accountDetails.dateOfBirth : null;
            const photoUrl = accountDetails && accountDetails.photoUrl;
            const userId = accountDetails && accountDetails.id;

            return (
              <div
                className={classes.customScroll}
                onClick={() => {
                  setIsAddNewProfileDialogOpen(true);
                  setUpdatingPatientId(userId);
                }}
              >
                <div className={classes.profileCard}>
                  <div className={classes.profileImg}>
                    <img src={photoUrl ? photoUrl : require('images/no_photo.png')} alt="" />
                  </div>
                  <div className={classes.profileGroup}>
                    <div className={classes.userTopGroup}>
                      <div className={classes.userName}>{`${firstName} ${lastName}`}</div>
                      <div className={classes.rightGroup}>
                        <div className={classes.userInfo}>
                          {gender && age ? (
                            <>{`${relation} | ${gender} | ${age}`}</>
                          ) : (
                            `${relation}`
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={classes.userBottomGroup}>
                      <div className={classes.userId}>UHID : {uhid}</div>
                      <div className={classes.rightGroup}>
                        {dob ? `DOB : ${moment(dob).format('DD MMM, YYYY')}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton
          onClick={() => {
            setIsAddNewProfileDialogOpen(true);
            setUpdatingPatientId('');
          }}
          color="primary"
        >
          Add New Profile
        </AphButton>
      </div>
      <AphDialog open={isAddNewProfileDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAddNewProfileDialogOpen(false)} />
        <AphDialogTitle>
          {updatingPatientId.length > 0 ? 'Update Profile' : 'Add New Profile'}
          {/* {updatingPatientId.length > 0 ? (
            <div
              onClick={() => setIsDeletePopoverOpen(true)}
              ref={cancelAppointRef}
              className={classes.moreIcon}
            >
              <img src={require('images/ic_more.svg')} alt="" />
            </div>
          ) : null} */}
        </AphDialogTitle>
        <AddNewProfile
          closeHandler={(isAddNewProfileDialogOpen: boolean) =>
            setIsAddNewProfileDialogOpen(isAddNewProfileDialogOpen)
          }
          selectedPatientId={updatingPatientId}
          successHandler={(isPopoverOpen: boolean) => setIsPopoverOpen(isPopoverOpen)}
          isProfileDelete={isProfileDelete}
        />
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
        <AphButton
          className={classes.deleteBtn}
          onClick={() => {
            setIsProfileDelete(true);
            deleteProfileMutation({ variables: { patientId: updatingPatientId } })
              .then(() => {
                setIsAddNewProfileDialogOpen(false);
                setIsDeletePopoverOpen(false);
                setIsPopoverOpen(true);
              })
              .catch(() => {
                setIsProfileDelete(false);
                alert('An error occurred while deleting profile.');
              });
          }}
        >
          Delete Profile
        </AphButton>
      </Popover>
      <Popover
        open={isPopoverOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <MascotWithMessage
          messageTitle=""
          message={
            updatingPatientId.length > 0
              ? isProfileDelete
                ? profileDeleteMessage
                : profileUpdateMessage
              : profileCreateMessage
          }
          closeButtonLabel="OK"
          closeMascot={() => {
            setIsPopoverOpen(false);
            if (updatingPatientId.length === 0 || isProfileDelete) {
              window.location.reload(true);
            }
          }}
        />
      </Popover>
    </div>
  );
};
