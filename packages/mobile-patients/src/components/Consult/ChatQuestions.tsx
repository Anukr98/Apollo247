import {
  ArrowFull,
  ArrowStep1,
  ArrowStep2,
  ArrowStep3,
  ArrowLeft,
  ChatSend,
  DropdownGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  TextInputProps,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import firebase from 'react-native-firebase';
import { NavigationScreenProps } from 'react-navigation';
import { Button } from '../ui/Button';
import { TextInputComponent } from '../ui/TextInputComponent';
import { MaterialMenu } from '../ui/MaterialMenu';
import { useAllCurrentPatients } from '../../hooks/authHooks';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flex: 1,
    // alignItems: 'flex-end',
    justifyContent: 'flex-end',
    // height: 100,
    backgroundColor: 'transparent',
    // ...theme.viewStyles.container,
  },
  mainView: {
    minHeight: 200,

    // flex: 1,
    // flex: 9,
    // backgroundColor: 'transparent',
  },
  itemContainer: {
    minHeight: 200,
    // margin: 20,
    paddingTop: 20,
    backgroundColor: 'white',
    alignItems: 'flex-start',
    // justifyContent: 'space-around',
    // borderRadius: 10,
    // shadowColor: '#808080',
    // shadowOffset: { width: 0, height: 5 },
    // shadowOpacity: 0.4,
    // shadowRadius: 10,
    // elevation: 8,
  },
  descptionText: {
    marginTop: 10,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    marginHorizontal: 50,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingBottom: 50,
  },
  titleStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(16),
    textAlign: 'left',
    paddingLeft: 20,
  },
  skipView: {
    height: 40,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  imageStyle: {
    marginTop: 12,
    width: '80%',
  },
  skipTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    color: '#a4a4a4',
    textAlign: 'center',
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 'auto',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 18, '#01475b'),
  },
});

type Slide = {
  key: string;
  title: string;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  index: number;
  icon?: React.ReactNode;
  buttonText?: string[];
  inputPlacerholder?: string;
  dropDown?: { key: string; value: string }[];
  inputData: string[];
  isDependent?: boolean;
  dependentValue?: string;
  keyboardType?: TextInputProps['keyboardType'];
  validation?: RegExp;
};

const style = { height: 56, width: 56 };

const slides: Slide[] = [
  {
    key: 'height',
    index: 0,
    title: 'What is your height?',
    inputPlacerholder: 'Enter height…',
    dropDown: [{ key: '1', value: 'cm' }, { key: '2', value: 'ft' }],
    inputData: ['value', 'drop'],
    keyboardType: 'number-pad',
  },
  {
    key: 'weight',
    index: 1,
    title: 'What is your weight (in kg) ?',
    inputPlacerholder: 'Enter weight in kilogram…',
    inputData: ['value'],
    keyboardType: 'number-pad',
  },
  {
    key: 'drug',
    index: 2,
    title: 'Are you allergic to any medicine?',
    buttonText: ['Yes', 'No'],
    inputData: ['value'],
  },
  {
    key: 'drugAllergies',
    index: 3,
    title: 'What medicines are you allergic to?',
    isDependent: true,
    dependentValue: 'Yes',
    inputPlacerholder: 'Enter medicines…',
    inputData: ['value'],
    keyboardType: 'default',
  },
  {
    key: 'diet',
    index: 4,
    title: 'Are you allergic to any kind of food?',
    buttonText: ['Yes', 'No'],
    inputData: ['value'],
  },
  {
    key: 'dietAllergies',
    index: 5,
    title: 'What kind of food are you allergic to?',
    isDependent: true,
    dependentValue: 'Yes',
    inputPlacerholder: 'Enter food items…',
    inputData: ['value'],
    keyboardType: 'default',
  },
  {
    key: 'smoke',
    index: 6,
    title: 'Do you smoke?',
    buttonText: ['Yes', 'No', 'Ex-Smoker'],
    inputData: ['value'],
  },
  {
    key: 'lifeStyleSmoke',
    index: 7,
    title: 'Do many do you smoke per day?',
    isDependent: true,
    buttonText: ['< 10', '10-20', '> 20'],
    dependentValue: 'Yes',
    inputData: ['value'],
  },
  {
    key: 'drink',
    index: 8,
    title: 'Do you drink?',
    buttonText: ['Yes', 'No'],
    inputData: ['value'],
  },
  {
    key: 'lifeStyleDrink',
    index: 9,
    title: 'How much do you drink in a week?',
    isDependent: true,
    buttonText: ['< 30ml', '30-60ml', '> 60ml'],
    dependentValue: 'Yes',
    inputData: ['value'],
  },
  {
    key: 'temperature',
    index: 10,
    title: 'What is your body temperature right now (in °F) ?',
    buttonText: ['99-100', '100-101', '102+', 'No Idea'],
    inputData: ['value'],
  },
  {
    key: 'bp',
    index: 11,
    title: 'What is your blood pressure right now?',
    inputPlacerholder: '---/---',
    buttonText: ['No Idea'],
    inputData: ['value', 'value'],
    keyboardType: 'numbers-and-punctuation',
  },
  {
    key: 'familyHistory',
    index: 12,
    title: 'Does anyone in your family suffer from — COPD,Cancer, Hypertension or Diabetes?',
    buttonText: ['Yes', 'No'],
    inputData: ['value'],
  },
];

