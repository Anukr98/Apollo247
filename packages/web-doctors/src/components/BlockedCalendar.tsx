import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  RadioGroup,
  FormControlLabel,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { GetBlockedCalendar, GetBlockedCalendarVariables } from 'graphql/types/GetBlockedCalendar';
import { GET_BLOCKED_CALENDAR } from 'graphql/doctors';
import { format } from 'date-fns';
import { DialogProps } from '@material-ui/core/Dialog';
import { AphRadio } from '@aph/web-ui-components';

const useBlockedCalendarAddModalStyles = makeStyles((theme: Theme) => {
  return {};
});
interface BlockedCalendarAddModalProps {
  dialogProps: DialogProps;
}
const BlockedCalendarAddModal: React.FC<BlockedCalendarAddModalProps> = (props) => {
  enum RadioValues {
    DAY = 'DAY',
    DURATION = 'DURATION',
  }
  const { dialogProps } = props;
  const classes = useBlockedCalendarAddModalStyles();
  const [selectedValue, setSelectedValue] = useState(RadioValues.DAY);
  return (
    <Dialog {...dialogProps}>
      <DialogTitle style={{ color: 'black' }}>BLOCK CALENDAR</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ color: 'black' }}>
          <RadioGroup
            value={selectedValue}
            onChange={(e) => setSelectedValue((e.target as HTMLInputElement).value as RadioValues)}
            row
          >
            <FormControlLabel value={RadioValues.DAY} label="For a day" control={<AphRadio />} />
            <FormControlLabel
              value={RadioValues.DURATION}
              label="For a duration"
              control={<AphRadio />}
            />
          </RadioGroup>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained">CANCEL</Button>
        <Button variant="contained">BLOCK CALENDAR</Button>
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
    content = blockedCalendar.map((item) => <BlockedCalendarItem item={item} />);
  }
  return (
    <div>
      <BlockedCalendarAddModal dialogProps={{ open: showAddModal }} />
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
