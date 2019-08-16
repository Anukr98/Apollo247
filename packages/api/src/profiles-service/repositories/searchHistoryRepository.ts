import { EntityRepository, Repository } from 'typeorm';
import { SearchHistory } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(SearchHistory)
export class SearchHistoryRepository extends Repository<SearchHistory> {
  saveSearch(saveSearchAttrs: Partial<SearchHistory>) {
    return this.create(saveSearchAttrs)
      .save()
      .catch((saveSearchError) => {
        throw new AphError(AphErrorMessages.SAVE_SEARCH_ERROR, undefined, {
          saveSearchError,
        });
      });
  }
}
