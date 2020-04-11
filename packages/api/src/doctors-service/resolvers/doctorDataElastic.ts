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
  const client = new Client({ node: '104.211.242.175:9200' });
  const params: RequestParams.Search = {
    index: 'doctors',
    body: {
      query: {
        match: {
          firstName: 'test',
        },
      },
    },
  };
  client
    .search(params)
    .then((result: ApiResponse) => {
      console.log(result.body.hits.hits);
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
