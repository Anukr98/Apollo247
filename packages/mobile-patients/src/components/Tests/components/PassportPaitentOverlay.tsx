import {
  extractPatientDetails,
  getAge,
  isSmallDevice,
  nameFormater,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
const { width, height } = Dimensions.get('window');

const { SHERPA_BLUE, APP_YELLOW, CARD_BG, WHITE, APP_GREEN, CLEAR } = theme.colors;

interface PassportPaitentOverlayProps {
  onPressDone: (response: any) => void;
  onPressClose: () => void;
  onPressAndroidBack?: () => void;
  title?: string;
  subTitle?: string;
  patientArray?: any;
  excludeProfileListIds?: string[];
  showCloseIcon?: boolean;
  onCloseIconPress?: () => void;
  disabledPatientId?: string;
  titleStyle?: StyleProp<TextStyle>;
  source?: string;
  responseMessage?: string | boolean;
  onCloseError?: () => void;
  refetchResult?: () => void;
  disableButton?: boolean;
  onChange?: (newArray: any) => void;
  value?: string
}

export const PassportPaitentOverlay: React.FC<PassportPaitentOverlayProps> = (props) => {
  const { onPressClose, patientArray, onPressDone, disableButton, onChange, value } = props;
  const [data, setData] = useState([
    {
      passportNo: '',
      displayId: '',
    },
  ]);
  useEffect(() => {
    let newArray = [...data]
    let obj = {
      passportNo: '',
      displayId: '',
    }
    for (let index = 0; index < patientArray.length - 1; index++) {
      const element = patientArray[index];
      newArray?.push(obj)
      setData(newArray)
    }
  }, [])
  const renderModalView = (item: any, index: any) => {
    const { patientName, patientSalutation } = extractPatientDetails(item?.patientObj);
    
    return (
      <>
        <View style={styles.inputView}>
          <TextInputComponent
            autoFocus={false}
            placeholder={string.enterPassport}
            placeholderTextColor={theme.colors.SHERPA_BLUE_LIGHT}
            value={data?.[index]?.passportNo || value}
            onChangeText={(value: any) => {
              let newArray = [...data]
              newArray[index]?.displayId = item?.displayId;
              newArray[index]?.passportNo = value;
              setData(newArray);
              onChange?.(newArray)
            }}
            inputStyle={styles.inputStyle}
          />
        </View>
        <View
          style={styles.patientView}
        >
          <Text style={styles.name}>
            {nameFormater(`${patientSalutation} ${patientName}`, 'title')}
          </Text>
          <Text style={styles.name}>
            {nameFormater(item?.patientObj?.gender, 'default')},{' '}
            {getAge(item?.patientObj?.dateOfBirth)}
          </Text>
        </View>
      </>
    );
  };

  return (
    <Overlay
      isVisible
      onRequestClose={() => onPressClose()}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.modalMainView}>
            <View style={styles.paitentModalView}>
              <Text style={styles.textHeadingModal}>{string.addPassport}</Text>
              <View style={{flex: 1}}>
                <FlatList
                  bounces={false}
                  data={patientArray}
                  style={{ marginBottom: height === 812 || height === 896 ? 80 : 70 }}
                  keyExtractor={(_, index) => `${index}`}
                  renderItem={({ item, index }) => renderModalView(item, index)}
                />
              </View>
              <StickyBottomComponent>
                <Button
                  title={'DONE'}
                  disabled={disableButton}
                  onPress={() => {
                    onPressDone(data)
                  }}
                  style={{ width: '100%' }}
                />
              </StickyBottomComponent>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Overlay>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  inputStyle: {
    width: '95%',
    height: 48,
    alignSelf: 'center',
    borderColor: '#F7F8F5',
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#F7F8F5',
    padding: 10,
  },
  patientView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.SHERPA_BLUE,
    borderRadius: 10,
    padding: 5,
    width: '95%',
    alignSelf: 'center',
    position: 'absolute',
  },
  inputView: {
    ...theme.viewStyles.cardViewStyle,
    borderColor: 'rgba(2,71,91,0.2)',
    borderWidth: 1,
    paddingTop: 50,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginBottom: 10,
    marginTop: 10,
    elevation: 0,
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: CLEAR,
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: CLEAR,
  },
  mainViewStyle: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  selectPatientNameViewStyle: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectPatientNameTextStyle: {
    ...text('M', 17, SHERPA_BLUE, 1, 24),
  },
  modalMainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
    flexDirection: 'column',
  },
  paitentModalView: {
    backgroundColor: 'white',
    height: height / 2,
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  patientCard: {
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 30,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  patientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 2,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 15,
    margin: 5,
  },
  textHeadingModal: {
    ...theme.viewStyles.text('SB', 17, '#02475b'),
    marginBottom: 20,
  },
  patientText: {
    ...theme.viewStyles.text('R', isSmallDevice ? 15 : 16, '#00B38E'),
    width: isSmallDevice ? '72%' : '78%',
  },
  patientSubText: {
    ...theme.viewStyles.text('R', isSmallDevice ? 11 : 12, '#00B38E'),
  },
  name: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 31,
    color: colors.WHITE,
  },
});

PassportPaitentOverlay.defaultProps = {
  titleStyle: styles.selectPatientNameTextStyle,
};
