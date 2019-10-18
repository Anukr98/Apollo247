import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React from 'react';
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
  };
});

const { AWAY, ONLINE } = DOCTOR_ONLINE_STATUS;

export interface OnlineAwayButtonProps {}

export const DoctorOnlineStatusButton: React.FC<OnlineAwayButtonProps> = (props) => {
  const classes = useStyles();
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
