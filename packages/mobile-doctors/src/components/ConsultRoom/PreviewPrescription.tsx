import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { GET_CASESHEET_DETAILS } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetCaseSheetDetails,
  GetCaseSheetDetails_getCaseSheet_caseSheetDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheetDetails';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { NavigationScreenProps } from 'react-navigation';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({});

export interface PreviewPrescriptionProps
  extends NavigationScreenProps<{
    id: string;
  }> {}

export const PreviewPrescription: React.FC<PreviewPrescriptionProps> = (props) => {
  const id = props.navigation.getParam('id');
  const { setLoading } = useUIElements();
  const client = useApolloClient();
  const [caseSheet, setcaseSheet] = useState<
    GetCaseSheetDetails_getCaseSheet_caseSheetDetails | null | undefined
  >();

  useEffect(() => {
    getCaseSheetAPI();
  }, []);

  const getCaseSheetAPI = () => {
    setLoading && setLoading(true);
    client
      .query<GetCaseSheetDetails>({
        query: GET_CASESHEET_DETAILS,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: id },
      })
      .then((_data) => {
        const caseSheet = g(_data, 'data', 'getCaseSheet', 'caseSheetDetails');
        console.log(caseSheet, 'caseSheet');
        setcaseSheet(caseSheet);
        setLoading && setLoading(false);
      })
      .catch((e) => {
        setLoading && setLoading(false);
      });
  };

  const renderHeader = () => {
    return (
      <Header
        containerStyle={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        headerText={'Prescription'}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  return (
    <SafeAreaView>
      {renderHeader()}
      {caseSheet && caseSheet.blobName ? (
        <Pdf
          key={`${AppConfig.Configuration.DOCUMENT_BASE_URL}${caseSheet.blobName}`}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`number of pages: ${numberOfPages}, fb:${filePath}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          source={{ uri: `${AppConfig.Configuration.DOCUMENT_BASE_URL}${caseSheet.blobName}` }}
          style={{
            marginTop: 6,
            marginHorizontal: 14,
            width: width - 40,
            height: Platform.OS === 'ios' ? height - 165 : height - 175,
            // : height - 100,
            backgroundColor: 'transparent',
          }}
        />
      ) : null}
      {caseSheet && caseSheet.sentToPatient && (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
          <Text style={theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE)}>
            PRESCRIPTION SENT
          </Text>
        </View>
      )
      // : (
      // <View style={styles.footerButtonsContainer}>
      //   <Button
      //     onPress={() => {
      //       // props.setCaseSheetEdit(true);
      //       // setShowEditPreviewButtons(true);
      //       // props.navigation.navigate(AppRoutes.ConsultRoomScreen)
      //     }}
      //     title={'EDIT CASE SHEET'}
      //     titleTextStyle={styles.buttonTextStyle}
      //     variant="white"
      //     style={[styles.buttonsaveStyle, { marginRight: 16 }]}
      //   />
      //   <Button
      //     title={'SEND TO PATIENT'}
      //     onPress={() => {
      //       // sendToPatientAction();
      //     }}
      //     style={styles.buttonendStyle}
      //   />
      // </View>
      // )
      }
    </SafeAreaView>
  );
};
