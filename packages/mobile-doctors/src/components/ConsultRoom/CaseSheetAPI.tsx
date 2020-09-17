import { useQuery } from 'react-apollo-hooks';
import { GetDoctorFavouriteAdviceList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteAdviceList';
import {
  GET_DOCTOR_FAVOURITE_ADVICE_LIST,
  GET_DOCTOR_FAVOURITE_MEDICINE_LIST,
  GET_DOCTOR_FAVOURITE_TEST_LIST,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { GetDoctorFavouriteMedicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { GetDoctorFavouriteTestList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteTestList';

export const CaseSheetAPI = () => {
  const { data: favList, loading: favlistLoading, error: favListError } = useQuery<
    GetDoctorFavouriteAdviceList
  >(GET_DOCTOR_FAVOURITE_ADVICE_LIST, {
    fetchPolicy: 'no-cache',
  });

  const { data: favMed, loading: favMedLoading, error: favMedError } = useQuery<
    GetDoctorFavouriteMedicineList
  >(GET_DOCTOR_FAVOURITE_MEDICINE_LIST, {
    fetchPolicy: 'no-cache',
  });

  const { data: favTest, loading: favTestLoading, error: favTestError } = useQuery<
    GetDoctorFavouriteTestList
  >(GET_DOCTOR_FAVOURITE_TEST_LIST, {
    fetchPolicy: 'no-cache',
  });

  return {
    favList: (g(favList, 'getDoctorFavouriteAdviceList', 'adviceList') || [])
      .filter((item) => item && item.instruction)
      .sort((a, b) => (a && b ? a.instruction.localeCompare(b.instruction) : -1)),
    favlistLoading,
    favListError,
    favMed: (g(favMed, 'getDoctorFavouriteMedicineList', 'medicineList') || [])
      .filter((item) => item && item.medicineName)
      .sort((a, b) => (a && b ? (a.medicineName || '').localeCompare(b.medicineName || '') : -1)),
    favMedLoading,
    favMedError,
    favTest: (g(favTest, 'getDoctorFavouriteTestList', 'testList') || [])
      .filter((item) => item && item.itemname)
      .sort((a, b) => (a && b ? a.itemname.localeCompare(b.itemname) : -1)),
    favTestLoading,
    favTestError,
  };
};
