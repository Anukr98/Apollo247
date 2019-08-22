import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';

export const caseSheetTypeDefs = gql`
  input SymptomInput {
    symptom: String!
    since: String
    howOften: String
    severity: String
    caseSheetId: String
    appointmentId: String
  }

  extend type Mutation {
    addSymptom(symptomInput: SymptomInput): String
  }
`;

type SymptomInput = {
  symptom: string;
  since: string;
  howOften: string;
  severity: string;
  caseSheetId: string;
  appointmentId: string;
};

type SymptomArgs = { symptomInput: SymptomInput };

const addSymptom: Resolver<null, SymptomArgs, ConsultServiceContext, string> = async (
  parent,
  { symptomInput },
  { consultsDb, doctorsDb }
) => {
  console.log(symptomInput);
  return 'polo';
};

export const caseSheetResolvers = {
  Mutation: {
    addSymptom,
  },
};
