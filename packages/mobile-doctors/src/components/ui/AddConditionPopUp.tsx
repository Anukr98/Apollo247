import { DiagnosisCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosisCard';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { AddPlus, DiagonisisRemove, Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SEARCH_DIAGNOSIS } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import {
  searchDiagnosis,
  searchDiagnosisVariables,
  searchDiagnosis_searchDiagnosis,
} from '@aph/mobile-doctors/src/graphql/types/searchDiagnosis';
import { isValidSearch } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { width } = Dimensions.get('window');

export interface AddConditionPopUpProps {
  onClose: () => void;
  data?: string;
  onDone?: (value: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[]) => void;
}
export const AddConditionPopUp: React.FC<AddConditionPopUpProps> = (props) => {
  const [value, setValue] = useState<GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchData, setSearchData] = useState<(searchDiagnosis_searchDiagnosis | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const client = useApolloClient();

  const handleBack = async () => {
    props.onClose();
    return false;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

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
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          {strings.consult.add_condition}
        </Text>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View
        style={[
          theme.viewStyles.cardContainer,
          {
            width: '100%',
            flexDirection: 'row',
            padding: 16,
            borderBottomEndRadius: 10,
            borderBottomStartRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Button
          title={strings.buttons.done}
          onPress={() => {
            props.onDone && props.onDone(value);
            props.onClose();
          }}
          style={{ width: (width - 110) / 2 }}
        />
      </View>
    );
  };

  const searchDiagnosis = (searchVal: string) => {
    if (isValidSearch(searchText)) {
      setSearchText(searchVal);
      if (searchVal.length > 2) {
        setLoading(true);
        client
          .query<searchDiagnosis, searchDiagnosisVariables>({
            query: SEARCH_DIAGNOSIS,
            variables: { searchString: searchVal },
          })
          .then((data) => {
            data.data.searchDiagnosis &&
              setSearchData(data.data.searchDiagnosis.filter((i) => i !== null));
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setSearchData([]);
      }
    }
  };

  const renderSearchList = () => {
    return (
      <View
        style={[
          theme.viewStyles.whiteRoundedCornerCard,
          { elevation: 30, shadowRadius: 6, shadowOpacity: 1, maxHeight: '70%' },
        ]}
      >
        <ScrollView bounces={false}>
          {searchData.map((i, index) => (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setSearchText('');
                setSearchData([]);
                if (value.findIndex((s) => s.name === (i && i.name)) < 0) {
                  setValue(
                    [
                      ...value,
                      {
                        name: (i && i.name) || '',
                      } as GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
                    ].filter((i) => i.name !== '')
                  );
                }
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 16,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderBottomWidth: index === searchData.length - 1 ? 0 : 1,
                  borderColor: theme.colors.SEPARATOR_LINE,
                }}
              >
                <Text
                  style={{
                    flex: 0.98,
                    ...theme.viewStyles.text('M', 16, theme.colors.darkBlueColor(1)),
                  }}
                >
                  {i && i.name}
                </Text>
                <AddPlus />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  const renderSelectedList = () => {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {value.map(
          (i) =>
            i.name && (
              <DiagnosisCard
                diseaseName={i.name}
                onPressIcon={() => {
                  setValue(value.filter((val) => val.name !== i.name));
                }}
                icon={<DiagonisisRemove />}
              />
            )
        )}
      </View>
    );
  };
  const renderInput = () => {
    return (
      <View
        style={[theme.viewStyles.cardContainer, { marginTop: 20, marginBottom: 20, padding: 16 }]}
      >
        <TextInput
          placeholder={strings.consult.search_condition}
          textAlignVertical={'top'}
          placeholderTextColor={theme.colors.placeholderTextColor}
          style={{
            ...theme.fonts.IBMPlexSansMedium(18),
            width: '100%',
            color: '#01475b',
            paddingBottom: 4,
            borderBottomWidth: 2,
            borderColor: theme.colors.APP_GREEN,
          }}
          value={searchText}
          onChangeText={(value) => searchDiagnosis(value)}
        />
        {loading && (
          <ActivityIndicator
            animating={true}
            size="large"
            color="green"
            style={{ paddingTop: 20 }}
          />
        )}
        {searchData.length > 0 ? renderSearchList() : renderSelectedList()}
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
            {renderInput()}
            {renderButtons()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
