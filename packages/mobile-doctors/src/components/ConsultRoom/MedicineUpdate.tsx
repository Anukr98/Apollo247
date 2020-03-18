import { removeMedicineList, updateMedicineList } from '@aph/mobile-doctors/src/components/ApiCall';
import MedicineUpdateStyles from '@aph/mobile-doctors/src/components/ConsultRoom/MedicineUpdate.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { ChipViewCard } from '@aph/mobile-doctors/src/components/ui/ChipViewCard';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Minus, Plus } from '@aph/mobile-doctors/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import {
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';

const styles = MedicineUpdateStyles;

type ConsultationType = {
  [key: string]: {
    isSelected: boolean;
    title: string;
  };
};

const medicineTimings: { [a: string]: string } = {
  [MEDICINE_TIMINGS.MORNING]: 'Morning',
  [MEDICINE_TIMINGS.NOON]: 'Noon',
  [MEDICINE_TIMINGS.EVENING]: 'Evening',
  [MEDICINE_TIMINGS.NIGHT]: 'Night',
};

console.log({ medicineTimings });

const medicineToBeTaken: { [a: string]: string } = {
  [MEDICINE_TO_BE_TAKEN.AFTER_FOOD]: 'After Food',
  [MEDICINE_TO_BE_TAKEN.BEFORE_FOOD]: 'Before Food',
};
console.log({ medicineToBeTaken });

export interface ProfileProps
  extends NavigationScreenProps<{
    medicine: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription;
  }> {}

export const MedicineUpdate: React.FC<ProfileProps> = (props) => {
  const medicine = props.navigation.getParam('medicine');
  console.log({ medicine });
  const [count, setCount] = useState<number>(parseInt(medicine.medicineDosage || '0', 10));
  const [value, setValue] = useState<string>(medicine.medicineInstructions || '');
  const [duration, setDuration] = useState<string>(
    medicine.medicineConsumptionDurationInDays || ''
  );

  const prepareConsultationType: ConsultationType = {};
  ((medicine.medicineTimings! as unknown) as []).forEach((m) => {
    prepareConsultationType[m] = { isSelected: true, title: medicineTimings[m] };
  });
  const [consultationType, setConsultationType] = useState(prepareConsultationType);

  const prepareTimings: ConsultationType = {};
  ((medicine.medicineToBeTaken! as unknown) as []).forEach((m) => {
    prepareTimings[m] = { isSelected: true, title: medicineToBeTaken[m] };
  });

  const [medicneupdate, setMedicineUpdate] = useState(prepareTimings);

  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          backgroundColor: '#ffffff',
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={medicine.medicineName || ''}
      ></Header>
    );
  };

  const removeData = () => {
    removeMedicineList(medicine.medicineName || '');
    props.navigation.pop();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          backgroundColor: '#ffffff',
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowRadius: 10,
          shadowOpacity: 0.2,
          elevation: 5,
        }}
      >
        {showHeaderView()}
      </View>
      <KeyboardAwareScrollView bounces={false}>
        <View
          style={{
            marginLeft: 16,
            marginRight: 16,
            marginTop: 16,
            backgroundColor: '#ffffff',
            borderRadius: 10,
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowRadius: 10,
            shadowOpacity: 0.2,
            elevation: 5,
          }}
        >
          <Text style={styles.dosage}>{strings.medicine.dosage}</Text>
          <View style={{ flexDirection: 'row', marginLeft: 16 }}>
            <TouchableOpacity onPress={() => setCount(count - 1)}>
              <View>
                <Minus />
              </View>
            </TouchableOpacity>
            <Text style={styles.countText}>
              {count} {strings.medicine.tablet}
              {count > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={() => setCount(count + 1)}>
              <View style={{ marginLeft: 10 }}>
                <Plus />
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: 16,
              marginRight: 16,
              //marginBottom: 24,
            }}
          ></View>
          <Text style={styles.dosage}>{strings.medicine.time_of_the_day}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: 16,
              marginRight: 16,
            }}
          >
            {Object.keys(medicineTimings).map((key) => {
              const title = medicineTimings[key];
              return (
                <ChipViewCard
                  key={key}
                  title={title}
                  onChange={(isChecked) => {
                    console.log({ key, isChecked });
                    setConsultationType({
                      ...consultationType,
                      [key]: { isSelected: isChecked, title: title },
                    });
                  }}
                  isChecked={!!(consultationType[key] && consultationType[key].isSelected)}
                />
              );
            })}
          </View>
          <Text style={styles.dosage}>{strings.medicine.tobe_taken}</Text>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: 16,
              marginRight: 16,
            }}
          >
            {Object.keys(medicineToBeTaken).map((key) => {
              const title = medicineToBeTaken[key];
              return (
                <ChipViewCard
                  containerStyle={{ marginRight: 8 }}
                  key={key}
                  title={title}
                  onChange={(isChecked) => {
                    console.log({ key, isChecked });
                    setMedicineUpdate({
                      ...medicneupdate,
                      [key]: { isSelected: isChecked, title: title },
                    });
                  }}
                  isChecked={!!(medicneupdate[key] && medicneupdate[key].isSelected)}
                />
              );
            })}
          </View>
          <Text style={styles.dosage}>{strings.medicine.duration_of_consumption}</Text>
          <View style={[styles.inputValidView]}>
            <TextInput
              style={styles.inputStyle}
              value={duration}
              onChangeText={(duration) => setDuration(duration)}
              autoCorrect={true}
            />
          </View>
          <Text style={styles.dosage}>{strings.medicine.instruction_label}</Text>
          <TextInputComponent
            placeholder={strings.medicine.enter_instruction_here}
            inputStyle={styles.inputView}
            multiline={true}
            value={value}
            onChangeText={(value) => setValue(value)}
            autoCorrect={true}
          />
        </View>
        <View style={styles.footerButtonsContainer}>
          <Button
            title={strings.buttons.delete}
            titleTextStyle={styles.buttonTextStyle}
            variant="white"
            style={[styles.buttonsaveStyle, { marginRight: 16 }]}
            onPress={() => removeData()}
          />
          <Button
            title={strings.buttons.update}
            style={styles.buttonendStyle}
            onPress={() => {
              let dosagefianl = '';
              if (count > 0) {
                dosagefianl = count.toString().concat('tablets');
              }
              updateMedicineList({
                medicineName: medicine.medicineName,
                medicineDosage: dosagefianl,
                medicineToBeTaken: (Object.keys(medicneupdate).filter(
                  (m) => medicneupdate[m].isSelected
                ) as unknown) as MEDICINE_TO_BE_TAKEN,
                medicineInstructions: value,
                medicineTimings: Object.keys(consultationType).filter(
                  (m) => consultationType[m].isSelected
                ),
                medicineConsumptionDurationInDays: duration,
              });
              props.navigation.goBack();
            }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};
