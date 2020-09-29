import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { AphCustomDropdown } from '@aph/web-ui-components';
import { MenuItem, Theme } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
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
  let defaultValue = props.origin === 'settings' ? 0 : chatDays;
  const NO_OF_DAYS = new Array(31 - defaultValue).fill(0);

  return (
    <div>
      <span className={classes.header}> {props.header}</span>
      <br />
      <div style={{ top: 10, left: 3, position: 'relative' }}>
        <AphCustomDropdown
          value={props.value}
          onChange={(e: any) => {
            let val = parseInt(e.target.value, 10);
            props.origin === 'settings' ? props.onChange(val) : props.onChange([val]);
          }}
          classes={{
            root: classes.select,
          }}
          MenuProps={{
            classes: { paper: classes.menu },
          }}
          disabled={props.disabled}
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
      {!props.disabled && (
        <span className={classes.infoWrapper}>
          <InfoOutlinedIcon
            style={{
              marginTop: 3,
            }}
          />
          <span style={{ marginLeft: 10 }}>{props.info}</span>
        </span>
      )}
    </div>
  );
};
