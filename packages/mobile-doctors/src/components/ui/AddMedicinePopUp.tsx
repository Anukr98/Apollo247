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
import { RadioButtons } from '@aph/mobile-doctors/src/components/ui/RadioButtons';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import {
  MEDICINE_CONSUMPTION_DURATION,
  MEDICINE_FORM_TYPES,
  MEDICINE_FREQUENCY,
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_UNIT,
  ROUTE_OF_ADMINISTRATION,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  formatFractionalNumber,
  formatInt,
  isValidSearch,
  medUnitFormatArray,
  nameFormater,
} from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { string } from '@aph/mobile-doctors/src/strings/string';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  allowedDosages?: (string | null)[] | null;
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
  const { data, onClose, onAddnew, allowedDosages } = props;
  const { showAphAlert } = useUIElements();
  const [dosagesOption, setDosagesOption] = useState<OptionsObject[]>([]);
  const [medName, setMedName] = useState<string>('');
  const [medicineSelected, setMedicineSelected] = useState<MedicineProductDetails>();
  const [externalId, setExternalId] = useState<string>('');
  const [medSearchText, setMedSearchText] = useState<string>('');
  const [isFromSearch, setFromSearch] = useState<boolean>(false);
  const [medList, setMedList] = useState<MedicineProduct[]>([]);
  const [listLoader, setListLoader] = useState<boolean>(false);
  const [medDetailLoading, setMedDetailLoading] = useState<boolean>(false);

  const [defaultForm, setDefaultForm] = useState<boolean>(true);
  const [renderType, setRenderType] = useState<string>('');
  const radioOptions = [
    { key: MEDICINE_FORM_TYPES.OTHERS, label: 'Take' },
    { key: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT, label: 'Apply' },
  ];

  const medTimingsArray = [
    {
      key: MEDICINE_TIMINGS.MORNING,
      value: nameFormater(MEDICINE_TIMINGS.MORNING),
      color: theme.colors.APP_GREEN,
    },
    {
      key: MEDICINE_TIMINGS.NOON,
      value: nameFormater(MEDICINE_TIMINGS.NOON),
      color: theme.colors.APP_GREEN,
    },
    {
      key: MEDICINE_TIMINGS.EVENING,
      value: nameFormater(MEDICINE_TIMINGS.EVENING),
      color: theme.colors.APP_GREEN,
    },
    {
      key: MEDICINE_TIMINGS.NIGHT,
      value: nameFormater(MEDICINE_TIMINGS.NIGHT),
      color: theme.colors.APP_GREEN,
    },
    {
      key: MEDICINE_TIMINGS.AS_NEEDED,
      value: nameFormater(MEDICINE_TIMINGS.AS_NEEDED),
      color: theme.colors.APP_RED,
    },
  ];

  const [medTimingAnswers, setMedTimingAnswers] = useState<
    {
      key: MEDICINE_TIMINGS;
      selected: boolean;
      value: string;
    }[]
  >(medTimingsArray.map((i) => ({ key: i.key, selected: false, value: '' })));

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
      key: MEDICINE_FREQUENCY.ALTERNATE_DAY,
      value: nameFormater(MEDICINE_FREQUENCY.ALTERNATE_DAY),
    },
    { key: MEDICINE_FREQUENCY.ONCE_A_WEEK, value: nameFormater(MEDICINE_FREQUENCY.ONCE_A_WEEK) },
    { key: MEDICINE_FREQUENCY.TWICE_A_WEEK, value: nameFormater(MEDICINE_FREQUENCY.TWICE_A_WEEK) },
    {
      key: MEDICINE_FREQUENCY.THREE_TIMES_A_WEEK,
      value: nameFormater(MEDICINE_FREQUENCY.THREE_TIMES_A_WEEK),
    },
    {
      key: MEDICINE_FREQUENCY.ONCE_IN_15_DAYS,
      value: nameFormater(MEDICINE_FREQUENCY.ONCE_IN_15_DAYS),
    },
    { key: MEDICINE_FREQUENCY.ONCE_A_MONTH, value: nameFormater(MEDICINE_FREQUENCY.ONCE_A_MONTH) },
    { key: MEDICINE_FREQUENCY.EVERY_HOUR, value: nameFormater(MEDICINE_FREQUENCY.EVERY_HOUR) },
    {
      key: MEDICINE_FREQUENCY.EVERY_TWO_HOURS,
      value: nameFormater(MEDICINE_FREQUENCY.EVERY_TWO_HOURS),
    },
    {
      key: MEDICINE_FREQUENCY.EVERY_FOUR_HOURS,
      value: nameFormater(MEDICINE_FREQUENCY.EVERY_FOUR_HOURS),
    },
    { key: MEDICINE_FREQUENCY.STAT, value: nameFormater(MEDICINE_FREQUENCY.STAT) },
    { key: MEDICINE_FREQUENCY.AS_NEEDED, value: nameFormater(MEDICINE_FREQUENCY.AS_NEEDED) },
  ];
  const medicineDefaultOptions = [
    {
      dosageType: 'OINTMENT',
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      medicineUnite: MEDICINE_UNIT.AS_PRESCRIBED,
      administrationRoute: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    {
      dosageType: 'INJECTION',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.UNIT,
      administrationRoute: ROUTE_OF_ADMINISTRATION.INTRAMUSCULAR,
    },
    {
      dosageType: 'LIQUID',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.ML,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    {
      dosageType: 'Suspension',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.ML,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    {
      dosageType: 'TABLET',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.TABLET,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    {
      dosageType: 'CAPSULE',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.TABLET,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    {
      dosageType: 'syrup',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.ML,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    {
      dosageType: 'GEL',
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      medicineUnite: MEDICINE_UNIT.AS_PRESCRIBED,
      administrationRoute: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    {
      dosageType: 'DROPS',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.ML,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORAL_DROPS,
    },
    {
      dosageType: 'LOTION',
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      medicineUnite: MEDICINE_UNIT.ML,
      administrationRoute: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    {
      dosageType: 'SOAP',
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      medicineUnite: MEDICINE_UNIT.AS_PRESCRIBED,
      administrationRoute: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    {
      dosageType: 'SPRAY',
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      medicineUnite: MEDICINE_UNIT.SPRAY,
      administrationRoute: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    {
      dosageType: 'POWDER',
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      medicineUnite: MEDICINE_UNIT.AS_PRESCRIBED,
      administrationRoute: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    {
      dosageType: 'INHALER',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.PUFF,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    {
      dosageType: 'RESPULES',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.SPRAY,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    {
      dosageType: 'PATCH',
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      medicineUnite: MEDICINE_UNIT.PATCH,
      administrationRoute: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    {
      dosageType: 'PASTE',
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      medicineUnite: MEDICINE_UNIT.AS_PRESCRIBED,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    {
      dosageType: 'OTHERS',
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      medicineUnite: MEDICINE_UNIT.TABLET,
      administrationRoute: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
  ];

  const medUnit: OptionsObject[] = medUnitFormatArray;

  useEffect(() => {
    const fetchDosage = async () => {
      const dosages: OptionsObject[] = [];
      let allowed: string[] = [];
      if (allowedDosages && allowedDosages.length > 0) {
        allowed = allowedDosages.filter((i) => i !== null) as string[];
      } else {
        const data = await AsyncStorage.getItem('allowedDosages');
        allowed = JSON.parse(data || '[]');
      }
      if (allowed.length == 0) {
        allowed = string.smartPrescr.dosagesAllowed;
      }
      allowed.forEach((item) => {
        const indexPresent = medUnit.findIndex((i) => i.key === item);
        if (indexPresent > -1) {
          dosages.push(medUnit[indexPresent]);
        } else {
          let formatedValue = nameFormater(item, 'lower');
          const existsIndex = string.smartPrescr.muiltdosages.findIndex(
            (i) => i.single === formatedValue
          );
          if (existsIndex > -1) {
            formatedValue = string.smartPrescr.muiltdosages[existsIndex].multiple;
          }
          dosages.push({ key: item, value: formatedValue });
        }
      });
      setDosagesOption(dosages);
      if (data) {
        setMedName(data.medicineName || medName);
        // if (data.externalId && data.medicineName && data.externalId !== data.medicineName) {
        //   medDetailsApi(data.externalId);
        // } else if (data.medicineUnit) {
        //   setMedType(data.medicineUnit);
        // }
        if (data.medicineFormTypes) {
          setRenderType(data.medicineFormTypes);
        }
        if (data.routeOfAdministration) {
          setRouteOfAdminDrop(
            routeOfAdminOptions.find((i) => i.key === data.routeOfAdministration) ||
              routeOfAdminOptions[0]
          );
        }
        if (data.medicineUnit) {
          setTypeDrop(dosages.find((i) => i.key === data.medicineUnit) || dosages[0]);
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
            value: nameFormater(data.medicineConsumptionDurationUnit).slice(0, -1) + '(s)',
          });
        }
        if (data.medicineConsumptionDurationInDays) {
          setForTime(data.medicineConsumptionDurationInDays);
        }
        if (data.medicineCustomDosage) {
          const formValues = data.medicineCustomDosage.split('-');
          let valueIndexCounter = 0;
          const medAnswers: {
            key: MEDICINE_TIMINGS;
            selected: boolean;
            value: string;
          }[] = [];
          if (data.medicineTimings && data.medicineTimings.length > 0) {
            medTimingsArray.forEach((item) => {
              if (data.medicineTimings && data.medicineTimings.includes(item.key)) {
                medAnswers.push({
                  key: item.key,
                  selected: true,
                  value:
                    valueIndexCounter < formValues.length
                      ? formValues[valueIndexCounter] || ''
                      : '',
                });
              } else {
                medAnswers.push({ key: item.key, selected: false, value: '' });
              }
              valueIndexCounter++;
            });
          }
          if (medAnswers.length === 0) {
            medTimingsArray.forEach((item, index) => {
              if (item.key === MEDICINE_TIMINGS.AS_NEEDED) {
                return;
              } else if (index <= formValues.length - 1) {
                if (formValues[index] === '0' || formValues[index] === '') {
                  medAnswers.push({
                    key: item.key,
                    selected: false,
                    value: formValues[index],
                  });
                } else {
                  medAnswers.push({ key: item.key, selected: true, value: formValues[index] });
                }
              } else {
                medAnswers.push({ key: item.key, selected: false, value: '' });
              }
            });
          }
          setMedTimingAnswers(medAnswers);
          setDefaultForm(false);
        } else if (data.medicineDosage) {
          setMedicineDosage(data.medicineDosage);
          setDefaultForm(true);
          if (data.medicineTimings && data.medicineTimings.length > 0) {
            setMedTimingAnswers(
              medTimingsArray.map((item) => {
                if (data.medicineTimings && data.medicineTimings.includes(item.key)) {
                  return { key: item.key, selected: true, value: '' };
                } else {
                  return { key: item.key, selected: false, value: '' };
                }
              })
            );
          }
        }
        if (data.externalId) {
          setExternalId(data.externalId);
        }
      }
    };
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    fetchDosage();
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const routeOfAdminOptions: OptionsObject[] = Object.values(ROUTE_OF_ADMINISTRATION).map(
    (item) => ({
      key: item,
      value: nameFormater(item),
    })
  );

  const [routeOfAdminDrop, setRouteOfAdminDrop] = useState<OptionsObject>(routeOfAdminOptions[0]);
  const [medicineDosage, setMedicineDosage] = useState<string>('');
  const [typeDrop, setTypeDrop] = useState<OptionsObject>(dosagesOption[0]);
  const [takeDrop, setTakeDrop] = useState<OptionsObject>(takeTime[0]);
  const [forTime, setForTime] = useState<string>('');
  const [forTimeDrop, setForTimeDrop] = useState<OptionsObject>(forTimeArray[0]);

  const [afterFoodValue, setAfterFoodValue] = useState<boolean>(false);
  const [beforeFoodValue, setBeforeFoodValue] = useState<boolean>(false);

  const [instructions, setInstructions] = useState<string>('');

  const handleBack = async () => {
    props.onClose();
    return false;
  };

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
              setExternalId('');
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
          title={data ? strings.smartPrescr.update_medicine : strings.smartPrescr.add_medicine}
          onPress={() => {
            if (defaultForm && medicineDosage.length === 0) {
              showAphAlert &&
                showAphAlert({
                  title: 'Alert!',
                  description: 'Enter dosage',
                });
              return;
            } else if (
              !defaultForm &&
              medTimingAnswers.filter(
                (i) => i.key !== MEDICINE_TIMINGS.AS_NEEDED && i.selected && i.value.length === 0
              ).length > 0
            ) {
              showAphAlert &&
                showAphAlert({
                  title: 'Alert!',
                  description: `Enter (${medTimingAnswers
                    .filter(
                      (i) =>
                        i.key !== MEDICINE_TIMINGS.AS_NEEDED && i.selected && i.value.length === 0
                    )
                    .map((i) => nameFormater(i.key, 'lower'))
                    .join(', ')}) dosage(s)`,
                });
              return;
            } else if (
              !defaultForm &&
              medTimingAnswers.filter((i) => i.key !== MEDICINE_TIMINGS.AS_NEEDED && i.selected)
                .length !==
                medTimingAnswers.filter(
                  (i) => i.key !== MEDICINE_TIMINGS.AS_NEEDED && i.value.length !== 0
                ).length
            ) {
              showAphAlert &&
                showAphAlert({
                  title: 'Alert!',
                  description: `Timings (${medTimingAnswers
                    .filter(
                      (i) =>
                        i.key !== MEDICINE_TIMINGS.AS_NEEDED && !i.selected && i.value.length !== 0
                    )
                    .map((i) => nameFormater(i.key, 'lower'))
                    .join(', ')}) have dosages, select the timing(s) or empty the input field(s).`,
                });
              return;
            } else if (defaultForm && medTimingAnswers.filter((i) => i.selected).length === 0) {
              showAphAlert &&
                showAphAlert({
                  title: 'Alert!',
                  description: 'Select at least one timing\n(Morning/Noon/Evening/Night/As needed)',
                });
              return;
            } else if (
              !defaultForm &&
              medTimingAnswers.filter((i) => i.key !== MEDICINE_TIMINGS.AS_NEEDED && i.selected)
                .length === 0
            ) {
              showAphAlert &&
                showAphAlert({
                  title: 'Alert!',
                  description: 'Select at least one timing\n(Morning/Noon/Evening/Night)',
                });
              return;
            } else if (forTime.length === 0) {
              showAphAlert &&
                showAphAlert({
                  title: 'Alert!',
                  description: 'Enter number of ' + forTimeDrop.value,
                });
              return;
            }
            const dataSend = {
              medicineName: medName,
              id: data ? data.id : '',
              externalId: externalId,
              medicineDosage: defaultForm ? medicineDosage : '',
              medicineFormTypes: renderType,
              medicineUnit: typeDrop.key,
              medicineInstructions: instructions,
              medicineFrequency: defaultForm ? takeDrop.key : null,
              medicineConsumptionDurationUnit: forTimeDrop.key,
              medicineConsumptionDurationInDays: forTime,
              medicineTimings: medTimingsArray
                .map((item) => {
                  return (
                    (medTimingAnswers.find((i) => i.key === item.key && i.selected) || {}).key || ''
                  );
                })
                .filter((i) => i !== ''),
              medicineToBeTaken: [
                afterFoodValue ? MEDICINE_TO_BE_TAKEN.AFTER_FOOD : '',
                beforeFoodValue ? MEDICINE_TO_BE_TAKEN.BEFORE_FOOD : '',
              ].filter((i) => i !== ''),
              routeOfAdministration: routeOfAdminDrop.key,
              medicineCustomDosage: !defaultForm
                ? medTimingsArray
                    .map((item) => {
                      if (item.key === MEDICINE_TIMINGS.AS_NEEDED) {
                        return '';
                      } else {
                        return (
                          (medTimingAnswers.find((i) => i.key === item.key) || {}).value || 'n'
                        );
                      }
                    })
                    .filter((i) => i !== '')
                    .join('-')
                    .replace(/n/g, '')
                : null,
            };
            console.log(dataSend, 'data');
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

  const renderTakeInput = () => {
    if (defaultForm) {
      return (
        <TextInput
          style={styles.textInputStyles}
          placeholder=""
          placeholderTextColor="rgba(1, 71, 91, 0.3)"
          value={medicineDosage}
          maxLength={7}
          keyboardType={'numbers-and-punctuation'}
          selectionColor={theme.colors.INPUT_CURSOR_COLOR}
          onChange={(text) => {
            setMedicineDosage(formatFractionalNumber(text.nativeEvent.text));
          }}
        />
      );
    } else {
      return medTimingsArray.map((item) => {
        if (item.key === MEDICINE_TIMINGS.AS_NEEDED) {
          return null;
        }
        const existingAnswers = medTimingAnswers.find((i) => i.key === item.key);
        if (existingAnswers) {
          return (
            <TextInput
              style={styles.textInputStyles2}
              // placeholder={nameFormater(item.key)}
              placeholder={''}
              placeholderTextColor="rgba(1, 71, 91, 0.3)"
              value={existingAnswers.value}
              maxLength={7}
              keyboardType={'numbers-and-punctuation'}
              selectionColor={theme.colors.INPUT_CURSOR_COLOR}
              onChange={(text) => {
                setMedTimingAnswers([
                  ...(medTimingAnswers.filter((i) => i.key !== item.key) || []),
                  {
                    key: existingAnswers.key,
                    selected: formatFractionalNumber(text.nativeEvent.text) !== '',
                    value: formatFractionalNumber(text.nativeEvent.text),
                  },
                ]);
              }}
            />
          );
        }
      });
    }
  };

  const renderMedicineType = () => {
    return (
      <View style={{ margin: 16 }}>
        <RadioButtons
          data={radioOptions}
          selectedItem={renderType}
          setselectedItem={(type) => {
            setRenderType(type);
          }}
          containerStyle={{ flexDirection: 'row' }}
          itemStyle={{ marginRight: 20 }}
        />
        <View style={styles.medTypeView}>
          {renderTakeInput()}
          <MaterialMenu
            options={dosagesOption}
            selectedText={typeDrop ? typeDrop.key : ''}
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
                marginLeft: 0,
                marginTop: 10,
              }}
            >
              <View
                style={[
                  styles.MtextView,
                  {
                    width: defaultForm
                      ? // || (!defaultForm && medTimingAnswers.filter((i) => i.selected).length % 2 === 1)
                        (width - 110) / 2
                      : width - 90,
                  },
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
        {defaultForm && (
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
        )}
        <View style={styles.customTextContainer}>
          <TouchableOpacity
            onPress={() => {
              setDefaultForm(!defaultForm);
              if (defaultForm) {
                setMedTimingAnswers(
                  medTimingsArray.map((item) => {
                    setFromSearch(false);
                    const existing = medTimingAnswers.findIndex((i) => i.key === item.key);
                    if (item.key !== MEDICINE_TIMINGS.AS_NEEDED) {
                      return {
                        key: item.key,
                        selected: isFromSearch
                          ? false
                          : existing > -1
                          ? medTimingAnswers[existing].selected
                          : true,
                        value: isFromSearch
                          ? ''
                          : existing > -1
                          ? medTimingAnswers[existing].value
                          : '',
                      };
                    } else {
                      return {
                        key: item.key,
                        selected:
                          existing > -1
                            ? medTimingAnswers[existing].value !== ''
                              ? true
                              : medTimingAnswers[existing].selected
                            : true,
                        value: '',
                      };
                    }
                  })
                );
              }
            }}
          >
            <Text style={styles.customTextStyle}>
              {defaultForm ? strings.common.custom : strings.common.default}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.inTheText}>{strings.smartPrescr.in_the}</Text>
        <View style={styles.sessionsView}>
          {medTimingsArray.map((item) => {
            if (!defaultForm && item.key === MEDICINE_TIMINGS.AS_NEEDED) {
              return null;
            }
            const existingAnswers = medTimingAnswers.find((i) => i.key === item.key);
            if (existingAnswers) {
              return (
                <ChipViewCard
                  title={item.value}
                  isChecked={existingAnswers.selected}
                  onChange={() => {
                    if (item.key === MEDICINE_TIMINGS.AS_NEEDED) {
                      setMedTimingAnswers([
                        ...(medTimingAnswers
                          .filter((i) => i.key !== item.key)
                          .map((i) => {
                            if (i.key !== MEDICINE_TIMINGS.AS_NEEDED) {
                              return { key: i.key, selected: false, value: '' };
                            } else {
                              return { key: i.key, selected: i.selected, value: i.value };
                            }
                          }) || []),
                        {
                          key: existingAnswers.key,
                          selected: !existingAnswers.selected,
                          value: existingAnswers.value,
                        },
                      ]);
                    } else {
                      setMedTimingAnswers([
                        ...(medTimingAnswers
                          .filter((i) => i.key !== item.key)
                          .map((i) => {
                            if (i.key === MEDICINE_TIMINGS.AS_NEEDED) {
                              return { key: i.key, selected: false, value: i.value };
                            } else {
                              return { key: i.key, selected: i.selected, value: i.value };
                            }
                          }) || []),
                        {
                          key: existingAnswers.key,
                          selected: !existingAnswers.selected,
                          value: existingAnswers.selected ? '' : existingAnswers.value,
                        },
                      ]);
                    }
                  }}
                  containerStyle={styles.chipContainerStyle}
                  containerSelectedStyle={{
                    backgroundColor: item.color,
                  }}
                  containerUnSelectedStyle={{
                    borderColor: item.color,
                  }}
                  textStyle={[styles.chiptextStyle, { color: item.color }]}
                  textSelectedStyle={styles.chipSelectedTextStyle}
                />
              );
            }
          })}
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
        <Text style={styles.forLable}>{strings.smartPrescr.for}</Text>
        <View style={styles.forInputView}>
          <TextInput
            style={styles.textInputStyles}
            placeholder=""
            placeholderTextColor="rgba(1, 71, 91, 0.3)"
            value={forTime}
            keyboardType={'numbers-and-punctuation'}
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
        <Text style={styles.routeOfAdminText}>{strings.smartPrescr.route_of_administration}</Text>
        <MaterialMenu
          options={routeOfAdminOptions}
          selectedText={routeOfAdminDrop.key}
          menuContainerStyle={styles.menuContainerStyle}
          onPress={(item) => {
            setRouteOfAdminDrop(item);
          }}
          selectedTextStyle={styles.seleTextStyle}
          itemTextStyle={styles.itemTextStyle}
          itemContainer={styles.MaterialitemContainerStyle}
          bottomPadding={{ paddingBottom: 10 }}
        >
          <View style={styles.dropDownValueView}>
            <View style={styles.dropdownView}>
              <Text style={styles.takeDropdownText}>{routeOfAdminDrop.value}</Text>
              <View style={styles.dropdownGreenView}>
                <DropdownGreen />
              </View>
            </View>
          </View>
        </MaterialMenu>
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
          <ActivityIndicator
            animating={true}
            size="large"
            color="green"
            style={styles.listSpinner}
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
      setListLoader(true);
      searchMedicineApi(value)
        .then(async ({ data }) => {
          const products = data.products || [];
          // if (products.length > 0) {
          setMedList(products);
          // } else {
          //   setMedList([
          //     {
          //       description: '',
          //       id: 1,
          //       image: '',
          //       is_in_stock: true,
          //       is_prescription_required: '',
          //       name: value,
          //       price: 0,
          //       sku: value,
          //       small_image: '',
          //       status: '',
          //       thumbnail: '',
          //       type_id: '',
          //     },
          //   ]);
          // }
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
    let changed = false;
    if (medType) {
      medicineDefaultOptions.forEach((item) => {
        if (item.dosageType.toLowerCase() === medType.toLowerCase()) {
          changed = true;
          setRenderType(item.defaultSetting);
          setRouteOfAdminDrop(
            routeOfAdminOptions.find((i) => i.key === item.administrationRoute) ||
              routeOfAdminOptions[0]
          );
          setTypeDrop(dosagesOption.find((i) => i.key === item.medicineUnite) || dosagesOption[0]);
        }
      });
    }
    if (!changed) {
      const item = medicineDefaultOptions.find((i) => i.dosageType === 'OTHERS');
      if (item) {
        setRenderType(item.defaultSetting);
        setRouteOfAdminDrop(
          routeOfAdminOptions.find((i) => i.key === item.administrationRoute) ||
            routeOfAdminOptions[0]
        );
        setTypeDrop(dosagesOption.find((i) => i.key === item.medicineUnite) || dosagesOption[0]);
      }
    }
  };

  const medDetailsApi = (sku: string) => {
    setMedDetailLoading(true);
    getMedicineDetailsApi(sku)
      .then((data) => {
        setMedicineSelected(data.data.productdp[0]);
        data.data.productdp[0] && setMedName(data.data.productdp[0].name);
        setExternalId(data.data.productdp[0].sku);
        const medtype =
          data.data.productdp[0] && data.data.productdp[0].PharmaOverview.length
            ? data.data.productdp[0].PharmaOverview[0].Doseform
            : '';
        setMedType(medtype);
      })
      .finally(() => setMedDetailLoading(false));
  };

  const renderMedicineItem = (item: MedicineProduct, index: number) => {
    const length =
      medList.findIndex((i) => i.name.toLowerCase() === medSearchText.trim().toLowerCase()) === -1
        ? medList.length
        : medList.length - 1;
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setMedName(item.name);
          setFromSearch(true);
          if (item.name === item.sku) {
            setMedicineSelected(item as MedicineProductDetails);
            setExternalId(item.sku);
            setMedType(MEDICINE_UNIT.OTHERS);
          } else {
            medDetailsApi(item.sku);
            setExternalId(item.sku);
          }
        }}
      >
        <View
          style={[
            styles.medicineListView,
            {
              borderColor: length !== index ? theme.colors.SEPARATOR_LINE : theme.colors.CLEAR,
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
            <ActivityIndicator
              animating={true}
              size="large"
              color="green"
              style={styles.listSpinner}
            />
          ) : (
            <FlatList
              data={[
                medSearchText &&
                medList.findIndex(
                  (i) => i.name.toLowerCase() === medSearchText.trim().toLowerCase()
                ) === -1
                  ? {
                      description: '',
                      id: 1,
                      image: '',
                      is_in_stock: true,
                      is_prescription_required: '',
                      name: medSearchText,
                      price: 0,
                      sku: medSearchText,
                      small_image: '',
                      status: '',
                      thumbnail: '',
                      type_id: '',
                    }
                  : null,
                ...medList,
              ].filter((i) => i !== null)}
              renderItem={({ item, index }) => item && renderMedicineItem(item, index)}
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
