import { GatewayContext } from 'api-gateway';
import { Connection } from 'typeorm';

export interface ConsultServiceContext extends GatewayContext {
  doctorsDb: Connection;
  consultsDb: Connection;
  patientsDb: Connection;
}
