import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  SelfUploadPhrIcon,
  CartPhrIcon,
  FollowUpPhrIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import moment from 'moment';

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
  followUpTextStyle: { ...theme.viewStyles.text('R', 12, '#0087BA', 1, 15.8) },
  cardMainContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 0,
    marginBottom: 16,
  },
});

export interface HealthRecordCardProps {
  item: any;
  editDeleteData?: any;
  onEditDeletePress?: (optionSeletected: string) => void;
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
}

export const HealthRecordCard: React.FC<HealthRecordCardProps> = (props) => {
  const {
    item,
    editDeleteData,
    onHealthCardPress,
    onEditDeletePress,
    prescriptionName,
    doctorName,
    dateText,
    selfUpload,
    sourceName,
    index,
    onOrderTestAndMedicinePress,
    onFollowUpPress,
    showFollowUp,
  } = props;
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.cardMainContainerStyle}
      onPress={() => onHealthCardPress(item)}
    >
      <View style={{ marginVertical: 12, marginLeft: 13, marginRight: 11 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text
              numberOfLines={1}
              style={{ ...theme.viewStyles.text('M', 16, '#02475B', 1, 20.8) }}
            >
              {prescriptionName}
            </Text>
            <Text numberOfLines={1} style={{ ...theme.viewStyles.text('R', 10, '#67909C', 1, 13) }}>
              {doctorName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ ...theme.viewStyles.text('R', 10, '#67909C', 1, 13) }}>{dateText}</Text>
            {/* For Next Phase */}
            {/* <MaterialMenu
              options={editDeleteData}
              menuContainerStyle={[styles.menuContainerStyle, { marginTop: 25 }]}
              itemContainer={{ height: 44.8, marginHorizontal: 12, width: 260 / 2 }}
              itemTextStyle={styles.itemTextStyle}
              showItemDifferentColor={true}
              lastContainerStyle={{ borderBottomWidth: 0 }}
              bottomPadding={{ paddingBottom: 0 }}
              onPress={(selectedOption) => {
                onEditDeletePress && onEditDeletePress(selectedOption.key);
              }}
            >
              <More />
            </MaterialMenu> */}
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 9 }}>
          <SelfUploadPhrIcon style={{ width: 16, height: 10.14, marginRight: 8 }} />
          <Text numberOfLines={1} style={{ ...theme.viewStyles.text('R', 12, '#67909C', 1, 15.8) }}>
            {sourceName}
          </Text>
        </View>
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
