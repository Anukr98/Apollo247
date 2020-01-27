import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Text,
  ScrollView,
  Dimensions,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import {
  Remove,
  BackArrow,
  AddPlus,
  DropdownGreen,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import {
  searchMedicineApi,
  MedicineProduct,
  getMedicineDetailsApi,
  MedicineProductDetails,
} from '@aph/mobile-doctors/src/components/ApiCall';
import { isValidSearch } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import axios, { AxiosResponse } from 'axios';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { MaterialMenu, OptionsObject } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import { ChipViewCard } from '@aph/mobile-doctors/src/components/ui/ChipViewCard';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Option } from '@aph/mobile-doctors/src/components/ui/DropDown';
import { GetDoctorFavouriteMedicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  chipContainerStyle: {
    maxWidth: (width - 150) / 2,
    marginRight: 16,
    marginTop: 8,
  },
  chiptextStyle: {
    paddingTop: 0,
    paddingBottom: 2,
    paddingLeft: 16,
    paddingRight: 16,
    ...theme.viewStyles.text('S', 12, theme.colors.APP_GREEN),
  },
  chipSelectedTextStyle: {
    paddingTop: 0,
    paddingBottom: 2,
    paddingLeft: 16,
    paddingRight: 16,
    ...theme.viewStyles.text('SB', 12, theme.colors.WHITE),
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: '#01475b',
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderColor: theme.colors.APP_GREEN,
  },
});

export interface AddMedicinePopUpProps {
  onClose: () => void;
  data?: GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList;
}

