import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { GetDoctorFavouriteAdviceList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteAdviceList';
import { GET_DOCTOR_FAVOURITE_ADVICE_LIST } from '@aph/mobile-doctors/src/graphql/profiles';

// const { data, loading, error } = useQuery<
//   getPatientPastConsultsAndPrescriptions,
//   getPatientPastConsultsAndPrescriptionsVariables
// >(GET_PAST_CONSULTS_PRESCRIPTIONS, {
//   variables: {
//     consultsAndOrdersInput: {
//       patient: currentPatient && currentPatient.id ? currentPatient.id : '',
//     },
//   },
//   fetchPolicy: 'no-cache',
// });
export const CaseSheetAPI = () => {
  const { data: favList, loading: favlistLoading, error: favListError } = useQuery<
    GetDoctorFavouriteAdviceList
  >(GET_DOCTOR_FAVOURITE_ADVICE_LIST, {
    fetchPolicy: 'no-cache',
  });

  return { favList, favlistLoading, favListError };
};
