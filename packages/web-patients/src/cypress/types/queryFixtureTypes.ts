export interface QueryResultFixture<Query, QueryVariables = {}> {
  (queryVariables?: QueryVariables): Query;
}
