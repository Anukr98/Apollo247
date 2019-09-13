import { makeStyles } from '@material-ui/styles';
import { Theme, Button, CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { GetBlockedCalendar, GetBlockedCalendarVariables } from 'graphql/types/GetBlockedCalendar';
import { GET_BLOCKED_CALENDAR } from 'graphql/doctors';
import { format } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => {
  return {};
});

export interface BlockedCalendarProps {
  doctorId: string;
}

// const BlockedCalendarItem = (props:{item:{id:number; doctorId:}})

export const BlockedCalendar: React.FC<BlockedCalendarProps> = (props) => {
  const classes = useStyles();
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
  if (error) content = <div>Error :(</div>;
  if (loading) content = <CircularProgress />;
  if (data && data.getBlockedCalendar) {
    console.log(data);
    const blockedCalendar = data.getBlockedCalendar.blockedCalendar.map((item) => ({
      ...item,
      start: new Date(item.start),
      end: new Date(item.end),
    }));
    content = blockedCalendar.map((item) => {
      const sameDay = item.start.getDate() === item.end.getDate();
      const dateText = sameDay
        ? format(item.start, 'iii, P')
        : `${format(item.start, 'P')} - ${format(item.end, 'P')}`;
      const timeText = sameDay
        ? `${format(item.start, 'p')} - ${format(item.end, 'p')}`
        : 'All slots';
      return (
        <div style={{ color: 'black', display: 'flex', justifyContent: 'space-between' }}>
          <span>{dateText}</span>
          <span>{timeText}</span>
          <span>EDIT</span>
          <span>UNBLOCK</span>
        </div>
      );
    });
  }
  return (
    <div>
      <h2>Blocked Calendar</h2>
      {content}
      <Button variant="contained" onClick={() => setShowAddModal(true)}>
        Add Blocked Hours
      </Button>
    </div>
  );
};
