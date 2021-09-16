import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Image } from 'react-native';
import Pdf from 'react-native-pdf';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CheckedIcon, UnCheck } from '@aph/mobile-patients/src/components/ui/Icons';
import moment from 'moment';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  healthRecord: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 5,
    marginVertical: 20,
    width: '30%',
  },
  pdfThumbnail: {
    flex: 1,
    marginTop: 6,
    width: width / 4,
    height: width / 3.5,
    backgroundColor: 'transparent',
  },
  hrImage: {
    resizeMode: 'cover',
    width: '100%',
    height: width / 3.3,
    borderRadius: 8,
  },
  hrHeading: theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE, 1, 20),
  checkContainer: {
    position: 'absolute',
    right: 7,
    top: 7,
  },
  pdfIconContainer: {
    position: 'absolute',
    left: 7,
    top: 10,
  },
  pdfIcon: {
    backgroundColor: 'grey',
    paddingHorizontal: 2,
    borderRadius: 4,
  },
});

export interface SelectEprescriptionCardProps {
  selected: boolean;
  isPdf: boolean;
  url: string;
  heading: string;
  date: string;
  onLongPressCard: () => void;
  onPressCard: () => void;
}

export const SelectEprescriptionCard: React.FC<SelectEprescriptionCardProps> = (props) => {
  const { selected, isPdf, url, heading, date, onLongPressCard, onPressCard } = props;
  const prescriptionDate = moment(date).format('DD MMM YYYY');

  return (
    <TouchableOpacity
      activeOpacity={1}
      onLongPress={onLongPressCard}
      onPress={onPressCard}
      style={styles.healthRecord}
    >
      {isPdf ? (
        <Pdf key={url} source={{ uri: url }} style={styles.pdfThumbnail} />
      ) : (
        <Image source={{ uri: url }} style={styles.hrImage} />
      )}
      <View style={{ padding: 5 }}>
        <Text numberOfLines={1} style={styles.hrHeading}>
          {heading}
        </Text>
        <Text style={theme.viewStyles.text('R', 13, theme.colors.LIGHT_BLUE, 0.6, 24)}>
          {prescriptionDate}
        </Text>
      </View>
      <View style={styles.checkContainer}>{selected ? <CheckedIcon /> : <UnCheck />}</View>
      {isPdf && (
        <View style={styles.pdfIconContainer}>
          <View style={styles.pdfIcon}>
            <Text style={theme.viewStyles.text('M', 10, theme.colors.WHITE, 1, 13)}>PDF</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
