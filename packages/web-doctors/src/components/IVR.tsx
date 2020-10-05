import { makeStyles } from '@material-ui/styles';
import { FormControlLabel, RadioGroup, MenuItem } from '@material-ui/core';
import React, { useState, useContext } from 'react';
import { AphSwitch, AphRadio, AphCustomDropdown } from '@aph/web-ui-components';

const useStyles = makeStyles(() => {
  return {
    ivrRadioGroup: {
      marginTop: 12,
      marginLeft: 10,
      '& label:nth-child(2),& label:nth-child(3)': {
        marginLeft: 46,
      },
    },
    rootSelect: {
      width: '146px',
      borderBottom: '1px solid #00b38e',
    },
    drawLine: {
      position: 'relative',
      width: '678px',
      height: '0px',
      marginTop: 15,
      marginBottom: 10,
      opacity: '0.1',
      border: '1px solid #000000',
    },
    dropdownHeader: {
      height: '16px',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '12px',
      letterSpacing: '0.0233333px',
      color: '#757474',
    },

    thumb: {
      backgroundColor: '#FFFFFF',
    },

    switchBase: {
      color: '#FFFFFF',
      '&$checked': {
        color: '#FFFFFF',
      },
      '&$checked + $track': {
        backgroundColor: '#FC9916 !important',
        opacity: 1,
      },
    },
    checked: {},
    track: {},
    highlightedText: {
      height: '21px',
      fontStyle: 'normal',
      fontWeight: 500,
      fontSize: '16px',
      letterSpacing: '0.0266667px',
      color: '#02475B',
    },
  };
});

const IVR = (props: any) => {
  const classes = useStyles({});
  const [isEditable, setIsEditable] = useState<boolean>(false);

  const radioLabel: any = {
    Online: 'ONLINE',
    'In-person': 'PHYSICAL',
    Both: 'BOTH',
  };

  return (
    <div>
      {props.ivrState.setUpIvr ? 'YES' : 'NO'}
      <AphSwitch
        checked={props.ivrState.setUpIvr}
        onChange={() => {
          props.setIvrState({ ...props.ivrState, setUpIvr: !props.ivrState.setUpIvr });
        }}
        classes={{
          thumb: classes.thumb,
          switchBase: classes.switchBase,
          checked: classes.checked,
          track: classes.track,
        }}
      />
      {props.ivrState.setUpIvr && (
        <>
          <div className={classes.drawLine} />
          {isEditable ? (
            <div>
              <span className={classes.dropdownHeader}>
                {'Select the type of appointment for '}
              </span>
              <RadioGroup
                className={classes.ivrRadioGroup}
                value={props.ivrState.consultationMode}
                onChange={(e) => {
                  props.setIvrState({
                    ...props.ivrState,
                    consultationMode: e.target.value,
                  });
                }}
                row
              >
                {Object.keys(radioLabel).map((x) => {
                  return (
                    <FormControlLabel
                      value={radioLabel[x]}
                      label={x}
                      // disabled={freeTextSwitch ? true : false}
                      control={<AphRadio />}
                    />
                  );
                })}
              </RadioGroup>

              <div style={{ display: 'flex', marginTop: 35 }}>
                {props.ivrState.consultationMode !== 'PHYSICAL' && (
                  <div style={{ width: '50%' }}>
                    <span className={classes.dropdownHeader}>
                      {'Select the time of call before online appointment. '}
                    </span>
                    <br />
                    <br />
                    <AphCustomDropdown
                      classes={{
                        root: classes.rootSelect,
                      }}
                      onChange={(e: any) => {
                        props.setIvrState({ ...props.ivrState, ivrCallTimeOnline: e.target.value });
                      }}
                      value={props.ivrState.ivrCallTimeOnline}
                    >
                      {[10, 30, 60].map((val, index) => (
                        <MenuItem key={val} value={val}>
                          {val + ' min'}
                        </MenuItem>
                      ))}
                    </AphCustomDropdown>
                  </div>
                )}

                {props.ivrState.consultationMode !== 'ONLINE' && (
                  <div style={{ width: '50%' }}>
                    <span className={classes.dropdownHeader}>
                      {'Select the time of call before in-person appointment. '}
                    </span>
                    <br />
                    <br />
                    <AphCustomDropdown
                      classes={{
                        root: classes.rootSelect,
                      }}
                      onChange={(e: any) => {
                        props.setIvrState({
                          ...props.ivrState,
                          ivrCallTimePhysical: e.target.value,
                        });
                      }}
                      value={props.ivrState.ivrCallTimePhysical}
                    >
                      {[10, 30, 60].map((val, index) => (
                        <MenuItem key={val} value={val}>
                          {val + ' min'}
                        </MenuItem>
                      ))}
                    </AphCustomDropdown>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '75%' }}>
                  {'The type of appointment should be '}
                  <a className={classes.highlightedText}>{props.ivrState.consultationMode}</a>
                </span>
                <span
                  style={{
                    color: '#FC9916',
                    cursor: 'pointer',
                    textAlign: 'right',
                    width: '40%',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setIsEditable((edit) => !edit);
                  }}
                >
                  EDIT
                </span>
              </div>
              <span style={{ display: 'block' }}>
                Call me before{' '}
                <a className={classes.highlightedText}>{props.ivrState.ivrCallTimeOnline}</a>{' '}
                minutes of the online appointment
              </span>
              <span>
                Call me before{' '}
                <a className={classes.highlightedText}>{props.ivrState.ivrCallTimePhysical} </a>
                minutes of the in-person appointment
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IVR;
