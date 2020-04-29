import React from 'react';
import { Theme, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'relative',
    },
    formRow: {
      paddingBottom: 16,
    },
    commentsBox: {
      '& label': {
        textTransform: 'uppercase',
        color: '#0087ba',
      },
      '& textarea': {
        borderRadius: 0,
        backgroundColor: 'rgba(216, 216, 216, 0.2)',
        border: 'none',
        marginTop: 8,
        fontSize: 12,
        fontWeight: 500,
        color: 'rgba(1,71,91,0.6)',
        padding: 12,
        minHeight: 58,
      },
    },
    checkboxGroup: {
      paddingTop: 10,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        alignItems: 'center',
        marginLeft: 0,
        '& span': {
          fontSize: 12,
          fontWeight: 500,
          color: '#02475b',
        },
      },
    },
    checkboxRoot: {
      padding: 0,
      marginRight: 5,
      '& svg': {
        width: 24,
        height: 24,
        fill: '##02475b',
      },
    },
    bottomActions: {
      textAlign: 'right',
      '& button': {
        display: 'inline-block',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        color: '#fc9916',
        padding: '0 8px',
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#fc9916',
        },
        '&:last-child': {
          paddingRight: 0,
        },
      },
    },
    buttonDisabled: {
      backgroundColor: 'transparent',
      color: '#fc9916 !important',
      opacity: 0.6,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916 !important',
      },
    },
  };
});

export const CommentsForm: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.formRow}>
        <div className={classes.commentsBox}>
          <AphTextField
            label="Comments"
            multiline
          />
        </div>
      </div>
      <div className={classes.formRow}>
        <AphTextField
          label="Email*"
          placeholder="Add your email"
        />
        <div className={classes.checkboxGroup}>
          <FormControlLabel
            control={
              <Checkbox
                classes={{
                  root: classes.checkboxRoot,
                }}
              />
            }
            label="Mask Email address while posting comment"
          />
        </div>        
      </div>
      <div className={classes.formRow}>
        <AphTextField
          label="Full Name"
          placeholder="Add your name"
        />
      </div>
      <div className={classes.bottomActions}>
        <AphButton
          disabled
          classes={{
            disabled: classes.buttonDisabled,
          }}
        >Cancel</AphButton>
        <AphButton>Post comment</AphButton>
      </div>
    </div>
  );
};
