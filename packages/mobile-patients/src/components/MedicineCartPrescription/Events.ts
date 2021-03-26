import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

type cartPrescriptionOptionSelectedProceedClicked = WebEngageEvents[WebEngageEventName.CART_PRESCRIPTION_OPTION_SELECTED_PROCEED_CLICKED];

export const cartPrescriptionOptionSelectedProceedClicked = (
  attributes: cartPrescriptionOptionSelectedProceedClicked
) => {
  postWebEngageEvent(
    WebEngageEventName.CART_PRESCRIPTION_OPTION_SELECTED_PROCEED_CLICKED,
    attributes
  );
};
