import {
  GET_DOCTOR_FAVOURITE_ADVICE_LIST,
  GET_DOCTOR_FAVOURITE_MEDICINE_LIST,
  GET_DOCTOR_FAVOURITE_TEST_LIST,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetDoctorFavouriteAdviceList,
  GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteAdviceList';
import {
  GetDoctorFavouriteMedicineList,
  GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import {
  GetDoctorFavouriteTestList,
  GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteTestList';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import ApolloClient from 'apollo-client';

export const getFavoutires = (
  client: ApolloClient<object>,
  setFavList: (
    data: (GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList | null)[] | null
  ) => void,
  setFavMed: (
    data:
      | (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[]
      | null
  ) => void,
  setFavTest: (
    data: (GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList | null)[] | null
  ) => void
) => {
  client
    .query<GetDoctorFavouriteAdviceList>({ query: GET_DOCTOR_FAVOURITE_ADVICE_LIST })
    .then((data) => {
      setFavList(
        (g(data, 'data', 'getDoctorFavouriteAdviceList', 'adviceList') || [])
          .filter((item) => item && item.instruction)
          .sort((a, b) => (a && b ? a.instruction.localeCompare(b.instruction) : -1))
      );
    });
  client
    .query<GetDoctorFavouriteMedicineList>({ query: GET_DOCTOR_FAVOURITE_MEDICINE_LIST })
    .then((data) => {
      setFavMed(
        (g(data, 'data', 'getDoctorFavouriteMedicineList', 'medicineList') || [])
          .filter((item) => item && item.medicineName)
          .sort((a, b) =>
            a && b ? (a.medicineName || '').localeCompare(b.medicineName || '') : -1
          )
      );
    });
  client
    .query<GetDoctorFavouriteTestList>({ query: GET_DOCTOR_FAVOURITE_TEST_LIST })
    .then((data) => {
      setFavTest(
        (g(data, 'data', 'getDoctorFavouriteTestList', 'testList') || [])
          .filter((item) => item && item.itemname)
          .sort((a, b) => (a && b ? a.itemname.localeCompare(b.itemname) : -1))
      );
    });
};
