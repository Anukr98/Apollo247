import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

type PharmacySearchResults = WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS];
type Search = WebEngageEvents[WebEngageEventName.SEARCH];

export const MedicineSearchEvents = {
  search: (attributes: Search) => {
    postWebEngageEvent(WebEngageEventName.SEARCH, attributes);
  },

  pharmacySearchResults: (attributes: PharmacySearchResults) => {
    postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, attributes);
  },
};
