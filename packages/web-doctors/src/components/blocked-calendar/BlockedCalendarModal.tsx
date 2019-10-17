import { AphRadio } from '@aph/web-ui-components';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  RadioGroup,
  TextField,
} from '@material-ui/core';
import { Theme } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { DialogProps } from '@material-ui/core/Dialog';
import { AphSelect, AphTextField } from '@aph/web-ui-components';
import DateFnsUtils from '@date-io/date-fns';
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

export interface BlockedCalendarAddModalProps {
  dialogProps: DialogProps & { onClose: () => void };
  doctorId: string;
  item?: Item | null;
}

export const BlockedCalendarAddModal: React.FC<BlockedCalendarAddModalProps> = (props) => {
  enum RadioValues {
    DAY = 'DAY',
    DURATION = 'DURATION',
  }
  const { item, dialogProps, doctorId } = props;
  const [selectedValue, setSelectedValue] = useState(RadioValues.DURATION);
  const daySelected = selectedValue === RadioValues.DAY;
  const durationSelected = selectedValue === RadioValues.DURATION;
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isOverlapError, setIsOverlapError] = useState(false);

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
  const timeInvalid = daySelected ? !startTime || !endTime || endTime <= startTime : false;

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
      TodatTm[2] + '/' + TodatTm[0] + '/' + TodatTm[1];
    console.log(
      stTm[2] +
      '/' +
      (stTm[0] && stTm[0].length < 2 ? '0' + stTm[0] : stTm[0]) +
      '/' +
      (stTm[1] && stTm[1].length < 2 ? '0' + stTm[1] : stTm[1]),
      TodatTm[2] + '/' + TodatTm[0] + '/' + TodatTm[1]
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
  const invalid = dateInvalid || timeInvalid || invalidStTime || invalidTime;

  const handleSubmitComplete = () => {
    setStart('');
    setEnd('');
    setStartTime('');
    setEndTime('');
    setIsOverlapError(false);
    dialogProps.onClose();
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
          marginBottom: 20,
          color: 'rgba(2, 71, 91, 0.6)',
          fontSize: 14,
        },
      },
      datepicker: {
        width: '100%',
        marginBottom: 20,
      },
      timepicker: {
        margin: '10px 20px 10px 0',
        width: '30%',
        borderBottom: '2px solid #00b38e',
        '&:hover': {
          borderBottom: '2px solid #00b38e',
        },
      },
      KeyboardDatePicker: {
        width: '100%',
        color: '#02475b',
        '& svg': {
          fill: '#02475b',
        },
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
          color: '#01475b',
          borderBottom: '2px solid #00b38e',
          fontWeight: 500,
        },
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
        fontSize: 12,
        color: '#80a3ad !important',
        fontWeight: 600,
      },
    },
  });
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState(new Date('2019-10-17T21:11:54'));
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
          onChange={(e) => setSelectedValue((e.target as HTMLInputElement).value as RadioValues)}
          row
        >
          <FormControlLabel
            value={RadioValues.DURATION}
            label="For a duration"
            control={<AphRadio title="For a duration" />}
          />
          <FormControlLabel
            value={RadioValues.DAY}
            label="For a day"
            control={<AphRadio title="For a day" />}
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
                    label="From"
                    value={start}
                    onChange={(date) => { setStart(date ? date.toString() : '') }}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </div>
                {!daySelected && (
                  <div>
                    <KeyboardDatePicker
                      className={classes.KeyboardDatePicker}
                      disableToolbar
                      variant="inline"
                      format="MM-dd-yyyy"
                      margin="normal"
                      id="date-picker-inline"
                      label="To"
                      value={end}
                      onChange={(date) => { console.log(date ? date.toString() : ''); setEnd(date ? date.toString() : '') }}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                    />
                  </div>)}
              </ThemeProvider>
            </MuiPickersUtilsProvider>
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
          {daySelected && (
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
          )}
        </div>
        {isOverlapError && (
          <div style={{ color: 'red' }}>Error! Blocked calendar items cannot overlap</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={(e) => handleSubmitComplete()}>
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
                      const startDate = parse(start, 'yyyy-MM-dd', new Date());
                      const endDate = parse(end, 'yyyy-MM-dd', new Date());
                      if (durationSelected) {
                        startDate.setHours(0);
                        startDate.setMinutes(0);
                        endDate.setHours(23);
                        endDate.setMinutes(59);
                      } else {
                        const [startHours, startMins] = startTime.split(':');
                        startDate.setHours(parseInt(startHours, 10));
                        startDate.setMinutes(parseInt(startMins, 10));
                        const [endHours, endMins] = endTime.split(':');
                        endDate.setHours(parseInt(endHours, 10));
                        endDate.setMinutes(parseInt(endMins, 10));
                      }
                      const addArgs = {
                        refetchQueries: [{ query: GET_BLOCKED_CALENDAR, variables: { doctorId } }],
                        awaitRefetchQueries: true,
                        variables: {
                          doctorId,
                          start: startDate.toISOString(),
                          end: endDate.toISOString(),
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
