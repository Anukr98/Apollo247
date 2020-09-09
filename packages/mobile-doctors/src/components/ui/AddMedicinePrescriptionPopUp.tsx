import AddMedicinePrescriptionPopUpStyles from '@aph/mobile-doctors/src/components/ui/AddMedicinePrescriptionPopUp.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import {
  Green,
  LeftPointer,
  Remove,
  RightPointer,
  TickOrange,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_pastAppointments_caseSheet,
  GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_medicinePrescription,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { g, medicineDescription } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

const styles = AddMedicinePrescriptionPopUpStyles;

type selectMedicineType = {
  appointmentId: string;
  medicineId: string;
  medicineName: string;
  date: string;
};

export interface AddMedicinePrescriptionPopUpProps {
  prescriptionData: (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null;
  onClose: () => void;
  onProceed: (
    data: (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[]
  ) => void;
}

export const AddMedicinePrescriptionPopUp: React.FC<AddMedicinePrescriptionPopUpProps> = (
  props
) => {
  const { onClose, prescriptionData, onProceed } = props;
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [selectedAppointment, setSelectedAppointment] = useState<number>(
    (prescriptionData && prescriptionData.length - 1) || 0
  );
  const [selectedMedicine, setSelectedMedicine] = useState<selectMedicineType[]>([]);

  useEffect(() => {
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = async () => {
    props.onClose();
    return false;
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerStyles}>
        <Text style={styles.medNameStyles}>{strings.medicinePrescriptionPopup.heading}</Text>
      </View>
    );
  };

  const renderCalender = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (selectedAppointment > 0) {
              setSelectedAppointment(selectedAppointment - 1);
              setselectedAppointmentCaseSheet(
                prescriptionData && g(prescriptionData[selectedAppointment - 1], 'caseSheet')
              );
            }
          }}
        >
          <LeftPointer />
        </TouchableOpacity>
        {prescriptionData
          ? prescriptionData.map((item, i) => {
              if (
                item &&
                [
                  selectedAppointment > 0 ? selectedAppointment - 1 : 2,
                  selectedAppointment,
                  selectedAppointment < prescriptionData.length - 1
                    ? selectedAppointment + 1
                    : selectedAppointment - 2,
                ].includes(i)
              ) {
                const isSelected = selectedAppointment === i;
                return (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      setSelectedAppointment(i);
                      setselectedAppointmentCaseSheet(
                        prescriptionData && g(prescriptionData[i], 'caseSheet')
                      );
                    }}
                  >
                    <Text
                      style={{
                        ...theme.viewStyles.text(
                          'M',
                          12,
                          isSelected ? theme.colors.APP_GREEN : theme.colors.SHARP_BLUE
                        ),
                        textAlign: 'center',
                      }}
                    >
                      {moment(item.appointmentDateTime).format('Do MMM[\n]')}
                      <Text
                        style={theme.viewStyles.text(
                          'R',
                          10,
                          isSelected ? theme.colors.APP_GREEN : theme.colors.SHARP_BLUE
                        )}
                      >
                        {moment(item.appointmentDateTime).format('h:mm A')}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                );
              }
            })
          : null}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (prescriptionData && selectedAppointment < prescriptionData.length - 1) {
              setSelectedAppointment(selectedAppointment + 1);
              setselectedAppointmentCaseSheet(
                prescriptionData && g(prescriptionData[selectedAppointment + 1], 'caseSheet')
              );
            }
          }}
        >
          <RightPointer />
        </TouchableOpacity>
      </View>
    );
  };

  const duplicateCheck = (
    newItemsArray: selectMedicineType[],
    callBack: (finalMedicines: selectMedicineType[]) => void
  ) => {
    const duplicateEntries = _.difference(newItemsArray, _.uniqBy(newItemsArray, 'medicineId'));
    if (duplicateEntries.length > 0) {
      duplicateEntries.forEach((item) => {
        const duplicates = newItemsArray.filter(
          (existingItem) => existingItem.medicineId === item.medicineId
        );
        showAphAlert &&
          showAphAlert({
            title: 'Duplicate found!',
            description: `Medicine ${
              duplicates[0].medicineName
            } added from following appointments ${duplicates
              .map((item) => moment(item.date).format('Do MMM h:mm A'))
              .join(', ')}.\nPlease select only one to proceed.`,
            CTAs: [
              ...duplicates.map((duplicatesItem) => {
                return {
                  text: moment(duplicatesItem.date).format('Do MMM h:mm A'),
                  onPress: () => {
                    hideAphAlert && hideAphAlert();
                    duplicateCheck(
                      newItemsArray.filter(
                        (existingItem) =>
                          existingItem.medicineId !== duplicatesItem.medicineId ||
                          (existingItem.medicineId === duplicatesItem.medicineId &&
                            existingItem.appointmentId === duplicatesItem.appointmentId)
                      ),
                      (finalMedicines) => {
                        callBack(finalMedicines);
                      }
                    );
                  },
                };
              }),
            ],
          });
      });
    } else {
      callBack(newItemsArray);
    }
  };

  const [selectedAppointmentCaseSheet, setselectedAppointmentCaseSheet] = useState<
    GetCaseSheet_getCaseSheet_pastAppointments_caseSheet[] | null | undefined
  >(prescriptionData && g(prescriptionData[selectedAppointment], 'caseSheet'));

  const renderList = () => {
    return (
      <View>
        {selectedAppointmentCaseSheet &&
          (g(selectedAppointmentCaseSheet[0], 'medicinePrescription') || []).map(
            (item, index, array) => {
              const appointmentId =
                (prescriptionData && g(prescriptionData[selectedAppointment], 'id')) ||
                selectedAppointment.toString();
              const medicineId =
                g(item, 'id') || g(item, 'externalId') || g(item, 'medicineName') || '';
              const isSelected =
                selectedMedicine.findIndex(
                  (medicineSelected) =>
                    medicineSelected.appointmentId === appointmentId &&
                    medicineSelected.medicineId === medicineId
                ) > -1;
              if (item) {
                return (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedMedicine([
                          ...selectedMedicine.filter(
                            (medicineSelected) =>
                              !(
                                medicineSelected.appointmentId == appointmentId &&
                                medicineSelected.medicineId == medicineId
                              )
                          ),
                        ]);
                      } else {
                        setSelectedMedicine([
                          ...selectedMedicine,
                          {
                            appointmentId: appointmentId,
                            medicineId: medicineId,
                            medicineName: g(item, 'medicineName') || '',
                            date:
                              prescriptionData &&
                              g(prescriptionData[selectedAppointment], 'appointmentDateTime'),
                          },
                        ]);
                      }
                    }}
                  >
                    <View style={styles.itemContainer}>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}
                        >
                          <Text
                            style={{
                              ...theme.viewStyles.text(
                                'SB',
                                14,
                                isSelected ? theme.colors.APP_GREEN : theme.colors.SHARP_BLUE,
                                1,
                                undefined,
                                0.02
                              ),
                              marginBottom: 6,
                              flex: 1,
                            }}
                          >
                            {item.medicineName}
                          </Text>
                          <View style={{ marginLeft: 10 }}>
                            {isSelected ? (
                              <Text
                                style={theme.viewStyles.text(
                                  'SB',
                                  12,
                                  theme.colors.APP_YELLOW,
                                  1,
                                  14,
                                  0.02
                                )}
                              >
                                REMOVE
                              </Text>
                            ) : (
                              <Green />
                            )}
                          </View>
                        </View>

                        {item.includeGenericNameInPrescription && item.genericName ? (
                          <Text
                            style={theme.viewStyles.text(
                              'S',
                              12,
                              isSelected ? theme.colors.APP_GREEN : theme.colors.SHARP_BLUE,
                              1,
                              undefined,
                              0.02
                            )}
                          >
                            {`Contains ${item.genericName}`}
                          </Text>
                        ) : null}
                        <Text
                          style={theme.viewStyles.text(
                            'S',
                            12,
                            isSelected ? theme.colors.APP_GREEN : theme.colors.SHARP_BLUE,
                            1,
                            14,
                            0.02
                          )}
                        >
                          {medicineDescription(item)}
                        </Text>
                      </View>
                    </View>
                    {index < array.length - 1 ? <View style={styles.seperator} /> : null}
                  </TouchableOpacity>
                );
              }
            }
          )}
      </View>
    );
  };
  const [allSelectedInDate, setAllSelectedInDate] = useState<boolean>(false);
  useEffect(() => {
    if (selectedAppointmentCaseSheet) {
      let selectedCount = 0;
      (g(selectedAppointmentCaseSheet[0], 'medicinePrescription') || []).forEach((item) => {
        if (
          selectedMedicine.findIndex(
            (medicineSelected) =>
              medicineSelected.appointmentId ===
                ((prescriptionData && g(prescriptionData[selectedAppointment], 'id')) ||
                  selectedAppointment.toString()) &&
              medicineSelected.medicineId ===
                (g(item, 'id') || g(item, 'externalId') || g(item, 'medicineName') || '')
          ) > -1
        ) {
          selectedCount++;
        }
      });

      setAllSelectedInDate(
        selectedCount > 0 &&
          selectedCount == (g(selectedAppointmentCaseSheet[0], 'medicinePrescription') || []).length
      );
    }
  }, [selectedMedicine, selectedAppointment, selectedAppointmentCaseSheet, prescriptionData]);

  const renderEmptyView = () => {
    return (
      <View>
        <Text style={styles.noDataText}>There are no medicines prescribed on this appointment</Text>
      </View>
    );
  };
  const renderMedicines = () => {
    return (
      <View style={styles.mainContainer}>
        <Text style={styles.headingTextStyles}>
          {strings.medicinePrescriptionPopup.casesheetHeading}
        </Text>
        {renderCalender()}
        {(
          (selectedAppointmentCaseSheet &&
            g(selectedAppointmentCaseSheet[0], 'medicinePrescription')) ||
          []
        ).length > 0 ? (
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity
              onPress={() => {
                if (selectedAppointmentCaseSheet) {
                  const tempSelectedItems: selectMedicineType[] = [];
                  const removeSelecte: selectMedicineType[] = [];
                  (g(selectedAppointmentCaseSheet[0], 'medicinePrescription') || []).forEach(
                    (item) => {
                      const appointmentId =
                        (prescriptionData && g(prescriptionData[selectedAppointment], 'id')) ||
                        selectedAppointment.toString();
                      const medicineId =
                        g(item, 'id') || g(item, 'externalId') || g(item, 'medicineName') || '';
                      if (
                        selectedMedicine.findIndex(
                          (medicineSelected) =>
                            medicineSelected.appointmentId === appointmentId &&
                            medicineSelected.medicineId === medicineId
                        ) === -1
                      ) {
                        tempSelectedItems.push({
                          appointmentId: appointmentId,
                          medicineId: medicineId,
                          medicineName: g(item, 'medicineName') || '',
                          date:
                            prescriptionData &&
                            g(prescriptionData[selectedAppointment], 'appointmentDateTime'),
                        });
                      } else {
                        if (allSelectedInDate) {
                          removeSelecte.push({
                            appointmentId: appointmentId,
                            medicineId: medicineId,
                            medicineName: g(item, 'medicineName') || '',
                            date:
                              prescriptionData &&
                              g(prescriptionData[selectedAppointment], 'appointmentDateTime'),
                          });
                        }
                      }
                    }
                  );
                  setSelectedMedicine([
                    ...(removeSelecte.length > 0
                      ? selectedMedicine.filter((item) => removeSelecte.includes(item))
                      : selectedMedicine),
                    ...tempSelectedItems,
                  ]);
                  setAllSelectedInDate(!allSelectedInDate);
                }
              }}
              style={{ marginBottom: 10 }}
            >
              {allSelectedInDate ? (
                <Text style={styles.removeText}>{strings.medicinePrescriptionPopup.remove}</Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TickOrange />
                  <Text style={styles.addAllText}>{strings.medicinePrescriptionPopup.addAll}</Text>
                </View>
              )}
            </TouchableOpacity>
            <ScrollView bounces={false} style={styles.scrollViewStyle}>
              {renderList()}
              <View style={{ height: Platform.OS === 'android' ? 10 : 0 }} />
            </ScrollView>
          </View>
        ) : (
          renderEmptyView()
        )}
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttonView}>
        <Button
          title={'PROCEED'}
          onPress={() => {
            duplicateCheck(selectedMedicine, (finalMedicines) => {
              const appointmentIds = finalMedicines.map((item) => item.appointmentId);
              const medicine: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_medicinePrescription | null)[] = [];
              if (prescriptionData) {
                prescriptionData.forEach((appointment) => {
                  if (appointmentIds.includes(g(appointment, 'id') || '')) {
                    const medicinesId = finalMedicines
                      .filter((item) => item.appointmentId === g(appointment, 'id') || '')
                      .map((item) => item.medicineId);
                    if (
                      appointment &&
                      appointment.caseSheet &&
                      appointment.caseSheet[0] &&
                      appointment.caseSheet[0].medicinePrescription
                    ) {
                      medicine.push(
                        ...appointment.caseSheet[0].medicinePrescription
                          .map((item) => {
                            if (
                              medicinesId.includes(
                                g(item, 'id') ||
                                  g(item, 'externalId') ||
                                  g(item, 'medicineName') ||
                                  ''
                              )
                            ) {
                              return {
                                ...item,
                                externalId:
                                  g(item, 'id') ||
                                  g(item, 'externalId') ||
                                  g(item, 'medicineName') ||
                                  '',
                              } as GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_medicinePrescription;
                            } else {
                              return null;
                            }
                          })
                          .filter((item) => item)
                      );
                    }
                  }
                });
              }
              onProceed(medicine);
              onClose();
            });
          }}
          style={{ width: (width - 110) / 2 }}
        />
      </View>
    );
  };

  return (
    <View style={styles.mainView}>
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
          {renderMedicines()}
          {renderButtons()}
        </View>
      </View>
    </View>
  );
};
