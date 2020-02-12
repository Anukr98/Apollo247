import { GatewayContext } from 'api-gateway';
import { Connection } from 'typeorm';

export interface CouponServiceContext extends GatewayContext {
  doctorsDb: Connection;
  consultsDb: Connection;
  patientsDb: Connection;
}
