import { EntityRepository, Repository } from 'typeorm';
import { SearchHistory } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(SearchHistory)
export class SearchHistoryRepository extends Repository<SearchHistory> {
  findByPatientAndType(searchAttrs: Partial<SearchHistory>) {
    return this.find({ where: searchAttrs }).catch((searchError) => {
      throw new AphError(AphErrorMessages.GET_PAST_SEARCHES_ERROR, undefined, {
        searchError,
      });
    });
  }

  saveSearch(saveSearchAttrs: Partial<SearchHistory>) {
    return this.create(saveSearchAttrs)
      .save()
      .catch((saveSearchError) => {
        throw new AphError(AphErrorMessages.SAVE_SEARCH_ERROR, undefined, {
          saveSearchError,
        });
      });
  }

  updatePastSearch(saveSearchAttrs: Partial<SearchHistory>) {
    return this.update(saveSearchAttrs, { updatedDate: new Date() }).catch((saveSearchError) => {
      throw new AphError(AphErrorMessages.SAVE_SEARCH_ERROR, undefined, {
        saveSearchError,
      });
    });
  }

  getPatientRecentSearchHistory(patientId: string) {
    return this.createQueryBuilder('searchHistory')
      .where('searchHistory.patient = :patientId', { patientId })
      .orderBy('searchHistory.updatedDate', 'DESC')
      .limit(10)
      .getMany();
  }
}
