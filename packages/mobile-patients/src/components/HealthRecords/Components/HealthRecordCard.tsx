import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  SelfUploadPhrIcon,
  CartPhrIcon,
  FollowUpPhrIcon,
  More,
  HospitalUploadPhrIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { EDIT_DELETE_TYPE } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  itemTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
    paddingHorizontal: 0,
  },
  followupAndCartViewStyle: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(2,71,91,0.5)',
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    paddingTop: 7,
  },
  followUpTextStyle: { ...theme.viewStyles.text('R', 12, theme.colors.SKY_BLUE, 1, 15.8) },
  cardMainContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 0,
    marginBottom: 16,
  },
  prescriptionNameTextStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 20.8),
  },
  doctorTextStyle: { ...theme.viewStyles.text('R', 10, '#67909C', 1, 13) },
  sourceNameTextStyle: { ...theme.viewStyles.text('R', 12, '#67909C', 1, 15.8) },
});

export interface HealthRecordCardProps {
  item: any;
  editDeleteData?: any;
  onEditPress?: (selectedItem: any) => void;
  onDeletePress?: (selectedItem: any) => void;
  onHealthCardPress: (selectedItem: any) => void;
  onFollowUpPress?: (selectedItem: any) => void;
  onOrderTestAndMedicinePress?: (selectedItem: any) => void;
  prescriptionName: string;
  doctorName?: string;
  dateText: string;
  selfUpload: boolean;
  sourceName: string;
  index: number;
  showFollowUp?: boolean;
  showUpdateDeleteOption?: boolean;
  healthConditionCard?: boolean;
  healthCondtionCardTopView?: React.ReactElement;
}

export const HealthRecordCard: React.FC<HealthRecordCardProps> = (props) => {
  const {
    item,
    editDeleteData,
    onHealthCardPress,
    onEditPress,
    onDeletePress,
    prescriptionName,
    doctorName,
    dateText,
    selfUpload,
    sourceName,
    index,
    onOrderTestAndMedicinePress,
    onFollowUpPress,
    showFollowUp,
    healthConditionCard,
    healthCondtionCardTopView,
    showUpdateDeleteOption,
  } = props;
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.cardMainContainerStyle}
      onPress={() => onHealthCardPress(item)}
    >
      <View style={{ marginVertical: 12, marginLeft: 13, marginRight: 11 }}>
        <View style={{ flexDirection: 'row', position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
          {showUpdateDeleteOption ? null : (
            <Text style={{ ...theme.viewStyles.text('R', 10, '#67909C', 1, 13) }}>{dateText}</Text>
          )}
          {showUpdateDeleteOption ? (
            <MaterialMenu
              options={editDeleteData}
              menuContainerStyle={[styles.menuContainerStyle, { marginTop: 25 }]}
              itemContainer={{ height: 44.8, marginHorizontal: 12, width: 260 / 2 }}
              itemTextStyle={styles.itemTextStyle}
              showItemDifferentColor={true}
              lastContainerStyle={{ borderBottomWidth: 0 }}
              bottomPadding={{ paddingBottom: 0 }}
              onPress={(selectedOption) => {
                if (selectedOption.key === EDIT_DELETE_TYPE.EDIT) {
                  onEditPress && onEditPress(item);
                } else {
                  onDeletePress && onDeletePress(item);
                }
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ ...theme.viewStyles.text('R', 10, '#67909C', 1, 13) }}>
                  {dateText}
                </Text>
                <More />
              </View>
            </MaterialMenu>
          ) : null}
        </View>
        {healthConditionCard ? healthCondtionCardTopView : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ marginRight: 55 }}>
            <Text numberOfLines={1} style={styles.prescriptionNameTextStyle}>
              {prescriptionName}
            </Text>
            {doctorName ? (
              <Text numberOfLines={1} style={styles.doctorTextStyle}>
                {doctorName}
              </Text>
            ) : null}
          </View>
        </View>
        {healthConditionCard && !sourceName ? null : (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 9 }}>
            {selfUpload ? (
              sourceName === string.common.clicnical_document_text ||
              sourceName === string.common.patient_uploaded_text ||
              sourceName === '-' ? (
                <SelfUploadPhrIcon style={{ width: 16, height: 10.14, marginRight: 8 }} />
              ) : (
                <HospitalUploadPhrIcon style={{ height: 14, width: 14, marginRight: 8 }} />
              )
            ) : (
              <HospitalUploadPhrIcon style={{ height: 14, width: 14, marginRight: 8 }} />
            )}
            <Text numberOfLines={1} style={styles.sourceNameTextStyle}>
              {sourceName}
            </Text>
          </View>
        )}
        {selfUpload ? null : (
          <View style={styles.followupAndCartViewStyle}>
            {showFollowUp ? (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => onFollowUpPress && onFollowUpPress(item)}
                style={{ flexDirection: 'row' }}
              >
                <FollowUpPhrIcon style={{ width: 16, height: 14, marginRight: 9 }} />
                <Text style={styles.followUpTextStyle}>{'Follow up'}</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => onOrderTestAndMedicinePress && onOrderTestAndMedicinePress(item)}
              style={{ flexDirection: 'row' }}
            >
              <CartPhrIcon style={{ width: 14, height: 14, marginRight: 9 }} />
              <Text style={styles.followUpTextStyle}>{'Order Tests and Meds'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
