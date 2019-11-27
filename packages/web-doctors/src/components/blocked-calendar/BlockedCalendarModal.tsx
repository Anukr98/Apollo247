import { AphRadio } from '@aph/web-ui-components';
import {
  Button,
  Theme,
  CircularProgress,
  Dialog,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  RadioGroup,
  FormGroup,
  Checkbox,
  Grid,
  TextField,
} from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { DialogProps } from '@material-ui/core/Dialog';
import { AphSelect, AphTextField, AphButton } from '@aph/web-ui-components';
import DateFnsUtils from '@date-io/date-fns';
import * as _ from 'lodash';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import {
  ADD_BLOCKED_CALENDAR_ITEM,
  GET_BLOCKED_CALENDAR,
  UPDATE_BLOCKED_CALENDAR_ITEM,
} from 'graphql/doctors';
import {
  AddBlockedCalendarItem,
  AddBlockedCalendarItemVariables,
} from 'graphql/types/AddBlockedCalendarItem';
import React, { useState, useEffect } from 'react';
import { Mutation } from 'react-apollo';
import { format, parse } from 'date-fns';
import { Item } from 'components/blocked-calendar/BlockedCalendar';
import {
  UpdateBlockedCalendarItem,
  UpdateBlockedCalendarItemVariables,
} from 'graphql/types/UpdateBlockedCalendarItem';
import { ApolloError } from 'apollo-client';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { createMuiTheme } from '@material-ui/core';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import { useQuery } from 'react-apollo-hooks';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import moment from 'moment';
export interface BlockedCalendarAddModalProps {
  dialogProps: DialogProps & { onClose: () => void };
  doctorId: string;
  item?: Item | null;
}
const getFormattedDate = (date: any) => {
  const year = date.getFullYear();

  let month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;

  let day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year + '-' + month + '-' + day;
};
let customTimeArray: any = [];
export const BlockedCalendarAddModal: React.FC<BlockedCalendarAddModalProps> = (props) => {
  enum RadioValues {
    DAY = 'DAY',
    DURATION = 'DURATION',
  }
  enum BlockOption {
    entireday = 'entireday',
    consulthours = 'consulthours',
    customtime = 'customtime',
  }
  const { data, error, loading } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);
  const doctorSlot = data && data.getDoctorDetails && data.getDoctorDetails.consultHours;
  const [consultHours, setConsultHours] = useState();
  const { item, dialogProps, doctorId } = props;
  const [selectedValue, setSelectedValue] = useState(RadioValues.DAY);
  const [selectedBlockOption, setSelectedBlockOption] = useState(BlockOption.entireday);
  const daySelected = selectedValue === RadioValues.DAY;
  const durationSelected = selectedValue === RadioValues.DURATION;
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isOverlapError, setIsOverlapError] = useState(false);
  const [blockReason, setBlockReason] = useState('personal leave');
  const [val, setVal] = useState(customTimeArray);
  const [val1, setVal1] = useState();
  const [startVal, setStartVal] = useState(customTimeArray);
  const [startVal1, setStartVal1] = useState();
  const [dateRange, setDateRange] = useState();
  const [chackedSingleValue, setChackedSingleValue] = useState();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setStart(item ? format(item.start, 'yyyy-MM-dd') : '');
    setEnd(item ? format(item.end, 'yyyy-MM-dd') : '');
    setStartTime(item ? format(item.start, 'HH:mm') : '');
    setEndTime(item ? format(item.end, 'HH:mm') : '');
  }, [item]);

  useEffect(() => {
    if (daySelected) {
      setEnd(start);
    }
  }, [daySelected, start]);

  const dateInvalid = !start || !end || new Date(end) < new Date(start);
  const timeInvalid =
    daySelected && selectedBlockOption !== 'entireday'
      ? !startTime || !endTime || endTime <= startTime
      : false;

  let invalidStTime = false;
  let invalidTime = false;
  if (start) {
    const stTm = new Date(start).toLocaleDateString().split('/');
    const TodatTm = new Date().toLocaleDateString().split('/');
    invalidStTime =
      stTm[2] +
        '/' +
        (stTm[0] && stTm[0].length < 2 ? '0' + stTm[0] : stTm[0]) +
        '/' +
        (stTm[1] && stTm[1].length < 2 ? '0' + stTm[1] : stTm[1]) <
      TodatTm[2] +
        '/' +
        (TodatTm[0] && TodatTm[0].length < 2 ? '0' + TodatTm[0] : TodatTm[0]) +
        '/' +
        (TodatTm[1] && TodatTm[1].length < 2 ? '0' + TodatTm[1] : TodatTm[1]);
    console.log(
      stTm[2] +
        '/' +
        (stTm[0] && stTm[0].length < 2 ? '0' + stTm[0] : stTm[0]) +
        '/' +
        (stTm[1] && stTm[1].length < 2 ? '0' + stTm[1] : stTm[1]),
      TodatTm[2] +
        '/' +
        (TodatTm[0] && TodatTm[0].length < 2 ? '0' + TodatTm[0] : TodatTm[0]) +
        '/' +
        (TodatTm[1] && TodatTm[1].length < 2 ? '0' + TodatTm[1] : TodatTm[1])
    );
    if (
      daySelected &&
      startTime &&
      stTm[2] + '/' + stTm[0] + '/' + stTm[1] ===
        TodatTm[2] + '/' + TodatTm[0] + '/' + TodatTm[1] &&
      format(new Date(), 'HH:mm').toString() > startTime
    ) {
      invalidTime = true;
    }
  }

  // let invalid = true;
  const [invalid, setInvalid] = useState(true);
  useEffect(() => {
    if (selectedBlockOption === 'entireday') {
      setInvalid(dateInvalid || timeInvalid || invalidStTime || invalidTime);
    } else if (selectedBlockOption === 'consulthours' && !chackedSingleValue && !checked) {
      setInvalid(true);
    } else if (selectedBlockOption === 'consulthours' && chackedSingleValue && checked) {
      setInvalid(false);
    } else if (selectedBlockOption === 'customtime') {
      setInvalid(customTimeArray && customTimeArray.length < 1);
    }
  }, [
    selectedBlockOption,
    chackedSingleValue,
    invalid,
    dateInvalid,
    timeInvalid,
    invalidStTime,
    invalidTime,
    checked,
    customTimeArray,
  ]);
  const handleSubmitComplete = () => {
    setStart('');
    setEnd('');
    setStartTime('');
    setEndTime('');
    setIsOverlapError(false);
    dialogProps.onClose();
    customTimeArray.length = 0;
    setSelectedBlockOption(BlockOption.entireday);
  };
  const useStyles = makeStyles((theme: Theme) => {
    return {
      blockcalHeading: {
        minWidth: 480,
        boxShadow: '0 5px 20px 0 #80808033',
        marginBottom: 20,
        '& h6': {
          backgroundColor: '#fff',
          fontSize: 13,
          color: '#01475b',
          display: 'flex',
          fontWeight: 600,
          padding: '2px 0',
        },
      },
      BlockedCalendarModal: {},
      radioGroup: {
        '& label': {
          width: '48%',
          color: 'rgba(2, 71, 91, 0.8)',
          fontSize: 14,
          '& span': {
            fontWeight: 500,
            fontSize: 14,
          },
        },
      },
      datepicker: {
        width: '100%',
        marginBottom: 20,
      },
      timepicker: {
        margin: '10px 20px 10px 0',
        width: '100%',
        borderBottom: '2px solid #00b38e',
        '&:hover': {
          borderBottom: '2px solid #00b38e',
        },
      },
      KeyboardDatePicker: {
        width: '100%',
        color: '#02475b !important',
        '& label': {
          color: '#02475b !important',
        },
        '& svg': {
          fill: '#02475b',
        },
        '& div': {
          '&:before': {
            borderBottom: '2px solid #00b38e',
          },
          '&:after': {
            borderBottom: '2px solid #00b38e !important',
          },
        },
        '& input': {
          fontSize: 18,
          color: '#01475b',
          borderBottom: '2px solid #00b38e',
          fontWeight: 500,
        },
      },
      blockedContent: {
        fontSize: 14,
        '& h5': {
          fontSize: 14,
          color: 'rgba(2, 71, 91, 0.6)',
          fontWeight: 500,
        },
      },
      entireRow: {
        width: '95% !important',
        fontWeight: 500,
        marginBottom: 15,
      },
      entireDayContent: {
        width: '90%',
        margin: '0 0 30px 30px',
        '& h5': {
          color: 'rgba(2, 71, 91, 0.6)',
          fontWeight: 500,
          marginTop: 0,
          marginBottom: 0,
        },
      },
      menuPopover: {
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        marginLeft: -2,
        marginTop: 45,
        borderRadius: 10,
        left: '270px',
        width: '450px',
        '& ul': {
          padding: '10px 0px',
          '& li': {
            fontSize: 18,
            width: 480,
            fontWeight: 500,
            color: '#02475b',
            minHeight: 'auto',
            paddingLeft: 10,
            paddingRight: 10,
            // borderBottom: '1px solid rgba(1,71,91,0.2)',
            '&:last-child': {
              borderBottom: 'none',
            },
            '&:hover': {
              backgroundColor: '#f0f4f5',
            },
          },
        },
      },
      menuSelected: {
        color: '#00b38e !important',
      },
      checkbox: {
        // width: '100%',
      },
      deviderLine: {
        textAlign: 'center',
        marginTop: 35,
        fontSize: 20,
      },
      addblockedHours: {
        fontSize: 14,
        fontWeight: 700,
        color: '#fc9916',
        marginTop: 10,
        textTransform: 'uppercase',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        paddingLeft: 4,
        '& img': {
          marginRight: 10,
        },
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
      modalFooter: {
        padding: 16,
        boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
        '& button': {
          fontSize: 14,
          fontWeight: 600,
          padding: '8px 20px',
        },
      },
      cancelBtn: {
        color: '#fc9916',
        backgroundColor: '#fff',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
      formDate: {
        borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
        fontSize: 12,
        fontWeight: 500,
        width: '100%',
        color: '#02475b',
        marginBottom: 10,
      },
      fullRow: {
        width: '100%',
      },
    };
  });
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
        fontSize: 0,
      },
    },
  });
  const classes = useStyles();

  const TextFieldComponent = (props: any) => {
    return <TextField {...props} disabled={true} />;
  };
  const [selectedDate, setSelectedDate] = React.useState(new Date('2019-10-17T21:11:54'));
  const [blockConsultHourDay, setBlockConsultHourDay] = useState(
    new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  );
  const label = selectedValue === 'DAY' ? 'day' : 'duration';
  const addTimeArray = () => {
    if (startTime && endTime) {
      let obj = {
        startTime: startTime,
        endTime: endTime,
      };
      customTimeArray.push(obj);
      setInvalid(false);
    }
    setStartTime('');
    setEndTime('');
  };
  const convertFrom24To12Format = (time24: any) => {
    const [sHours, minutes] = time24.match(/([0-9]{1,2}):([0-9]{2})/).slice(1);
    const period = +sHours < 12 ? 'AM' : 'PM';
    const hours = +sHours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
  };
  const findBlockSlot = (value: any) => {
    const selectedDay =
      (value && new Date(value).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()) ||
      new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const consultHours = doctorSlot && doctorSlot.length > 0 && doctorSlot;

    const filteredDay =
      consultHours &&
      _.filter(consultHours, function(o) {
        if (o && o.weekDay) {
          return o.weekDay === selectedDay;
        }
      });
    const consultDurationDay: any = filteredDay && Array.isArray(filteredDay) ? filteredDay[0] : {};
    setConsultHours(consultDurationDay);
  };
  const convertTocunsultBlockStartEndTime = (value: any) => {
    const selectedDay =
      (value && new Date(value).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()) ||
      new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const consultHours = doctorSlot && doctorSlot.length > 0 && doctorSlot;

    const filteredDay =
      consultHours &&
      _.filter(consultHours, function(o) {
        if (o && o.weekDay) {
          return o.weekDay === selectedDay;
        }
      });
    const consultDurationDay: any = filteredDay && Array.isArray(filteredDay) ? filteredDay[0] : {};
    const startTime = convertFrom24To12Format(consultDurationDay.startTime);
    const endTime = convertFrom24To12Format(consultDurationDay.endTime);
    return ` ${startTime} - ${endTime}  | ${consultDurationDay.consultMode}`;
  };

  const changeListEndTime = (value: any, index: any) => {
    customTimeArray[index].endTime = value;
  };
  const changeListStartTime = (value: any, index: any) => {
    customTimeArray[index].startTime = value;
  };
  const convertIntoDay = (value: any) => {
    const day = value
      ? new Date(value).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
      : '';
    return day;
  };

  const getDateRange = (startDate: any, stopDate: any) => {
    if (startDate && stopDate) {
      var dateArray = [];
      var currentDate = moment(startDate);
      var endDate = moment(stopDate);
      while (currentDate <= endDate) {
        dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
        currentDate = moment(currentDate).add(1, 'days');
      }
      setDateRange(dateArray);
    }
  };
  const nextDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  return (
    <Dialog
      {...dialogProps}
      data-cypress="BlockedCalendarModal"
      className={classes.BlockedCalendarModal}
    >
      <DialogTitle className={classes.blockcalHeading}>BLOCK CALENDAR</DialogTitle>
      <DialogContent style={{ color: 'black' }}>
        <RadioGroup
          className={classes.radioGroup}
          value={selectedValue}
          onChange={(e) => {
            setSelectedValue((e.target as HTMLInputElement).value as RadioValues);

            setSelectedBlockOption(BlockOption.entireday);
          }}
          row
        >
          {' '}
          <FormControlLabel
            value={RadioValues.DAY}
            label="For a day"
            control={<AphRadio title="For a day" />}
          />
          <FormControlLabel
            value={RadioValues.DURATION}
            label="For a duration"
            control={<AphRadio title="For a duration" />}
          />
        </RadioGroup>
        <div>
          <div>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <ThemeProvider theme={defaultMaterialTheme}>
                <div>
                  <KeyboardDatePicker
                    className={classes.KeyboardDatePicker}
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label={
                      daySelected ? 'Which day would you like to block your calendar for?' : 'From'
                    }
                    value={start}
                    minDate={nextDate()}
                    onChange={(date) => {
                      setStart(date ? getFormattedDate(date) : '');
                      findBlockSlot(date ? getFormattedDate(date) : '');
                      getDateRange(date ? date : '', end ? end : '');
                      setBlockConsultHourDay(
                        date
                          ? date!.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
                          : ''
                      );
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    autoOk
                    TextFieldComponent={TextFieldComponent}
                  />
                </div>
                {!daySelected && (
                  <div>
                    <KeyboardDatePicker
                      className={classes.KeyboardDatePicker}
                      disableToolbar
                      variant="inline"
                      format="MM/dd/yyyy"
                      margin="normal"
                      id="date-picker-inline"
                      label="To"
                      minDate={new Date()}
                      value={end}
                      onChange={(date) => {
                        setEnd(date ? getFormattedDate(date) : '');
                        getDateRange(start ? start : '', date ? date : '');
                      }}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                      autoOk
                      TextFieldComponent={TextFieldComponent}
                    />
                  </div>
                )}
              </ThemeProvider>
            </MuiPickersUtilsProvider>
            <div className={classes.blockedContent}>
              <h5>Which of these would you like to block?</h5>
              <div>
                <RadioGroup
                  className={classes.radioGroup}
                  value={selectedBlockOption}
                  onChange={(e) =>
                    setSelectedBlockOption((e.target as HTMLInputElement).value as BlockOption)
                  }
                  row
                >
                  <FormControlLabel
                    disabled={!start}
                    className={classes.entireRow}
                    value={BlockOption.entireday}
                    label={`Block the entire ${label}`}
                    control={<AphRadio title="Block the entire day" />}
                  />
                  {selectedBlockOption === 'entireday' && (
                    <div className={classes.entireDayContent}>
                      <h5>Reason (optional)</h5>
                      <AphSelect
                        value={blockReason}
                        MenuProps={{
                          classes: { paper: classes.menuPopover },
                          anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                        }}
                        onChange={(e: any) => {
                          setBlockReason(e.target.value as string);
                        }}
                      >
                        <MenuItem
                          value="personal leave"
                          classes={{ selected: classes.menuSelected }}
                        >
                          Personal Leave
                        </MenuItem>
                        <MenuItem value="Busy" classes={{ selected: classes.menuSelected }}>
                          Busy
                        </MenuItem>
                        <MenuItem
                          value="Out of office"
                          classes={{ selected: classes.menuSelected }}
                        >
                          Out of office
                        </MenuItem>
                      </AphSelect>
                    </div>
                  )}
                  <FormControlLabel
                    disabled={!start}
                    className={classes.entireRow}
                    value={BlockOption.consulthours}
                    label="Block consult hours"
                    control={<AphRadio title="Block consult hours" />}
                  />
                  {selectedBlockOption === 'consulthours' && (
                    <div className={classes.entireDayContent}>
                      <p>
                        These are your active consult hours for the selected day. Select which ones
                        you’d like to block:
                      </p>
                      {start === end && (
                        <div>
                          <div className={classes.formDate}>
                            {start ? start : getFormattedDate(new Date())} {blockConsultHourDay}
                          </div>
                          {consultHours && (
                            <FormGroup>
                              <FormControlLabel
                                control={<Checkbox value="consultHours" />}
                                label={`${convertFrom24To12Format(
                                  consultHours.startTime
                                )} - ${convertFrom24To12Format(consultHours.endTime)} | ${
                                  consultHours.consultMode
                                }`}
                                onChange={() => {
                                  setChackedSingleValue(consultHours);
                                  setChecked(!checked);
                                  // setInvalid(!invalid);
                                }}
                              />
                            </FormGroup>
                          )}
                        </div>
                      )}
                      {start !== end && (
                        <div>
                          {dateRange &&
                            dateRange.length > 0 &&
                            dateRange.map((item: any) => (
                              <div>
                                <div className={classes.formDate}>
                                  {item ? item : getFormattedDate(new Date())}{' '}
                                  {convertIntoDay(item)}
                                </div>

                                <FormGroup>
                                  <FormControlLabel
                                    control={<Checkbox value="checkedA" />}
                                    label={convertTocunsultBlockStartEndTime(item)}
                                  />
                                </FormGroup>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {daySelected && (
                    <div className={classes.fullRow}>
                      <FormControlLabel
                        disabled={!start}
                        className={classes.entireRow}
                        value={BlockOption.customtime}
                        label="Block custom time"
                        control={<AphRadio title="Block custom time" />}
                      />
                      {selectedBlockOption === 'customtime' && (
                        <div className={classes.entireDayContent}>
                          {customTimeArray &&
                            customTimeArray.length > 0 &&
                            customTimeArray.map((item: any, index: number) => {
                              return (
                                <span key={index.toString()}>
                                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <ThemeProvider theme={defaultMaterialTheme}>
                                      <Grid container alignItems="flex-start" spacing={0}>
                                        <Grid item lg={5} sm={5} xs={5}>
                                          <TextField
                                            onChange={(e) => {
                                              changeListStartTime(e.currentTarget.value, index);
                                              const obj = customTimeArray;
                                              obj[index].startTime = e.currentTarget.value;
                                              setStartVal(obj);
                                              setStartVal1(e.currentTarget.value);
                                            }}
                                            value={
                                              startVal[index].startTime === item.startTime
                                                ? item.startTime
                                                : startVal1
                                            }
                                            label="From"
                                            type="time"
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{
                                              style: { color: 'black ' },
                                            }}
                                            className={classes.timepicker}
                                          />
                                        </Grid>
                                        <Grid
                                          item
                                          lg={2}
                                          sm={2}
                                          xs={2}
                                          className={classes.deviderLine}
                                        >
                                          -
                                        </Grid>
                                        <Grid item lg={5} sm={5} xs={5}>
                                          <TextField
                                            onChange={(e) => {
                                              changeListEndTime(e.currentTarget.value, index);
                                              const obj = customTimeArray;
                                              obj[index].endTime = e.currentTarget.value;
                                              setVal(obj);
                                              setVal1(e.currentTarget.value);
                                            }}
                                            value={
                                              val[index].endTime === item.endTime
                                                ? item.endTime
                                                : val1
                                            }
                                            label="To"
                                            type="time"
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{
                                              style: {
                                                color: 'black',
                                                width: '100%',
                                              },
                                            }}
                                            className={classes.timepicker}
                                          />
                                        </Grid>
                                      </Grid>
                                    </ThemeProvider>
                                  </MuiPickersUtilsProvider>
                                </span>
                              );
                            })}
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <ThemeProvider theme={defaultMaterialTheme}>
                              <Grid container alignItems="flex-start" spacing={0}>
                                <Grid item lg={5} sm={5} xs={5}>
                                  <TextField
                                    onChange={(e) => setStartTime(e.currentTarget.value)}
                                    value={startTime}
                                    label="From"
                                    type="time"
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{ style: { color: 'black ' } }}
                                    className={classes.timepicker}
                                  />
                                </Grid>
                                <Grid item lg={2} sm={2} xs={2} className={classes.deviderLine}>
                                  -
                                </Grid>
                                <Grid item lg={5} sm={5} xs={5}>
                                  <TextField
                                    onChange={(e) => setEndTime(e.currentTarget.value)}
                                    value={endTime}
                                    label="To"
                                    type="time"
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                      style: { color: 'black', width: '100%' },
                                    }}
                                    className={classes.timepicker}
                                  />
                                </Grid>
                              </Grid>
                            </ThemeProvider>
                          </MuiPickersUtilsProvider>
                          <div>
                            <AphButton
                              variant="contained"
                              color="primary"
                              classes={{ root: classes.addblockedHours }}
                              onClick={(e) => addTimeArray()}
                            >
                              <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD ANOTHER
                              TIME SLOT
                            </AphButton>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </RadioGroup>
              </div>
            </div>
            {/* <TextField
              onChange={(e) => { console.log(e.currentTarget.value); setStart(e.currentTarget.value) }}
              value={start}
              label="From"
              type="date"
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { color: 'black' } }}
              className={classes.datepicker}
            /> */}
          </div>
          {/* {!daySelected && (<div>
            <div style={{ display: 'flex' }}>
              <AphTextField
                disabled={daySelected}
                onChange={(e) => { console.log(e.currentTarget.value); setEnd(e.currentTarget.value) }}
                value={end}
                label="To"
                type="date"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { color: 'black' } }}
                className={classes.datepicker}
              />
            </div>
          </div>)} */}
          {/* {daySelected && (
            <TextField
              onChange={(e) => setStartTime(e.currentTarget.value)}
              value={startTime}
              label="Start time"
              type="time"
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { color: 'black ' } }}
              className={classes.timepicker}
            />
          )}
          {daySelected && (
            <TextField
              onChange={(e) => setEndTime(e.currentTarget.value)}
              value={endTime}
              label="End time"
              type="time"
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { color: 'black', width: '100%' } }}
              className={classes.timepicker}
            />
          )} */}
        </div>
        {isOverlapError && (
          <div style={{ color: 'red' }}>Error! Blocked calendar items cannot overlap</div>
        )}
      </DialogContent>
      <DialogActions className={classes.modalFooter}>
        <Button
          variant="contained"
          onClick={(e) => handleSubmitComplete()}
          className={classes.cancelBtn}
        >
          CANCEL
        </Button>
        <Mutation<UpdateBlockedCalendarItem, UpdateBlockedCalendarItemVariables>
          mutation={UPDATE_BLOCKED_CALENDAR_ITEM}
          onCompleted={() => handleSubmitComplete()}
        >
          {(updateBlockedCalendarItem, { loading: updateLoading }) => (
            <Mutation<AddBlockedCalendarItem, AddBlockedCalendarItemVariables>
              mutation={ADD_BLOCKED_CALENDAR_ITEM}
              onCompleted={() => handleSubmitComplete()}
            >
              {(addBlockedCalendarItem, { loading: addLoading }) => {
                const loading = addLoading || updateLoading;
                return (
                  <Button
                    type="submit"
                    disabled={loading || invalid}
                    variant="contained"
                    onClick={() => {
                      //2019-10-18 2019-10-18
                      //console.log(start, end);
                      const startDate = parse(start, 'yyyy-MM-dd', new Date());
                      const endDate = parse(end, 'yyyy-MM-dd', new Date());
                      //console.log(startDate, endDate);
                      if (selectedBlockOption === 'consulthours' && chackedSingleValue) {
                        const [startHours, startMins] = chackedSingleValue.startTime.split(':');
                        startDate.setHours(parseInt(startHours, 10));
                        startDate.setMinutes(parseInt(startMins, 10));
                        const [endHours, endMins] = chackedSingleValue.endTime.split(':');
                        endDate.setHours(parseInt(endHours, 10));
                        endDate.setMinutes(parseInt(endMins, 10));
                      }
                      if (durationSelected) {
                        startDate.setHours(0);
                        startDate.setMinutes(0);
                        endDate.setHours(23);
                        endDate.setMinutes(59);
                      } else {
                        if (startTime && endTime) {
                          const [startHours, startMins] = startTime.split(':');
                          startDate.setHours(parseInt(startHours, 10));
                          startDate.setMinutes(parseInt(startMins, 10));
                          const [endHours, endMins] = endTime.split(':');
                          endDate.setHours(parseInt(endHours, 10));
                          endDate.setMinutes(parseInt(endMins, 10));
                        } else {
                          startDate.setHours(0);
                          startDate.setMinutes(0);
                          endDate.setHours(23);
                          endDate.setMinutes(59);
                        }
                      }
                      const addArgs = {
                        refetchQueries: [
                          {
                            query: GET_BLOCKED_CALENDAR,
                            variables: { doctorId },
                          },
                        ],
                        awaitRefetchQueries: true,
                        variables: {
                          doctorId,
                          start: startDate.toISOString(),
                          end: endDate.toISOString(),
                          reason: blockReason,
                        },
                      };
                      const handleError = (error: ApolloError) => {
                        const networkErrorMessage = error.networkError
                          ? error.networkError.message
                          : null;
                        const allMessages = error.graphQLErrors
                          .map((e) => e.message)
                          .concat(networkErrorMessage ? networkErrorMessage : []);
                        const isOverlapError = allMessages.includes(
                          AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS
                        );
                        setIsOverlapError(isOverlapError);
                      };
                      const isUpdate = item && item.id != null;
                      //console.log(addArgs);
                      if (isUpdate) {
                        const updateArgs = {
                          ...addArgs,
                          variables: { ...addArgs.variables, id: item!.id },
                        };
                        updateBlockedCalendarItem(updateArgs).catch(handleError);
                      } else {
                        addBlockedCalendarItem(addArgs).catch(handleError);
                      }
                    }}
                  >
                    {loading && <CircularProgress size={20} />} BLOCK CALENDAR
                  </Button>
                );
              }}
            </Mutation>
          )}
        </Mutation>
      </DialogActions>
    </Dialog>
  );
};
