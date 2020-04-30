import { useAllCurrentPatients } from 'hooks/authHooks';
import { Relation } from 'graphql/types/globalTypes';

export const hasOnePrimaryUser = () => {
  const { allCurrentPatients } = useAllCurrentPatients();
  return (
    allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1
  );
};
