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
  BLOCK_MULTIPLE_CALENDAR_ITEMS,
} from 'graphql/doctors';
import {
  AddBlockedCalendarItem,
  AddBlockedCalendarItemVariables,
} from 'graphql/types/AddBlockedCalendarItem';
import {
  BlockMultipleCalendarItems,
  BlockMultipleCalendarItemsVariables,
} from 'graphql/types/BlockMultipleCalendarItems';
import React, { useState, useEffect, useRef } from 'react';
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
import { any, number } from 'prop-types';
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
  const [isPastTimeError, setIsPastTimeError] = useState(false);
  const [blockReason, setBlockReason] = useState('personal leave');
  const [val, setVal] = useState(customTimeArray);
  const [val1, setVal1] = useState();
  const [startVal, setStartVal] = useState(customTimeArray);
  const [startVal1, setStartVal1] = useState();
  const [dateRange, setDateRange] = useState();
  const [chackedSingleValue, setChackedSingleValue] = useState();
  const [checked, setChecked] = useState(false);
  const [listChecked, setListChecked] = useState(false);
  const [startEndList, setStartEndList] = useState();
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

  const handleSubmitComplete = () => {
    setStart('');
    setEnd('');
    setStartTime('');
    setEndTime('');
    setIsOverlapError(false);
    setIsPastTimeError(false);
    dialogProps.onClose();
    customTimeArray.length = 0;
    setSelectedBlockOption(BlockOption.entireday);
    setIsTimeValid(true);
    setIsallreadyInArray(true);
    setIsPastTime(true);

    if (dateRange && dateRange > 0) {
      setDateRange((dateRange.length = 0));
    }
  };
  const useStyles = makeStyles((theme: Theme) => {
    return {
      errorMsg: {
        color: '#f00',
      },
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
      BlockedCalendarModal: {
        width: 600,
        left: '50% !important',
        marginLeft: '-300px',
      },
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
            borderBottom: '2px solid #00b38e !important',
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
        backgroundColor: 'transparent !important',
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
      blockCalBtn: {
        backgroundColor: '#fc9916',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        '&:hover': {
          backgroundColor: '#fc9916',
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
        marginBottom: 0,
        paddingBottom: 5,
      },

      fullRow: {
        width: '100%',
      },
      formContainer: {
        width: '100% !important',
        color: '#0087ba !important',
      },
      blueRadio: {
        '& svg': {
          '& path': {
            color: '#0087ba !important',
          },
        },
      },
      consultHoursRange: {
        marginBottom: 15,
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
  const fromDatePickerRef = useRef(null);
  const toDatePickerRef = useRef(null);
  const TextFieldComponent = (props: any) => {
    return <TextField {...props} disabled={true} />;
  };
  var options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' };
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
  const convertFrom24To12Format = (slotTime: string) => {
    const currentDay = new Date().getDate();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const utcDate =
      new Date(
        new Date(`${currentYear}-${currentMonth}-${currentDay} ${slotTime}`).toUTCString()
      ).getTime() + +(5.5 * 60 * 60 * 1000);
    return format(utcDate, 'p');
  };
  // const convertTime = (time24: any) => {
  //   const [sHours, minutes] = time24.match(/([0-9]{1,2}):([0-9]{2})/).slice(1);
  //   const period = +sHours < 12 ? "AM" : "PM";
  //   const hours = +sHours % 12 || 12;

  //   return `${hours}:${minutes} ${period}`;
  // };
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

  const listOfStartEnd = (value: any) => {
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
    const startTime =
      consultDurationDay && consultDurationDay.startTime ? consultDurationDay.startTime : '';
    const endTime = consultDurationDay.endTime;

    const [startHours, startMins] = startTime.split(':');
    let localhours = Number(startHours) + 5;
    let localMinuts = Number(startMins) + 30;

    if (localMinuts > 59) {
      localMinuts = Number(localMinuts) - 60;
      localhours = Number(localhours) + 1;
      if (localhours > 23) {
        localhours = 0;
      }
    }
    const startDate = parse(value, 'yyyy-MM-dd', new Date());
    const endDate = parse(value, 'yyyy-MM-dd', new Date());
    startDate.setHours(parseInt(localhours.toString(), 10));
    startDate.setMinutes(parseInt(localMinuts.toString(), 10));
    const [endHours, endMins] = endTime.split(':');
    let localEndhours = Number(endHours) + 5;
    let localEndMinuts = Number(endMins) + 30;
    if (localEndMinuts > 59) {
      localEndMinuts = Number(localEndMinuts) - 60;
      localEndhours = Number(localEndhours) + 1;
      if (localEndhours > 23) {
        localEndhours = 0;
      }
    }

    endDate.setHours(parseInt(localEndhours.toString(), 10));
    endDate.setMinutes(parseInt(localEndMinuts.toString(), 10));
    let obj = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
    if (startEndList && startEndList.length > 0) {
      const xyz =
        startEndList &&
        _.filter(startEndList, function(o) {
          if (o && o.start) {
            return new Date(o.start).getDate() === new Date(obj.start).getDate();
          }
        });
      let index = 0;
      for (var i = 0; i < startEndList.length; i++) {
        if (new Date(startEndList[i].start).getDate() == new Date(obj.start).getDate()) {
          index = i;
        }
      }
      if (xyz && xyz.length > 0) {
        const local = startEndList;
        local.splice(index, 1);
        setStartEndList(local);
      } else {
        const local1 = startEndList;
        local1.push(obj);
        setStartEndList(local1);
      }
    } else {
      const local2: any = [];
      local2.push(obj);
      setStartEndList(local2);
    }
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
    const startTime =
      consultDurationDay && consultDurationDay.startTime
        ? convertFrom24To12Format(consultDurationDay && consultDurationDay.startTime)
        : '';
    const endTime =
      consultDurationDay && consultDurationDay.endTime
        ? convertFrom24To12Format(consultDurationDay && consultDurationDay.endTime)
        : '';
    var options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' };
    return startTime && endTime
      ? ` ${startTime} - ${endTime}  |  ${
          consultDurationDay && consultDurationDay.consultMode
            ? convertConsultMode(consultDurationDay.consultMode)
            : ''
        }`
      : 'No slots avialble for this date';
  };

  const convertConsultMode = (value: any) => {
    if (value === 'PHYSICAL') {
      return 'Physical';
    } else if (value === 'ONLINE') {
      return 'Online';
    } else {
      return 'Both';
    }
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
  const nextTODate = (val: any) => {
    const today = new Date(val);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };
  const [isTimeValid, setIsTimeValid] = useState(true);
  const [isallreadyInArray, setIsallreadyInArray] = useState(true);
  const [isPastTime, setIsPastTime] = useState(true);
  useEffect(() => {
    if (isPastTimeError || isOverlapError) {
      customTimeArray.length = 0;
      setStartTime('');
      setEndTime('');
    }
  }, [isPastTimeError, isOverlapError, customTimeArray]);
  useEffect(() => {
    if (checked) {
    }
  }, [isPastTimeError, isOverlapError, customTimeArray]);
  useEffect(() => {
    if (new Date(start).getDate() === new Date().getDate()) {
      if (startTime && startTime.length > 0) {
        const [shours, smins] = startTime.split(':');
        var startHour = shours;
        var startMinute = smins;
        var startTimeObject = new Date();
        startTimeObject.setHours(Number(startHour), Number(startMinute));
        const currentHours = new Date().getHours();
        const currentMinuts = new Date().getMinutes() + 1;
        var currentTimeObject = new Date();
        currentTimeObject.setHours(Number(currentHours), Number(currentMinuts));
        if (startTimeObject < currentTimeObject) {
          setIsPastTime(false);
        } else {
          setIsPastTime(true);
        }
      }
    } else {
      setIsPastTime(true);
    }
  }, [startTime, start]);

  useEffect(() => {
    if (startTime && endTime && startTime.length > 0 && endTime.length > 0) {
      const [shours, smins] = startTime.split(':');
      var startHour = shours;
      var startMinute = smins;
      //  var startSecond = extractedStartSecond;
      const [ehours, emins] = endTime.split(':');
      var endHour = ehours;
      var endMinute = Number(emins) - 1;
      //  var endSecond = extractedEndSecond;

      //Create date object and set the time to that
      var startTimeObject = new Date();
      startTimeObject.setHours(Number(startHour), Number(startMinute));

      //Create date object and set the time to that
      var endTimeObject = new Date(startTimeObject);
      endTimeObject.setHours(Number(endHour), Number(endMinute));

      //Now we are ready to compare both the dates
      if (startTimeObject > endTimeObject) {
        setIsTimeValid(false);
      } else {
        setIsTimeValid(true);
      }
    }
  }, [startTime, endTime]);
  useEffect(() => {
    if (startTime && customTimeArray && startTime.length > 0 && customTimeArray.length > 0) {
      const [shours, smins] = startTime.split(':');
      var startHour = shours;
      var startMinute = smins;
      var startTimeObject = new Date();
      startTimeObject.setHours(Number(startHour), Number(startMinute));
      customTimeArray.map((value: any) => {
        if (value && value.startTime && value.endTime) {
          const [arrayshours, arraysmins] = value.startTime.split(':');
          var arraystartHour = arrayshours;
          var arraystartMinute = arraysmins;
          //  var startSecond = extractedStartSecond;
          const [arrayehours, arrayemins] = value.endTime.split(':');
          var arrayendHour = arrayehours;
          var arrayendMinute = arrayemins;
          //  var endSecond = extractedEndSecond;

          //Create date object and set the time to that
          var startArrayTimeObject = new Date();
          startArrayTimeObject.setHours(Number(arraystartHour), Number(arraystartMinute));

          //Create date object and set the time to that
          var endArrayTimeObject = new Date(startTimeObject);
          endArrayTimeObject.setHours(Number(arrayendHour), Number(arrayendMinute));
          if (startArrayTimeObject <= startTimeObject) {
            if (startTimeObject < endArrayTimeObject) {
              setIsallreadyInArray(false);
            } else {
              setIsallreadyInArray(true);
            }
          } else {
            setIsallreadyInArray(true);
          }
          if (endTime && startTime) {
            const [ehours, emins] = endTime.split(':');
            var endHour = ehours;
            var endMinute = emins;
            var endTimeObject = new Date();
            endTimeObject.setHours(Number(endHour), Number(endMinute));

            if (startTimeObject <= startArrayTimeObject) {
              if (startArrayTimeObject <= endTimeObject) {
                setIsallreadyInArray(false);
              } else {
                setIsallreadyInArray(true);
              }
            } else if (startArrayTimeObject < startTimeObject) {
              if (startTimeObject < endArrayTimeObject) {
                setIsallreadyInArray(false);
              } else {
                setIsallreadyInArray(true);
              }
            } else {
              setIsallreadyInArray(true);
            }
          }
        }
      });

      //Now we are ready to compare both the dates
    }
  }, [startTime, endTime, customTimeArray]);

  useEffect(() => {
    if (isOverlapError && customTimeArray) {
      customTimeArray.length = 0;
      setSelectedBlockOption(BlockOption.entireday);
      setIsTimeValid(true);
      setIsallreadyInArray(true);
      setIsPastTime(true);
      setIsPastTimeError(false);
      // setIsOverlapError(false);
      setChecked(false);
    }
  }, [isOverlapError, customTimeArray]);
  useEffect(() => {
    if (selectedBlockOption === 'entireday') {
      setInvalid(dateInvalid || timeInvalid || invalidStTime || invalidTime);
      setIsTimeValid(true);
      setIsallreadyInArray(true);
      setIsPastTime(true);
      setIsPastTimeError(false);
      setChecked(false);
      customTimeArray.length = 0;
      setChackedSingleValue('');
      // setStartEndList([])
    } else if (
      durationSelected &&
      selectedBlockOption === 'consulthours' &&
      startEndList &&
      startEndList.length < 1
    ) {
      setInvalid(true);
    } else if (
      durationSelected &&
      selectedBlockOption === 'consulthours' &&
      startEndList &&
      startEndList.length > 0
    ) {
      setInvalid(false);
    } else if (selectedBlockOption === 'consulthours' && !chackedSingleValue && !checked) {
      setInvalid(true);
    } else if (selectedBlockOption === 'consulthours' && chackedSingleValue && checked) {
      setInvalid(false);
    } else if (selectedBlockOption === 'consulthours' && chackedSingleValue && !checked) {
      setInvalid(true);
    } else if (selectedBlockOption === 'customtime') {
      setInvalid(customTimeArray && customTimeArray.length < 1);
      if (startTime && endTime) {
        setInvalid(false);
      }
      if (customTimeArray && customTimeArray.length > 0) {
        setInvalid(false);
      }
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
    startTime,
    endTime,
    durationSelected,
    startEndList,
  ]);
  useEffect(() => {
    if (selectedBlockOption === 'entireday' || selectedBlockOption === 'consulthours') {
      setStartTime('');
      setEndTime('');
    }
  }, [startTime, endTime, selectedBlockOption]);
  useEffect(() => {
    if (
      durationSelected &&
      (selectedBlockOption === 'entireday' || selectedBlockOption === 'customtime')
    ) {
      setStartEndList('');
    }
  }, [durationSelected, selectedBlockOption, startEndList]);
  return (
    <span>
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
              setIsTimeValid(true);
              setIsallreadyInArray(true);
              setIsPastTime(true);
              setIsPastTimeError(false);
              setIsOverlapError(false);
              setChecked(false);
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
                  <div ref={fromDatePickerRef}>
                    <KeyboardDatePicker
                      className={classes.KeyboardDatePicker}
                      disableToolbar
                      variant="inline"
                      format="iii, dd/MM/yyyy"
                      margin="normal"
                      label={
                        daySelected
                          ? 'Which day would you like to block your calendar for?'
                          : 'From'
                      }
                      value={start}
                      minDate={new Date()}
                      onChange={(date) => {
                        setIsOverlapError(false);
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
                      PopoverProps={{
                        anchorEl: fromDatePickerRef.current,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'center',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'center',
                        },
                      }}
                      autoOk
                      TextFieldComponent={TextFieldComponent}
                    />
                  </div>
                  {!daySelected && (
                    <div ref={toDatePickerRef}>
                      <KeyboardDatePicker
                        className={classes.KeyboardDatePicker}
                        disableToolbar
                        variant="inline"
                        format="iii, dd/MM/yyy"
                        margin="normal"
                        label="To"
                        disabled={!start}
                        minDate={new Date(start)}
                        value={end}
                        onChange={(date) => {
                          setEnd(date ? getFormattedDate(date) : '');
                          getDateRange(start ? start : '', date ? date : '');
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'change date',
                        }}
                        PopoverProps={{
                          anchorEl: toDatePickerRef.current,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'center',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                          },
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
                    onChange={(e) => {
                      setSelectedBlockOption((e.target as HTMLInputElement).value as BlockOption);
                      setIsTimeValid(true);
                      setIsallreadyInArray(true);
                      setIsPastTime(true);
                      setIsPastTimeError(false);
                      setIsOverlapError(false);
                      setChecked(false);
                    }}
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
                        {start === end && (
                          <div>
                            {consultHours ? (
                              <div className={classes.formDate}>
                                <p>
                                  These are your active consult hours for the selected day. Select
                                  which ones you’d like to block:
                                </p>
                                {start
                                  ? new Date(start).toLocaleDateString('en-AU', options)
                                  : getFormattedDate(new Date())}
                                {/* {blockConsultHourDay} */}
                              </div>
                            ) : (
                              <p>You don't have any active consult hours on the selected day</p>
                            )}
                            {consultHours && (
                              <FormGroup>
                                <FormControlLabel
                                  className={classes.formContainer}
                                  control={<Checkbox value="consultHours" />}
                                  label={`${convertFrom24To12Format(
                                    consultHours.startTime
                                  )} - ${convertFrom24To12Format(
                                    consultHours.endTime
                                  )} | ${convertConsultMode(consultHours.consultMode)}`}
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
                            {dateRange && dateRange.length > 0 ? (
                              <p>
                                These are your active consult hours for the selected day. Select
                                which ones you’d like to block:
                              </p>
                            ) : (
                              <p>You don't have any active consult hours on the selected day</p>
                            )}

                            {dateRange &&
                              dateRange.length > 0 &&
                              dateRange.map((item: any) => (
                                <>
                                  {convertTocunsultBlockStartEndTime(item) !==
                                  'No slots avialble for this date' ? (
                                    <div className={classes.consultHoursRange}>
                                      <div className={classes.formDate}>
                                        {item
                                          ? new Date(item).toLocaleDateString('en-AU', options)
                                          : getFormattedDate(new Date())}{' '}
                                        {/* {convertIntoDay(item)} */}
                                      </div>

                                      <FormGroup>
                                        <FormControlLabel
                                          disabled={
                                            convertTocunsultBlockStartEndTime(item) ===
                                            'No slots avialble for this date'
                                          }
                                          className={`${classes.formContainer} ${classes.blueRadio}`}
                                          control={<Checkbox value="checkedA" />}
                                          label={convertTocunsultBlockStartEndTime(item)}
                                          onChange={() => {
                                            listOfStartEnd(item);
                                            setChecked(!checked);
                                          }}
                                        />
                                      </FormGroup>
                                    </div>
                                  ) : null}
                                </>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* {daySelected && ( */}
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
                                          <form noValidate>
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
                                          </form>
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
                                          <form noValidate>
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
                                          </form>
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
                                  <form noValidate>
                                    <TextField
                                      onChange={(e) => {
                                        setStartTime(e.currentTarget.value);
                                      }}
                                      value={startTime}
                                      label="From"
                                      type="time"
                                      InputLabelProps={{ shrink: true }}
                                      InputProps={{ style: { color: 'black ' } }}
                                      className={classes.timepicker}
                                    />
                                  </form>
                                </Grid>
                                <Grid item lg={2} sm={2} xs={2} className={classes.deviderLine}>
                                  -
                                </Grid>
                                <Grid item lg={5} sm={5} xs={5}>
                                  <form noValidate>
                                    <TextField
                                      onChange={(e) => {
                                        setEndTime(e.currentTarget.value);
                                      }}
                                      value={endTime}
                                      label="To"
                                      type="time"
                                      InputLabelProps={{ shrink: true }}
                                      InputProps={{
                                        style: { color: 'black', width: '100%' },
                                      }}
                                      className={classes.timepicker}
                                    />
                                  </form>
                                </Grid>
                              </Grid>
                            </ThemeProvider>
                          </MuiPickersUtilsProvider>
                          {!isTimeValid && (
                            <p className={classes.errorMsg}>
                              End time should be greater than start time
                            </p>
                          )}
                          {!isallreadyInArray && (
                            <p className={classes.errorMsg}>
                              You are trying to duplicate the blocking of same slot, please recheck
                              and try again
                            </p>
                          )}
                          {!isPastTime && (
                            <p className={classes.errorMsg}>Past time slots cannot be blocked</p>
                          )}
                          <div>
                            <AphButton
                              variant="contained"
                              color="primary"
                              disabled={!isTimeValid || !isallreadyInArray || !isPastTime}
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
                    {/* )} */}
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
            <div style={{ color: 'red' }}>
              You are trying to duplicate the blocking of same slot, please recheck and try again !
            </div>
          )}
          {isPastTimeError && <div style={{ color: 'red' }}>Past time slots cannot be blocked</div>}
        </DialogContent>
        <DialogActions className={classes.modalFooter}>
          <Button
            variant="contained"
            onClick={(e) => handleSubmitComplete()}
            className={classes.cancelBtn}
          >
            CANCEL
          </Button>

          <Mutation<BlockMultipleCalendarItems, BlockMultipleCalendarItemsVariables>
            mutation={BLOCK_MULTIPLE_CALENDAR_ITEMS}
            onCompleted={() => handleSubmitComplete()}
          >
            {(BlockMultipleCalendarItems, { loading: multipleLoading }) => (
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
                      const loading = addLoading || updateLoading || multipleLoading;
                      return (
                        <Button
                          type="submit"
                          disabled={
                            loading ||
                            invalid ||
                            !isTimeValid ||
                            !isallreadyInArray ||
                            !isPastTime ||
                            new Date(start).getDate() > new Date(end).getDate()
                          }
                          variant="contained"
                          className={classes.blockCalBtn}
                          onClick={() => {
                            const startDate = parse(start, 'yyyy-MM-dd', new Date());
                            const endDate = parse(end, 'yyyy-MM-dd', new Date());
                            if (durationSelected) {
                              if (new Date().getDate() === new Date(start).getDate()) {
                                const currentHours = new Date().getHours();
                                const currentMinuts = new Date().getMinutes() + 1;
                                startDate.setHours(parseInt(currentHours.toString(), 10));
                                startDate.setMinutes(parseInt(currentMinuts.toString(), 10));
                              } else {
                                startDate.setHours(0);
                                startDate.setMinutes(0);
                              }
                              endDate.setHours(23);
                              endDate.setMinutes(59);
                            } else if (selectedBlockOption === 'entireday') {
                              if (startTime && endTime) {
                                const [startHours, startMins] = startTime.split(':');
                                startDate.setHours(parseInt(startHours, 10));
                                startDate.setMinutes(parseInt(startMins, 10));
                                const [endHours, endMins] = endTime.split(':');
                                endDate.setHours(parseInt(endHours, 10));
                                endDate.setMinutes(parseInt(endMins, 10));
                              } else {
                                if (new Date().getDate() === new Date(start).getDate()) {
                                  const currentHours = new Date().getHours();
                                  const currentMinuts = new Date().getMinutes() + 1;
                                  startDate.setHours(parseInt(currentHours.toString(), 10));
                                  startDate.setMinutes(parseInt(currentMinuts.toString(), 10));
                                } else {
                                  startDate.setHours(0);
                                  startDate.setMinutes(0);
                                }
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
                              const isPastTimeError = allMessages.includes(
                                AphErrorMessages.INVALID_DATES
                              );
                              setIsPastTimeError(isPastTimeError);
                            };
                            const isUpdate = item && item.id != null;
                            if (isUpdate) {
                              const updateArgs = {
                                ...addArgs,
                                variables: { ...addArgs.variables, id: item!.id },
                              };
                              updateBlockedCalendarItem(updateArgs).catch(handleError);
                            } else if (durationSelected && selectedBlockOption === 'consulthours') {
                              if (start === end) {
                                const [startHours, startMins] = chackedSingleValue.startTime.split(
                                  ':'
                                );
                                let localhours = Number(startHours) + 5;
                                let localMinuts = Number(startMins) + 30;

                                if (localMinuts > 59) {
                                  localMinuts = Number(localMinuts) - 60;
                                  localhours = Number(localhours) + 1;
                                  if (localhours > 23) {
                                    localhours = 0;
                                  }
                                }

                                startDate.setHours(parseInt(localhours.toString(), 10));
                                startDate.setMinutes(parseInt(localMinuts.toString(), 10));
                                const [endHours, endMins] = chackedSingleValue.endTime.split(':');
                                let localEndhours = Number(endHours) + 5;
                                let localEndMinuts = Number(endMins) + 30;

                                if (localEndMinuts > 59) {
                                  localEndMinuts = Number(localEndMinuts) - 60;
                                  localEndhours = Number(localEndhours) + 1;
                                  if (localEndhours > 23) {
                                    localEndhours = 0;
                                  }
                                }
                                endDate.setHours(parseInt(localEndhours.toString(), 10));
                                endDate.setMinutes(parseInt(localEndMinuts.toString(), 10));

                                const addMultiArgs = {
                                  refetchQueries: [
                                    {
                                      query: GET_BLOCKED_CALENDAR,
                                      variables: { doctorId },
                                    },
                                  ],
                                  awaitRefetchQueries: true,
                                  variables: {
                                    blockCalendarInputs: {
                                      doctorId,
                                      reason: '',
                                      itemDetails: [
                                        {
                                          start: startDate.toISOString(),
                                          end: endDate.toISOString(),
                                          consultMode: chackedSingleValue.consultMode,
                                        },
                                      ],
                                    },
                                  },
                                };
                                BlockMultipleCalendarItems(addMultiArgs).catch(handleError);
                              } else {
                                const addMultiArgs = {
                                  refetchQueries: [
                                    {
                                      query: GET_BLOCKED_CALENDAR,
                                      variables: { doctorId },
                                    },
                                  ],
                                  awaitRefetchQueries: true,
                                  variables: {
                                    blockCalendarInputs: {
                                      doctorId,
                                      reason: '',
                                      itemDetails: startEndList,
                                    },
                                  },
                                };
                                BlockMultipleCalendarItems(addMultiArgs).catch(handleError);
                              }
                            } else if (selectedBlockOption === 'consulthours') {
                              if (selectedBlockOption === 'consulthours' && chackedSingleValue) {
                                const [startHours, startMins] = chackedSingleValue.startTime.split(
                                  ':'
                                );
                                let localhours = Number(startHours) + 5;
                                let localMinuts = Number(startMins) + 30;

                                if (localMinuts > 59) {
                                  localMinuts = Number(localMinuts) - 60;
                                  localhours = Number(localhours) + 1;
                                  if (localhours > 23) {
                                    localhours = 0;
                                  }
                                }

                                startDate.setHours(parseInt(localhours.toString(), 10));
                                startDate.setMinutes(parseInt(localMinuts.toString(), 10));
                                const [endHours, endMins] = chackedSingleValue.endTime.split(':');
                                let localEndhours = Number(endHours) + 5;
                                let localEndMinuts = Number(endMins) + 30;

                                if (localEndMinuts > 59) {
                                  localEndMinuts = Number(localEndMinuts) - 60;
                                  localEndhours = Number(localEndhours) + 1;
                                  if (localEndhours > 23) {
                                    localEndhours = 0;
                                  }
                                }
                                endDate.setHours(parseInt(localEndhours.toString(), 10));
                                endDate.setMinutes(parseInt(localEndMinuts.toString(), 10));
                              }
                              const addMultiArgs = {
                                refetchQueries: [
                                  {
                                    query: GET_BLOCKED_CALENDAR,
                                    variables: { doctorId },
                                  },
                                ],
                                awaitRefetchQueries: true,
                                variables: {
                                  blockCalendarInputs: {
                                    doctorId,
                                    reason: '',
                                    itemDetails: [
                                      {
                                        start: startDate.toISOString(),
                                        end: endDate.toISOString(),
                                        consultMode: chackedSingleValue.consultMode,
                                      },
                                    ],
                                  },
                                },
                              };

                              BlockMultipleCalendarItems(addMultiArgs).catch(handleError);
                            } else if (durationSelected && selectedBlockOption === 'customtime') {
                              if (startTime && endTime) {
                                let obj = {
                                  startTime: startTime,
                                  endTime: endTime,
                                };
                                customTimeArray.push(obj);
                              }

                              if (customTimeArray && dateRange) {
                                const dateRangeArray: any = [];
                                dateRange.map((dateItem: any, dateIndex: number) => {
                                  customTimeArray.map((item: any, index: number) => {
                                    const [startHours, startMins] = item.startTime.split(':');
                                    const rangeStartDate = new Date(dateItem);
                                    const rangeEndDate = new Date(dateItem);
                                    rangeStartDate.setHours(parseInt(startHours, 10));
                                    rangeStartDate.setMinutes(parseInt(startMins, 10));
                                    const [endHours, endMins] = item.endTime.split(':');
                                    rangeEndDate.setHours(parseInt(endHours, 10));
                                    rangeEndDate.setMinutes(parseInt(endMins, 10));
                                    let obj = {
                                      start: rangeStartDate.toISOString(),
                                      end: rangeEndDate.toISOString(),
                                    };
                                    dateRangeArray.push(obj);
                                  });
                                });

                                const addMultiArgs = {
                                  refetchQueries: [
                                    {
                                      query: GET_BLOCKED_CALENDAR,
                                      variables: { doctorId },
                                    },
                                  ],
                                  awaitRefetchQueries: true,
                                  variables: {
                                    blockCalendarInputs: {
                                      doctorId,
                                      reason: '',
                                      itemDetails: dateRangeArray,
                                    },
                                  },
                                };

                                BlockMultipleCalendarItems(addMultiArgs).catch(handleError);
                              }
                            } else if (selectedBlockOption === 'customtime') {
                              if (startTime && endTime) {
                                let obj = {
                                  startTime: startTime,
                                  endTime: endTime,
                                };
                                customTimeArray.push(obj);
                              }
                              if (customTimeArray) {
                                const dateRangeArray: any = [];
                                customTimeArray.map((item: any, index: number) => {
                                  const [startHours, startMins] = item.startTime.split(':');
                                  startDate.setHours(parseInt(startHours, 10));
                                  startDate.setMinutes(parseInt(startMins, 10));
                                  const [endHours, endMins] = item.endTime.split(':');
                                  endDate.setHours(parseInt(endHours, 10));
                                  endDate.setMinutes(parseInt(endMins, 10));
                                  let obj = {
                                    start: startDate.toISOString(),
                                    end: endDate.toISOString(),
                                  };
                                  dateRangeArray.push(obj);
                                });

                                const addMultiArgs = {
                                  refetchQueries: [
                                    {
                                      query: GET_BLOCKED_CALENDAR,
                                      variables: { doctorId },
                                    },
                                  ],
                                  awaitRefetchQueries: true,
                                  variables: {
                                    blockCalendarInputs: {
                                      doctorId,
                                      reason: '',
                                      itemDetails: dateRangeArray,
                                    },
                                  },
                                };

                                BlockMultipleCalendarItems(addMultiArgs).catch(handleError);
                              }
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
            )}
          </Mutation>
        </DialogActions>
      </Dialog>
    </span>
  );
};
