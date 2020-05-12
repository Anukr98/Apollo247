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
import { Item } from 'components/blocked-calendar/BlockedCalendar';

const useStyles = makeStyles((theme: Theme) => ({
  blockedCalendarBlock: {
    borderRadius: 10,
    backgroundColor: theme.palette.primary.contrastText,
    position: 'relative',
    flexGrow: 1,
    boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
    marginBottom: 15,
    padding: '12px 24px',
    color: '#02475b',
    fontSize: 16,
    fontWeight: 500,
  },
  blockBtn: {
    position: 'absolute',
    right: 24,
    top: 6,
    color: '#00b38e',
    fontSize: 14,
    fontWeight: 500,
  },
}));

export interface BlockedCalendarItemProps {
  doctorId: string;
  item: Item;
  onEdit: (item: Item) => void;
}

export const BlockedCalendarItem: React.FC<BlockedCalendarItemProps> = (props) => {
  const classes = useStyles({});
  const { item, doctorId, onEdit } = props;
  const sameDay =
    item.start.getDate() === item.end.getDate() && item.start.getMonth() === item.end.getMonth();
  const options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' };
  const otherOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
  const dateText = sameDay
    ? item.start.toLocaleDateString('en-AU', options)
    : `${item.start.toLocaleDateString('en-AU', otherOptions)} - ${item.end.toLocaleDateString(
        'en-AU',
        otherOptions
      )}`;
  const timeText = sameDay ? `${format(item.start, 'p')} - ${format(item.end, 'p')}` : 'All slots';
  return (
    <div className={classes.blockedCalendarBlock}>
      <span style={{ width: '45%', display: 'inline-block' }}>{dateText}</span>
      <span style={{ width: '25%', display: 'inline-block' }}>{timeText}</span>
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
            className={classes.blockBtn}
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
