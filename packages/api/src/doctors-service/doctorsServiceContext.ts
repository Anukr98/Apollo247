import { GatewayContext } from 'api-gateway';
import { Connection } from 'typeorm';

export interface DoctorsServiceContext extends GatewayContext {
  dbConnect: Connection;
}
