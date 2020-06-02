import React, { useState, useEffect } from 'react';
import { Theme, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import { SUBMIT_JD_CASESHEET } from 'graphql/appointments';
import { useApolloClient, useMutation } from 'react-apollo-hooks';
import { withRouter } from 'react-router-dom';
import { SubmitJdCasesheet, SubmitJdCasesheetVariables } from 'graphql/types/SubmitJdCasesheet';

const useStyles = makeStyles((theme: Theme) => {
  return {
    popoverTile: {
      fontSize: '18px',
      fontWeight: 500,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.33',
      letterSpacing: 'normal',
      color: '#02475b',
    },

    confirmation: {
      fontSize: '16px',
      fontWeight: 500,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: '1.25',
      letterSpacing: 'normal',
      color: 'rgba(0, 0, 0, 0.6)',
      marginTop: '24px',
    },
    message: {
      fontSize: '13px',
      fontWeight: 'normal',
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: 'rgba(0, 0, 0, 0.6)',
      marginTop: '16px',
    },
    dialogBox: {
      width: '400px',
      borderRadius: '10px',
      boxShadow: '0 5px 30px 0 rgba(0, 0, 0, 0.25)',
      backgroundColor: '#ffffff',
      paddingBottom: 30,
    },
    modalWrapper: {
      marginTop: '12px',
      marginLeft: '20px',
      height: '77%',
      marginRight: '20px',
    },
    modal: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    button: {
      minWidth: 130,
      fontSize: 13,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      // margin: theme.spacing(0, 1, 0, 1),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
      '&:disabled': {
        color: '#fc9916',
        opacity: 0.7,
      },
    },

    ApptTypeStyle: {
      fontSize: 15,
      paddingLeft: 10,
    },
    yesButton: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#fc9916',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#fc9916',
      },
      marginLeft: 20,
      width: '210px',
    },
    oKButton: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#fc9916',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#fc9916',
      },
    },

    buttonWrapper: {
      marginTop: '25px',
      textAlign: 'right',
    },
    cross: {
      marginTop: '16px',
      marginLeft: '85%',
    },
    paper: {
      transform: 'translate(-50%,-50%) !important',
      top: '50% !important',
      left: '50% !important',
    },
  };
});

export interface ModalContent {
  headerText: string;
  confirmationText: string;
  messageText: string;
  appointmentId: string;
  patientId: string;
}

export const modalData = {
  questionNotField: {
    headerText:
      'The Patient’s vitals and the completed case sheet haven’t been submitted for this appointment yet.',
    confirmationText: 'Do you still want to start this consultation?',
    messageText:
      'When you start the consult, we will notify the patient to join the consult room. Please allow the patient a few minutes to join. ',
  },

  jdPending: {
    headerText: 'Junior Doctor consultation hasn’t been initiated for this appointment yet.',
    confirmationText: 'Do you still want to start this consultation?',
    messageText:
      'When you start the consult, we will notify the patient to join the consult room. Please allow the patient a few minutes to join.',
  },

  jdInProgress: {
    headerText:
      'The Junior Doctor consultation is currently in progress for this appointment. You will be able to start this consult shortly..',
    confirmationText: '',
    messageText: '',
  },
};

export const defaultText = {
  headerText: '',
  confirmationText: '',
  messageText: '',
  appointmentId: '',
  patientId: '',
};

const StatusModal = (props: any) => {
  const apolloClient = useApolloClient();
  const classes = useStyles({});
  let text = props.text;

  return (
    <Popover
      open={props.isDialogOpen}
      onClose={props.onClose}
      disableBackdropClick
      disableEscapeKeyDown
      className={classes.modal}
      classes={{ paper: classes.paper }}
    >
      <div className={classes.dialogBox}>
        <Button className={classes.cross}>
          <img src={require('images/ic_cross.svg')} alt="" onClick={props.onClose} />
        </Button>
        <div className={classes.modalWrapper}>
          <div className={classes.popoverTile}>{text.headerText}</div>
          <div className={classes.confirmation}>{text.confirmationText}</div>
          <div className={classes.message}>{text.messageText}</div>
          <div className={classes.buttonWrapper}>
            <Button
              className={
                props.messageText !== '' ? classes.button : `${classes.button} ${classes.oKButton}`
              }
              onClick={props.onClose}
            >
              {props.messageText !== '' ? 'no, wait' : 'Okay'}
            </Button>
            {props.messageText !== '' && (
              <Button
                className={`${classes.button} ${classes.yesButton}`}
                onClick={() => {
                  const submit: any = apolloClient.mutate({
                    mutation: SUBMIT_JD_CASESHEET,
                    variables: { appointmentId: text.appointmentId },
                  });

                  submit
                    .then((resp: any) => {
                      if (resp && !resp.data) {
                        if (resp.data.submitJDCaseSheet) {
                          props.history.push(
                            `/consulttabs/${text.appointmentId}/${text.patientId}/0`
                          );
                        } else if (!resp.data.submitJDCaseSheet) {
                          let text = { ...defaultText };
                          text.headerText = modalData.jdInProgress.headerText;
                          props.setText(text);
                        }
                      }
                    })
                    .catch((exception: any) => console.log('something went wrong', exception))
                    .error((error: any) => console.log('something went wrong', error));
                }}
              >
                {'yes, start consult'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Popover>
  );
};
export default withRouter(StatusModal);