export const AddMedicinePopUp: React.FC<AddMedicinePopUpProps> = (props) => {
  const { data } = props;
  const [medName, setMedName] = useState<string>('');
  const [medicineSelected, setMedicineSelected] = useState<MedicineProductDetails>();
  const [medSearchText, setMedSearchText] = useState<string>('');
  const [medList, setMedList] = useState<MedicineProduct[]>([]);
  const [listLoader, setListLoader] = useState<boolean>(false);
  const [medDetailLoading, setMedDetailLoading] = useState<boolean>(false);
  const [renderType, setRenderType] = useState<number>(2);

  const forTimeArray: OptionsObject[] = [
    { key: 'D', value: 'Day(s)' },
    { key: 'W', value: 'Week(s)' },
    { key: 'M', value: 'Month(s)' },
  ];
  const takeTime: OptionsObject[] = [
    { key: '1', value: 'Once a day' },
    { key: '2', value: 'Twice a day' },
    { key: '3', value: 'Thrice a day' },
    { key: '4', value: 'Four times a day' },
    { key: '5', value: 'Five times a day' },
    { key: 'A', value: 'As needed' },
  ];
  const typeTakeArray: OptionsObject[] = [
    { key: 'SYRUP', value: 'Syrup' },
    { key: 'DROPS', value: 'Drops' },
    { key: 'CAPSULE', value: 'Capsule' },
    { key: 'INJECTION', value: 'Injection' },
    { key: 'TABLET', value: 'Tablet' },
    { key: 'BOTTLE', value: 'Bottle' },
    { key: 'SUSPENSION', value: 'Suspension' },
    { key: 'ROTACAPS', value: 'Rotacaps' },
    { key: 'SACHET', value: 'Sachet' },
    { key: 'OTHERS', value: 'Others' },
  ];

  const typeApplyArray: OptionsObject[] = [
    { key: 'POWDER', value: 'Powder' },
    { key: 'CREAM', value: 'Cream' },
    { key: 'SOAP', value: 'Soap' },
    { key: 'GEL', value: 'Gel' },
    { key: 'LOTION', value: 'Lotion' },
    { key: 'SPRAY', value: 'Spray' },
    { key: 'SOLUTION', value: 'Solution' },
    { key: 'OINTMENT', value: 'Ointment' },
    { key: 'OTHERS', value: 'Others' },
  ];

  const [take, setTake] = useState<string>('');
  const [typeDrop, setTypeDrop] = useState<OptionsObject>(typeTakeArray[typeTakeArray.length - 1]);
  const [takeDrop, setTakeDrop] = useState<OptionsObject>(takeTime[0]);
  const [forTime, setForTime] = useState<string>('');
  const [forTimeDrop, setForTimeDrop] = useState<OptionsObject>(forTimeArray[0]);

  const [afterFoodValue, setAfterFoodValue] = useState<boolean>(false);
  const [beforeFoodValue, setBeforeFoodValue] = useState<boolean>(false);
  const [morningValue, setMorningValue] = useState<boolean>(false);
  const [noonValue, setNoonValue] = useState<boolean>(false);
  const [eveningValue, setEveningValue] = useState<boolean>(false);
  const [nightValue, setNightValue] = useState<boolean>(false);
  const [asNeededValue, setAsNeededValue] = useState<boolean>(false);

  const [instructions, setInstructions] = useState<string>('');

  useEffect(() => {
    if (props.data) {
      setMedName(data.medicineName);
      if (data.externalId) {
        medDetailsApi(data.externalId);
      }
      if (data.medicineTimings && data.medicineTimings.length) {
      }
    }
    console.log(props.data, 'dnid');
  }, []);

  const renderHeader = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.cardContainer,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            width: width - 60,
            flexDirection: 'row',
          },
        ]}
      >
        {medName ? (
          <TouchableOpacity
            onPress={() => {
              setMedName('');
              setMedicineSelected(undefined);
            }}
            style={{ left: 16, position: 'absolute' }}
          >
            <BackArrow style={{ width: 24, height: 15 }} />
          </TouchableOpacity>
        ) : null}
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
            marginLeft: medName ? 60 : 20,
            marginRight: 20,
          }}
        >
          {medName ? medName : 'ADD MEDICINE'}
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
          title={'CANCEL'}
          variant={'white'}
          onPress={() => props.onClose()}
          style={{ width: (width - 110) / 2, marginRight: 16 }}
        />
        <Button title={'ADD MEDICINE'} style={{ width: (width - 110) / 2 }} />
      </View>
    );
  };
  const renderMedicineType = () => {
    return (
      <View style={{ margin: 16 }}>
        <Text
          style={{ ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT), paddingBottom: 8 }}
        >
          {renderType === 1 ? 'Take' : 'Apply'}
        </Text>
        <View
          style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end' }}
        >
          {renderType === 1 && (
            <TextInput
              style={{
                ...theme.fonts.IBMPlexSansMedium(18),
                width: (width - 100) / 2,
                color: '#01475b',
                paddingBottom: 4,
                borderBottomWidth: 2,
                borderColor: theme.colors.APP_GREEN,
                paddingTop: 0,
              }}
              placeholder=""
              placeholderTextColor="rgba(1, 71, 91, 0.3)"
              value={take}
              selectionColor={Platform.OS === 'ios' ? theme.colors.BLACK : ''}
              onChange={(text) => setTake(text.nativeEvent.text)}
            />
          )}
          <MaterialMenu
            options={renderType === 1 ? typeTakeArray : typeApplyArray}
            selectedText={typeDrop.key}
            menuContainerStyle={{
              alignItems: 'flex-end',
              marginLeft: 0,
              marginTop: 0,
              width: width - 100,
            }}
            onPress={(item) => {
              setTypeDrop(item);
            }}
            selectedTextStyle={{
              ...theme.viewStyles.text('M', 16, '#00b38e'),
              alignSelf: 'flex-start',
            }}
            itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
            itemContainer={{
              height: 44.8,
              marginHorizontal: 12,
              width: width,
              maxWidth: width - 130,
            }}
            bottomPadding={{ paddingBottom: 10 }}
          >
            <View
              style={{
                flexDirection: 'row',
                marginLeft: renderType === 1 ? 15 : 0,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: renderType === 1 ? (width - 110) / 2 : width - 90,
                  borderBottomWidth: 2,
                  paddingTop: 0,
                  borderColor: theme.colors.INPUT_BORDER_SUCCESS,
                }}
              >
                <Text
                  style={[
                    { color: '#01475b', ...theme.fonts.IBMPlexSansMedium(18), paddingBottom: 4 },
                    // typeofRecord !== undefined
                    //   ? { textTransform: 'capitalize' }
                    //   : styles.placeholderStyle,
                  ]}
                >
                  {typeDrop?.value}
                </Text>
                <View style={[{ flex: 1, alignItems: 'flex-end', marginRight: 10 }]}>
                  <DropdownGreen />
                </View>
              </View>
            </View>
          </MaterialMenu>
        </View>
        <MaterialMenu
          options={takeTime}
          selectedText={takeDrop.key}
          menuContainerStyle={{
            alignItems: 'flex-end',
            marginLeft: 10,
            marginTop: 20,
            width: width - 100,
          }}
          onPress={(item) => {
            setTakeDrop(item);
          }}
          selectedTextStyle={{
            ...theme.viewStyles.text('M', 16, '#00b38e'),
            alignSelf: 'flex-start',
          }}
          itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
          itemContainer={{
            height: 44.8,
            marginHorizontal: 12,
            width: width,
            maxWidth: width - 130,
          }}
          bottomPadding={{ paddingBottom: 10 }}
        >
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 10,
              marginTop: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: width - 90,
                borderBottomWidth: 2,
                paddingTop: 0,
                borderColor: theme.colors.INPUT_BORDER_SUCCESS,
              }}
            >
              <Text
                style={[
                  { color: '#01475b', ...theme.fonts.IBMPlexSansMedium(18), paddingBottom: 4 },
                  // typeofRecord !== undefined
                  //   ? { textTransform: 'capitalize' }
                  //   : styles.placeholderStyle,
                ]}
              >
                {takeDrop.value}
              </Text>
              <View style={[{ flex: 1, alignItems: 'flex-end', marginRight: 10 }]}>
                <DropdownGreen />
              </View>
            </View>
          </View>
        </MaterialMenu>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
            paddingBottom: 8,
            marginTop: 12,
          }}
        >
          {'For'}
        </Text>
        <View
          style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end' }}
        >
          <TextInput
            style={[styles.inputStyle, { width: (width - 100) / 2 }]}
            placeholder=""
            placeholderTextColor="rgba(1, 71, 91, 0.3)"
            value={forTime}
            selectionColor={Platform.OS === 'ios' ? theme.colors.BLACK : ''}
            onChange={(text) => setForTime(text.nativeEvent.text)}
          />
          <MaterialMenu
            options={forTimeArray}
            selectedText={forTimeDrop.key}
            menuContainerStyle={{ alignItems: 'flex-end', marginLeft: (width - 110) / 2 - 130 }}
            onPress={(item) => {
              setForTimeDrop(item);
            }}
            selectedTextStyle={{
              ...theme.viewStyles.text('M', 16, '#00b38e'),
              alignSelf: 'flex-start',
            }}
            itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
            itemContainer={{ height: 44.8, marginHorizontal: 12, width: (width - 110) / 2 - 60 }}
            bottomPadding={{ paddingBottom: 0 }}
          >
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 15,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: (width - 110) / 2,
                  borderBottomWidth: 2,
                  paddingTop: 0,
                  borderColor: theme.colors.INPUT_BORDER_SUCCESS,
                }}
              >
                <Text
                  style={[
                    { color: '#01475b', ...theme.fonts.IBMPlexSansMedium(18), paddingBottom: 4 },
                    // typeofRecord !== undefined
                    //   ? { textTransform: 'capitalize' }
                    //   : styles.placeholderStyle,
                  ]}
                >
                  {forTimeDrop.value}
                </Text>
                <View style={[{ flex: 1, alignItems: 'flex-end', marginRight: 10 }]}>
                  <DropdownGreen />
                </View>
              </View>
            </View>
          </MaterialMenu>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: width - 90,
            marginTop: 10,
          }}
        >
          <ChipViewCard
            title={'After food'}
            isChecked={afterFoodValue}
            onChange={() => {
              setAfterFoodValue(!afterFoodValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />

          <ChipViewCard
            title={'Before Food'}
            isChecked={beforeFoodValue}
            onChange={() => {
              setBeforeFoodValue(!beforeFoodValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
        </View>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
            marginTop: 12,
          }}
        >
          {'In the'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            width: width - 90,
            marginTop: 0,
            flexWrap: 'wrap',
          }}
        >
          <ChipViewCard
            title={'Morning'}
            isChecked={morningValue}
            onChange={() => {
              setMorningValue(!morningValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
          <ChipViewCard
            title={'Noon'}
            isChecked={noonValue}
            onChange={() => {
              setNoonValue(!noonValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
          <ChipViewCard
            title={'Evening'}
            isChecked={eveningValue}
            onChange={() => {
              setEveningValue(!eveningValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
          <ChipViewCard
            title={'Night'}
            isChecked={nightValue}
            onChange={() => {
              setNightValue(!nightValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
          <ChipViewCard
            title={'As Needed'}
            isChecked={asNeededValue}
            onChange={() => {
              setAsNeededValue(!asNeededValue);
            }}
            containerStyle={styles.chipContainerStyle}
            containerSelectedStyle={{
              backgroundColor: '#e50000',
            }}
            containerUnSelectedStyle={{
              borderColor: '#e50000',
            }}
            textStyle={[styles.chiptextStyle, { color: '#e50000' }]}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
        </View>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
            paddingBottom: 8,
            marginTop: 10,
          }}
        >
          {'Additional Instructions (if any)'}
        </Text>
        <TextInput
          placeholder={'Type here…'}
          style={{
            borderWidth: 2,
            borderRadius: 10,
            height: 80,
            paddingLeft: 12,
            paddingRight: 12,
            paddingBottom: 12,
            paddingTop: 12,
            borderColor: theme.colors.APP_GREEN,
          }}
          textAlignVertical={'top'}
          multiline={true}
          value={instructions}
          onChange={(text) => setInstructions(text.nativeEvent.text)}
        />
      </View>
    );
  };

  const renderMedicineDetails = () => {
    // const med =
    return (
      <View>
        {medDetailLoading ? (
          <ActivityIndicator
            animating={true}
            size="large"
            color="green"
            style={{ paddingTop: 20 }}
          />
        ) : (
          renderMedicineType()
        )}
      </View>
    );
  };

  const searchMedicine = (value: string) => {
    if (isValidSearch(value)) {
      setMedSearchText(value);
      if (!(value && value.length > 2)) {
        setMedList([]);
        return;
      }
      searchMedicineApi(value).then((data) => {
        console.log(data.data.products);
      });
      setListLoader(true);
      searchMedicineApi(value)
        .then(async ({ data }) => {
          const products = data.products || [];
          setMedList(products);
          setListLoader(false);
        })
        .catch((e) => {
          if (!axios.isCancel(e)) {
            setListLoader(false);
          }
        });
    }
  };

  const medDetailsApi = (sku: string) => {
    setMedDetailLoading(true);
    getMedicineDetailsApi(sku)
      .then((data) => {
        setMedicineSelected(data.data.productdp[0]);
        data.data.productdp[0] && setMedName(data.data.productdp[0].name);
        const medtype =
          data.data.productdp[0] && data.data.productdp[0].PharmaOverview.length
            ? data.data.productdp[0].PharmaOverview[0].Doseform
            : '';
        switch (medtype) {
          case 'SYRUP':
          case 'DROPS':
          case 'CAPSULE':
          case 'INJECTION':
          case 'TABLET':
          case 'BOTTLE':
          case 'SUSPENSION':
          case 'ROTACAPS':
          case 'SACHET':
            setTypeDrop(
              typeTakeArray.find((i) => i.key === medtype) ||
                typeTakeArray[typeApplyArray.length - 1]
            );
            setRenderType(1);
            break;
          case 'POWDER':
          case 'CREAM':
          case 'SOAP':
          case 'GEL':
          case 'LOTION':
          case 'SPRAY':
          case 'SOLUTION':
          case 'OINTMENT':
          default:
            setTypeDrop(
              typeApplyArray.find((i) => i.key === medtype) ||
                typeApplyArray[typeApplyArray.length - 1]
            );
            setRenderType(2);
        }
      })
      .finally(() => setMedDetailLoading(false));
  };

  const renderMedicineItem = (item: MedicineProduct, index: number) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setMedName(item.name);
          medDetailsApi(item.sku);
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            paddingVertical: 13,
            borderColor:
              medList.length - 1 !== index ? theme.colors.SEPARATOR_LINE : theme.colors.CLEAR,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE), flex: 0.9 }}>
            {item.name}
          </Text>
          <AddPlus />
        </View>
      </TouchableOpacity>
    );
  };

  const renderMedicineSearchList = () => {
    return (
      <View style={{ margin: 20 }}>
        <TextInput
          autoFocus
          style={styles.inputStyle}
          placeholder="Search Medicine"
          placeholderTextColor="rgba(1, 71, 91, 0.3)"
          value={medSearchText}
          selectionColor={Platform.OS === 'ios' ? theme.colors.BLACK : ''}
          onChange={(text) => searchMedicine(text.nativeEvent.text.replace(/\\/g, ''))}
        />
        <View>
          {listLoader ? (
            <ActivityIndicator
              animating={true}
              size="large"
              color="green"
              style={{ paddingTop: 20 }}
            />
          ) : (
            <FlatList
              data={medList}
              renderItem={({ item, index }) => renderMedicineItem(item, index)}
            />
          )}
        </View>
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
            <ScrollView bounces={false}>
              {medName ? renderMedicineDetails() : renderMedicineSearchList()}
            </ScrollView>
            {medName && !medDetailLoading ? renderButtons() : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
