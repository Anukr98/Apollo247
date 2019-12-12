import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import { MyAccount } from '@aph/mobile-patients/src/components/MyAccount';
import { GET_PATIENT_APPOINTMENTS } from '@aph/mobile-patients/src/graphql/profiles';
import moment from 'moment';
import {
  APPOINTMENT_TYPE,
  STATUS,
  APPOINTMENT_STATE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { MockedProvider } from '@apollo/react-testing';
import { Consult } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import { useApolloClient, ApolloProvider } from 'react-apollo-hooks';
import ApolloClient from 'apollo-client';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink, createHttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { AppCommonDataProvider } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { DiagnosticsCartProvider } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { mount, shallow } from 'enzyme';

// const client = new ApolloClient({ uri: apiRoutes.graphql() });

const mocks = [
  {
    request: {
      query: GET_PATIENT_APPOINTMENTS,
      variables: {
        patientId: '',
        appointmentDate: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
      },
    },
    result: {
      data: {
        getPatinetAppointments: {
          patinetAppointments: {
            appointmentType: APPOINTMENT_TYPE.ONLINE,
            id: 'string',
            patientId: 'string',
            appointmentDateTime: 'any',
            status: STATUS.IN_PROGRESS,
            hospitalId: 'string',
            doctorId: 'string',
            displayId: 2345,
            isFollowUp: 'string',
            rescheduleCount: 345,
            appointmentState: APPOINTMENT_STATE.NEW,
            isConsultStarted: true,
            doctorInfo: null,
          },
        },
      },
    },
  },
];

const createTestProps = {
  navigation: {
    navigate: jest.fn(),
    replace: jest.fn(),
    addListener: jest.fn(),
    getParam: jest.fn(),
  },
};

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: new createHttpLink({
    uri: apiRoutes.graphql(),
    fetch: fetch,
  }),
});

describe('Consult tests', () => {
  it('call function', () => {
    const consult = (
      <ApolloProvider client={client}>
        <AuthProvider>
          <AppCommonDataProvider>
            <ShoppingCartProvider>
              <DiagnosticsCartProvider>
                <UIElementsProvider>
                  <Consult navigation={createTestProps.navigation} />
                </UIElementsProvider>
              </DiagnosticsCartProvider>
            </ShoppingCartProvider>
          </AppCommonDataProvider>
        </AuthProvider>
      </ApolloProvider>
    );
    renderer.create(consult);

    const container = shallow(consult);
    container.update();
  });

  // it('my accout rendered', () => {
  //   renderer.create(<MyAccount />);
  // });
});
