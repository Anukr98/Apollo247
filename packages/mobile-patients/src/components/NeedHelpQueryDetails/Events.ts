import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

type HelpTicketSubmitted = WebEngageEvents[WebEngageEventName.HELP_TICKET_SUBMITTED];

export const helpTicketSubmitted = (attributes: HelpTicketSubmitted) => {
  postWebEngageEvent(WebEngageEventName.HELP_TICKET_SUBMITTED, attributes);
};
