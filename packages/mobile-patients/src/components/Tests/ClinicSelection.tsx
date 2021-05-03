import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  searchPickupStoresApi,
  Store,
  Clinic,
  searchClinicApi,
  getPlaceInfoByPincode,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

const styles = StyleSheet.create({
  bottonButtonContainer: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '66%',
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginBottom: 16,
  },
  inputValidationStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    paddingTop: 8,
    letterSpacing: 0.04,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
});

export interface ClinicSelectionProps extends NavigationScreenProps {
  pincode: string;
  storeclinicss: Clinic[];
}
{
}

export const ClinicSelection: React.FC<ClinicSelectionProps> = (props) => {
  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean>(false);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);
  const {
    clinicId,
    setClinicId,
    pinCode,
    setClinics,
    clinics,
    setPinCode,
    setDiagnosticClinic,
  } = useDiagnosticsCart();
  const [selectedClinic, setSelectedClinic] = useState<string>(clinicId || '');
  const [clinicDetails, setClinicDetails] = useState<Clinic[] | undefined>([]);

  useEffect(() => {
    fetchStorePickup();
    if (clinicId) {
      filterClinics(clinicId, true);
    }
    if (pinCode) {
      filterClinics(pinCode);
    }
  }, []);

  const filterClinics = (key: string, isId?: boolean) => {
    if (isId) {
      const data = clinics.filter((item) => item.CentreCode === key);
      setPinCode && setPinCode(pinCode);
      setClinicDetails(data);
    } else {
      if (isValidPinCode(key)) {
        setPinCode && setPinCode(key);
        if (key.length == 6) {
          setStorePickUpLoading(true);
          getPlaceInfoByPincode(key)
            .then((data) => {
              const city = (
                (data.data.results[0].address_components || []).find(
                  (item: any) => item.types.indexOf('locality') > -1
                ) || { long_name: '' }
              ).long_name;
              let filterArray;
              city &&
                (filterArray = clinics.filter((item) =>
                  item.City.toLowerCase().includes(city.toLowerCase())
                ));

              setClinicDetails(filterArray || []);
            })
            .catch((e) => {
              CommonBugFender('ClinicSelection_filterClinics', e);
              setClinicDetails([]);
            })
            .finally(() => {
              setStorePickUpLoading(false);
            });
        }
      }
    }
  };

  const fetchStorePickup = () => {
    setStorePickUpLoading(true);
    searchClinicApi()
      .then((data) => {
        setStorePickUpLoading(false);
        setClinics && setClinics(data.data.data);
      })
      .catch((e) => {
        CommonBugFender('ClinicSelection_fetchStorePickup', e);
        setStorePickUpLoading(false);
      });
  };

  const renderBottomButton = () => {
    const foundStoreIdIndex = clinics.findIndex(({ CentreCode }) => CentreCode == selectedClinic);
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          disabled={!(foundStoreIdIndex > -1)}
          title="DONE"
          onPress={() => {
            setDiagnosticClinic!({ ...clinics[foundStoreIdIndex], date: new Date().getTime() });
            setClinicId && setClinicId(selectedClinic);
            props.navigation.goBack();
          }}
        />
      </View>
    );
  };

  const renderInputWithValidation = () => {
    return (
      <View style={{ paddingBottom: 24 }}>
        <TextInputComponent
          value={pinCode}
          onChangeText={(pincode) => filterClinics(pincode)}
          maxLength={6}
          textInputprops={{
            ...(!isValidPinCode(pinCode) ? { selectionColor: '#e50000' } : {}),
            autoFocus: true,
          }}
          inputStyle={[
            styles.inputStyle,
            !isValidPinCode(pinCode) ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter pin code'}
          autoCorrect={false}
        />
        {storePickUpLoading && <ActivityIndicator color="green" size="large" />}
        {!storePickUpLoading && pinCode.length == 6 && clinicDetails!.length == 0 && (
          <Text
            style={{
              paddingTop: 10,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: '#0087ba',
            }}
          >
            Sorry! We’re working hard to get to this area! In the meantime, you can either pick up
            from a nearby store, or change the pincode.
          </Text>
        )}

        {!isValidPinCode(pinCode) ? (
          <Text style={styles.inputValidationStyle}>{'Invalid Pincode'}</Text>
        ) : null}
      </View>
    );
  };

  const renderCardTitle = () => {
    if (!storePickUpLoading && pinCode.length == 6 && clinicDetails!.length > 0) {
      return (
        <>
          <Text style={styles.heading}>{'Clinics In This Region'}</Text>
          <View style={styles.separator} />
        </>
      );
    }
  };

  const renderRadioButtonList = () => {
    return (
      <FlatList
        bounces={false}
        data={clinicDetails || []}
        renderItem={({ item, index }) => (
          <RadioSelectionItem
            key={item.CentreCode}
            title={`${item.CentreName}\n${item.Locality},${item.City},${item.State}`}
            isSelected={selectedClinic === item.CentreCode}
            onPress={() => {
              setSelectedClinic(item.CentreCode);
            }}
            containerStyle={{ marginTop: 16 }}
            hideSeparator={index == clinicDetails!.length - 1}
          />
        )}
      />
    );
  };

  const renderStorePickupCard = () => {
    return (
      <View style={styles.cardStyle}>
        {renderInputWithValidation()}
        {renderCardTitle()}
        {renderRadioButtonList()}
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        leftIcon="backArrow"
        title={'Clinic Visit'}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
      <ScrollView bounces={false}>{renderStorePickupCard()}</ScrollView>
      {renderBottomButton()}
    </SafeAreaView>
  );
};
