import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  medicineText: {
    color: 'rgba(2, 71, 91, 0.6)',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 0,
    marginLeft: 16,
    marginTop: 16,
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

export interface ProfileProps extends NavigationScreenProps {}

export const AddSymptons: React.FC<ProfileProps> = (props) => {
  const [symptons, setSymptons] = useState<string>('');
  const [since, setSince] = useState<string>('');
  const [howOften, setHowOffen] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
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
        headerText="ADD SYMPTONS"
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
          backgroundColor: '#ffffff',
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowRadius: 10,
          shadowOpacity: 0.2,
          elevation: 5,
          margin: 20,
          borderRadius: 10,
        }}
      >
        <Text style={styles.medicineText}>Sympton</Text>
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
          onChangeText={(symptons) => setSymptons(symptons)}
          maxLength={20}
          value={symptons}
        />

        <Text style={styles.medicineText}>Since?</Text>
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
          onChangeText={(since) => setSince(since)}
          maxLength={20}
          value={since}
        />
        <Text style={styles.medicineText}>How Often?</Text>
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
          onChangeText={(howOften) => setHowOffen(howOften)}
          maxLength={20}
          value={howOften}
        />
        <Text style={styles.medicineText}>Severity?</Text>
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
          onChangeText={(severity) => setSeverity(severity)}
          maxLength={20}
          value={severity}
        />
      </View>
      <View style={styles.footerButtonsContainer}>
        <Button
          title="CANCEL"
          titleTextStyle={styles.buttonTextStyle}
          variant="white"
          style={[styles.buttonsaveStyle, { marginRight: 16 }]}
        />
        <Button title="ADD SYMPTOM" style={styles.buttonendStyle} />
      </View>
    </SafeAreaView>
  );
};
