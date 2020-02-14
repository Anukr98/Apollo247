import { addMedicineList } from '@aph/mobile-doctors/src/components/ApiCall';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { ChipViewCard } from '@aph/mobile-doctors/src/components/ui/ChipViewCard';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Minus, Plus } from '@aph/mobile-doctors/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  dosage: {
    color: 'rgba(2, 71, 91, 0.6)',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 10,
    marginLeft: 16,
    marginTop: 16,
  },
  countText: { marginLeft: 10, ...theme.fonts.IBMPlexSansMedium(16), color: '#02475b' },

  inputView: {
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30c1a3',
    // marginTop: 10,
    color: '#01475b',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },

  footerButtonsContainer: {
    // zIndex: -1,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonendStyle: {
    width: '45%',
    height: 40,
    backgroundColor: '#fc9916',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.4,
    elevation: 2,
  },
  buttonsaveStyle: {
    width: '35%',
    height: 40,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(14),
    textAlign: 'center',
    color: '#fc9916',
  },
});

type ConsultationType = {
  [key: string]: boolean;
};

export interface ProfileProps
  extends NavigationScreenProps<{
    Name: string;
  }> {}

export const MedicineAddScreen: React.FC<ProfileProps> = (props) => {
  const [count, setCount] = useState(1);
  const [value, setValue] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [consultationType, setConsultationType] = useState({
    MORNING: { title: 'Morning', isSelected: false },
    NOON: { title: 'Noon', isSelected: false },
    EVENING: { title: 'Evening', isSelected: false },
    NIGHT: { title: 'Night', isSelected: false },
  });

  const [medicneupdate, setMedicineUpdate] = useState({
    AFTER_FOOD: { title: 'After Food', isSelected: false },
    BEFORE_FOOD: { title: 'Before Food', isSelected: false },
  });

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
        headerText={props.navigation.getParam('Name')}
      ></Header>
    );
  };
  const removeData = () => {
    //removeMedicineList(props.navigation.getParam('Name'));

    props.navigation.pop(2);
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
            {count == 1 ? (
              <TouchableOpacity>
                <View>
                  <Minus />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setCount(count - 1)}>
                <View>
                  <Minus />
                </View>
              </TouchableOpacity>
            )}

            <Text style={styles.countText}>
              {count} {strings.medicine.tablet}
              {count > 1 ? 's' : ''}
            </Text>
            {count == 5 ? (
              <TouchableOpacity>
                <View>
                  <Plus />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setCount(count + 1)}>
                <View>
                  <Plus />
                </View>
              </TouchableOpacity>
            )}
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
              //marginBottom: 24,
            }}
          >
            {Object.keys(consultationType).map((key) => {
              const data = consultationType[key];
              return (
                <ChipViewCard
                  containerStyle={{ marginRight: 8 }}
                  title={data.title}
                  onChange={(isChecked) => {
                    console.log({ key, isChecked });
                    setConsultationType({
                      ...consultationType,
                      [key]: { isSelected: isChecked, title: data.title },
                    });
                  }}
                  isChecked={consultationType[key].isSelected}
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
              padding: 10,
            }}
          >
            {Object.keys(medicneupdate).map((key) => {
              const data = medicneupdate[key];
              return (
                <ChipViewCard
                  containerStyle={{ marginRight: 8 }}
                  title={data.title}
                  onChange={(isChecked) => {
                    console.log({ key, isChecked });
                    setMedicineUpdate({
                      ...medicneupdate,
                      [key]: { isSelected: isChecked, title: data.title },
                    });
                  }}
                  isChecked={medicneupdate[key].isSelected}
                />
              );
            })}
          </View>
          <Text style={styles.dosage}>{strings.medicine.duration_of_consumption}</Text>

          {/* <TextInput
            style={styles.inputStyle}
            value={duration}
            onChangeText={(duration) => setDuration(duration)}
            autoCorrect={true}
          /> */}
          <TextInput
            style={{
              marginLeft: 16,
              marginRight: 20,
              ...theme.fonts.IBMPlexSansMedium(18),
              width: '90%',
              borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
              borderBottomWidth: 2,
              marginBottom: 16,

              color: '#01475b',
            }}
            maxLength={20}
            value={duration}
            onChangeText={(duration) => setDuration(duration)}
          />

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
            title={strings.buttons.cancel}
            titleTextStyle={styles.buttonTextStyle}
            variant="white"
            style={[styles.buttonsaveStyle, { marginRight: 16 }]}
            onPress={() => removeData()}
          />
          <Button
            title={strings.smartPrescr.add_medicine}
            style={styles.buttonendStyle}
            onPress={() => {
              if (count == 0 || duration == '') {
                Alert.alert(strings.medicine.please_select_feilds);
              } else {
                let dosagefianl = '';
                console.log({
                  medicineName: props.navigation.getParam('Name'),
                  medicineDosage: count,
                  medicineToBeTaken: Object.keys(medicneupdate).filter(
                    (time) => medicneupdate[time].isSelected
                  ),
                  medicineInstructions: value,
                  medicineTimings: Object.keys(consultationType).filter(
                    (time) => consultationType[time].isSelected
                  ),
                  medicineConsumptionDurationInDays: duration,
                });
                if (count > 1) {
                  dosagefianl = count.toString().concat('tablets');
                } else {
                  dosagefianl = count.toString().concat('tablet');
                }
                addMedicineList({
                  medicineName: props.navigation.getParam('Name'),
                  medicineDosage: dosagefianl,
                  medicineToBeTaken: Object.keys(medicneupdate).filter(
                    (time) => medicneupdate[time].isSelected
                  ),
                  medicineInstructions: value,
                  medicineTimings: Object.keys(consultationType).filter(
                    (time) => consultationType[time].isSelected
                  ),
                  medicineConsumptionDurationInDays: duration,
                });
                props.navigation.pop(2);
              }
            }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};
