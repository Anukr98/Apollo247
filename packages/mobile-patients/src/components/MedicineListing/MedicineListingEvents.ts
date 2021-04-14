import { trackTagalysEvent } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';

type CategoryListGridView = WebEngageEvents[WebEngageEventName.CATEGORY_LIST_GRID_VIEW];
type SearchEnterClick = WebEngageEvents[WebEngageEventName.SEARCH_ENTER_CLICK];
type PharmacySearchResults = WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS];
type Search = WebEngageEvents[WebEngageEventName.SEARCH];
type CategoryPageViewed = WebEngageEvents[WebEngageEventName.CATEGORY_PAGE_VIEWED];

export const MedicineListingEvents = {
  categoryListGridView: (attributes: CategoryListGridView) => {
    postWebEngageEvent(WebEngageEventName.CATEGORY_LIST_GRID_VIEW, attributes);
  },

  search: (attributes: Search) => {
    postWebEngageEvent(WebEngageEventName.SEARCH, attributes);
  },

  pharmacySearchResults: (attributes: PharmacySearchResults) => {
    postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, attributes);
  },

  searchEnterClick: (attributes: SearchEnterClick) => {
    postWebEngageEvent(WebEngageEventName.SEARCH_ENTER_CLICK, attributes);
  },

  categoryPageViewed: (attributes: CategoryPageViewed) => {
    postWebEngageEvent(WebEngageEventName.CATEGORY_PAGE_VIEWED, attributes);
    postAppsFlyerEvent(AppsFlyerEventName.CATEGORY_PAGE_VIEWED, attributes);
    postFirebaseEvent(FirebaseEventName.CATEGORY_PAGE_VIEWED, attributes);
  },

  tagalysSearch: (patientId: string, attributes: Tagalys.ProductList) => {
    try {
      trackTagalysEvent(
        {
          event_type: 'product_list',
          details: attributes,
        },
        patientId
      );
    } catch (error) {}
  },
};
