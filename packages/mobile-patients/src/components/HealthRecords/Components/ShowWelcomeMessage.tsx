import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ClinicalDoc, StarClinicalDocument } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, BackHandler, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    ...theme.viewStyles.container,
  },
  mainViewStyle: {
    flex: 1,
  },
  subViewStyle: {
    marginTop: 80,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
  },
  welcomeContentView: {
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  commonView: {
    marginTop: 50,
    flexDirection: 'row',
    padding: 20,
    right: 15,
  },
  titleText: {
    ...theme.viewStyles.text('B', 16, theme.colors.BLACK_COLOR, 1, 21),
    bottom: 2,
  },
});

export interface ShowWelcomeMessageProps extends NavigationScreenProps {}

export const ShowWelcomeMessage: React.FC<ShowWelcomeMessageProps> = (props) => {
  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    onGoBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const renderTopDetailsView = () => {
    return (
      <View style={styles.subViewStyle}>
        <View style={styles.welcomeContentView}>
          <Text style={{ ...theme.viewStyles.text('B', 22, theme.colors.BLACK_COLOR, 1, 21) }}>
            Welcome to
          </Text>
          <Text style={{ ...theme.viewStyles.text('B', 22, theme.colors.SKY_BLUE, 1, 21) }}>
            Clinical Documents
          </Text>
        </View>
        <View style={styles.commonView}>
          <StarClinicalDocument size="md" style={{ right: 15 }} />
          <View>
            <Text style={styles.titleText}>All-New Design</Text>
            <Text
              numberOfLines={2}
              style={{
                ...theme.viewStyles.text('R', 14, theme.colors.BLACK_COLOR, 1, 21),
              }}
            >
              Easy access to uploaded documents linked to your number
            </Text>
          </View>
        </View>
        <View style={[styles.commonView, { marginTop: 20 }]}>
          <ClinicalDoc size="md" style={{ right: 15 }} />
          <View>
            <Text style={styles.titleText}>Smart scan capability</Text>
            <Text
              numberOfLines={4}
              style={{ ...theme.viewStyles.text('R', 14, theme.colors.BLACK_COLOR, 1, 21) }}
            >
              Find your document auto-digitised as well as stored in the relevant PHR section
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const onGoBack = () => {
    props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };

  const renderUploadedImages = () => {
    return (
      <View style={{ position: 'absolute', bottom: 70, alignSelf: 'center' }}>
        <Button
          style={{ width: '100%' }}
          title={'ADD DOCUMENT'}
          onPress={() => {
            props.navigation.navigate(AppRoutes.ClinicalDocumentPreview);
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          title={'CLINICAL DOCUMENTS'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
        {renderTopDetailsView()}
        {renderUploadedImages()}
      </SafeAreaView>
    </View>
  );
  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
      </SafeAreaView>
    </View>
  );
};
