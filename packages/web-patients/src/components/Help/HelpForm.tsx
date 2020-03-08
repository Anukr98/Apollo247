import React from 'react';
import { Theme, Typography, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphTextField, AphSelect } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        borderRadius: 0,
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        margin: 0,
      },
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    customScrollBar: {
      height: '65vh',
      overflow: 'auto',
    },
    contentGroup: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
      '& h2': {
        fontSize: 18,
        fontWeight: 600,
      },
    },
    formGroup: {
      paddingTop: 8,
      paddingBottom: 8,
    },
    buttonGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      marginLeft: -5,
      marginRight: -5,
      '& button': {
        margin: 5,
        fontSize: 16,
        lineHeight: '16px',
        padding: 12,
        textTransform: 'none',
        color: '#00b38e',
        fontWeight: 500,
        borderRadius: 10,
      },
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: '#fff !important',
      '&:hover': {
        backgroundColor: '#00b38e',
        color: '#fff !important',
      },
    },
    formRow: {
      marginBottom: 20,
      '&:last-child': {
        marginBottom: 0,
      },
      '& label': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginBottom: 8,
        display: 'block',
      },
    },
    selectRoot: {
      marginTop: -15,
    },
    inputRoot: {
      paddingTop: 5,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    bottomActions: {
      display: 'flex',
      padding: 20,
      '& button': {
        flexGrow: 1,
        borderRadius: 10,
        '&:first-child': {
          color: '#fc9916',
        },
        '&:last-child': {
          marginLeft: 10,
        },
      },
    },
  };
});

export const HelpForm: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.mascotIcon}>
        <img src={require('images/ic-mascot.png')} alt="" />
      </div>
      <div className={classes.customScrollBar}>
        <div className={classes.contentGroup}>
          <Typography variant="h2">Hi! :)</Typography>
          <div className={classes.formGroup}>
            <div className={classes.formRow}>
              <label>What do you need help with?</label>
              <div className={classes.buttonGroup}>
                <AphButton color="secondary" className={classes.buttonActive}>
                  Pharmacy
                </AphButton>
                <AphButton color="secondary">Online Consult</AphButton>
                <AphButton color="secondary">Health Records</AphButton>
                <AphButton color="secondary">Physical Consult</AphButton>
                <AphButton color="secondary">Something else</AphButton>
              </div>
            </div>
            <div className={classes.formRow}>
              <label>Please select a reason that best matches your query</label>
              <div className={classes.selectRoot}>
                <AphSelect>
                  <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                    Reason 01
                  </MenuItem>
                  <MenuItem value={2}>Reason 02</MenuItem>
                  <MenuItem value={3}>Reason 03</MenuItem>
                </AphSelect>
              </div>
            </div>
            <div className={classes.formRow}>
              <label>any other comments (optional)?</label>
              <div className={classes.inputRoot}>
                <AphTextField placeholder="Write your query here…" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.bottomActions}>
        <AphButton>Reset</AphButton>
        <AphButton color="primary">Submit</AphButton>
      </div>
    </div>
  );
};
