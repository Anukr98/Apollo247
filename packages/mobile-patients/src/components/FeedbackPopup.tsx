import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  FeedbackInfoCard,
  FeedbackInfoCardProps,
} from '@aph/mobile-patients/src/components/ui/FeedbackInfoCard';
import {
  RatingSmilyView,
  RatingStatus,
} from '@aph/mobile-patients/src/components/ui/RatingSmilyView';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { ADD_PATIENT_FEEDBACK } from '@aph/mobile-patients/src/graphql/profiles';
import {
  addPatientFeedback,
  addPatientFeedbackVariables,
} from '@aph/mobile-patients/src/graphql/types/addPatientFeedback';
import { FEEDBACKTYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  aphConsole,
  g,
  isIphone5s,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  ConsultFeedBackData,
  MedicineFeedBackData,
  TestsFeedBackData,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  containerStyles: {
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.BUTTON_BG,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledStyle: {
    backgroundColor: theme.colors.BUTTON_DISABLED_BG,
  },
  titleTextStyle: {
    ...theme.viewStyles.text('B', isIphone5s() ? 12 : 14, theme.colors.BUTTON_TEXT),
    textAlign: 'center',
  },
});

export interface FeedbackPopupProps {
  type: FEEDBACKTYPE;
  title: string;
  description: string;
  transactionId: string;
  info: FeedbackInfoCardProps;
  isVisible: boolean;
  onComplete?: () => void;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = (props) => {
  const { showAphAlert, setLoading } = useUIElements();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

  const [ratingStatus, setRatingStatus] = useState<RatingStatus>();
  const [ratingOption, setRatingOption] = useState<string>();
  const [ratingSuggestion, setRatingSuggestion] = useState<string>();

  // For feedback popup
  // useEffect(() => {
  //   if (props.isVisible && false) {
  //     //write conditions later
  //     showAphAlert!({
  //       unDismissable: true,
  //       title: props.title,
  //       description: props.description,
  //       children: (
  //         <KeyboardAwareScrollView bounces={false}>{renderRatingContent()}</KeyboardAwareScrollView>
  //       ),
  //     });
  //   }
  // }, [props.isVisible, ratingStatus, ratingOption, ratingSuggestion]);

  const onSubmitFeedBack = () => {
    setLoading!(true);
    // call api here
    const variables: addPatientFeedbackVariables = {
      patientFeedbackInput: {
        feedbackType: props.type,
        patientId: g(currentPatient, 'id')!,
        rating: ratingStatus,
        transactionId: props.transactionId,
        reason: ratingOption,
        thankyouNote: ratingSuggestion,
      },
    };
    aphConsole.log(JSON.stringify(variables));

    client
      .mutate<addPatientFeedback, addPatientFeedbackVariables>({
        mutation: ADD_PATIENT_FEEDBACK,
        variables,
      })
      .then(({}) => {
        props.onComplete && props.onComplete();
      })
      .catch((e) => {
        CommonBugFender('FeedbackPopup', e);
        aphConsole.log({ e });
        handleGraphQlError(e);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const renderRatingContent = () => {
    const question = ratingStatus
      ? props.type == FEEDBACKTYPE.CONSULT
        ? ConsultFeedBackData[ratingStatus].question
        : props.type == FEEDBACKTYPE.DIAGNOSTICS
        ? TestsFeedBackData[ratingStatus].question
        : MedicineFeedBackData[ratingStatus].question
      : '';
    const options = ratingStatus
      ? props.type == FEEDBACKTYPE.CONSULT
        ? ConsultFeedBackData[ratingStatus].options
        : props.type == FEEDBACKTYPE.DIAGNOSTICS
        ? TestsFeedBackData[ratingStatus].options
        : MedicineFeedBackData[ratingStatus].options
      : [];
    console.log({ question, options });
    return (
      <View style={{}}>
        <FeedbackInfoCard
          style={{ marginTop: 16, marginHorizontal: 20 }}
          title={props.info.title}
          description={props.info.description}
          imageComponent={props.info.imageComponent}
          photoUrl={props.info.photoUrl}
        />
        <RatingSmilyView
          style={{ marginTop: 36.5, marginBottom: ratingStatus ? 0 : 40, marginHorizontal: 20 }}
          status={ratingStatus}
          onStatusChange={(_ratingStatus) => {
            console.log('_ratingStatus \n', { _ratingStatus });
            setRatingStatus(_ratingStatus);
            setRatingOption('');
          }}
        />
        {!!ratingStatus && (
          <>
            <View style={{ marginHorizontal: 20 }}>
              <Spearator style={{ marginTop: 19.8 }} />
              <Text style={{ ...theme.viewStyles.text('M', 14, '#02475b'), marginTop: 23.8 }}>
                {question}
              </Text>
              {options.map((item, i) => (
                <RadioSelectionItem
                  title={item}
                  isSelected={item == ratingOption}
                  hideSeparator={true}
                  onPress={() => setRatingOption(item)}
                  containerStyle={{ marginTop: i == 0 ? 16 : 12 }}
                />
              ))}
              <Spearator style={{ marginTop: 19.8 }} />
              <View style={{ marginTop: 23.8 }}>
                <Text style={theme.viewStyles.text('M', 14, '#02475b')}>
                  {'What can be improved?'}
                </Text>
                <TextInputComponent
                  placeholder={'Write your suggestion here...'}
                  value={ratingSuggestion}
                  onChangeText={(text) => setRatingSuggestion(text)}
                  inputStyle={{
                    paddingBottom: 8,
                    marginTop: 8,
                  }}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
                marginTop: 40,
                marginBottom: 20,
                alignItems: 'center',
              }}
            >
              <Button
                disabled={!ratingOption}
                onPress={onSubmitFeedBack}
                title={'SUBMIT FEEDBACK'}
                style={{ width: '66.66%' }}
              />
            </View>
          </>
        )}
      </View>
    );
  };

  if (!props.isVisible) return null;
  return (
    <BottomPopUp title={props.title} description={props.description} style={{ elevation: 999 }}>
      <KeyboardAwareScrollView bounces={false}>{renderRatingContent()}</KeyboardAwareScrollView>
    </BottomPopUp>
  );
};
