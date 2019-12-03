import { isIphone5s, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ADD_PATIENT_FEEDBACK } from '../graphql/profiles';
import {
  addPatientFeedback,
  addPatientFeedbackVariables,
} from '../graphql/types/addPatientFeedback';
import { FEEDBACKTYPE } from '../graphql/types/globalTypes';
import { ConsultFeedBackData, MedicineFeedBackData, TestsFeedBackData } from '../strings/AppConfig';
import { RadioSelectionItem } from './Medicines/RadioSelectionItem';
import { Spearator } from './ui/BasicComponents';
import { BottomPopUp } from './ui/BottomPopUp';
import { Button } from './ui/Button';
import { FeedbackInfoCard, FeedbackInfoCardProps } from './ui/FeedbackInfoCard';
import { RatingSmilyView, RatingStatus } from './ui/RatingSmilyView';
import { TextInputComponent } from './ui/TextInputComponent';
import { useUIElements } from './UIElementsProvider';
import { useAllCurrentPatients } from '../hooks/authHooks';

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
    client
      .mutate<addPatientFeedback, addPatientFeedbackVariables>({
        mutation: ADD_PATIENT_FEEDBACK,
        variables: {
          patientFeedbackInput: {
            feedbackType: props.type,
            patientId: g(currentPatient, 'id')!,
            rating: ratingStatus,
            transactionId: props.transactionId,
            reason: ratingOption,
            thankyouNote: ratingSuggestion,
          },
        },
      })
      .then(({}) => {
        props.onComplete && props.onComplete();
      })
      .catch(() => {
        Alert.alert('Uh oh.. :(', 'Something went wrong, please try later.');
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
    <BottomPopUp title={props.title} description={props.description}>
      <KeyboardAwareScrollView bounces={false}>{renderRatingContent()}</KeyboardAwareScrollView>
    </BottomPopUp>
  );
};
