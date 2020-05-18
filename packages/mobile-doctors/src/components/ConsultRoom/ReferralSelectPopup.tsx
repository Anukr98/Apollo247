import { ReferralSelectPopupStyles } from '@aph/mobile-doctors/src/components/ConsultRoom/ReferralSelectPopup.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { GreenRemove, Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { OptionsObject } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const styles = ReferralSelectPopupStyles;

export interface ReferralSelectPopupProps {
  data: OptionsObject[];
  selected?: OptionsObject;
  onSelect: (item: OptionsObject) => void;
  onClose: () => void;
}

export const ReferralSelectPopup: React.FC<ReferralSelectPopupProps> = (props) => {
  const { onClose, data, onSelect, selected: selectedProps } = props;
  const [processedData, setProcessedData] = useState<OptionsObject[]>(data);
  const [searchText, setSearchText] = useState<string>(
    (selectedProps && selectedProps.value.toString()) || ''
  );
  const [selected, setSelected] = useState<OptionsObject | undefined>(selectedProps);
  useEffect(() => {
    if (selected && selected.key !== '-1') {
      setProcessedData([selected, ...processedData.filter((i) => i.key !== selected.key)]);
    } else {
      setSearchText('');
    }
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = async () => {
    onClose();
    return false;
  };

  const renderItem = (item: OptionsObject, index: number) => {
    const isSelected = selected && selected.key === item.key;
    return (
      <TouchableOpacity
        onPress={() => {
          setSelected(item);
          onSelect(item);
          setSearchText(item.value.toString());
        }}
      >
        <View
          style={[
            styles.itemContainer,
            { borderBottomWidth: index === processedData.length - 1 ? 0 : 1 },
            {
              backgroundColor: isSelected ? theme.colors.APP_YELLOW : theme.colors.blackColor(0.01),
            },
          ]}
        >
          <Text
            style={theme.viewStyles.text(
              'M',
              14,
              isSelected ? theme.colors.WHITE : theme.colors.SHARP_BLUE
            )}
          >
            {item.value}
          </Text>
          {isSelected && (
            <View style={styles.deleteContiner}>
              <TouchableOpacity
                onPress={() => {
                  setSelected(undefined);
                  setSearchText('');
                  onSelect({ key: '-1', value: strings.case_sheet.select_Speciality });
                }}
              >
                <GreenRemove />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE)}>
          No speciality matching your search
        </Text>
      </View>
    );
  };

  const onSearch = (text: string) => {
    setSearchText(text);
    setProcessedData(
      data.filter((i) =>
        i.value
          .toString()
          .toLowerCase()
          .includes(text.toLowerCase())
      )
    );
  };

  const renderSearchInput = () => {
    return (
      <View style={styles.searchTextContainerStyle}>
        <TextInput
          style={styles.textInputContainer}
          value={searchText}
          placeholder={strings.case_sheet.select_Speciality + '...'}
          selectionColor={theme.colors.INPUT_CURSOR_COLOR}
          onChange={(text) => onSearch(text.nativeEvent.text)}
          onFocus={() => {
            setSearchText('');
          }}
          onBlur={() => setSearchText((selected && selected.value.toString()) || '')}
        />
      </View>
    );
  };

  const renderButton = () => {
    return (
      <View style={styles.buttonView}>
        <Button
          title={strings.buttons.done}
          variant={'orange'}
          onPress={() => props.onClose()}
          style={styles.buttonStyle}
        />
      </View>
    );
  };
  return (
    <View style={styles.mainView}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          onClose();
        }}
      >
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
                  onClose();
                }}
                style={styles.touchableCloseIcon}
              >
                <Remove style={styles.closeIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.contentView}>
              {renderSearchInput()}
              <FlatList
                keyboardShouldPersistTaps={'always'}
                data={processedData}
                contentContainerStyle={styles.flatListContainerStyle}
                ListEmptyComponent={() => renderEmptyComponent()}
                renderItem={({ item, index }) => renderItem(item, index)}
              />
              {renderButton()}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </View>
  );
};
