import ApolloClient from 'apollo-client';
import { GetDoctorNextAvailableSlot } from '../graphql/types/GetDoctorNextAvailableSlot';
import { NEXT_AVAILABLE_SLOT } from '../graphql/profiles';

export const getNextAvailableSlots = (
  client: ApolloClient<object>,
  doctorIds: (string | null)[] | (string | undefined)[] | string[],
  todayDate: string
) => {
  return new Promise((res, rej) => {
    client
      .query<GetDoctorNextAvailableSlot>({
        query: NEXT_AVAILABLE_SLOT,
        variables: {
          DoctorNextAvailableSlotInput: {
            doctorIds: doctorIds,
            availableDate: todayDate,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data) {
          if (
            data &&
            data.getDoctorNextAvailableSlot &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
          ) {
            res({ data: data.getDoctorNextAvailableSlot.doctorAvailalbeSlots });
          }
        }
      })
      .catch((e: string) => {
        console.log('Error occured while searching Doctor', e);
        rej({ error: e });
      });
  });
};
