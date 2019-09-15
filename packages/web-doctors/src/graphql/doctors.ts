import gql from 'graphql-tag';

export const UPDATE_DOCTOR_ONLINE_STATUS = gql`
  mutation UpdateDoctorOnlineStatus($doctorId: String!, $onlineStatus: DOCTOR_ONLINE_STATUS!) {
    updateDoctorOnlineStatus(doctorId: $doctorId, onlineStatus: $onlineStatus) {
      doctor {
        id
        onlineStatus
      }
    }
  }
`;

export const GET_BLOCKED_CALENDAR = gql`
  query GetBlockedCalendar($doctorId: String!) {
    getBlockedCalendar(doctorId: $doctorId) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const ADD_BLOCKED_CALENDAR_ITEM = gql`
  mutation AddBlockedCalendarItem($doctorId: String!, $start: DateTime!, $end: DateTime!) {
    addBlockedCalendarItem(doctorId: $doctorId, start: $start, end: $end) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const REMOVE_BLOCKED_CALENDAR_ITEM = gql`
  mutation RemoveBlockedCalendarItem($id: Int!) {
    removeBlockedCalendarItem(id: $id) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;
