import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Up, Down, Plus, Minus } from '@aph/mobile-doctors/src/components/ui/Icons';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { ChipViewCard } from '@aph/mobile-doctors/src/components/ui/ChipViewCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { CapsuleView } from '@aph/mobile-doctors/src/components/ui/CapsuleView';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { SelectableButton } from '@aph/mobile-doctors/src/components/ui/SelectableButton';

import {
  updateMedicineList,
  removeMedicineList,
  addMedicineList,
} from '@aph/mobile-doctors/src/components/ApiCall';

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
  timeofthedayText: {
    color: 'rgba(2, 71, 91, 0.6)',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 10,
  },
  foodmedicineview: {
    flexDirection: 'row',
    marginBottom: 24,
    flex: 1,
    marginRight: 16,
  },
  daysview: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginRight: 16,
    marginBottom: 16,
  },
  addDoctorText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0,
    color: '#fc9916',
    marginTop: 2,
  },
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
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    // width: '80%',
    color: theme.colors.INPUT_TEXT,
    paddingBottom: 4,
  },
  inputValidView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    paddingBottom: 0,
    marginLeft: 20,
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
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
    color: '#890000',
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
  const [count, setCount] = useState(0);
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

  //   useEffect(() => {
  //     setDuration(props.navigation.getParam('MedicineConsumptionDurationInDays'));
  //     setValue(props.navigation.getParam('MedicineInstructions'));
  //     setCount(parseInt(props.navigation.getParam('Dosage').substring(0, 1)));
  //     const abc = props.navigation.getParam('MedicineToBeTaken');
  //     setMedicineUpdate({
  //       ...medicneupdate,
  //       [abc]: {
  //         isSelected: !!abc,
  //         title: medicneupdate[abc].title,
  //       },
  //     });
  //     const def = props.navigation.getParam('MedicineTimings');
  //     setConsultationType({
  //       ...consultationType,
  //       [def]: {
  //         isSelected: !!def,
  //         title: consultationType[def].title,
  //       },
  //     });
  //   }, []);

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
        <Text style={styles.dosage}>Dosage</Text>
        <View style={{ flexDirection: 'row', marginLeft: 16 }}>
          <TouchableOpacity onPress={() => setCount(count - 1)}>
            <View>
              <Minus />
            </View>
          </TouchableOpacity>
          <Text style={styles.countText}>
            {count} tablet{count > 1 ? 's' : ''}
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
        <Text style={styles.dosage}>Time of the Day</Text>
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
        <Text style={styles.dosage}>To be taken</Text>
        <View
          style={{
            flexDirection: 'row',
            //justifyContent: 'space-between',
            marginLeft: 16,
            marginRight: 16,
            padding: 10,
            // marginBottom: 24,
          }}
        >
          {Object.keys(medicneupdate).map((key) => {
            const data = medicneupdate[key];
            return (
              <ChipViewCard
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
        <Text style={styles.dosage}>Duration of Consumption</Text>
        <View style={[styles.inputValidView]}>
          <TextInput
            style={styles.inputStyle}
            value={duration}
            onChangeText={(duration) => setDuration(duration)}
            autoCorrect={true}
          />
        </View>
        <Text style={styles.dosage}>Instructions (if any)</Text>
        <TextInputComponent
          placeholder="Enter instructions here.."
          inputStyle={styles.inputView}
          multiline={true}
          value={value}
          onChangeText={(value) => setValue(value)}
          autoCorrect={true}
        />
      </View>
      <View style={styles.footerButtonsContainer}>
        <Button
          title="CANCEL"
          titleTextStyle={styles.buttonTextStyle}
          variant="white"
          style={[styles.buttonsaveStyle, { marginRight: 16 }]}
          onPress={() => removeData()}
        />
        <Button
          title="ADD MEDICINE "
          style={styles.buttonendStyle}
          onPress={() => {
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
            if (count > 0) {
              dosagefianl = count.toString().concat('tablets');
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
          }}
        />
      </View>
    </SafeAreaView>
  );
};
