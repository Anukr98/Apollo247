import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  TextField,
} from '@material-ui/core';
import _isEmpty from 'lodash/isEmpty';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { GetBlockedCalendar, GetBlockedCalendarVariables } from 'graphql/types/GetBlockedCalendar';
import { GET_BLOCKED_CALENDAR, ADD_BLOCKED_CALENDAR_ITEM } from 'graphql/doctors';
import { format } from 'date-fns';
import { DialogProps } from '@material-ui/core/Dialog';
import { AphRadio } from '@aph/web-ui-components';
import { Mutation } from 'react-apollo';
import {
  AddBlockedCalendarItem,
  AddBlockedCalendarItemVariables,
} from 'graphql/types/AddBlockedCalendarItem';

const useBlockedCalendarAddModalStyles = makeStyles((theme: Theme) => {
  return {};
});
interface BlockedCalendarAddModalProps {
  dialogProps: DialogProps & { onClose: () => void };
  doctorId: string;
}
const BlockedCalendarAddModal: React.FC<BlockedCalendarAddModalProps> = (props) => {
  enum RadioValues {
    DAY = 'DAY',
    DURATION = 'DURATION',
  }
  const { dialogProps, doctorId } = props;
  const classes = useBlockedCalendarAddModalStyles();
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
                    start: `${startDateTime}:00Z`,
                    end: `${endDateTime}:00Z`,
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

const useBlockedCalendarItemStyles = makeStyles((theme: Theme) => {
  return {};
});
interface BlockedCalendarItemProps {
  item: { start: Date; end: Date };
}
const BlockedCalendarItem: React.FC<BlockedCalendarItemProps> = (props) => {
  const classes = useBlockedCalendarItemStyles();
  const { item } = props;
  const sameDay = item.start.getDate() === item.end.getDate();
  const dateText = sameDay
    ? format(item.start, 'iii, P')
    : `${format(item.start, 'P')} - ${format(item.end, 'P')}`;
  const timeText = sameDay ? `${format(item.start, 'p')} - ${format(item.end, 'p')}` : 'All slots';
  return (
    <div style={{ color: 'black', display: 'flex', justifyContent: 'space-between' }}>
      <span>{dateText}</span>
      <span>{timeText}</span>
      <span>EDIT</span>
      <span>UNBLOCK</span>
    </div>
  );
};

const useBlockedCalendarStyles = makeStyles((theme: Theme) => {
  return {};
});
export interface BlockedCalendarProps {
  doctorId: string;
}
export const BlockedCalendar: React.FC<BlockedCalendarProps> = (props) => {
  const classes = useBlockedCalendarStyles();
  const [showAddModal, setShowAddModal] = useState(false);
  const { doctorId } = props;
  const { data, loading, error } = useQuery<GetBlockedCalendar, GetBlockedCalendarVariables>(
    GET_BLOCKED_CALENDAR,
    {
      variables: {
        doctorId,
      },
    }
  );
  let content = null;
  if (error) {
    content = <div>Error :(</div>;
  }
  if (loading) {
    content = <CircularProgress />;
  }
  if (data && data.getBlockedCalendar) {
    const blockedCalendar = data.getBlockedCalendar.blockedCalendar.map((item) => ({
      ...item,
      start: new Date(item.start),
      end: new Date(item.end),
    }));
    content = blockedCalendar.map((item) => <BlockedCalendarItem key={item.id} item={item} />);
  }
  return (
    <div>
      <BlockedCalendarAddModal
        doctorId={doctorId}
        dialogProps={{
          open: showAddModal,
          onClose: () => setShowAddModal(false),
        }}
      />
      <h2>Blocked Calendar</h2>
      <div>{content}</div>
      <div>
        <Button variant="contained" onClick={() => setShowAddModal(true)}>
          Add Blocked Hours
        </Button>
      </div>
    </div>
  );
};
