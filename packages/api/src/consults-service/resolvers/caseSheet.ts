import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';

export const caseSheetTypeDefs = gql``;

type symptomInput = {
  symptom: string;
  since: string;
  howOften: string;
  severity: string;
  caseSheetId: string;
};

const addSymptom: Resolver<null, symptomInput, ConsultServiceContext, String> = async (
  parent,
  { args },
  { consultsDb, doctorsDb }
) => {
  return '';
};

export const caseSheetResolvers = {
  Query: {
    addSymptom,
  },
};
