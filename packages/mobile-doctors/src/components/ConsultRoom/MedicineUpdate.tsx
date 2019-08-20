import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Up, Down, Plus, Minus } from '@aph/mobile-doctors/src/components/ui/Icons';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { ChipViewCard } from '@aph/mobile-doctors/src/components/ui/ChipViewCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { CapsuleView } from '@aph/mobile-doctors/src/components/ui/CapsuleView';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { SelectableButton } from '@aph/mobile-doctors/src/components/ui/SelectableButton';

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
  morning: string;
  noon: string;
  evening: string;
  night: string;
  afterfood: string;
  beforefood: string;
};

export interface ProfileProps extends NavigationScreenProps {}

export const MedicineUpdate: React.FC<ProfileProps> = (props) => {
  const [count, setCount] = useState(0);
  const [medinceName, setMedinceName] = useState<string>('Ibuprofen, 200mg');
  const [value, setValue] = useState<string>('');
  const [consultationType, setConsultationType] = useState<ConsultationType>({
    morning: 'Morning',
    noon: 'Noon',
    evening: 'Evening',
    night: 'Night',
    afterfood: 'After Food',
    beforefood: 'Before Food',
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
        headerText="MEDICINE UPDATE"
      ></Header>
    );
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
          <ChipViewCard
            title="Morning"
            onChange={(isChecked) => {
              if (!isChecked && !consultationType.morning) {
                return;
              } else {
                console.log('morngn', consultationType.morning);
                // setConsultationType({ ...consultationType, morning: isChecked });
              }
            }}
            isChecked={!!consultationType.morning}
          />
          <ChipViewCard
            title="Noon"
            onChange={(isChecked) => {
              if (!isChecked && !consultationType.noon) {
                return;
              } else {
                console.log('morngn', consultationType.noon);
                // setConsultationType({ ...consultationType, noon: isChecked });
              }
            }}
            isChecked={!!consultationType.noon}
          />
          <ChipViewCard
            title="Evening"
            onChange={(isChecked) => {
              if (!isChecked && !consultationType.evening) {
                return;
              } else {
                console.log('morngn', consultationType.evening);
                // setConsultationType({ ...consultationType, evening: isChecked });
              }
            }}
            isChecked={!!consultationType.evening}
          />
          <ChipViewCard
            title="Night"
            onChange={(isChecked) => {
              if (!isChecked && !consultationType.night) {
                return;
              } else {
                console.log('morngn', consultationType.night);
                // setConsultationType({ ...consultationType, night: isChecked });
              }
            }}
            isChecked={!!consultationType.night}
          />
        </View>
        <Text style={styles.dosage}>To be taken</Text>
        <View
          style={{
            flexDirection: 'row',
            // justifyContent: 'space-between',
            marginLeft: 16,
            marginRight: 16,
            // marginBottom: 24,
          }}
        >
          <ChipViewCard
            title="After Food"
            onChange={(isChecked) => {
              if (!isChecked && !consultationType.afterfood) {
                return;
              } else {
                console.log('morngn', consultationType.afterfood);
                // setConsultationType({ ...consultationType, afterfood: isChecked });
              }
            }}
            isChecked={!!consultationType.afterfood}
          />

          <View style={{ flex: 0.1 }} />

          <ChipViewCard
            title="Before Food"
            onChange={(isChecked) => {
              if (!isChecked && !consultationType.beforefood) {
                return;
              } else {
                console.log('morngn', consultationType.beforefood);
                // setConsultationType({ ...consultationType, beforefood: isChecked });
              }
            }}
            isChecked={!!consultationType.beforefood}
          />
        </View>
        <Text style={styles.dosage}>Duration of Consumption</Text>
        <View style={[styles.inputValidView]}>
          <TextInput
            autoFocus
            style={styles.inputStyle}
            value={value}
            onChangeText={(value) => setValue(value)}
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
          title="DELETE"
          titleTextStyle={styles.buttonTextStyle}
          variant="white"
          style={[styles.buttonsaveStyle, { marginRight: 16 }]}
        />
        <Button title="UPDATE" style={styles.buttonendStyle} />
      </View>
    </SafeAreaView>
  );
};
