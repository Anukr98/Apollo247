import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  dateTextStyle: { ...theme.viewStyles.text('R', 14, '#95B1B7', 1, 21) },
  cardMainContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 9,
    marginBottom: 16,
  },
  healthRecordTitleTextStyle: {
    ...theme.viewStyles.text('M', 18, theme.colors.APP_GREEN, 1, 21),
    marginBottom: 15,
  },
  healthRecordMoreTextStyle: { ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE, 1, 21) },
});

export interface SearchHealthRecordCardProps {
  item: any;
  healthRecordTitle: string;
  healthRecordMoreText: string;
  searchHealthCardTopView?: React.ReactElement;
  dateText: string;
  onSearchHealthCardPress: (selectedItem: any) => void;
  index: number;
}

export const SearchHealthRecordCard: React.FC<SearchHealthRecordCardProps> = (props) => {
  const {
    item,
    healthRecordMoreText,
    healthRecordTitle,
    onSearchHealthCardPress,
    searchHealthCardTopView,
    dateText,
    index,
  } = props;
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.cardMainContainerStyle}
      onPress={() => onSearchHealthCardPress(item)}
    >
      <View style={{ marginVertical: 12, marginLeft: 13, marginRight: 11 }}>
        {searchHealthCardTopView}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{}}>
            <Text style={styles.healthRecordTitleTextStyle}>{healthRecordTitle}</Text>
            <Text style={styles.dateTextStyle}>
              {dateText}
              <Text style={styles.healthRecordMoreTextStyle}>{healthRecordMoreText}</Text>
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
