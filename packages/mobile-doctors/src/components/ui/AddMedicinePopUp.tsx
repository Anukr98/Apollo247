import {
  getMedicineDetailsApi,
  MedicineProduct,
  MedicineProductDetails,
  searchMedicineApi,
} from '@aph/mobile-doctors/src/components/ApiCall';
import AddMedicinePopUpStyles from '@aph/mobile-doctors/src/components/ui/AddMedicinePopUp.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { ChipViewCard } from '@aph/mobile-doctors/src/components/ui/ChipViewCard';
import {
  AddPlus,
  BackArrow,
  DropdownGreen,
  Remove,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { MaterialMenu, OptionsObject } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import {
  MEDICINE_CONSUMPTION_DURATION,
  MEDICINE_FREQUENCY,
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_UNIT,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  formatInt,
  isValidSearch,
  nameFormater,
} from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const styles = AddMedicinePopUpStyles;

export interface AddMedicinePopUpProps {
  onClose: () => void;
  data?:
    | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
    | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription;
  onAddnew?: (
    data:
      | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
      | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
  ) => void;
}

export const AddMedicinePopUp: React.FC<AddMedicinePopUpProps> = (props) => {
  const { data, onClose, onAddnew } = props;

  const [medName, setMedName] = useState<string>('');
  const [medicineSelected, setMedicineSelected] = useState<MedicineProductDetails>();
  const [medSearchText, setMedSearchText] = useState<string>('');
  const [medList, setMedList] = useState<MedicineProduct[]>([]);
  const [listLoader, setListLoader] = useState<boolean>(false);
  const [medDetailLoading, setMedDetailLoading] = useState<boolean>(false);
  const [renderType, setRenderType] = useState<number>(2);

  const forTimeArray: OptionsObject[] = [
    { key: MEDICINE_CONSUMPTION_DURATION.DAYS, value: 'Day(s)' },
    { key: MEDICINE_CONSUMPTION_DURATION.WEEKS, value: 'Week(s)' },
    { key: MEDICINE_CONSUMPTION_DURATION.MONTHS, value: 'Month(s)' },
  ];
  const takeTime: OptionsObject[] = [
    { key: MEDICINE_FREQUENCY.ONCE_A_DAY, value: nameFormater(MEDICINE_FREQUENCY.ONCE_A_DAY) },
    { key: MEDICINE_FREQUENCY.TWICE_A_DAY, value: nameFormater(MEDICINE_FREQUENCY.TWICE_A_DAY) },
    { key: MEDICINE_FREQUENCY.THRICE_A_DAY, value: nameFormater(MEDICINE_FREQUENCY.THRICE_A_DAY) },
    {
      key: MEDICINE_FREQUENCY.FOUR_TIMES_A_DAY,
      value: nameFormater(MEDICINE_FREQUENCY.FOUR_TIMES_A_DAY),
    },
    {
      key: MEDICINE_FREQUENCY.FIVE_TIMES_A_DAY,
      value: nameFormater(MEDICINE_FREQUENCY.FIVE_TIMES_A_DAY),
    },
    { key: MEDICINE_FREQUENCY.AS_NEEDED, value: nameFormater(MEDICINE_FREQUENCY.AS_NEEDED) },
  ];
  const typeTakeArray: OptionsObject[] = [
    { key: MEDICINE_UNIT.SYRUP, value: nameFormater(MEDICINE_UNIT.SYRUP) },
    { key: MEDICINE_UNIT.DROPS, value: nameFormater(MEDICINE_UNIT.DROPS) },
    { key: MEDICINE_UNIT.CAPSULE, value: nameFormater(MEDICINE_UNIT.CAPSULE) },
    { key: MEDICINE_UNIT.INJECTION, value: nameFormater(MEDICINE_UNIT.INJECTION) },
    { key: MEDICINE_UNIT.TABLET, value: nameFormater(MEDICINE_UNIT.TABLET) },
    { key: MEDICINE_UNIT.BOTTLE, value: nameFormater(MEDICINE_UNIT.BOTTLE) },
    { key: MEDICINE_UNIT.SUSPENSION, value: nameFormater(MEDICINE_UNIT.SUSPENSION) },
    { key: MEDICINE_UNIT.ROTACAPS, value: nameFormater(MEDICINE_UNIT.ROTACAPS) },
    { key: MEDICINE_UNIT.SACHET, value: nameFormater(MEDICINE_UNIT.SACHET) },
    { key: MEDICINE_UNIT.ML, value: 'ml' },
    { key: MEDICINE_UNIT.OTHERS, value: nameFormater(MEDICINE_UNIT.OTHERS) },
  ];

  const typeApplyArray: OptionsObject[] = [
    { key: MEDICINE_UNIT.POWDER, value: nameFormater(MEDICINE_UNIT.POWDER) },
    { key: MEDICINE_UNIT.CREAM, value: nameFormater(MEDICINE_UNIT.CREAM) },
    { key: MEDICINE_UNIT.SOAP, value: nameFormater(MEDICINE_UNIT.SOAP) },
    { key: MEDICINE_UNIT.GEL, value: nameFormater(MEDICINE_UNIT.GEL) },
    { key: MEDICINE_UNIT.LOTION, value: nameFormater(MEDICINE_UNIT.LOTION) },
    { key: MEDICINE_UNIT.SPRAY, value: nameFormater(MEDICINE_UNIT.SPRAY) },
    { key: MEDICINE_UNIT.SOLUTION, value: nameFormater(MEDICINE_UNIT.SOLUTION) },
    { key: MEDICINE_UNIT.OINTMENT, value: nameFormater(MEDICINE_UNIT.OINTMENT) },
    { key: MEDICINE_UNIT.OTHERS, value: nameFormater(MEDICINE_UNIT.OTHERS) },
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

  useEffect(() => {
    if (data) {
      setMedName(data.medicineName || medName);
      if (data.externalId && data.medicineName && data.externalId !== data.medicineName) {
        medDetailsApi(data.externalId);
      } else if (data.medicineUnit) {
        setMedType(data.medicineUnit);
      }
      if (data.externalId === data.medicineName) {
        setMedicineSelected({
          description: '',
          id: 1,
          image: '',
          is_in_stock: true,
          is_prescription_required: '',
          name: data.medicineName,
          price: 0,
          sku: data.medicineName,
          small_image: '',
          status: '',
          thumbnail: '',
          type_id: '',
        } as MedicineProductDetails);
      }
      if (data.medicineTimings) {
        (data.medicineTimings || []).forEach((i) => {
          if (i === MEDICINE_TIMINGS.MORNING) {
            setMorningValue(true);
          } else if (i === MEDICINE_TIMINGS.NOON) {
            setNoonValue(true);
          } else if (i === MEDICINE_TIMINGS.EVENING) {
            setEveningValue(true);
          } else if (i === MEDICINE_TIMINGS.NIGHT) {
            setNightValue(true);
          } else if (i === MEDICINE_TIMINGS.AS_NEEDED) {
            setAsNeededValue(true);
          }
        });
      }
      if (data.medicineToBeTaken) {
        data.medicineToBeTaken.forEach((i) => {
          if (i === MEDICINE_TO_BE_TAKEN.AFTER_FOOD) {
            setAfterFoodValue(true);
          } else if (i === MEDICINE_TO_BE_TAKEN.BEFORE_FOOD) {
            setBeforeFoodValue(true);
          }
        });
      }
      if (data.medicineInstructions) {
        setInstructions(data.medicineInstructions);
      }
      if (data.medicineFrequency) {
        setTakeDrop({
          key: data.medicineFrequency,
          value: nameFormater(data.medicineFrequency),
        });
      }
      if (data.medicineConsumptionDurationUnit) {
        setForTimeDrop({
          key: data.medicineConsumptionDurationUnit,
          value: nameFormater(data.medicineConsumptionDurationUnit),
        });
      }
      if (data.medicineConsumptionDurationInDays) {
        setForTime(data.medicineConsumptionDurationInDays);
      }
      if (data.medicineDosage) {
        setTake(data.medicineDosage);
      }
    }
  }, []);

  const renderHeader = () => {
    return (
      <View style={styles.headerStyles}>
        {medName ? (
          <TouchableOpacity
            onPress={() => {
              if (data) {
                onClose();
              }
              setMedName('');
              setMedicineSelected(undefined);
            }}
            style={styles.touchableStyles}
          >
            <BackArrow style={styles.backArrowIcon} />
          </TouchableOpacity>
        ) : null}
        <Text style={[styles.medNameStyles, { marginLeft: medName ? 60 : 20 }]}>
          {medName ? medName : strings.smartPrescr.add_medicine}
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
          title={strings.smartPrescr.add_medicine}
          onPress={() => {
            const dataSend = {
              medicineName: medName,
              id: data ? data.id : '',
              externalId: medicineSelected ? medicineSelected.sku : '',
              medicineDosage: take,
              medicineUnit: typeDrop.key,
              medicineInstructions: instructions,
              medicineFrequency: takeDrop.key,
              medicineConsumptionDurationUnit: forTimeDrop.key,
              medicineConsumptionDurationInDays: forTime,
              medicineTimings: [
                morningValue ? MEDICINE_TIMINGS.MORNING : '',
                noonValue ? MEDICINE_TIMINGS.NOON : '',
                eveningValue ? MEDICINE_TIMINGS.EVENING : '',
                nightValue ? MEDICINE_TIMINGS.NIGHT : '',
                asNeededValue ? MEDICINE_TIMINGS.AS_NEEDED : '',
              ].filter((i) => i !== ''),
              medicineToBeTaken: [
                afterFoodValue ? MEDICINE_TO_BE_TAKEN.AFTER_FOOD : '',
                beforeFoodValue ? MEDICINE_TO_BE_TAKEN.BEFORE_FOOD : '',
              ].filter((i) => i !== ''),
            };
            onAddnew &&
              onAddnew(dataSend as
                | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
                | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription);
            onClose();
          }}
          style={{ width: (width - 110) / 2 }}
        />
      </View>
    );
  };

  const renderMedicineType = () => {
    return (
      <View style={{ margin: 16 }}>
        <Text style={styles.medTypeViewText}>{renderType === 1 ? 'Take' : 'Apply'}</Text>
        <View style={styles.medTypeView}>
          {renderType === 1 && (
            <TextInput
              style={styles.textInputStyles}
              placeholder=""
              placeholderTextColor="rgba(1, 71, 91, 0.3)"
              value={take}
              maxLength={4}
              selectionColor={theme.colors.INPUT_CURSOR_COLOR}
              onChange={(text) => setTake((formatInt(text.nativeEvent.text) || '').toString())}
            />
          )}
          <MaterialMenu
            options={renderType === 1 ? typeTakeArray : renderType === 2 ? typeApplyArray : []}
            selectedText={typeDrop.key}
            menuContainerStyle={styles.materialContainer}
            onPress={(item) => {
              setTypeDrop(item);
            }}
            selectedTextStyle={styles.selTextStyle}
            itemTextStyle={styles.textItemStyle}
            itemContainer={styles.itemContainerStyle}
            bottomPadding={{ paddingBottom: 10 }}
          >
            <View
              style={{
                flexDirection: 'row',
                marginLeft: renderType === 1 ? 15 : 0,
              }}
            >
              <View
                style={[
                  styles.MtextView,
                  { width: renderType === 1 ? (width - 110) / 2 : width - 90 },
                ]}
              >
                <Text style={styles.dropValueText}>{typeDrop && typeDrop.value}</Text>
                <View style={styles.dropDownGreenView}>
                  <DropdownGreen />
                </View>
              </View>
            </View>
          </MaterialMenu>
        </View>
        <MaterialMenu
          options={takeTime}
          selectedText={takeDrop.key}
          menuContainerStyle={styles.menuContainerStyle}
          onPress={(item) => {
            setTakeDrop(item);
          }}
          selectedTextStyle={styles.seleTextStyle}
          itemTextStyle={styles.itemTextStyle}
          itemContainer={styles.MaterialitemContainerStyle}
          bottomPadding={{ paddingBottom: 10 }}
        >
          <View style={styles.dropDownValueView}>
            <View style={styles.dropdownView}>
              <Text style={styles.takeDropdownText}>{takeDrop.value}</Text>
              <View style={styles.dropdownGreenView}>
                <DropdownGreen />
              </View>
            </View>
          </View>
        </MaterialMenu>
        <Text style={styles.forLable}>{strings.smartPrescr.for}</Text>
        <View style={styles.forInputView}>
          <TextInput
            style={[styles.inputStyle, { width: (width - 100) / 2 }]}
            placeholder=""
            placeholderTextColor="rgba(1, 71, 91, 0.3)"
            value={forTime}
            selectionColor={theme.colors.INPUT_CURSOR_COLOR}
            onChange={(text) => setForTime((formatInt(text.nativeEvent.text) || '').toString())}
          />
          <MaterialMenu
            options={forTimeArray}
            selectedText={forTimeDrop.key}
            menuContainerStyle={styles.MMContainer}
            onPress={(item) => {
              setForTimeDrop(item);
            }}
            selectedTextStyle={styles.MMseleStyle}
            itemTextStyle={styles.MMitemText}
            itemContainer={styles.MMitemContainer}
            bottomPadding={{ paddingBottom: 0 }}
          >
            <View style={styles.forDropView}>
              <View style={styles.forDropTextView}>
                <Text style={styles.forDropText}>{forTimeDrop.value}</Text>
                <View style={styles.dropDownGreenView}>
                  <DropdownGreen />
                </View>
              </View>
            </View>
          </MaterialMenu>
        </View>
        <View style={styles.chipCardView}>
          <ChipViewCard
            title={strings.smartPrescr.after_food}
            isChecked={afterFoodValue}
            onChange={() => {
              setAfterFoodValue(!afterFoodValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />

          <ChipViewCard
            title={strings.smartPrescr.before_food}
            isChecked={beforeFoodValue}
            onChange={() => {
              setBeforeFoodValue(!beforeFoodValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
        </View>
        <Text style={styles.inTheText}>{strings.smartPrescr.in_the}</Text>
        <View style={styles.sessionsView}>
          <ChipViewCard
            title={strings.smartPrescr.morning}
            isChecked={morningValue}
            onChange={() => {
              setMorningValue(!morningValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
          <ChipViewCard
            title={strings.smartPrescr.noon}
            isChecked={noonValue}
            onChange={() => {
              setNoonValue(!noonValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
          <ChipViewCard
            title={strings.smartPrescr.evening}
            isChecked={eveningValue}
            onChange={() => {
              setEveningValue(!eveningValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
          <ChipViewCard
            title={strings.smartPrescr.night}
            isChecked={nightValue}
            onChange={() => {
              setNightValue(!nightValue);
            }}
            containerStyle={styles.chipContainerStyle}
            textStyle={styles.chiptextStyle}
            textSelectedStyle={styles.chipSelectedTextStyle}
          />
          <ChipViewCard
            title={strings.smartPrescr.as_needed}
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
        <Text style={styles.additionalInstrLabel}>{strings.smartPrescr.additional_instru}</Text>
        <TextInput
          placeholder={strings.smartPrescr.type_here}
          style={styles.additionalInstrInputstyle}
          placeholderTextColor={theme.colors.placeholderTextColor}
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
          // <ActivityIndicator
          //   animating={true}
          //   size="large"
          //   color="green"
          //   style={{ paddingTop: 20 }}
          // />
          <Spinner />
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
          if (products.length > 0) {
            setMedList(products);
          } else {
            setMedList([
              {
                description: '',
                id: 1,
                image: '',
                is_in_stock: true,
                is_prescription_required: '',
                name: value,
                price: 0,
                sku: value,
                small_image: '',
                status: '',
                thumbnail: '',
                type_id: '',
              },
            ]);
          }
          setListLoader(false);
        })
        .catch((e) => {
          if (!axios.isCancel(e)) {
            setListLoader(false);
          }
        });
    }
  };

  const setMedType = (medType: MEDICINE_UNIT | '') => {
    if (typeTakeArray.findIndex((i) => i.key === medType) > -1) {
      setTypeDrop(
        typeTakeArray.find((i) => i.key === medType) || typeTakeArray[typeApplyArray.length - 1]
      );
      setRenderType(1);
    } else if (typeApplyArray.findIndex((i) => i.key === medType) > -1 || medType === '') {
      setTypeDrop(
        typeApplyArray.find((i) => i.key === medType) || typeApplyArray[typeApplyArray.length - 1]
      );
      setRenderType(2);
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
        setMedType(medtype);
      })
      .finally(() => setMedDetailLoading(false));
  };

  const renderMedicineItem = (item: MedicineProduct, index: number) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setMedName(item.name);
          if (item.name === item.sku) {
            setMedicineSelected(item as MedicineProductDetails);
            setMedType(MEDICINE_UNIT.OTHERS);
          } else {
            medDetailsApi(item.sku);
          }
        }}
      >
        <View
          style={[
            styles.medicineListView,
            {
              borderColor:
                medList.length - 1 !== index ? theme.colors.SEPARATOR_LINE : theme.colors.CLEAR,
            },
          ]}
        >
          <Text style={styles.medicineListText}>{item.name}</Text>
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
          placeholder={strings.consult.search_medicine}
          placeholderTextColor="rgba(1, 71, 91, 0.3)"
          value={medSearchText}
          selectionColor={theme.colors.INPUT_CURSOR_COLOR}
          onChange={(text) => searchMedicine(text.nativeEvent.text.replace(/\\/g, ''))}
        />
        <View>
          {listLoader ? (
            // <ActivityIndicator
            //   animating={true}
            //   size="large"
            //   color="green"
            //   style={{ paddingTop: 20 }}
            // />
            <Spinner />
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
              style={styles.touchableCloseIcon}
            >
              <Remove style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.contenteView}>
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
