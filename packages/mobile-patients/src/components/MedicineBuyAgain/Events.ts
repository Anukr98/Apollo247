import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

type buyAgainPageViewed = WebEngageEvents[WebEngageEventName.BUY_AGAIN_PAGE_VIEWED];

export const Events = {
  buyAgainPageViewed: (attributes: buyAgainPageViewed) => {
    postWebEngageEvent(WebEngageEventName.BUY_AGAIN_PAGE_VIEWED, attributes);
  },
};
