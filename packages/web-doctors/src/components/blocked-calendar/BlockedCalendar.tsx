import { Button, CircularProgress } from '@material-ui/core';
import { GET_BLOCKED_CALENDAR } from 'graphql/doctors';
import { GetBlockedCalendar, GetBlockedCalendarVariables } from 'graphql/types/GetBlockedCalendar';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { BlockedCalendarItem } from 'components/blocked-calendar/BlockedCalendarItem';
import { BlockedCalendarAddModal } from 'components/blocked-calendar/BlockedCalendarModal';

export type Item = { id: number; start: Date; end: Date };
export interface BlockedCalendarProps {
  doctorId: string;
}

export const BlockedCalendar: React.FC<BlockedCalendarProps> = (props) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
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
    content = blockedCalendar.map((item) => (
      <BlockedCalendarItem
        key={item.id}
        doctorId={doctorId}
        item={item}
        onEdit={(item) => {
          setItemToEdit(item);
          setShowAddModal(true);
        }}
      />
    ));
  }
  return (
    <div data-cypress="BlockedCalendar">
      <BlockedCalendarAddModal
        item={itemToEdit}
        doctorId={doctorId}
        dialogProps={{
          open: showAddModal,
          onClose: () => {
            setShowAddModal(false);
            setItemToEdit(null);
          },
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
