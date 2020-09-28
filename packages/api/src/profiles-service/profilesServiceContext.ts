import { GatewayContext } from 'api-gateway';
import { Patient } from 'profiles-service/entities';
import { Connection } from 'typeorm';

export interface ProfilesServiceContext extends GatewayContext {
  profilesDb: Connection;
  doctorsDb: Connection;
  consultsDb: Connection;
  currentPatient: Patient | null;
  headers?: any
}
