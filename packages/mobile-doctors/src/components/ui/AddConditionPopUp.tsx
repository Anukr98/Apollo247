import { DiagnosisCard } from '@aph/mobile-doctors/src/components/ConsultRoom/DiagnosisCard';
import styles from '@aph/mobile-doctors/src/components/ui/AddConditionPopUp.styles.ts';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { AddPlus, DiagonisisRemove, Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
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
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

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
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{strings.consult.add_condition}</Text>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttonsView}>
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
        setSearchData([]);
        client
          .query<searchDiagnosis, searchDiagnosisVariables>({
            query: SEARCH_DIAGNOSIS,
            variables: { searchString: searchVal },
          })
          .then((data) => {
            const diagnosisData: (searchDiagnosis_searchDiagnosis | null)[] = [];
            const apiData = data.data.searchDiagnosis || [];
            if (
              apiData.findIndex(
                (i) => i && i.name && i.name.toLowerCase() === searchVal.toLowerCase()
              ) === -1
            ) {
              diagnosisData.push({ name: searchVal, id: '' } as searchDiagnosis_searchDiagnosis);
            }
            diagnosisData.push(...apiData);
            setSearchData(diagnosisData.filter((i) => i !== null));
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
      <View style={styles.searchListView}>
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
                style={[
                  styles.nameView,
                  { borderBottomWidth: index === searchData.length - 1 ? 0 : 1 },
                ]}
              >
                <Text style={styles.nameText}>{i && i.name}</Text>
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
      <View style={styles.selectedList}>
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
      <View style={styles.inputView}>
        <TextInput
          placeholder={strings.consult.search_condition}
          textAlignVertical={'top'}
          placeholderTextColor={theme.colors.placeholderTextColor}
          style={styles.textInputstyle}
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
    <View style={styles.mainView}>
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
              style={styles.touchableStyle}
            >
              <Remove style={styles.removeStyle} />
            </TouchableOpacity>
          </View>
          <View style={styles.dataView}>
            {renderHeader()}
            {renderInput()}
            {renderButtons()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
