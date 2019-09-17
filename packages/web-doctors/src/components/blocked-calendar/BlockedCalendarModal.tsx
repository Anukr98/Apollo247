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
import { ADD_BLOCKED_CALENDAR_ITEM, GET_BLOCKED_CALENDAR } from 'graphql/doctors';
import {
  AddBlockedCalendarItem,
  AddBlockedCalendarItemVariables,
} from 'graphql/types/AddBlockedCalendarItem';
import React, { useState } from 'react';
import { Mutation } from 'react-apollo';
import { format, parse } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {};
});

export interface BlockedCalendarAddModalProps {
  dialogProps: DialogProps & { onClose: () => void };
  doctorId: string;
  item?: { id: number; start: Date; end: Date };
}

export const BlockedCalendarAddModal: React.FC<BlockedCalendarAddModalProps> = (props) => {
  enum RadioValues {
    DAY = 'DAY',
    DURATION = 'DURATION',
  }
  const { item, dialogProps, doctorId } = props;
  const classes = useStyles();
  const [selectedValue, setSelectedValue] = useState(RadioValues.DURATION);
  const [start, setStart] = useState(item ? format(item.start, 'MM/dd/yyyy') : '');
  const [end, setEnd] = useState(item ? format(item.end, 'MM/dd/yyyy') : '');
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
        <Mutation<AddBlockedCalendarItem, AddBlockedCalendarItemVariables>
          mutation={ADD_BLOCKED_CALENDAR_ITEM}
          onCompleted={() => dialogProps.onClose()}
        >
          {(addBlockedCalendarItem, { loading }) => (
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
                addBlockedCalendarItem({
                  variables: {
                    doctorId,
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                  },
                  refetchQueries: [{ query: GET_BLOCKED_CALENDAR, variables: { doctorId } }],
                  awaitRefetchQueries: true,
                });
              }}
            >
              {loading && <CircularProgress size={20} />} BLOCK CALENDAR
            </Button>
          )}
        </Mutation>
      </DialogActions>
    </Dialog>
  );
};
