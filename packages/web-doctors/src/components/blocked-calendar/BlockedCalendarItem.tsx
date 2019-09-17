import { Button, CircularProgress, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { format } from 'date-fns';
import { GET_BLOCKED_CALENDAR, REMOVE_BLOCKED_CALENDAR_ITEM } from 'graphql/doctors';
import {
  RemoveBlockedCalendarItem,
  RemoveBlockedCalendarItemVariables,
} from 'graphql/types/RemoveBlockedCalendarItem';
import React from 'react';
import { Mutation } from 'react-apollo';

const useStyles = makeStyles((theme: Theme) => {
  return {};
});

export interface BlockedCalendarItemProps {
  doctorId: string;
  item: { id: number; start: Date; end: Date };
}

export const BlockedCalendarItem: React.FC<BlockedCalendarItemProps> = (props) => {
  const classes = useStyles();
  const { item, doctorId } = props;
  const sameDay = item.start.getDate() === item.end.getDate();
  const dateText = sameDay
    ? format(item.start, 'iii, P')
    : `${format(item.start, 'P')} - ${format(item.end, 'P')}`;
  const timeText = sameDay ? `${format(item.start, 'p')} - ${format(item.end, 'p')}` : 'All slots';
  return (
    <div style={{ color: 'black', display: 'flex', justifyContent: 'space-between' }}>
      <span>{dateText}</span>
      <span>{timeText}</span>
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
