import styles from '@aph/mobile-doctors/src/components/ui/AddSymptomPopUp.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
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
      <View style={styles.headeView}>
        <Text style={styles.headerText}>
          {props.data ? strings.consult.update_complaint : strings.consult.add_complaint}
        </Text>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttonView}>
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
          labelStyle={styles.lableStyle}
          inputStyle={styles.inputTextStyle}
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
          labelStyle={styles.lableStyle}
          inputStyle={styles.inputTextStyle}
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
          labelStyle={styles.lableStyle}
          inputStyle={styles.inputTextStyle}
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
          labelStyle={styles.lableStyle}
          inputStyle={styles.inputTextStyle}
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
          labelStyle={styles.lableStyle}
          inputStyle={styles.detailsInputstyle}
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
    <View style={styles.mainView}>
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
              style={styles.touchableClosestyle}
            >
              <Remove style={styles.removeIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.conentView}>
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
