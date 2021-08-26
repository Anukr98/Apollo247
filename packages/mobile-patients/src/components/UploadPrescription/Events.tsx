import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { postCleverTapEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';

export const postCleverTapUploadPrescriptionEvents = (
  source: CleverTapEvents[CleverTapEventName.PHARMACY_PRESCRIPTION_UPLOADED]['Source'],
  location: CleverTapEvents[CleverTapEventName.PHARMACY_PRESCRIPTION_UPLOADED]['Location']
) => {
  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_PRESCRIPTION_UPLOADED] = {
    Source: source,
    Location: location,
  };
  postCleverTapEvent(CleverTapEventName.PHARMACY_PRESCRIPTION_UPLOADED, cleverTapEventAttributes);
};
