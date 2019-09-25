import { GatewayContext } from 'api-gateway';
import { Connection } from 'typeorm';
import { Doctor } from 'doctors-service/entities';

export interface DoctorsServiceContext extends GatewayContext {
  doctorsDb: Connection;
  consultsDb: Connection;
  patientsDb: Connection;
  currentUser: Doctor;
}
