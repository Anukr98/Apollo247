import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { width } = Dimensions.get('window');

export interface AddSymptomPopUpProps {
  onClose: () => void;
  data?: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms;
  onDone?: (value: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms) => void;
}
export const AddSymptomPopUp: React.FC<AddSymptomPopUpProps> = (props) => {
  const [value, setValue] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | undefined
  >(props.data);
  const { showAphAlert, hideAphAlert } = useUIElements();

  const handleBack = async () => {
    props.onClose();
    return false;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const renderHeader = () => {
    return (
      <View
        style={[
          theme.viewStyles.cardContainer,
          {
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            width: width - 60,
            flexDirection: 'row',
            zIndex: 2,
          },
        ]}
      >
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          {props.data ? strings.consult.update_complaint : strings.consult.add_complaint}
        </Text>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View
        style={[
          theme.viewStyles.cardContainer,
          {
            width: '100%',
            flexDirection: 'row',
            padding: 16,
            borderBottomEndRadius: 10,
            borderBottomStartRadius: 10,
          },
        ]}
      >
        <Button
          title={strings.buttons.cancel}
          variant={'white'}
          onPress={() => props.onClose()}
          style={{ width: (width - 110) / 2, marginRight: 16 }}
        />
        <Button
          title={props.data ? strings.buttons.update_symptom : strings.buttons.add_symptom}
          onPress={() => {
            if (value) {
              if (value.symptom) {
                if (value.severity) {
                  props.onDone && props.onDone(value);
                } else {
                  showAphAlert &&
                    showAphAlert({
                      title: strings.common.alert,
                      description: strings.consult.enter_severity,
                    });
                  return;
                }
              } else {
                showAphAlert &&
                  showAphAlert({
                    title: strings.common.alert,
                    description: strings.consult.enter_symptom,
                  });
                return;
              }
            } else {
              showAphAlert &&
                showAphAlert({
                  title: strings.common.alert,
                  description: strings.consult.complaint_data_empty,
                  onPressOk: () => {
                    props.onClose();
                    hideAphAlert && hideAphAlert();
                  },
                });
              return;
            }
            props.onClose();
          }}
          style={{ width: (width - 110) / 2 }}
        />
      </View>
    );
  };

  const renderInput = () => {
    return (
      <View style={{ padding: 16 }}>
        <TextInputComponent
          label={strings.consult.symptom}
          labelStyle={theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.7))}
          inputStyle={{
            paddingBottom: 4,
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
          }}
          value={(value && value.symptom) || ''}
          onChangeText={(text) => {
            setValue({
              ...value,
              symptom: text,
            } as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms);
          }}
        />
        <TextInputComponent
          label={strings.consult.since_optional}
          labelStyle={theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.7))}
          inputStyle={{
            paddingBottom: 4,
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
          }}
          value={(value && value.since) || ''}
          onChangeText={(text) => {
            setValue({
              ...value,
              since: text,
            } as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms);
          }}
        />
        <TextInputComponent
          label={strings.consult.how_often_optional}
          labelStyle={theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.7))}
          inputStyle={{
            paddingBottom: 4,
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
          }}
          value={(value && value.howOften) || ''}
          onChangeText={(text) => {
            setValue({
              ...value,
              howOften: text,
            } as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms);
          }}
        />
        <TextInputComponent
          label={strings.consult.severity}
          labelStyle={theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.7))}
          inputStyle={{
            paddingBottom: 4,
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
          }}
          value={(value && value.severity) || ''}
          onChangeText={(text) => {
            setValue({
              ...value,
              severity: text,
            } as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms);
          }}
        />
        <TextInputComponent
          label={strings.common.details}
          labelStyle={theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.7))}
          inputStyle={{
            borderWidth: 2,
            borderRadius: 10,
            height: 80,
            paddingLeft: 12,
            paddingRight: 12,
            paddingBottom: 12,
            paddingTop: 12,
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
          }}
          placeholder={strings.consult.enter_details_here}
          multiline={true}
          textInputprops={{ textAlignVertical: 'top' }}
          value={(value && value.details) || ''}
          onChangeText={(text) => {
            setValue({
              ...value,
              details: text,
            } as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms);
          }}
        />
      </View>
    );
  };
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 5,
        elevation: 500,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <View
          style={{
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              alignItems: 'flex-end',
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                props.onClose();
              }}
              style={{
                marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 50,
                backgroundColor: 'white',
                height: 28,
                width: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                marginRight: 0,
                marginBottom: 8,
              }}
            >
              <Remove style={{ width: 28, height: 28 }} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              ...theme.viewStyles.cardContainer,
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              borderRadius: 10,
              maxHeight: '85%',
            }}
          >
            {renderHeader()}
            <ScrollView bounces={false} style={{ backgroundColor: 'white' }}>
              {renderInput()}
            </ScrollView>
            {renderButtons()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
