import ApolloClient from 'apollo-client';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorNextAvailableSlot';
import { NEXT_AVAILABLE_SLOT, DOWNLOAD_DOCUMENT } from '@aph/mobile-doctors/src/graphql/profiles';
import { downloadDocuments } from '@aph/mobile-doctors/src/graphql/types/downloadDocuments';

export const getNextAvailableSlots = (
  client: ApolloClient<object>,
  doctorIds: (string | null)[] | (string | undefined)[] | string[],
  todayDate: string
) => {
  return new Promise<{
    data: (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[];
  }>((res, rej) => {
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

export const getPrismUrls = (
  client: ApolloClient<object>,
  patientId: string,
  fileIds: string[]
) => {
  return new Promise<{ urls: string[] | null }>((res, rej) => {
    client
      .query<downloadDocuments>({
        query: DOWNLOAD_DOCUMENT,
        fetchPolicy: 'no-cache',
        variables: {
          downloadDocumentsInput: {
            patientId: patientId,
            fileIds: fileIds,
          },
        },
      })
      .then(({ data }) => {
        res({ urls: data.downloadDocuments.downloadPaths });
      })
      .catch((e) => {
        // const error = JSON.parse(JSON.stringify(e));
        rej({ error: e });
      });
  });
};
