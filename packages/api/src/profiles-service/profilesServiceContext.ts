import { GatewayContext } from 'api-gateway';
import { Patient } from 'profiles-service/entity/patient';

export interface ProfilesServiceContext extends GatewayContext {
  currentPatient: Patient | null;
}
