import {
  postCleverTapEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

type PharmacySearchResults = WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS];
type Search = WebEngageEvents[WebEngageEventName.SEARCH];
type PharmacySearch = CleverTapEvents[CleverTapEventName.PHARMACY_SEARCH];

export const MedicineSearchEvents = {
  search: (attributes: Search) => {
    postWebEngageEvent(WebEngageEventName.SEARCH, attributes);
  },

  pharmacySearch: (attributes: PharmacySearch) => {
    postCleverTapEvent(CleverTapEventName.PHARMACY_SEARCH, attributes);
  },

  pharmacySearchResults: (attributes: PharmacySearchResults) => {
    postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, attributes);
  },
};
