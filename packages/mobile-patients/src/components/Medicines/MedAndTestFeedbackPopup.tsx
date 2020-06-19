import { MedicalIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import React from 'react';
import { FEEDBACKTYPE } from '../../graphql/types/globalTypes';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { FeedbackPopup } from '../FeedbackPopup';
import { useUIElements } from '../UIElementsProvider';

export interface MedAndTestFeedbackPopupProps {
  onComplete: () => void;
  feedback: {
    visible: boolean;
    title: string;
    subtitle: string;
    transactionId: string;
  };
}

export const MedAndTestFeedbackPopup: React.FC<MedAndTestFeedbackPopupProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert } = useUIElements();

  const postRatingGivenWEGEvent = (rating: string, reason: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_FEEDBACK_GIVEN] = {
      'Patient UHID': g(currentPatient, 'id'),
      Rating: rating,
      'Rating Reason': reason,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_FEEDBACK_GIVEN, eventAttributes);
  };

  return (
    <FeedbackPopup
      title="We value your feedback! :)"
      description="How was your overall experience with the following medicine delivery —"
      info={{
        title: props.feedback.title,
        description: props.feedback.subtitle,
        imageComponent: <MedicalIcon />,
      }}
      transactionId={props.feedback.transactionId}
      type={FEEDBACKTYPE.PHARMACY}
      isVisible={props.feedback.visible}
      onComplete={(ratingStatus, ratingOption) => {
        postRatingGivenWEGEvent(ratingStatus!, ratingOption);
        props.onComplete();
        showAphAlert!({
          title: 'Thanks :)',
          description: 'Your feedback has been submitted. Thanks for your time.',
        });
      }}
    />
  );
};
