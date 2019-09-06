import { GatewayContext } from 'api-gateway';
import { Connection } from 'typeorm';

export interface NotificationsServiceContext extends GatewayContext {
  doctorsDb: Connection;
  consultsDb: Connection;
  patientsDb: Connection;
}
