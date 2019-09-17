import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { GetBlockedCalendar } from 'graphql/types/GetBlockedCalendar';
import { AddBlockedCalendarItem } from 'graphql/types/AddBlockedCalendarItem';

export interface AllAphOperations {
  GetDoctorDetails: GetDoctorDetails;
  GetBlockedCalendar: GetBlockedCalendar;
  AddBlockedCalendarItem: AddBlockedCalendarItem;
}
