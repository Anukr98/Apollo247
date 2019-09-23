import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { GetBlockedCalendar } from 'graphql/types/GetBlockedCalendar';
import { AddBlockedCalendarItem } from 'graphql/types/AddBlockedCalendarItem';
import { RemoveBlockedCalendarItem } from 'graphql/types/RemoveBlockedCalendarItem';

export interface AllAphOperations {
  GetDoctorDetails: GetDoctorDetails;
  GetBlockedCalendar: GetBlockedCalendar;
  AddBlockedCalendarItem: AddBlockedCalendarItem;
  RemoveBlockedCalendarItem: RemoveBlockedCalendarItem;
}
