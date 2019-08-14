import { GatewayContext } from 'api-gateway';
import { Patient } from 'profiles-service/entities';
import { Connection } from 'typeorm';

export interface ProfilesServiceContext extends GatewayContext {
  profilesDb: Connection;
  currentPatient: Patient | null;
}
