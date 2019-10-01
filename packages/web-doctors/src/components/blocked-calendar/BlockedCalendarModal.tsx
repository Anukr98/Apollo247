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
import { DialogProps } from '@material-ui/core/Dialog';
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

  const dateInvalid =
    !start || !end || new Date() > new Date(start) || new Date(end) < new Date(start);
  const timeInvalid = daySelected ? !startTime || !endTime || endTime < startTime : false;
  const invalid = dateInvalid || timeInvalid;

  const handleSubmitComplete = () => {
    setStart('');
    setEnd('');
    setStartTime('');
    setEndTime('');
    setIsOverlapError(false);
    dialogProps.onClose();
  };

  return (
    <Dialog {...dialogProps} data-cypress="BlockedCalendarModal">
      <DialogTitle style={{ color: 'black' }}>BLOCK CALENDAR</DialogTitle>
      <DialogContent style={{ color: 'black' }}>
        <RadioGroup
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
          <div style={{ display: 'flex' }}>
            <TextField
              onChange={(e) => setStart(e.currentTarget.value)}
              value={start}
              label="Start"
              type="date"
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { color: 'black ' } }}
            />
            {daySelected && (
              <TextField
                onChange={(e) => setStartTime(e.currentTarget.value)}
                value={startTime}
                label="Start time"
                type="time"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { color: 'black ' } }}
              />
            )}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex' }}>
            <TextField
              disabled={daySelected}
              onChange={(e) => setEnd(e.currentTarget.value)}
              value={end}
              label="End"
              type="date"
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { color: 'black ' } }}
            />
            {daySelected && (
              <TextField
                onChange={(e) => setEndTime(e.currentTarget.value)}
                value={endTime}
                label="End time"
                type="time"
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { color: 'black ' } }}
              />
            )}
          </div>
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
