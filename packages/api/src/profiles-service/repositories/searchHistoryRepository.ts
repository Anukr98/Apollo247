import { EntityRepository, Repository } from 'typeorm';
import { SearchHistory, SEARCH_TYPE } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(SearchHistory)
export class SearchHistoryRepository extends Repository<SearchHistory> {
  findByPatientAndType(searchAttrs: Partial<SearchHistory>) {
    const { type, typeId, patient } = searchAttrs;
    return this.find({ where: { type, typeId, patient } }).catch((searchError) => {
      throw new AphError(AphErrorMessages.GET_PAST_SEARCHES_ERROR, undefined, {
        searchError,
      });
    });
  }

  saveSearch(saveSearchAttrs: Partial<SearchHistory>) {
    saveSearchAttrs.updatedDate = new Date();
    return this.create(saveSearchAttrs)
      .save()
      .catch((saveSearchError) => {
        throw new AphError(AphErrorMessages.SAVE_SEARCH_ERROR, undefined, {
          saveSearchError,
        });
      });
  }

  updatePastSearch(saveSearchAttrs: Partial<SearchHistory>) {
    const { type, typeId, patient } = saveSearchAttrs;
    return this.update(
      { type, typeId, patient },
      {
        updatedDate: new Date(),
        typeName: saveSearchAttrs.typeName,
        image: saveSearchAttrs.image,
      }
    ).catch((saveSearchError) => {
      throw new AphError(AphErrorMessages.SAVE_SEARCH_ERROR, undefined, {
        saveSearchError,
      });
    });
  }

  getPatientRecentSearchHistory(patientId: string, searchTypes: SEARCH_TYPE[]) {
    return this.createQueryBuilder('searchHistory')
      .where('searchHistory.patient = :patientId', { patientId })
      .andWhere('searchHistory.type IN (:...searchTypes)', { searchTypes })
      .orderBy('searchHistory.updatedDate', 'DESC')
      .limit(10)
      .getMany()
      .catch((getSearchError) => {
        throw new AphError(AphErrorMessages.GET_PAST_SEARCHES_ERROR, undefined, {
          getSearchError,
        });
      });
  }
}
