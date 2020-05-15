import React, { useState, useEffect, useContext } from 'react';
import { Typography, Divider, Slider, createMuiTheme, withStyles } from '@material-ui/core';
import { AphToggleSwitch } from 'components/case-sheet/panels/AphToggleSwitch';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { debounce } from 'lodash';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { addDays } from 'date-fns';
import { useParams } from 'hooks/routerHooks';
import { getLocalStorageItem, updateLocalStorageItem } from './LocalStorageUtils';

const useStyles = makeStyles(() => ({
  followUpContainer: {
    width: '100%',
    '& .followup-label': {
      color: 'rgba(2,71,91,0.6)',
      fontSize: 12,
      marginTop: 5,
      '&.first-label': {
        paddingLeft: 60,
      },
      '&.last-label': {
        paddingRight: 40,
        paddingTop: 9,
      },
      display: 'inline-block',
      textAlign: 'center',
    },
  },
  KeyboardDatePicker: {
    width: '100%',
    '& div': {
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
    },
    '& input': {
      fontSize: 18,
      color: '##01475b',
      borderBottom: '2px solid #00b38e',
      fontWeight: 500,
    },
  },
  switchBtn: {
    position: 'absolute',
    right: 10,
  },
  followupTxt: {
    fontSize: 14,
    color: 'rgba(2, 71, 91, 0.6)',
    fontWeight: 500,
    marginBottom: 16,
    display: 'inline-block',
  },
  followupAfter: {
    paddingTop: 16,
  },
  followup: {
    '& h5': {
      fontSize: 14,
      color: 'rgba(2, 71, 91, 0.6)',
      fontWeight: 500,
      paddingBottom: 8,
    },
  },
  button: {
    borderRadius: '5px',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    border: 'solid 1px #00b38e',
    backgroundColor: '#ffffff',
    color: '#00b38e',
    marginRight: 10,
    marginTop: 5,
    textTransform: 'capitalize',
    '&:first-child': {
      borderRadius: 5,
    },
    '&:last-child': {
      borderRadius: 5,
      border: 'solid 1px #00b38e',
    },
    '& svg': {
      marginRight: 5,
    },
    '&.Mui-selected': {
      color: '#ffffff',
      backgroundColor: '#00b38e !important',
      '& svg': {
        '& path': {
          fill: '#fff',
        },
      },
    },
    '& .MuiInput': {
      borderBottom: '2px solid #00b38e',
      '&:before': {
        borderBottom: '2px solid #00b38e !important',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e !important',
        borderBottomColor: '#00b38e !important',
      },
    },
    '&.markLabel': {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 'normal',
    },
  },
  recommendedType: {
    marginTop: 30,
    marginBottom: 10,
  },
  datepicker: {
    '& input': {
      color: 'rgba(2,71,91,0.5)',
      fontSize: 18,
      fontWeight: 500,

      '&:hover': {
        borderBottom: 'none',
        '&:before': {
          borderBottom: 'none',
        },
      },
      '&:before': {
        borderBottom: 'none',
      },
      '&:after': {
        borderBottom: 'none',
      },
    },
  },
  datePickerOpen: {
    '& input': {
      background: `url(${require('images/ic_cal_up.svg')}) no-repeat right center`,
      cursor: 'pointer',
      backgroundSize: 30,
    },
  },
  datePickerClose: {
    '& input': {
      'background-image': `url(${require('images/ic_cal_down.svg')})`,
      backgroundSize: 30,
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
    label: <span className="followup-label last-label">Custom</span>,
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
})(Slider);

const defaultMaterialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#00b38e',
    },
    text: {
      primary: '#00b38e',
    },
    action: {
      selected: '#fff',
    },
  },
  typography: {
    fontWeightMedium: 600,
    htmlFontSize: 14,
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body1: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 700,
    },
    body2: {
      fontWeight: 600,
    },
    caption: {
      fontSize: 12,
      color: '#80a3ad !important',
      fontWeight: 600,
    },
  },
});

interface CashSheetProps {
  startAppointment: boolean;
}

