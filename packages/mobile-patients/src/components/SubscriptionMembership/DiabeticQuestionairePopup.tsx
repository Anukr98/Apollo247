import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
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
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: '#3D5868',
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
    top: Dimensions.get('window').height * 0.15,
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
    marginVertical: 10,
    width: '97%',
  },
  subHeadingText: {
    ...theme.viewStyles.text('R', 12, '#02475B', 1, 18, 0.35),
    textAlign: 'center',
  },
  buttonView: { width: '40%', alignSelf: 'center', marginTop: 30 },
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
    height: 21,
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

  const onPressRadioButton = (item: any, index: number) => {
    if (index == 0) {
      setIsTypeOfDiabetesChecked('checked');
      setTypeOfDiabetes(item.item.value);
    } else {
      setIsDurationOfDiabetesChecked('checked');
      setDurationOfDiabetes(item.item.value);
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
                    marginTop: key == 1 ? '10%' : 5,
                  },
                ]}
              >
                *Optional
              </Text>
              <Text style={styles.questionText}>{item.QUESTION}</Text>
              <FlatList
                data={item.OPTIONS}
                numColumns={2}
                renderItem={(data) => renderOptions(data, key)}
              />
            </View>
          );
        })}
      </View>
    );
  };

  const renderOptions = (item: any, index: number) => {
    return (
      <View style={{ width: '50%', marginTop: 10 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => onPressRadioButton(item, index)}
          style={{ flexDirection: 'row' }}
        >
          {(isTypeOfDiabetesChecked == 'checked' && typeOfDiabetes === item.item.value) ||
          (isDurationOfDiabetesChecked == 'checked' && durationOfDiabetes === item.item.value) ? (
            <RadioButtonIcon style={styles.radioIcon} />
          ) : (
            <RadioButtonUnselectedIcon style={styles.radioIcon} />
          )}

          <Text
            style={[
              styles.radioButtonText,
              {
                color:
                  (isTypeOfDiabetesChecked == 'checked' && typeOfDiabetes === item.item.value) ||
                  (isDurationOfDiabetesChecked == 'checked' &&
                    durationOfDiabetes === item.item.value)
                    ? theme.colors.APP_GREEN
                    : theme.colors.SHERPA_BLUE,
              },
            ]}
          >
            {item.item.value}
          </Text>
        </TouchableOpacity>
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
            <View style={{ width: '89%' }}>
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