export interface ChatQuestionsProps {
  onDonePress: (values: { k: string; v: string[] }[]) => void;
  onItemDone?: (values: { k: string; v: string[] }) => void;
}

export const ChatQuestions: React.FC<ChatQuestionsProps> = (props) => {
  const appIntroSliderRef = React.useRef<any>(null);
  const [currentIndex, setcurrentIndex] = useState<number>(0);
  const [values, setValues] = useState<{ k: string; v: string[] }[]>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isSend, setisSend] = useState<boolean[]>(slides.map((item) => false));
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    const v = slides.map((item) => {
      return {
        k: item.key,
        v: item.inputData.map((i) => (item.dropDown && i === 'drop' ? item.dropDown[0].value : '')),
      };
    });

    if (currentPatient && currentPatient.patientMedicalHistory) {
      currentPatient.patientMedicalHistory.bp &&
        (v.find((i) => i.k === 'bp')!.v = [
          currentPatient.patientMedicalHistory.bp !== 'No Idea'
            ? currentPatient.patientMedicalHistory.bp
            : '',
          currentPatient.patientMedicalHistory.bp === 'No Idea'
            ? currentPatient.patientMedicalHistory.bp
            : '',
        ]);
      currentPatient.patientMedicalHistory.height &&
        (v.find((i) => i.k === 'height')!.v =
          currentPatient.patientMedicalHistory.height !== 'No Idea'
            ? [...currentPatient.patientMedicalHistory.height.split(' ')]
            : ['', 'cm']);
      currentPatient.patientMedicalHistory.weight &&
        (v.find((i) => i.k === 'weight')!.v = [
          currentPatient.patientMedicalHistory.weight !== 'No Idea'
            ? currentPatient.patientMedicalHistory.weight
            : '',
        ]);
      currentPatient.patientMedicalHistory.dietAllergies &&
        (currentPatient.patientMedicalHistory.dietAllergies === 'No'
          ? (v.find((i) => i.k === 'diet')!.v = ['No'])
          : (v.find((i) => i.k === 'diet')!.v = ['Yes']) ||
            (v.find((i) => i.k === 'dietAllergies')!.v = [
              currentPatient.patientMedicalHistory.dietAllergies,
            ]));

      currentPatient.patientMedicalHistory.drugAllergies &&
        (currentPatient.patientMedicalHistory.drugAllergies === 'No'
          ? (v.find((i) => i.k === 'drug')!.v = ['No'])
          : (v.find((i) => i.k === 'drug')!.v = ['Yes']) ||
            (v.find((i) => i.k === 'drugAllergies')!.v = [
              currentPatient.patientMedicalHistory.drugAllergies,
            ]));
      currentPatient.patientMedicalHistory.temperature &&
        (v.find((i) => i.k === 'temperature')!.v = [
          currentPatient.patientMedicalHistory.temperature,
        ]);
    }

    setValues(v);
    // appIntroSliderRef.current.goToSlide(6);
  }, []);

  const _renderNextButton = () => {
    return (
      <View>
        <ChatSend style={{ width: 24, height: 24, marginTop: 8, marginLeft: 14 }} />
      </View>
    );
  };
  const _renderPrevButton = () => {
    return (
      <View>
        <ArrowLeft />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainView}>
        <AppIntroSlider
          ref={appIntroSliderRef}
          extraData={refresh}
          paginationStyle={{ bottom: 10 }}
          // hidePagination
          //scrollEnabled={false}
          slides={slides}
          showPrevButton={false}
          showNextButton={true}
          showDoneButton={true}
          renderNextButton={_renderNextButton}
          renderPrevButton={_renderPrevButton}
          renderDoneButton={_renderNextButton}
          dotStyle={{ backgroundColor: theme.colors.SKY_BLUE }}
          activeDotStyle={{ backgroundColor: theme.colors.SHERPA_BLUE }}
          onDone={() => {
            values && props.onDonePress(values);
          }}
          onSlideChange={(index: number) => {
            if (
              slides[index].isDependent &&
              values &&
              values[index - 1].v[0] !== slides[index].dependentValue
            ) {
              setcurrentIndex(index + 1);
              appIntroSliderRef.current.goToSlide(index + 1);
            }
            if (slides[index].key === 'lifeStyleDrink') {
              let v = values!;
              v[index].v[0] = v[index - 1].v[0];
              setValues(v);
              setRefresh(!refresh);
            }
            if (slides[index].key === 'lifeStyleSmoke') {
              let v = values!;
              v[index].v[0] = v[index - 1].v[0];
              setValues(v);
              setRefresh(!refresh);
            }
            if (index < currentIndex) {
              // appIntroSliderRef.current.goToSlide(currentIndex);
            } else {
              !isSend[index - 1] && props.onItemDone!(values![index - 1]);
              let send = isSend;
              send[index - 1] = true;
              setisSend(send);
              setcurrentIndex(index);
            }
            setRefresh(!refresh);
          }}
          renderItem={(item: Slide) => (
            <View style={styles.itemContainer}>
              <View>
                <Text style={styles.titleStyle}>{item.title}</Text>
              </View>
              <View style={{ width: '100%', opacity: currentIndex > item.index ? 0.5 : 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    margin: 20,
                  }}
                >
                  {item.inputPlacerholder && (
                    <TextInputComponent
                      value={`${values && values[item.index].v[0]}`}
                      onChangeText={(text) => {
                        if (currentIndex <= item.index) {
                          let v = values!;
                          v[item.index].v[0] = text;
                          setValues(v);
                          setRefresh(!refresh);
                        }
                      }}
                      conatinerstyles={{
                        width: 'auto',
                        maxWidth: item.buttonText || item.dropDown ? '40%' : '100%',
                        minWidth: item.buttonText || item.dropDown ? width / 2 - 20 : '100%',
                      }}
                      placeholder={item.inputPlacerholder}
                      keyboardType={item.keyboardType}
                    />
                  )}
                  {item.dropDown && (
                    <MaterialMenu
                      options={item.dropDown}
                      selectedText={values && values[item.index].v[item.inputPlacerholder ? 1 : 0]}
                      menuContainerStyle={{ alignItems: 'flex-end', marginRight: width / 2 }}
                      itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
                      itemTextStyle={{
                        ...theme.viewStyles.text('M', 16, '#01475b'),
                        paddingHorizontal: 0,
                      }}
                      selectedTextStyle={{
                        ...theme.viewStyles.text('M', 16, '#00b38e'),
                        alignSelf: 'flex-start',
                      }}
                      bottomPadding={{ paddingBottom: 20 }}
                      onPress={(selectedDrop) => {
                        if (currentIndex <= item.index) {
                          let v = values!;
                          v[item.index].v[
                            item.inputPlacerholder ? 1 : 0
                          ] = selectedDrop.value.toString();
                          setValues(v);
                          setRefresh(!refresh);
                        }
                      }}
                    >
                      <View style={{ flexDirection: 'row', paddingTop: 1, marginRight: 40 }}>
                        <View
                          style={[
                            styles.placeholderViewStyle,
                            {
                              maxWidth: item.buttonText || item.dropDown ? '40%' : '100%',
                              minWidth:
                                item.buttonText || item.inputPlacerholder
                                  ? (width - 40) / 2 - 10
                                  : '100%',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.placeholderTextStyle,
                              values && values[item.index] !== undefined
                                ? null
                                : styles.placeholderStyle,
                            ]}
                          >
                            {values && values[item.index] !== undefined
                              ? values[item.index].v[item.inputPlacerholder ? 1 : 0]
                              : 'select'}
                          </Text>
                          <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                            <DropdownGreen />
                          </View>
                        </View>
                      </View>
                    </MaterialMenu>
                  )}
                  {item.buttonText &&
                    item.buttonText.map((text) => (
                      <Button
                        disabled={currentIndex > item.index}
                        style={{
                          width: 'auto',
                          maxWidth: '45%',
                          minWidth:
                            (width - 40) /
                              (item.inputPlacerholder || item.dropDown
                                ? item.buttonText!.length + 1
                                : item.buttonText!.length) -
                            10,
                          backgroundColor:
                            values &&
                            values[item.index].v[
                              item.inputPlacerholder || item.dropDown ? 1 : 0
                            ] === text
                              ? theme.colors.APP_GREEN
                              : theme.colors.WHITE,
                          marginBottom: 16,
                        }}
                        disabledStyle={{
                          backgroundColor:
                            values &&
                            values[item.index].v[
                              item.inputPlacerholder || item.dropDown ? 1 : 0
                            ] === text
                              ? theme.colors.APP_GREEN
                              : theme.colors.WHITE,
                        }}
                        titleTextStyle={{
                          color:
                            values &&
                            values[item.index].v[
                              item.inputPlacerholder || item.dropDown ? 1 : 0
                            ] === text
                              ? theme.colors.WHITE
                              : theme.colors.APP_GREEN,
                        }}
                        key={text}
                        title={text}
                        onPress={() => {
                          let v = values!;
                          v[item.index].v[item.inputPlacerholder || item.dropDown ? 1 : 0] = text;
                          setValues(v);
                          setRefresh(!refresh);
                        }}
                      />
                    ))}
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};
