import React, { useState } from 'react';
import { Checkbox } from '@material-ui/core';
import { AphTextField } from '@aph/web-ui-components';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => {
  return {
    checkboxLabel: {
      fontSize: 12,
      letterSpacing: 0.0233333,
      color: '#02475B',
    },
    checked: {
      color: '#FC9916 !important',
    },
    genericText: {
      '& div ': { paddingRight: 55 },
    },
  };
});

export const GenericMedicineName = (props: any) => {
  const classes = useStyles({});
  const [report, setReport] = useState(false);

  return (
    <div style={{ marginTop: 20 }}>
      <Checkbox
        classes={{ checked: classes.checked }}
        checked={props.isChecked}
        onChange={() => props.setIsChecked((check: any) => !check)}
      />
      <span className={classes.checkboxLabel}>
        {'Include Generic medicine name in the prescription.'}
      </span>
      {props.isChecked && !report && (
        <span
          style={{
            display: 'inline-block',
            width: '100%',
            paddingLeft: 10,
            paddingRight: 10,
            height: 55,
          }}
        >
          <AphTextField
            classes={{ root: classes.genericText }}
            value={props.value}
            onChange={(e) => props.setGenericName(e.target.value)}
          />

          {false && (
            <span
              style={{
                position: 'absolute',
                right: 23,
                marginTop: 10,
                color: '#FC9916',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
              onClick={() => {
                setReport(true);
                setTimeout(() => {
                  setReport(false);
                }, 5000);
              }}
            >
              {'Report'}
            </span>
          )}
        </span>
      )}
      {report && (
        <div style={{ padding: 10, color: '#4A4A4A' }}>
          {
            'Thanks for your feedback. We have informed the respective team about the data issue in the generic medicine.'
          }
        </div>
      )}
    </div>
  );
};
