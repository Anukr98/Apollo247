import React, { useState, useEffect, useContext } from 'react';
import { Typography, Switch, Divider, makeStyles, Slider, withStyles } from '@material-ui/core';
import { debounce } from 'lodash';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles(() => ({
  followUpContainer: {
    width: '100%',
    '& .followup-label': {
      '&.first-label': {
        paddingLeft: '60px',
      },
      display: 'inline-block',
      textAlign: 'center',
    },
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
    label: (
      <span className="followup-label first-label">
        2<br />
        days
      </span>
    ),
  },
  {
    value: 5,
    label: (
      <span className="followup-label">
        5<br />
        days
      </span>
    ),
  },
  {
    value: 7,
    label: (
      <span className="followup-label">
        7<br />
        days
      </span>
    ),
  },
  {
    value: 9,
    label: <span className="followup-label">Custom</span>,
  },
];

const valuetext = (value: number) => {
  return `${value} days`;
};

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
  // markLabel: {
  //   width: '10px',
  //   display: 'inline-block',
  //   whiteSpace: 'normal',
  // '&::after': {
  //   content: '"days"',
  //   display: 'block'
  // },
  // '&:nth-child(5)': {
  //   paddingLeft: '70px'
  // },
  // '&:nth-last-child(2)::after': {
  //   content: '""'
  // }
  // }
})(Slider);

export const FollowUp: React.FC = () => {
  const classes = useStyles();
  const {
    consultType: consultTypeData,
    setConsultType: setConsultTypeData,
    followUp,
    setFollowUp,
    followUpAfterInDays,
    setFollowUpAfterInDays,
    followUpDate,
    setFollowUpDate,
  } = useContext(CaseSheetContext);
  const [shouldFollowUp, setShouldFollowUp] = useState<boolean>(!!followUp[0]);
  const [followUpDays, setFollowUpDays] = useState<number>(
    parseInt(followUpAfterInDays[0], 10) || 2
  );
  const [consultType, setConsultType] = useState<string>(consultTypeData[0]);
  const [selectedDate, handleDateChange] = useState<Date>(
    followUpDate[0] ? new Date(followUpDate[0]) : new Date()
  );

  useEffect(() => {
    if (!shouldFollowUp) {
      handleDateChange(new Date());
      setFollowUpDays(2);
      setConsultType('');
    }
  }, [shouldFollowUp]);

  useEffect(() => {
    consultTypeData[0] = consultType;
    setConsultTypeData(consultTypeData);

    followUp[0] = shouldFollowUp;
    setFollowUp(followUp);

    followUpAfterInDays[0] = `${followUpDays === 9 ? 'Custom' : followUpDays}`;
    setFollowUpAfterInDays(followUpAfterInDays);

    followUpDate[0] = `${followUpDays === 9 ? selectedDate : ''}`;
    setFollowUpDate(followUpDate);
  }, [consultType, shouldFollowUp, followUpDays, selectedDate]);

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
                <div>
                  <Typography component="h5" variant="h5">
                    Follow Up On
                  </Typography>
                  <KeyboardDatePicker
                    autoOk
                    placeholder="dd/mm/yyyy"
                    variant="inline"
                    format="dd/MM/yyyy"
                    value={selectedDate}
                    InputAdornmentProps={{ position: 'end' }}
                    onChange={(date) => handleDateChange((date as unknown) as Date)}
                  />
                </div>
              )}
            </Typography>
            <Typography component="div">
              <Typography component="h5" variant="h5">
                Recommended Consult Type
              </Typography>
              <Typography component="div">
                <ToggleButtonGroup
                  exclusive
                  value={consultType}
                  onChange={(e, newValue) => setConsultType(newValue)}
                >
                  <ToggleButton value="ONLINE" className={classes.button}>
                    <img src={require('images/ic_video.svg')} alt="" /> online
                  </ToggleButton>
                  <ToggleButton value="PHYSICAL" className={classes.button}>
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
