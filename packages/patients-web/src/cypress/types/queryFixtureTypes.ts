export interface QueryResultFixture<Q> {
  (...args: any[]): { data: Q };
}
