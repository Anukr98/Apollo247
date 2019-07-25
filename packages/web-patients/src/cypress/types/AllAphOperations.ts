import { GetCurrentPatients } from 'graphql/types/GetCurrentPatients';
import { GetPatients } from 'graphql/types/GetPatients';

export interface AllAphOperations {
  GetCurrentPatients: GetCurrentPatients;
  GetPatients: GetPatients;
}
