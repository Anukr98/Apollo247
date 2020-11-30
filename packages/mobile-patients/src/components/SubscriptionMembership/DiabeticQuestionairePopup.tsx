import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RoundCancelIcon, RadioButtonIcon, RadioButtonUnselectedIcon } from '../ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { colors } from '@aph/mobile-patients/src/theme/colors';

const styles = StyleSheet.create({
  optionalText: {
    ...theme.viewStyles.text('M', 8, '#FF8E8E', 1, 10.4, 0.35),
    marginBottom: 5,
  },
  questionText: {
    ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 18, 0.35),
    marginBottom: 10,
  },
  radioButtonText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
    marginLeft: 8,
  },
  blurView: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.31)',
    width: '100%',
    height: '100%',
  },
  popupContainerView: {
    flexDirection: 'row',
    top: Dimensions.get('window').height * 0.2,
  },
  popupView: {
    width: '90%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headingText: {
    ...theme.viewStyles.text('M', 16, '#00B38E', 1, 20, 0.35),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subHeadingView: {
    marginHorizontal: 15,
    marginVertical: 10,
    width: '93%',
  },
  subHeadingText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 18, 0.35),
  },
  buttonView: { width: '40%', alignSelf: 'center', marginTop: 10 },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 10,
    marginVertical: 4,
    padding: 16,
  },
  sectionsHeading: {
    marginHorizontal: 10,
    height: 30,
  },
  crossIconStyle: {
    resizeMode: 'contain',
    width: 22,
    height: 23,
  },
  howToAvail: {
    flexDirection: 'row',
    marginTop: 15,
    width: '80%',
  },
  oneVectorStyle: {
    marginRight: 10,
    marginTop: 5,
  },
  bottomContainer: {
    backgroundColor: '#FC9916',
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  radioIcon: { height: 18, width: 18, resizeMode: 'contain' },
});

export interface DiabeticQuestionairePopupProps extends NavigationScreenProps {
  heading: string;
  subHeading: string;
  ctaText: string;
  questions: [{ QUESTION: string; OPTIONS: [{ key: string; value: string }] }];
  onClose: () => void;
  onPressSubmit: (typeOfDiabetes: string, durationOfDiabetes: string) => void;
}

export const DiabeticQuestionairePopup: React.FC<DiabeticQuestionairePopupProps> = (props) => {
  const [typeOfDiabetes, setTypeOfDiabetes] = useState<string>('');
  const [durationOfDiabetes, setDurationOfDiabetes] = useState<string>('');
  const [isTypeOfDiabetesChecked, setIsTypeOfDiabetesChecked] = useState<string>('unchecked');
  const [isDurationOfDiabetesChecked, setIsDurationOfDiabetesChecked] = useState<string>(
    'unchecked'
  );

  const onPressRadioButton = (item: any, selectedOption: any) => {
    if (item.QUESTION == props.questions[0].QUESTION) {
      setIsTypeOfDiabetesChecked('checked');
      setTypeOfDiabetes(selectedOption.value);
    } else {
      setIsDurationOfDiabetesChecked('checked');
      setDurationOfDiabetes(selectedOption.value);
    }
  };

  const renderQuestions = () => {
    return (
      <View>
        {props.questions.map((item, key) => {
          return (
            <View>
              <Text
                style={[
                  styles.optionalText,
                  {
                    marginTop: key == 1 ? 10 : 5,
                  },
                ]}
              >
                *Optional
              </Text>
              <Text style={styles.questionText}>{item.QUESTION}</Text>
              {item.OPTIONS.map((res, key) => {
                return (
                  <View key={res.key}>
                    <View style={{}}>
                      <View style={{}}>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => onPressRadioButton(item, res)}
                          style={{ flexDirection: 'row' }}
                        >
                          {(isTypeOfDiabetesChecked == 'checked' && typeOfDiabetes === res.value) ||
                          (isDurationOfDiabetesChecked == 'checked' &&
                            durationOfDiabetes === res.value) ? (
                            <RadioButtonIcon style={styles.radioIcon} />
                          ) : (
                            <RadioButtonUnselectedIcon style={styles.radioIcon} />
                          )}

                          <Text
                            style={[
                              styles.radioButtonText,
                              {
                                color:
                                  (isTypeOfDiabetesChecked == 'checked' &&
                                    typeOfDiabetes === res.value) ||
                                  (isDurationOfDiabetesChecked == 'checked' &&
                                    durationOfDiabetes === res.value)
                                    ? theme.colors.APP_GREEN
                                    : theme.colors.SHERPA_BLUE,
                              },
                            ]}
                          >
                            {res.value}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.blurView}>
      <View style={styles.popupContainerView}>
        <View style={{ width: '5.72%' }} />
        <View style={styles.popupView}>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View style={{ width: '90%' }}>
              <Text style={styles.headingText}>{props.heading}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                props.onClose();
              }}
              style={styles.sectionsHeading}
            >
              <RoundCancelIcon style={styles.crossIconStyle} />
            </TouchableOpacity>
          </View>
          <View style={styles.subHeadingView}>
            <Text style={styles.subHeadingText}>{props.subHeading}</Text>
          </View>
          {renderQuestions()}

          <Button
            title={props.ctaText}
            onPress={() => {
              props.onPressSubmit(typeOfDiabetes, durationOfDiabetes);
            }}
            style={styles.buttonView}
          />
        </View>
      </View>
    </View>
  );
};
