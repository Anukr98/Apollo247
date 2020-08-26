import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphCustomDropdown } from '@aph/web-ui-components';
import { MenuItem, Theme } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { useAuth } from 'hooks/authHooks';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { useParams } from 'hooks/routerHooks';
import { CaseSheetContext } from 'context/CaseSheetContext';
const useStyles = makeStyles((theme: Theme) => ({
  header: {
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '18px',
    letterSpacing: '0.0233333px',
    color: 'rgba(2, 71, 91, 0.6)',
  },
  followUpInput: {
    width: 60,
  },
  daysLabel: {
    fontWeight: 500,
    fontSize: 14,
    color: '#02475B',
    letterSpacing: '0.0233333px',
    marginLeft: 13,
    display: 'inline-block',
    width: '60%',
  },
  infoWrapper: {
    display: 'flex',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: '16px',
    letterSpacing: 1,
    color: '#00B38E',
    marginTop: 20,
  },
  infoErrorWrapper: {
    display: 'flex',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: '16px',
    letterSpacing: 1,
    color: 'red',
    marginTop: 20,
  },

  menu: {
    width: 125,
    maxHeight: 450,
    boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
    backgroundColor: theme.palette.common.white,
    color: '#02475b',
    '& ul': {
      textAlign: 'center',
      '& li': {
        minHeight: 'auto',
        paddingLeft: 50,
        paddingRight: 0,
        borderBottom: '1px solid rgba(1,71,91,0.2)',
        textAlign: 'center',
        '&:last-child': {
          borderBottom: 'none',
        },
      },
    },
  },
  menuSelected: {
    backgroundColor: 'transparent !important',
    color: '#00b38e',
    fontWeight: 600,
  },
  select: {
    width: 40,
    borderBottom: '1px solid #00b38e',
  },
}));

export const FollowUp = (props: any) => {
  const classes = useStyles({});
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const { chatDays } = useAuthContext(); //from getDoctorDetails

  const { followUpChatDays, setFollowUpChatDays, caseSheetEdit } = useContext(CaseSheetContext);
  let defaultValue = props.origin === 'settings' ? 0 : chatDays;
  const [value, setValue] = useState(null);
  const NO_OF_DAYS = new Array(31 - defaultValue).fill(0);
  const messages = {
    settings:
      "This value will be default for all patient, However you can change the follow up chat day count on individual patient's Case-sheet",
    caseSheet: `The follow up chat days count will be changed for this individual patient. Your default follow up chat day count is set at ${chatDays}.`,
  };

  return (
    <div>
      {console.log('casesheet follow up', followUpChatDays)}
      {props.origin === 'settings' ? (
        <span className={classes.header}> {'Select the number of days'}</span>
      ) : (
        <span className={classes.header}> {'Set your patient follow up chat days limit.'}</span>
      )}
      <br />
      <div style={{ top: 10, left: 3, position: 'relative' }}>
        <AphCustomDropdown
          label={'Days'}
          value={props.origin === 'settings' ? props.chatValue : followUpChatDays}
          onChange={(e: any) => {
            let val = parseInt(e.target.value, 10);
            props.origin === 'settings' ? props.setChatValue(val) : setFollowUpChatDays(val);
          }}
          classes={{
            root: classes.select,
          }}
          MenuProps={{
            classes: { paper: classes.menu },
          }}
          disabled={props.origin === 'settings' ? false : !caseSheetEdit}
        >
          {NO_OF_DAYS.map((val, index) => (
            <MenuItem
              classes={{
                root: classes.menu,
                selected: classes.menuSelected,
              }}
              key={index + defaultValue}
              value={index + defaultValue}
            >
              {index + defaultValue}
            </MenuItem>
          ))}
        </AphCustomDropdown>
        <span className={classes.daysLabel}>{'Days'}</span>
      </div>
      {(caseSheetEdit || props.origin === 'settings') && (
        <span className={classes.infoWrapper}>
          <InfoOutlinedIcon
            style={{
              marginTop: 3,
            }}
          />
          <span style={{ marginLeft: 10 }}>
            {props.origin === 'settings' ? messages.settings : messages.caseSheet}
          </span>
        </span>
      )}
    </div>
  );
};
