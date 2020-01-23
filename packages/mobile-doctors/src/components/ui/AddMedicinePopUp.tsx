import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Text,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { Remove, BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export interface AddMedicinePopUpProps {
  onClose: () => void;
}

export const AddMedicinePopUp: React.FC<AddMedicinePopUpProps> = (props) => {
  const { width, height } = Dimensions.get('window');
  const [medicineSelected, setMedicineSelected] = useState<string>('enriufvbefsiudbn');
  const [medSearchText, setMedSearchText] = useState<string>('');
  const renderHeader = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.cardContainer,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            width: width - 60,
            flexDirection: 'row',
          },
        ]}
      >
        {medicineSelected ? (
          <TouchableOpacity
            onPress={() => {
              setMedicineSelected('');
            }}
            style={{ left: 16, position: 'absolute' }}
          >
            <BackArrow style={{ width: 24, height: 15 }} />
          </TouchableOpacity>
        ) : null}
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
            marginLeft: medicineSelected ? 60 : 20,
            marginRight: 20,
          }}
        >
          {medicineSelected || 'ADD MEDICINE'}
        </Text>
      </View>
    );
  };

  const renderMedicineDetails = () => {
    return (
      <View>
        <Text>{'hiosf'}</Text>
      </View>
    );
  };

  const renderMedicineSearchList = () => {
    return (
      <View style={{ margin: 20 }}>
        <TextInput
          autoFocus
          style={{
            ...theme.fonts.IBMPlexSansMedium(18),
            width: '90%',
            color: '#01475b',
            paddingBottom: 4,
            borderBottomWidth: 2,
            borderColor: theme.colors.APP_GREEN,
          }}
          placeholder="Search Medicine"
          placeholderTextColor="rgba(1, 71, 91, 0.3)"
          value={medSearchText}
          selectionColor={Platform.OS === 'ios' ? theme.colors.BLACK : ''}
          onChange={(text) => setMedSearchText(text.nativeEvent.text.replace(/\\/g, ''))}
        />
      </View>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 5,
        elevation: 500,
      }}
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
            style={{
              marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 50,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: 0,
              marginBottom: 8,
            }}
          >
            <Remove style={{ width: 28, height: 28 }} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            ...theme.viewStyles.cardContainer,
            backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            borderRadius: 10,
            maxHeight: '85%',
          }}
        >
          {renderHeader()}
          <ScrollView bounces={false}>
            {medicineSelected ? renderMedicineDetails() : renderMedicineSearchList()}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
