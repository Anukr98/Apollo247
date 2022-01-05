import React from 'react';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AlertIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface SubstituteNoticeProps {
  onPressAccept: () => void;
  onPressReject: () => void;
  orderInfo: any;
}

export const SubstituteNotice: React.FC<SubstituteNoticeProps> = (props) => {
  const { onPressAccept, onPressReject, orderInfo } = props;

  const renderNotice = () => {
    return (
      <View style={styles.subCont}>
        <View style={styles.header}>
          <AlertIcon style={styles.alert} />
          <Text style={styles.Notice}>NOTICE</Text>
        </View>
        <Text style={styles.message}>{orderInfo?.substitutionMessage}</Text>
        {renderButtons()}
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View>
        <TouchableOpacity onPress={onPressAccept}>
          <Text style={styles.agree}>Yes, Agree to Receiving Substitutes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressReject}>
          <Text style={styles.reject}>No, I want the Exact Items Delivered</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return !!orderInfo?.substitutionMessage ? (
    <View style={styles.container}>{renderNotice()}</View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D4F5FF',
    paddingTop: 25,
    paddingHorizontal: 20,
  },
  subCont: {
    borderWidth: 1,
    borderColor: '#D4D4D4',
    backgroundColor: '#fff',
    paddingTop: 9,
    paddingBottom: 20,
    borderRadius: 4,
  },
  Notice: {
    flex: 1,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    lineHeight: 20,
    color: '#02475B',
    marginLeft: 3,
    textAlignVertical: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 0.8,
    borderBottomColor: '#d8d9d4',
    paddingBottom: 7,
  },
  message: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 17,
    color: '#02475B',
    marginHorizontal: 11,
    flexWrap: 'wrap',
    marginTop: 12,
    paddingBottom: 15,
    borderBottomWidth: 0.8,
    borderBottomColor: '#d8d9d4',
  },
  agree: {
    color: '#fff',
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    paddingHorizontal: 25,
    paddingVertical: 8,
    backgroundColor: '#FCB716',
    borderRadius: 4,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    margin: 10,
    textAlign: 'center',
  },
  reject: {
    color: '#FCB716',
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    paddingHorizontal: 25,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCB716',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  alert: {
    height: 21,
    width: 21,
  },
});
