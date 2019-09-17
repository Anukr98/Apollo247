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
  Theme,
} from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/styles';
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

const useStyles = makeStyles((theme: Theme) => {
  return {};
});

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
  const classes = useStyles();
  const [selectedValue, setSelectedValue] = useState(RadioValues.DURATION);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  useEffect(() => {
    setStart(item ? format(item.start, 'yyyy-MM-dd') : '');
    setEnd(item ? format(item.end, 'yyyy-MM-dd') : '');
  }, [item]);
  const invalid = !start || !end || new Date() > new Date(start) || new Date(end) < new Date(start);
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
            value={RadioValues.DAY}
            label="For a day"
            control={<AphRadio title="For a day" />}
            disabled
          />
          <FormControlLabel
            value={RadioValues.DURATION}
            label="For a duration"
            control={<AphRadio title="For a duration" />}
          />
        </RadioGroup>
        <div>
          <TextField
            onChange={(e) => setStart(e.currentTarget.value)}
            value={start}
            label="Start"
            type="date"
            InputLabelProps={{ shrink: true }}
            InputProps={{ style: { color: 'black ' } }}
          />
        </div>
        <div>
          <TextField
            onChange={(e) => setEnd(e.currentTarget.value)}
            value={end}
            label="End"
            type="date"
            InputLabelProps={{ shrink: true }}
            InputProps={{ style: { color: 'black ' } }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={(e) => dialogProps.onClose()}>
          CANCEL
        </Button>
        <Mutation<UpdateBlockedCalendarItem, UpdateBlockedCalendarItemVariables>
          mutation={UPDATE_BLOCKED_CALENDAR_ITEM}
          onCompleted={() => dialogProps.onClose()}
        >
          {(updateBlockedCalendarItem, { loading: updateLoading }) => (
            <Mutation<AddBlockedCalendarItem, AddBlockedCalendarItemVariables>
              mutation={ADD_BLOCKED_CALENDAR_ITEM}
              onCompleted={() => dialogProps.onClose()}
            >
              {(addBlockedCalendarItem, { loading: addLoading }) => {
                const loading = addLoading || updateLoading;
                return (
                  <Button
                    type="submit"
                    disabled={loading || invalid}
                    variant="contained"
                    onClick={() => {
                      if (!start || !end || invalid) return;
                      const startDate = parse(start, 'yyyy-MM-dd', new Date());
                      const endDate = parse(end, 'yyyy-MM-dd', new Date());
                      const sameDay = start === end;
                      if (sameDay) {
                        startDate.setHours(0);
                        startDate.setMinutes(0);
                        endDate.setHours(23);
                        endDate.setMinutes(59);
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
                      const isUpdate = item && item.id != null;
                      if (isUpdate) {
                        const updateArgs = {
                          ...addArgs,
                          variables: { ...addArgs.variables, id: item!.id },
                        };
                        updateBlockedCalendarItem(updateArgs);
                      } else {
                        addBlockedCalendarItem(addArgs);
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
