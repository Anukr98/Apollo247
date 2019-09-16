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
import _isEmpty from 'lodash/isEmpty';
import React, { useState } from 'react';
import { Mutation } from 'react-apollo';

const useStyles = makeStyles((theme: Theme) => {
  return {};
});

export interface BlockedCalendarAddModalProps {
  dialogProps: DialogProps & { onClose: () => void };
  doctorId: string;
}

export const BlockedCalendarAddModal: React.FC<BlockedCalendarAddModalProps> = (props) => {
  enum RadioValues {
    DAY = 'DAY',
    DURATION = 'DURATION',
  }
  const { dialogProps, doctorId } = props;
  const classes = useStyles();
  const [selectedValue, setSelectedValue] = useState(RadioValues.DAY);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const invalid = _isEmpty(startDateTime) || _isEmpty(endDateTime);
  return (
    <Dialog {...dialogProps}>
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
          />
          <FormControlLabel
            value={RadioValues.DURATION}
            label="For a duration"
            control={<AphRadio title="For a duration" />}
          />
        </RadioGroup>
        <div>
          <TextField
            onChange={(e) => setStartDateTime(e.currentTarget.value)}
            value={startDateTime}
            label="Start"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            InputProps={{ style: { color: 'black ' } }}
          />
        </div>
        <div>
          <TextField
            onChange={(e) => setEndDateTime(e.currentTarget.value)}
            value={endDateTime}
            label="End"
            type="datetime-local"
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
              disabled={loading || invalid}
              variant="contained"
              onClick={() => {
                addBlockedCalendarItem({
                  variables: {
                    doctorId,
                    start: new Date(startDateTime),
                    end: new Date(endDateTime),
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
