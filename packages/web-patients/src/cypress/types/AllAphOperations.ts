import { GetCurrentPatients } from 'graphql/types/GetCurrentPatients';
import { GetPatients } from 'graphql/types/GetPatients';
import { UpdatePatient } from 'graphql/types/UpdatePatient';

export interface AllAphOperations {
  GetCurrentPatients: GetCurrentPatients;
  GetPatients: GetPatients;
  UpdatePatient: UpdatePatient;
}
