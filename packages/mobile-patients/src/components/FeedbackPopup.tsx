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
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import {
  addPatientFeedback,
  addPatientFeedbackVariables,
} from '@aph/mobile-patients/src/graphql/types/addPatientFeedback';
import { FEEDBACKTYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { Overlay } from 'react-native-elements';
import {
  aphConsole,
  g,
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
import { StyleSheet, Text, View, ViewStyle, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  cancelReasonContentHeading: {
    marginBottom: 12,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  dropDownOptionHeading: {
    marginBottom: 12,
    color: '#02475B',
    ...theme.fonts.IBMPlexSansMedium(15),
    lineHeight: 18.2,
  },
  skipText: {
    ...theme.viewStyles.yellowTextStyle,
    fontSize: 14,
  },
  skipView: {
    margin: 20,
  },
  cancelReasonContentView: { flexDirection: 'row', alignItems: 'center' },
  cancelReasonContentText: {
    flex: 0.9,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  reasonCancelDropDownExtraView: {
    marginTop: 5,
    backgroundColor: '#00b38e',
    height: 2,
  },
});

export interface FeedbackPopupProps {
  type: FEEDBACKTYPE;
  title: string;
  description: string;
  transactionId: string;
  info: FeedbackInfoCardProps;
  isVisible: boolean;
  containerStyle?: ViewStyle;
  onComplete?: (ratingStatus: RatingStatus, ratingOption: string) => void;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = (props) => {
  const { setLoading } = useUIElements();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

  const [ratingStatus, setRatingStatus] = useState<RatingStatus>();
  const [ratingOption, setRatingOption] = useState<string>();
  const [ratingSuggestion, setRatingSuggestion] = useState<string>();
  const [overlayDropdown, setOverlayDropdown] = useState(false);

  const OTHERS_FEEDBACK = string.Diagnostics_Feedback_Others;
  const feedbackQuestions = ratingStatus
    ? props.type == FEEDBACKTYPE.CONSULT
      ? ConsultFeedBackData[ratingStatus].question
      : props.type == FEEDBACKTYPE.DIAGNOSTICS
      ? TestsFeedBackData[ratingStatus].question
      : MedicineFeedBackData[ratingStatus].question
    : '';
  const feedbackOptions = ratingStatus
    ? props.type == FEEDBACKTYPE.CONSULT
      ? ConsultFeedBackData[ratingStatus].options
      : props.type == FEEDBACKTYPE.DIAGNOSTICS
      ? TestsFeedBackData[ratingStatus].options
      : MedicineFeedBackData[ratingStatus].options
    : [];

  const optionsDropdown = overlayDropdown && (
    <Overlay
      onBackdropPress={() => setOverlayDropdown(false)}
      isVisible={overlayDropdown}
      overlayStyle={styles.dropdownOverlayStyle}
    >
      <DropDown
        cardContainer={{
          margin: 0,
        }}
        options={feedbackOptions.map(
          (feedbackOptions, i) =>
            ({
              onPress: () => {
                setRatingOption(feedbackOptions!);
                setOverlayDropdown(false);
              },
              optionText: feedbackOptions,
            } as Option)
        )}
      />
    </Overlay>
  );

  const content = (
    <View style={{ paddingHorizontal: 16 }}>
      <Text
        style={
          props.type == FEEDBACKTYPE.DIAGNOSTICS
            ? styles.dropDownOptionHeading
            : styles.cancelReasonContentHeading
        }
      >
        {feedbackQuestions}
      </Text>
      {ratingOption != OTHERS_FEEDBACK ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setOverlayDropdown(true);
          }}
        >
          <View style={styles.cancelReasonContentView}>
            <Text
              style={[styles.cancelReasonContentText, ratingOption ? {} : { opacity: 0.3 }]}
              numberOfLines={1}
            >
              {ratingOption || 'Select reason'}
            </Text>
            <View style={{ flex: 0.1 }}>
              <DropdownGreen style={{ alignSelf: 'flex-end' }} />
            </View>
          </View>
          <View style={styles.reasonCancelDropDownExtraView} />
        </TouchableOpacity>
      ) : (
        <TextInputComponent
          value={ratingSuggestion}
          onChangeText={(text) => {
            text.startsWith(' ') ? null : setRatingSuggestion(text);
          }}
          placeholder={'Write your reason'}
        />
      )}
    </View>
  );

  const onSubmitFeedBack = () => {
    setLoading!(true);
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
        props.onComplete && props.onComplete(ratingStatus, ratingOption!);
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

    return (
      <View style={{}}>
        {props.info.title === '' ? null : (
          <FeedbackInfoCard
            style={{ marginTop: 16, marginHorizontal: 20 }}
            title={props.info.title}
            description={props.info.description}
            imageComponent={props.info.imageComponent}
            photoUrl={props.info.photoUrl}
          />
        )}
        <RatingSmilyView
          style={{ marginTop: 36.5, marginBottom: ratingStatus ? 0 : 40, marginHorizontal: 20 }}
          status={ratingStatus}
          onStatusChange={(_ratingStatus) => {
            setRatingStatus(_ratingStatus);
            setRatingOption('');
          }}
        />
        {!!ratingStatus && (
          <>
            <View style={{ marginHorizontal: 20 }}>
              {FEEDBACKTYPE.DIAGNOSTICS ? (
                <Spearator style={{ marginTop: 19.5 }} />
              ) : (
                <>
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
                </>
              )}
              <View
                style={[
                  { marginTop: 23.8 },
                  props.type === FEEDBACKTYPE.CONSULT ? { marginBottom: 4 } : {},
                ]}
              >
                {FEEDBACKTYPE.DIAGNOSTICS ? (
                  <>
                    {optionsDropdown}
                    {content}
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </View>
            </View>
            {props.type === FEEDBACKTYPE.CONSULT ? null : renderSubmitButton()}
          </>
        )}
      </View>
    );
  };

  const renderSubmitButton = () => {
    return (
      <View
        style={{
          flex: 1,
          marginTop: props.type === FEEDBACKTYPE.CONSULT ? 20 : 40,
          marginBottom: props.type === FEEDBACKTYPE.CONSULT ? 60 : 20,
          alignItems: 'center',
        }}
      >
        <Button
          disabled={props.type == FEEDBACKTYPE.DIAGNOSTICS ? !ratingStatus : !ratingOption}
          onPress={onSubmitFeedBack}
          title={'SUBMIT FEEDBACK'}
          style={{ width: '66.66%', marginBottom: 10 }}
        />
      </View>
    );
  };

  if (!props.isVisible) return null;
  return (
    <BottomPopUp
      title={props.title}
      description={props.description}
      style={[{ elevation: 999 }, props.containerStyle]}
    >
      <KeyboardAwareScrollView bounces={false}>{renderRatingContent()}</KeyboardAwareScrollView>
      {props.type === FEEDBACKTYPE.CONSULT ? renderSubmitButton() : null}
    </BottomPopUp>
  );
};
