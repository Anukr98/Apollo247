import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { GetBlockedCalendar } from 'graphql/types/GetBlockedCalendar';

export interface AllAphOperations {
  GetDoctorDetails: GetDoctorDetails;
  GetBlockedCalendar: GetBlockedCalendar;
}
