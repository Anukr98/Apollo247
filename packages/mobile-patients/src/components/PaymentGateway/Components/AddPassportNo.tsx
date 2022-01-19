import React from 'react';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
const windowWidth = Dimensions.get('window').width;

export interface AddPassportNoProps {
  passportNo: any;
  onPressAdd: () => void;
  ordersList: any;
}

export const AddPassportNo: React.FC<AddPassportNoProps> = (props) => {
  const { passportNo, onPressAdd, ordersList } = props;

  let tests = ordersList?.map((obj: any) => {
    const itemObjArr = obj?.diagnosticOrderLineItems?.filter((_item: any) => {
      if (AppConfig.Configuration.DIAGNOSTICS_COVID_ITEM_IDS.includes(_item?.itemId)) {
        return _item;
      }
    });
    return itemObjArr;
  });
  tests = tests?.filter((item: any) => {
    return item?.length != 0;
  });

  const renderAddPassportNumber = () => {
    return (
      <View style={styles.subCont}>
        <Text style={styles.addPassport}>
          {passportNo?.length
            ? string.diagnostics.editpassportText
            : string.diagnostics.addOrEditPassportText}
        </Text>
        <TouchableOpacity onPress={onPressAdd}>
          <Text style={styles.add}>{passportNo?.length ? 'EDIT' : 'ADD'}</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return tests?.length && ordersList?.length && tests?.length == ordersList?.length ? (
    <View style={styles.container}>{renderAddPassportNumber()}</View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  subCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addPassport: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1),
  },
  add: {
    ...theme.viewStyles.text('SB', 14, '#FC9916'),
  },
});
