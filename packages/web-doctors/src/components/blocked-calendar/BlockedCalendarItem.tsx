import { Button, CircularProgress } from '@material-ui/core';
import { format } from 'date-fns';
import { GET_BLOCKED_CALENDAR, REMOVE_BLOCKED_CALENDAR_ITEM } from 'graphql/doctors';
import {
  RemoveBlockedCalendarItem,
  RemoveBlockedCalendarItemVariables,
} from 'graphql/types/RemoveBlockedCalendarItem';
import React from 'react';
import { Mutation } from 'react-apollo';
import { Item } from 'components/blocked-calendar/BlockedCalendar';

export interface BlockedCalendarItemProps {
  doctorId: string;
  item: Item;
  onEdit: (item: Item) => void;
}

export const BlockedCalendarItem: React.FC<BlockedCalendarItemProps> = (props) => {
  const { item, doctorId, onEdit } = props;
  const sameDay = item.start.getDate() === item.end.getDate();
  const dateText = sameDay
    ? format(item.start, 'iii, P')
    : `${format(item.start, 'P')} - ${format(item.end, 'P')}`;
  const timeText = sameDay ? `${format(item.start, 'p')} - ${format(item.end, 'p')}` : 'All slots';
  return (
    <div style={{ color: 'black' }}>
      <span style={{ width: '30%', display: 'inline-block' }}>{dateText}</span>
      <span style={{ width: '30%', display: 'inline-block' }}>{timeText}</span>
      {/* <Button
        variant="text"
        style={{ color: 'black', width: '20%', display: 'inline-block' }}
        onClick={() => onEdit(item)}
      >
        EDIT
      </Button> */}
      <span style={{ color: 'black', width: '20%', display: 'inline-block' }}></span>
      <Mutation<RemoveBlockedCalendarItem, RemoveBlockedCalendarItemVariables>
        mutation={REMOVE_BLOCKED_CALENDAR_ITEM}
      >
        {(removeBlockedCalendarItem, { loading }) => (
          <Button
            variant="text"
            style={{ color: 'black' }}
            disabled={loading}
            onClick={() => {
              removeBlockedCalendarItem({
                variables: { id: item.id },
                refetchQueries: [{ query: GET_BLOCKED_CALENDAR, variables: { doctorId } }],
                awaitRefetchQueries: true,
              });
            }}
          >
            {loading && <CircularProgress size={20} />} UNBLOCK
          </Button>
        )}
      </Mutation>
    </div>
  );
};
