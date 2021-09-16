import {
  postCleverTapEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

type buyAgainPageViewed = WebEngageEvents[WebEngageEventName.BUY_AGAIN_PAGE_VIEWED];

export const Events = {
  buyAgainPageViewed: (attributes: buyAgainPageViewed) => {
    postWebEngageEvent(WebEngageEventName.BUY_AGAIN_PAGE_VIEWED, attributes);
    postCleverTapEvent(CleverTapEventName.PHARMACY_BUY_AGAIN_VIEWED, attributes);
  },
};
