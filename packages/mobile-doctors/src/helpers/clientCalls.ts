import { Platform } from 'react-native';
import ApolloClient from 'apollo-client';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorNextAvailableSlot';
import {
  NEXT_AVAILABLE_SLOT,
  DOWNLOAD_DOCUMENT,
  GET_PARTICIPANTS_LIVE_STATUS,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { downloadDocuments } from '@aph/mobile-doctors/src/graphql/types/downloadDocuments';
import {
  USER_STATUS,
  USER_TYPE,
  BOOKINGSOURCE,
  DEVICETYPE,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  setAndGetNumberOfParticipants,
  setAndGetNumberOfParticipantsVariables,
} from '@aph/mobile-doctors/src/graphql/types/setAndGetNumberOfParticipants';

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

export const updateParticipantsLiveStatus = (
  client: ApolloClient<object>,
  appointmentId: string,
  userStatus: USER_STATUS
) => {
  const input = {
    appointmentId: appointmentId,
    userType: USER_TYPE.DOCTOR,
    sourceType: BOOKINGSOURCE.MOBILE,
    deviceType: Platform.OS === 'ios' ? DEVICETYPE.IOS : DEVICETYPE.ANDROID,
    userStatus: userStatus,
  };
  return new Promise((res, rej) => {
    client
      .query<setAndGetNumberOfParticipants, setAndGetNumberOfParticipantsVariables>({
        query: GET_PARTICIPANTS_LIVE_STATUS,
        variables: input,
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res(data);
      })
      .catch((e) => {
        rej(e);
      });
  });
};
