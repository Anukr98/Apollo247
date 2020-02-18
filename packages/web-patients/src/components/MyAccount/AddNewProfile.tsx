import { Theme, FormControl, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphTextField, AphSelect } from '@aph/web-ui-components';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    dialogContent: {
      paddingTop: 20,
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
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 20,
      paddingTop: 30,
    },
    shadowHide: {
      overflow: 'hidden',
    },
    profileForm: {
      borderRadius: 10,
      backgroundColor: '#f7f8f5',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: 10,
      position: 'relative',
    },
    formControl: {
      marginBottom: 25,
      width: '100%',
      '& label': {
        fontSize: 14,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
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
        maxWidth: '100%'
      },
    },
    uploadInput: {
      display: 'none'
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
  };
});

export const AddNewProfile: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.shadowHide}>
        <div className={classes.dialogContent}>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'48vh'}>
            <div className={classes.customScrollBar}>
              <div className={classes.profileForm}>
                <div className={classes.uploadImage}>
                  <input
                    accept="image/*"
                    className={classes.uploadInput}
                    id="upload-prifile-photo"
                    type="file"
                  />
                  <label className={classes.profileCircle} htmlFor="upload-prifile-photo">
                    <img src={require('images/ic_account.svg')} />
                  </label>
                  <label className={classes.editBtn} htmlFor="upload-prifile-photo">
                    <img src={require('images/ic-edit-white.svg')} />  
                  </label>
                </div>
                <FormControl
                  className={`${classes.formControl} ${classes.noMargin}`}
                  fullWidth
                >
                  <AphTextField
                    label="Full Name"
                    placeholder="First Name"
                    inputProps={{ maxLength: 20 }}
                  />
                </FormControl>
                <FormControl
                  className={`${classes.formControl}`}
                  fullWidth
                >
                  <AphTextField
                    placeholder="Last name"
                    inputProps={{ maxLength: 20 }}
                  />
                </FormControl>
                <FormControl className={classes.formControl} fullWidth>
                  <AphTextField
                    label="Date Of Birth"
                    placeholder="dd/mm/yyyy"
                    inputProps={{ type: 'text', maxLength: 10 }}
                  />
                </FormControl>
                <FormControl className={classes.formControl}>
                  <label>Gender</label>
                  <Grid container spacing={2} className={classes.btnGroup}>
                    <Grid item xs={4} sm={4}>
                      <AphButton
                        color="secondary"
                        className={`${classes.genderBtns} ${classes.btnActive}`}
                      >
                        Male
                      </AphButton>
                    </Grid>
                    <Grid item xs={4} sm={4}>
                      <AphButton
                        color="secondary"
                        className={`${classes.genderBtns}`}
                      >
                        Female
                      </AphButton>
                    </Grid>
                  </Grid>
                </FormControl>
                <FormControl
                  className={`${classes.formControl} ${classes.relationMenu}`}
                  fullWidth
                >
                  <label>Relation</label>
                  <AphSelect>
                    <MenuItem
                      classes={{ selected: classes.menuSelected }}
                    >
                      Me
                    </MenuItem>
                    <MenuItem
                      classes={{ selected: classes.menuSelected }}
                    >
                      Mother
                    </MenuItem>
                    ))}
                  </AphSelect>
                </FormControl>
                <FormControl
                  className={`${classes.formControl} ${classes.noMargin}`}
                  fullWidth
                >
                  <AphTextField
                    label="Email Address (Optional)"
                    placeholder="name@email.com"
                  />
                </FormControl>
              </div>
            </div>
          </Scrollbars>
        </div>
        <div className={classes.dialogActions}>
          <AphButton>Cancel</AphButton>
          <AphButton color="primary">Save</AphButton>
        </div>
      </div>
    </div>
  );
};
