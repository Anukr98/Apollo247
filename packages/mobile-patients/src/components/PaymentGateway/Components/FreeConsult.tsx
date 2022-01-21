import React from 'react';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Apollo247Icon } from '@aph/mobile-patients/src/components/ui/Icons';
const windowWidth = Dimensions.get('window').width;

export interface FreeConsultProps {
  name: string;
}

export const FreeConsult: React.FC<FreeConsultProps> = (props) => {
  const { name } = props;
  const { selectedPrescriptionType } = useAppCommonData();

  const renderMsg = () => {
    return (
      <View style={styles.subCont}>
        <Apollo247Icon style={styles.icon} />
        <Text style={styles.msg}>
          To help with your free prescription an Apollo Doctor will call you within 15-20 mins from
          one of these numbers: 04048214566, 04071565134. Please attend the call for timely
          processing of your order
        </Text>
      </View>
    );
  };

  const renderFreeConsult = () => {
    return (
      <View>
        <Text style={styles.freeConsult}> {`Free Consult Booked for ${name}`}</Text>
        {renderMsg()}
        <Text style={styles.note}>
          <Text style={{ ...styles.note, ...theme.fonts.IBMPlexSansSemiBold(10) }}>Note:</Text>
          Delivery TAT will be on hold till consult is completed
        </Text>
      </View>
    );
  };

  return selectedPrescriptionType === 'CONSULT' ? (
    <View style={styles.container}>{renderFreeConsult()}</View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  freeConsult: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: '#02475B',
    paddingBottom: 10,
    borderBottomWidth: 0.8,
    borderBottomColor: '#d8d9d4',
    paddingHorizontal: 12,
  },
  subCont: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    marginTop: 12,
  },
  icon: {
    height: 36,
    width: 50,
  },
  msg: {
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 17,
    color: '#6D7278',
    letterSpacing: 0.0026,
    marginLeft: 14,
    flexWrap: 'wrap',
    width: windowWidth - 120,
  },
  note: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 13,
    color: '#02475B',
    marginTop: 12,
    paddingHorizontal: 12,
  },
});
