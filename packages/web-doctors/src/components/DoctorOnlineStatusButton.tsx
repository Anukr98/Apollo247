import { makeStyles, CSSProperties } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React, { useState } from 'react';
import { useCurrentPatient } from 'hooks/authHooks';
import { DOCTOR_ONLINE_STATUS } from 'graphql/types/globalTypes';
import _startCase from 'lodash/startCase';
import {
  UpdateDoctorOnlineStatus,
  UpdateDoctorOnlineStatusVariables,
} from 'graphql/types/updateDoctorOnlineStatus';
import { UPDATE_DOCTOR_ONLINE_STATUS } from 'graphql/doctors';
import { Mutation } from 'react-apollo';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import { useQuery } from 'react-apollo-hooks';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';

const useStyles = makeStyles((theme: Theme) => {
  // const toggleBtn = {
  //   wi: '50%',
  //   color: '#02475b',
  //   fontSize: 14,
  //   fontWeight: 600,
  //   textTransform: 'none' as 'none',
  //   textAlign: 'center' as 'center',
  //   height: 30,
  //   '& span': {
  //     padding: 0,
  //     width: 'auto',
  //   },
  // };
  return {
    toggleBtnGroup: {
      backgroundColor: 'black',
      // backgroundColor: '#f7f7f7',
      // minWidth: 208,
      // borderRadius: 20,
      // marginRight: 10,
    },
    // toggleBtn,
    // toggleBtnSelected: {
    //   ...toggleBtn,
    //   backgroundColor: '#00b38e',
    //   color: theme.palette.common.white,
    //   borderRadius: '20px !important',
    //   '&:hover': {
    //     backgroundColor: '#00b38e',
    //     color: theme.palette.common.white,
    //   },
    // },
  };
});

const { AWAY, ONLINE } = DOCTOR_ONLINE_STATUS;

export interface OnlineAwayButtonProps {}

export const DoctorOnlineStatusButton: React.FC<OnlineAwayButtonProps> = (props) => {
  const classes = useStyles();
  const { data, error, loading } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);
  if (loading || error || !data || !data.getDoctorDetails) return null;
  const { id, onlineStatus } = data.getDoctorDetails;
  // const isSelected = (status: DOCTOR_ONLINE_STATUS) => status === onlineStatus;
  return (
    <Mutation<UpdateDoctorOnlineStatus, UpdateDoctorOnlineStatusVariables>
      mutation={UPDATE_DOCTOR_ONLINE_STATUS}
    >
      {(updateDoctorOnlineStatus, { loading }) => (
        <>
          {loading && <CircularProgress />}
          <ToggleButtonGroup
            className={classes.toggleBtnGroup}
            exclusive
            value={onlineStatus}
            onChange={(e, newStatus: DOCTOR_ONLINE_STATUS) => {
              updateDoctorOnlineStatus({
                variables: {
                  doctorId: id,
                  onlineStatus: newStatus,
                },
              });
            }}
          >
            <ToggleButton
              key={AWAY}
              value={AWAY}
              disabled={loading}
              // className={isSelected(AWAY) ? classes.toggleBtnSelected : classes.toggleBtn}
            >
              Away
            </ToggleButton>

            <ToggleButton
              key={ONLINE}
              value={ONLINE}
              disabled={loading}
              // className={isSelected(ONLINE) ? classes.toggleBtnSelected : classes.toggleBtn}
            >
              Online
            </ToggleButton>
          </ToggleButtonGroup>
        </>
      )}
    </Mutation>
  );
};
