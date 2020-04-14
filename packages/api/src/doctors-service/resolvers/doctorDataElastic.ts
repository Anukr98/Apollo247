import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch';

export const doctorDataElasticTypeDefs = gql`
  extend type Mutation {
    insertDataElastic: String
  }
`;

const insertDataElastic: Resolver<null, {}, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const client = new Client({ node: 'http://104.211.242.175:9200' });
  const sourceData = {
    doc: {
      firstName: 'testdoc1',
      doctorSlots: [
        {
          date: '2020-04-09',
          slots: [{ id: 1, slot: '2020-04-09T14:30', status: 'BOOKED' }],
        },
      ],
    },
  };

  const doc1: RequestParams.Update = {
    index: 'doctors',
    type: 'posts',
    id: '1',
    body: {
      script: {
        source:
          'for (int i = 0; i < ctx._source.doctorSlots.length; ++i) { if(ctx._source.doctorSlots[i].date == params.date) {ctx._source.doctorSlots[i].date = params.newDate; ctx._source.doctorSlots[i].slots.add(params.slot);}}',
        params: {
          date: '2020-04-11',
          newDate: '2020-04-11',
          slot: {
            id: 1,
            slot: '2020-04-11T14:30',
            status: 'BOOKED',
          },
        },
      },
    },
  };
  await client.index({
    index: 'doctors',
    id: '2',
    body: {
      firstName: 'testdoc2',
      lastName: 'last',
      mobileNumber: '+918019677179',
      specialty: {
        id: 1,
        specialtyName: 'General Physian',
      },
    },
  });
  //await client.index(doc1);
  //await client.update(doc1);
  const params: RequestParams.Search = {
    index: 'doctors',
    body: {
      query: {
        match: {
          firstName: 'testdoc1',
        },
      },
    },
  };
  client
    .search(params)
    .then((result: ApiResponse) => {
      console.log('response = ', result.body.hits.hits);
    })
    .catch((err: Error) => {
      console.log(err);
    });
  return 'Elastic search query';
};
//insert data features ends here

export const doctorDataElasticResolvers = {
  Mutation: { insertDataElastic },
};
