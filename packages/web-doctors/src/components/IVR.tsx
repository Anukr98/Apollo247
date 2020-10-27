import { makeStyles } from '@material-ui/styles';
import { FormControlLabel, RadioGroup, MenuItem } from '@material-ui/core';
import React, { useState, useContext, useEffect } from 'react';
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
      opacity: 0.1,
      border: '1px solid #000000',
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
    edit: {
      color: '#FC9916',
      cursor: 'pointer',
      textAlign: 'right',
      width: '40%',
      fontWeight: 600,
    },
  };
});

const LightText = ({ data }: any) => {
  return (
    <span
      style={{
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '12px',
        letterSpacing: '0.0233333px',
        color: '#757474',
      }}
    >
      {data}
    </span>
  );
};

const Dropdown = (props: any) => {
  return (
    <div style={{ width: '50%' }}>
      <LightText data={props.data} />
      <div style={{ marginTop: 30 }}>
        <AphCustomDropdown
          style={{
            width: '146px',
            borderBottom: '1px solid #00b38e',
          }}
          onChange={props.onChange}
          value={props.value}
        >
          {[10, 30, 60].map((val, index) => (
            <MenuItem key={val} value={val}>
              {val + ' min'}
            </MenuItem>
          ))}
        </AphCustomDropdown>
      </div>
    </div>
  );
};

const radioLabel: any = {
  Online: 'ONLINE',
  'In-person': 'PHYSICAL',
  Both: 'BOTH',
};

const label: any = {
  ONLINE: 'Online',
  PHYSICAL: 'In-person',
  BOTH: 'Both',
};

const IVR = (props: any) => {
  const classes = useStyles({});
  const [isEditable, setIsEditable] = useState<boolean>(false);

  useEffect(() => {
    if (!props.expanded) {
      setIsEditable(false);
    }
  }, [props.expanded]);

  return (
    <div>
      {props.ivrState.setUpIvr ? 'YES' : 'NO'}
      <AphSwitch
        checked={props.ivrState.setUpIvr}
        onChange={() => {
          props.setEnableSave(true);
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
              <LightText data={'Select the type of appointment for '} />
              <RadioGroup
                className={classes.ivrRadioGroup}
                value={props.ivrState.consultationMode}
                onChange={(e: any) => {
                  props.setIvrState({
                    ...props.ivrState,
                    consultationMode: e.target.value,
                  });
                }}
                row
              >
                {Object.keys(radioLabel).map((x) => {
                  return (
                    <FormControlLabel value={radioLabel[x]} label={x} control={<AphRadio />} />
                  );
                })}
              </RadioGroup>

              <div style={{ display: 'flex', marginTop: 35 }}>
                {props.ivrState.consultationMode !== 'PHYSICAL' && (
                  <Dropdown
                    data={'Select the time of call before online appointment. '}
                    onChange={(e: any) => {
                      props.setIvrState({
                        ...props.ivrState,
                        ivrCallTimeOnline: e.target.value,
                      });
                    }}
                    value={props.ivrState.ivrCallTimeOnline}
                  />
                )}

                {props.ivrState.consultationMode !== 'ONLINE' && (
                  <Dropdown
                    data={'Select the time of call before in-person appointment. '}
                    onChange={(e: any) => {
                      props.setIvrState({
                        ...props.ivrState,
                        ivrCallTimePhysical: e.target.value,
                      });
                    }}
                    value={props.ivrState.ivrCallTimePhysical}
                  />
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '75%' }}>
                  <LightText data={'The type of appointment should be '} /> &nbsp;
                  <a className={classes.highlightedText}>
                    {props.ivrState.consultationMode !== ''
                      ? label[props.ivrState.consultationMode]
                      : ''}
                  </a>
                </span>
                <span
                  className={classes.edit}
                  onClick={() => {
                    setIsEditable(true);
                    props.setEnableSave(true);
                  }}
                >
                  EDIT
                </span>
              </div>
              {props.ivrState.consultationMode !== 'PHYSICAL' && (
                <span style={{ display: 'block', marginTop: 30 }}>
                  <LightText data={'Call me before '} />
                  <a className={classes.highlightedText}>{props.ivrState.ivrCallTimeOnline}</a>
                  <LightText data={' minutes of the online appointment'} />
                </span>
              )}
              {props.ivrState.consultationMode !== 'ONLINE' && (
                <span style={{ display: 'block', marginTop: 30 }}>
                  <LightText data={'Call me before '} />
                  <a className={classes.highlightedText}>{props.ivrState.ivrCallTimePhysical} </a>
                  <LightText data={' minutes of the in-person appointment'} />
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IVR;
