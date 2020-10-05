import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  FormControlLabel,
  RadioGroup,
  MenuItem,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { useState, useContext } from 'react';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { FollowUp } from 'components/case-sheet/panels';
import { AphButton, AphSwitch, AphRadio, AphCustomDropdown } from '@aph/web-ui-components';
import {
  UpdateDoctorChatDays,
  UpdateDoctorChatDaysVariables,
} from 'graphql/types/UpdateDoctorChatDays';
import {
  SetAppointmentReminderIvrVariables,
  SetAppointmentReminderIvr,
} from 'graphql/types/SetAppointmentReminderIvr';
import { useApolloClient } from 'react-apollo-hooks';
import { UPDATE_DOCTOR_CHAT_DAYS, SET_APPOINTMENT_REMINDER_IVR } from 'graphql/profiles';
import IVR from 'components/IVR';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      paddingLeft: 0,
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
        paddingTop: 0,
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 20px',
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 20,
        borderBottom: 'solid 0.5px rgba(98,22,64,0.2)',
      },
      '& h5': {
        padding: '5px 5px 3px 20px',
        fontWeight: 500,
      },
      '& h6': {
        color: '#658f9b',
        padding: '5px 5px 0 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontWeight: theme.typography.fontWeightMedium,
        '& span': {
          padding: '0 2px',
        },
      },
    },

    helpTxt: {
      color: '#0087ba',
      fontSize: 16,
      lineHeight: 1.38,
      fontWeight: 500,
    },
    expandIcon: {
      color: '#02475b',
      margin: '5px 0',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      backgroundColor: '#fff',
      '&:before': {
        backgroundColor: 'transparent',
      },
      '&:first-child': {
        marginTop: 0,
      },
      '& h3': {
        fontSize: 17,
        fontWeight: theme.typography.fontWeightMedium,
        color: '#01475b',
        lineHeight: '24px',
        padding: '4px 0',
      },
    },
    expansionText: {
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0.2px',
      color: '#00B38E',
      marginTop: 10,
    },
    saveButton: {
      minWidth: 168,
      fontStyle: 'normal',
      fontWeight: 'bold',
      fontSize: '13px',
      lineHeight: '24px',
      textAlign: 'center',
      color: '#FFFFFF',
      background: '#FC9916',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      borderRadius: '5px',
      '&:hover': {
        background: '#FC9916',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      },
      marginTop: '36%',
      float: 'right',
    },
  };
});

interface Expansion {
  followUpExpand: boolean;
  ivrExpanded: boolean;
}

export const MyAccountSettings: React.FC = () => {
  const apolloClient = useApolloClient();
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const { chatDays, setChatDays, currentUser } = useAuthContext();
  const classes = useStyles({});

  const expansionDefaultState = {
    followUpExpand: false,
    ivrExpanded: false,
  };
  const [expansionState, setExpansionState] = useState<Expansion>({
    followUpExpand: false,
    ivrExpanded: false,
  });
  const [ivrState, setIvrState] = useState<any>({
    setUpIvr: currentUser.isIvrSet,
    consultationMode: currentUser.ivrConsultType,
    ivrCallTimeOnline: currentUser.ivrCallTimeOnline,
    ivrCallTimePhysical: currentUser.ivrCallTimePhysical,
  });

  const items = [
    {
      key: 'IVR',
      value: <div>{'Set-up an IVR as a reminder for appointment booking'}</div>,
      state: expansionState.ivrExpanded,
      component: <IVR ivrState={ivrState} setIvrState={setIvrState} />,
    },

    {
      key: 'followUp',
      value: (
        <div>
          <div>{'Set your patient follow Up days'}</div>
          {!expansionState.followUpExpand && (
            <div>
              <div className={classes.expansionText}>
                {'Default value set at '}
                <span
                  style={{ fontSize: 18, fontWeight: 600, color: '#00B38E' }}
                >{`${chatDays} days`}</span>
              </div>
            </div>
          )}
        </div>
      ),
      state: expansionState.followUpExpand,
      component: (
        <FollowUp
          origin={'settings'}
          onChange={setChatDays}
          value={chatDays}
          header={'Select the number of days'}
          disabled={false}
          info={
            "This value will be default for all patient, However you can change the follow up chat day count on individual patient's Case-sheet"
          }
        />
      ),
    },
  ];

  const handlePanelExpansion = (expansionKey: string) => {
    const collapsed = { ...expansionDefaultState };

    switch (expansionKey) {
      case 'followUp':
        setExpansionState({ ...collapsed, followUpExpand: !expansionState.followUpExpand });
        break;

      case 'IVR':
        setExpansionState({ ...collapsed, ivrExpanded: !expansionState.ivrExpanded });
        break;
    }
  };

  const saveChanges = () => {
    if (expansionState.followUpExpand) {
      apolloClient
        .mutate<UpdateDoctorChatDays, UpdateDoctorChatDaysVariables>({
          mutation: UPDATE_DOCTOR_CHAT_DAYS,
          fetchPolicy: 'no-cache',
          variables: { doctorId: currentUser.id, chatDays: chatDays },
        })
        .then((_data) => {
          alert(_data.data.updateDoctorChatDays.response);
        });
    } else if (expansionState.ivrExpanded) {
      const inputVariables = {
        doctorId: currentUser.id,
        isIvrSet: ivrState.setUpIvr,
        ivrConsultType: ivrState.consultationMode,
        ivrCallTimeOnline: parseInt(ivrState.ivrCallTimeOnline, 10),
        ivrCallTimePhysical: parseInt(ivrState.ivrCallTimePhysical, 10),
      };

      apolloClient
        .mutate<SetAppointmentReminderIvr, SetAppointmentReminderIvrVariables>({
          mutation: SET_APPOINTMENT_REMINDER_IVR,
          fetchPolicy: 'no-cache',
          variables: inputVariables,
        })
        .then((_data) => {
          alert('IVR changes updated successfully');
        });
    }
  };

  return (
    <div style={{ height: 800 }}>
      {console.log(ivrState)}
      {items.map((item) => (
        <ExpansionPanel
          key={item.key}
          expanded={item.state}
          onChange={() => handlePanelExpansion(item.key)}
          className={`${classes.expandIcon}`}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon style={{ color: '#01475b' }} />}>
            <Typography variant="h3">{item.value}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ paddingTop: 0 }}>{item.component}</ExpansionPanelDetails>
        </ExpansionPanel>
      ))}

      {Object.values(expansionState).includes(true) && (
        <AphButton
          variant="contained"
          color="primary"
          classes={{ root: classes.saveButton }}
          onClick={() => {
            saveChanges();
          }}
        >
          SAVE CHANGES
        </AphButton>
      )}
    </div>
  );
};