type Params = { id: string; patientId: string; tabValue: string };
export const FollowUp: React.FC<CashSheetProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();

  const {
    followUp,
    setFollowUp,
    followUpAfterInDays,
    setFollowUpAfterInDays,
    followUpDate,
    setFollowUpDate,
    followUpConsultType: consultTypeData,
    setFollowUpConsultType: setConsultTypeData,
    appointmentInfo,
  } = useContext(CaseSheetContext);
  const [shouldFollowUp, setShouldFollowUp] = useState<boolean>(followUp[0]);
  const [followUpDays, setFollowUpDays] = useState<number>(
    parseInt(followUpAfterInDays[0], 10) || 5
  );

  const [defaultValue, setDefaultValue] = useState(parseInt(followUpAfterInDays[0], 10) || 5);

  const [followUpConsultType, setFollowUpConsultType] = useState<string>(consultTypeData[0]);
  const [selectedDate, handleDateChange] = useState<Date>(
    followUp[0] && followUpDate[0] !== '' && followUpDate[0] !== null
      ? new Date(followUpDate[0])
      : new Date()
  );
  useEffect(() => {
    if (!shouldFollowUp) {
      handleDateChange(new Date());
      setFollowUpConsultType('');
    }
  }, [shouldFollowUp]);

  useEffect(() => {
    consultTypeData[0] = followUpConsultType;
    setConsultTypeData(consultTypeData);
    if (shouldFollowUp && followUpConsultType === '') {
      setFollowUpConsultType('ONLINE');
    }

    followUpAfterInDays[0] = `${followUpDays}`;
    followUpDate[0] = `${followUpDays === 9 ? selectedDate : addDays(new Date(), followUpDays)}`;
    const storageItem = getLocalStorageItem(params.id);
    if (storageItem) {
      storageItem.followUpAfterInDays = followUpAfterInDays;
      storageItem.followUpDate = followUpDate;
      updateLocalStorageItem(params.id, storageItem);
    }
    setFollowUpAfterInDays(followUpAfterInDays);
    setFollowUpDate(followUpDate);
  }, [followUpConsultType, shouldFollowUp, followUpDays, selectedDate]);
  const isFollowUpDisable = true;
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Typography component="div" className={classes.followUpContainer}>
        <Typography component="div">
          <Typography component="span" className={classes.followupTxt}>
            Do you recommend a follow up?
          </Typography>
          <AphToggleSwitch
            checked={shouldFollowUp}
            disabled={isFollowUpDisable}
            onChange={(e) => {
              setShouldFollowUp(e.target.checked);
              followUp[0] = e.target.checked;
              const storageItem = getLocalStorageItem(params.id);
              if (storageItem) {
                storageItem.followUp = followUp;
                updateLocalStorageItem(params.id, storageItem);
              }
              setFollowUp(followUp);
            }}
            value="followup"
            color="primary"
            className={classes.switchBtn}
          />
        </Typography>
        {shouldFollowUp && (
          <div className={classes.followup}>
            <Divider />
            <Typography className={classes.followupAfter} component="div">
              <Typography component="h5" variant="h5">
                Follow Up After
              </Typography>
              <PrettoSlider
                getAriaValueText={valuetext}
                step={null}
                marks={marks}
                min={2}
                max={9}
                defaultValue={defaultValue}
                onChange={debounce((e, value: number) => setFollowUpDays(value), 200)}
                disabled={!props.startAppointment}
              />
              {followUpDays === 9 && (
                <div className={classes.recommendedType}>
                  <Typography component="h5" variant="h5">
                    Follow Up On
                  </Typography>
                  <ThemeProvider theme={defaultMaterialTheme}>
                    <span>
                      <KeyboardDatePicker
                        className={classes.KeyboardDatePicker}
                        inputVariant="standard"
                        disableToolbar
                        autoOk
                        placeholder="dd/mm/yyyy"
                        variant="inline"
                        format="dd/MM/yyyy"
                        value={selectedDate}
                        minDate={new Date()}
                        onKeyPress={(e) => {
                          if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) e.preventDefault();
                        }}
                        onChange={(date) => handleDateChange(date as Date)}
                        disabled={!props.startAppointment}
                        onFocus={() => {}}
                        onBlur={() => {}}
                      />
                    </span>
                  </ThemeProvider>
                </div>
              )}
            </Typography>
            <Typography component="div" className={classes.recommendedType}>
              <Typography component="h5" variant="h5">
                Recommended Consult Type
              </Typography>
              <Typography component="div">
                <ToggleButtonGroup
                  exclusive
                  value={followUpConsultType}
                  onChange={(e, newValue) => setFollowUpConsultType(newValue)}
                >
                  <ToggleButton
                    value="ONLINE"
                    className={classes.button}
                    disabled={!props.startAppointment}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g fill="none" fillRule="evenodd">
                        <path
                          fill="#00B38E"
                          fillRule="nonzero"
                          d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l2.29 2.29c.63.63 1.71.18 1.71-.71V8.91c0-.89-1.08-1.34-1.71-.71L17 10.5z"
                        />
                      </g>
                    </svg>
                    online
                  </ToggleButton>
                  <ToggleButton
                    value="PHYSICAL"
                    className={classes.button}
                    disabled={!props.startAppointment}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                    >
                      <g fill="none" fillRule="evenodd">
                        <path
                          fill="#00B38E"
                          fillRule="nonzero"
                          d="M17 16h-1V2c0-.55-.45-1-1-1h-4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v15H1c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1V3h3v14c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zm-8-6H7V8h2v2z"
                        />
                      </g>
                    </svg>
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
