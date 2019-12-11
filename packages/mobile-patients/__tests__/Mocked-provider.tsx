import { AppCommonDataProvider } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { Consult } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import { DiagnosticsCartProvider } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { GET_PATIENT_APPOINTMENTS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  APPOINTMENT_STATE,
  APPOINTMENT_TYPE,
  STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import { MockedProvider } from '@apollo/react-testing';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import moment from 'moment';
import fetch from 'node-fetch';
import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
const wait = require('waait');

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

describe('Consult mocked data', () => {
  const consult = (
    <MockedProvider mocks={mocks} addTypename={false}>
      {/* <ApolloProvider client={client}> */}
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
      {/* </ApolloProvider> */}
    </MockedProvider>
  );
  it('call function', async () => {
    const component = renderer.create(consult);

    const tree = component.toJSON();
    await wait(0);
    console.log(component, 'component');

    // expect(tree.children).toContain('Hope you are doing well?');
  });
});
