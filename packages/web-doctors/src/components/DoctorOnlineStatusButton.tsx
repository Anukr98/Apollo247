import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Button } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React, { useState, useRef } from 'react';
import { DOCTOR_ONLINE_STATUS } from 'graphql/types/globalTypes';
import {
  UpdateDoctorOnlineStatus,
  UpdateDoctorOnlineStatusVariables,
} from 'graphql/types/UpdateDoctorOnlineStatus';
import { UPDATE_DOCTOR_ONLINE_STATUS } from 'graphql/doctors';
import { Mutation } from 'react-apollo';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import { useQuery } from 'react-apollo-hooks';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ReactCountdownClock from 'react-countdown-clock';
import IdleTimer from 'react-idle-timer';

const useStyles = makeStyles((theme: Theme) => {
  const toggleBtn = {
    width: '50%',
    color: '#02475b',
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'none' as 'none',
    textAlign: 'center' as 'center',
    height: 30,
    '& span': {
      padding: '0 !important',
      width: 'auto !important',
    },
  };
  return {
    toggleBtnGroup: {
      backgroundColor: '#f7f7f7',
      minWidth: 208,
      borderRadius: 20,
      marginRight: 10,
      marginLeft: 5,
    },
    toggleBtn,
    toggleBtnSelected: {
      ...toggleBtn,
      backgroundColor: '#00b38e !important',
      color: theme.palette.common.white,
      borderRadius: '20px !important',
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
    popoverTile: {
      color: '#fcb716',
      fontWeight: 500,
    },
    countdownLoader: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
  };
});

const { AWAY, ONLINE } = DOCTOR_ONLINE_STATUS;

export interface OnlineAwayButtonProps {}

export const DoctorOnlineStatusButton: React.FC<OnlineAwayButtonProps> = (props) => {
  const classes = useStyles();
  const idleTimerRef = useRef(null);
  const idleTimeValueInMinutes = 3;
  const [jrdNoFillDialog, setJrdNoFillDialog] = useState(false);
  const ActiveQueueConsultValues = Number(
    localStorage && localStorage.getItem('activeConsultQueueCount')
  );
  const { data, error, loading } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);
  if (loading || error || !data || !data.getDoctorDetails) return null;
  const { id, onlineStatus } = data.getDoctorDetails;

  const isSelected = (status: DOCTOR_ONLINE_STATUS) => status === onlineStatus;

  return (
    <Mutation<UpdateDoctorOnlineStatus, UpdateDoctorOnlineStatusVariables>
      mutation={UPDATE_DOCTOR_ONLINE_STATUS}
    >
      {(updateDoctorOnlineStatus, { loading }) => (
        <>
          {loading && <CircularProgress size={20} />}
          {ActiveQueueConsultValues === 0 && onlineStatus === ONLINE ? (
            <IdleTimer
              ref={idleTimerRef}
              element={document}
              onIdle={(e) => {
                setJrdNoFillDialog(true);
              }}
              debounce={250}
              timeout={1000 * 60 * idleTimeValueInMinutes}
            />
          ) : (
            <></>
          )}
          {jrdNoFillDialog ? (
            <Dialog
              open={jrdNoFillDialog}
              onClose={() => setJrdNoFillDialog(false)}
              disableBackdropClick
              disableEscapeKeyDown
            >
              <DialogTitle className={classes.popoverTile}>Apollo 24x7 - Alert</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Hi! Seems like you've gone offline. Please click on 'OK' to continue chatting with
                  your patient.
                  <div className={classes.countdownLoader}>
                    <ReactCountdownClock
                      seconds={60}
                      color="#fcb716"
                      alpha={0.9}
                      size={50}
                      onComplete={() => {
                        setJrdNoFillDialog(false);
                        updateDoctorOnlineStatus({
                          variables: {
                            doctorId: id,
                            onlineStatus:
                              ActiveQueueConsultValues === 0
                                ? DOCTOR_ONLINE_STATUS.AWAY
                                : DOCTOR_ONLINE_STATUS.ONLINE,
                          },
                        });
                      }}
                    />
                  </div>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  color="primary"
                  onClick={() => {
                    setJrdNoFillDialog(false);
                  }}
                  autoFocus
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          ) : (
            <></>
          )}
          <ToggleButtonGroup
            className={classes.toggleBtnGroup}
            exclusive
            value={onlineStatus}
            onChange={(e, newStatus: DOCTOR_ONLINE_STATUS) => {
              if (newStatus !== onlineStatus) {
                updateDoctorOnlineStatus({
                  variables: {
                    doctorId: id,
                    onlineStatus: newStatus,
                  },
                }).then(() => {
                  window.location.reload();
                });
              }
            }}
          >
            <ToggleButton
              key={ONLINE}
              value={ONLINE}
              disabled={loading}
              className={isSelected(ONLINE) ? classes.toggleBtnSelected : classes.toggleBtn}
            >
              Online
            </ToggleButton>
            <ToggleButton
              key={AWAY}
              value={AWAY}
              disabled={loading}
              className={isSelected(AWAY) ? classes.toggleBtnSelected : classes.toggleBtn}
            >
              Away
            </ToggleButton>
          </ToggleButtonGroup>
        </>
      )}
    </Mutation>
  );
};
