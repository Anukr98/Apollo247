import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { UserInputInterface } from 'components/MyAccount/AddNewProfile';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    dialogContent: {
      paddingTop: 0,
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      textAlign: 'center',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        flexGrow: 1,
        '&:first-child': {
          color: '#fca532',
          marginRight: 10,
        },
        '&:last-child': {
          marginLeft: 10,
        },
      },
    },
    customScrollBar: {
      padding: '5px 20px 20px 20px',
    },
    shadowHide: {
      overflow: 'hidden',
    },
    profileForm: {
      borderRadius: 10,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      padding: 10,
      position: 'relative',
    },
    formControl: {
      marginBottom: 25,
      width: '100%',
      '& label': {
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        color: '#A4A4A4',
        transform: 'none',
      },
    },
    noMargin: {
      marginBottom: 5,
    },
    btnGroup: {
      paddingTop: 7,
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: theme.palette.common.white,
        fontSize: 16,
        fontWeight: 500,
      },
    },
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    genderBtns: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: '7px 13px 7px 13px',
      textTransform: 'none',
      borderRadius: 10,
      '&:disabled': {
        color: '#eaeaea !important',
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    relationMenu: {
      '& >div': {
        marginTop: 0,
        paddingTop: 0,
      },
    },
    uploadImage: {
      position: 'absolute',
      right: 20,
      top: -30,
      zIndex: 1,
    },
    profileCircle: {
      position: 'relative',
      width: 65,
      height: 65,
      borderRadius: '50%',
      backgroundColor: '#b2c7cd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      overflow: 'hidden',
      '& img': {
        maxWidth: '100%',
      },
    },
    uploadInput: {
      display: 'none',
    },
    editBtn: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: '#01475b',
      height: 24,
      width: 24,
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
      '& img': {
        maxWidth: 13,
        verticalAlign: 'middle',
      },
    },
    showMessage: {
      opacity: 1.0,
    },
    hideMessage: {
      opacity: 0,
    },
    saveButton: {
      backgroundColor: '#fcb716',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#fcb716',
        color: '#fff',
      },
    },
    saveBtnDisable: {
      backgroundColor: '#fcb716',
      color: '#fff',
      opacity: 0.5,
    },
    warningMsg: {
      color: '#0087BA',
      fontWeight: 500,
      fontSize: 11,
      lineHeight: '16px',
      position: 'absolute',
      top: -29,
      left: 20,
      width: '65%',
    },
    disabledFields: {
      '& input': {
        opacity: '0.5',
        pointerEvents: 'none',
      },
      '& button': {
        opacity: '0.5',
        pointerEvents: 'none',
      },
    },

    addnewMemberBtn: {
      color: '#FC9916',
      margin: '0 20px 10px 10px',
      fontSize: 13,
      lineHeight: '24px',
      fontWeight: 'bold',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    disabledInput: {
      '& label': {
        color: '#02475b !important',
      },
      '& input': {
        opacity: '0.5 !important',
      },
    },
    inputRoot: {
      '&:before': {
        borderBottom: 'none !important',
      },
    },
    confirmContent: {
      marginBottom: 20,
      '& h3': {
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        color: '#A4A4A4',
        marginBottom: 5,
      },
      '& h4': {
        color: '#0087BA',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        borderTop: '0.4px solid #CECECE',
        paddingTop: 15,
      },
      '& h5': {
        fontWeight: 500,
        fontSize: 18,
        lineHeight: '24px',
        color: '#01475B',
        margin: 0,
      },
    },
  };
});

interface AddNewProfileProps {
  successHandler: () => void;
  handleEdit: () => void;
  userInput: UserInputInterface;
}

export const AddNewProfileConfirm: React.FC<AddNewProfileProps> = (props) => {
  const classes = useStyles({});
  const { successHandler, userInput } = props;
  return (
    <div className={classes.root}>
      <div className={classes.shadowHide}>
        <div className={classes.dialogContent}>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'52vh'}>
            <div className={classes.customScrollBar}>
              <div className={classes.profileForm}>
                <div className={classes.confirmContent}>
                  <h3>Full Name</h3>
                  <h5>
                    {userInput.firstName} {userInput.lastName}
                  </h5>
                </div>
                <div className={classes.confirmContent}>
                  <h3>Date Of Birth</h3>
                  <h5>{userInput.dateOfBirth}</h5>
                </div>
                <div className={classes.confirmContent}>
                  <h3>Gender</h3>
                  <h5>
                    <AphButton
                      color="secondary"
                      disabled={true}
                      className={`${classes.genderBtns} ${classes.btnActive}`}
                    >
                      {userInput.gender}
                    </AphButton>
                  </h5>
                </div>
                <div className={classes.confirmContent}>
                  <h3>Relation</h3>
                  <h5>{userInput.relation}</h5>
                </div>
                <div className={classes.confirmContent}>
                  <h3>Email Address (Optional)</h3>
                  <h5>{userInput.emailAddress}</h5>
                </div>
                <div className={classes.confirmContent}>
                  <h4>
                    You cannot edit these details once you have saved them. They will appear on all
                    your medical documents. Do you wish to confirm?
                  </h4>
                </div>
              </div>
            </div>
          </Scrollbars>
        </div>
        <div className={classes.dialogActions}>
          <AphButton onClick={() => props.handleEdit()}>EDIT</AphButton>
          <AphButton
            color="primary"
            className={classes.saveButton}
            onClick={() => successHandler()}
          >
            CONFIRM
          </AphButton>
        </div>
      </div>
    </div>
  );
};
