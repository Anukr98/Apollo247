import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

type CategoryPageViewed = WebEngageEvents[WebEngageEventName.CATEGORY_PAGE_VIEWED];

export const MedicineBuyAgainEvents = {
  categoryPageViewed: (attributes: CategoryPageViewed) => {
    postWebEngageEvent(WebEngageEventName.CATEGORY_PAGE_VIEWED, attributes);
    postAppsFlyerEvent(AppsFlyerEventName.CATEGORY_PAGE_VIEWED, attributes);
    postFirebaseEvent(FirebaseEventName.CATEGORY_PAGE_VIEWED, attributes);
  },
};
