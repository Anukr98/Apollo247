import '@aph/universal/dist/global';
import 'reflect-metadata';
import { Appointment } from 'consults-service/entities/Appointment';
import { ConsultQueueItem1596692647711 } from 'consults-service/database/migrations/1596692647718-ConsultQueueItem';
import { createConnections } from 'typeorm';
export const connect = async () => {
  try {
    createConnections()
      .then(res => {
        console.log('db connection established');
      })
      .catch(err => {
        console.log('connection error', err)
      })
  } catch (error) {
    console.log('connection error', error)
  }
};
