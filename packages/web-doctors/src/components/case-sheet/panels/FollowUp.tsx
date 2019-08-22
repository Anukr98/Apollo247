import React, { useState, useEffect } from 'react';
import { Typography, Switch, Divider, makeStyles, Slider, withStyles } from '@material-ui/core';
import { debounce } from 'lodash';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const useStyles = makeStyles(() => ({
  followUpContainer: {
    width: '100%',
  },
  button: {
    borderRadius: '5px',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    border: 'solid 1px #00b38e',
    backgroundColor: '#ffffff',
    color: '#00b38e',
    '&.Mui-selected': {
      color: '#ffffff',
      backgroundColor: '#00b38e !important',
    },
  },
}));

const marks = [
  {
    value: 2,
    label: '2 days',
  },
  {
    value: 5,
    label: '5 days',
  },
  {
    value: 7,
    label: '7 days',
  },
  {
    value: 9,
    label: 'Custom',
  },
];

function valuetext(value: number) {
  return `${value}°C`;
}

const PrettoSlider = withStyles({
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

export const FollowUp: React.FC = () => {
  const classes = useStyles();
  const [shouldFollowUp, setShouldFollowUp] = useState<boolean>(false);
  const [followUpDays, setFollowUpDays] = useState<number>(2);
  const [consultType, setConsultType] = useState<string>('');
  const [selectedDate, handleDateChange] = useState<Date>(new Date());

  useEffect(() => {
    if (!shouldFollowUp) {
      handleDateChange(new Date());
      setFollowUpDays(2);
      setConsultType('');
    }
  }, [shouldFollowUp]);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Typography component="div" className={classes.followUpContainer}>
        <Typography component="div">
          <Typography component="span">Do you recommend a follow up?</Typography>
          <Switch
            checked={shouldFollowUp}
            onChange={(e) => setShouldFollowUp(e.target.checked)}
            value="followup"
            color="primary"
          />
        </Typography>
        {shouldFollowUp && (
          <div>
            <Divider />
            <Typography component="div">
              <Typography component="h5" variant="h5">
                Follow Up After
              </Typography>
              <PrettoSlider
                getAriaValueText={valuetext}
                step={null}
                marks={marks}
                min={2}
                max={9}
                onChange={debounce((e, value) => setFollowUpDays(value), 200)}
              />
              {followUpDays === 9 && (
                <KeyboardDatePicker
                  autoOk
                  variant="inline"
                  inputVariant="outlined"
                  label="With keyboard"
                  format="MM/dd/yyyy"
                  value={selectedDate}
                  InputAdornmentProps={{ position: 'end' }}
                  onChange={(date) => handleDateChange((date as unknown) as Date)}
                />
              )}
            </Typography>
            <Typography component="div">
              <Typography component="h5" variant="h5">
                Recommended Consult Type
              </Typography>
              <Typography component="div">
                <ToggleButtonGroup
                  value={consultType}
                  onChange={(e, newValue) => setConsultType(newValue)}
                >
                  <ToggleButton value="online" className={classes.button}>
                    <img src={require('images/ic_video.svg')} alt="" /> online
                  </ToggleButton>
                  <ToggleButton value="inperson" className={classes.button}>
                    In-person
                  </ToggleButton>
                </ToggleButtonGroup>
              </Typography>
            </Typography>
          </div>
        )}
      </Typography>
    </MuiPickersUtilsProvider>
  );
};
