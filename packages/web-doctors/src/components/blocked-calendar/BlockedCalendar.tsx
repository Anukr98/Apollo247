import { CircularProgress } from '@material-ui/core';
import { GET_BLOCKED_CALENDAR } from 'graphql/doctors';
import { GetBlockedCalendar, GetBlockedCalendarVariables } from 'graphql/types/GetBlockedCalendar';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { BlockedCalendarItem } from 'components/blocked-calendar/BlockedCalendarItem';
import { BlockedCalendarAddModal } from 'components/blocked-calendar/BlockedCalendarModal';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';

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
  const useStyles = makeStyles((theme: Theme) => {
    return {
      blockcalendarSection: {
        marginTop: 20,
        borderTop: '2px solid rgba(2, 71, 91, 0.05)',
        paddingTop: 15,
        '& h2': {
          fontSize: 16,
          fontWeight: 600,
          color: '#02475b',
        },
      },
      addblockedHours: {
        fontSize: 14,
        fontWeight: 700,
        color: '#fc9916',
        marginTop: 10,
        textTransform: 'uppercase',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        paddingLeft: 4,
        '& img': {
          marginRight: 10,
        },
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    };
  });
  const classes = useStyles({});
  return (
    <div data-cypress="BlockedCalendar" className={classes.blockcalendarSection}>
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
        <AphButton
          variant="contained"
          color="primary"
          classes={{ root: classes.addblockedHours }}
          onClick={() => setShowAddModal(true)}
        >
          <img src={require('images/ic_dark_plus.svg')} alt="" /> Add Blocked Hours
        </AphButton>
      </div>
    </div>
  );
};
