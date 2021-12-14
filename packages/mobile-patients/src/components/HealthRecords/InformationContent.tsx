import React, { useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { colors } from '@aph/mobile-patients/src/theme/colors';

export interface InformativeContentProps extends NavigationScreenProps {}

const styles = StyleSheet.create({
  collapseCardLabelViewStyle: {
    marginTop: 20,
    marginLeft: 20,
    // marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginBottom: 15,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 29,
  },
  descriptionStyle: {
    color: '#01475B',
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansRegular(12),
  },
  profileImage: {
    height: 200,
    marginTop: 20,
    borderRadius: 5,
    marginBottom: 20,
    left: 5,
    // resizeMode: 'conta',
  },
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  description: {
    ...viewStyles.text('R', 13, '#01475B', 1, 23),
    left: 20,
    width: '90%',
    top: 20,
  },
  titleDesc: {
    ...viewStyles.text('SB', 18, '#01475B', 1, 23),
    left: 20,
  },
  dropDown: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#F8F8F8',
    marginHorizontal: 8,
    marginTop: 10,
  },
});

export const InformativeContent: React.FC<InformativeContentProps> = (props) => {
  const relatedFAQ = props.navigation.state.params ? props.navigation.state.params.relatedFAQ : [];
  const desc = props.navigation.state.params ? props.navigation.state.params.desc : null;
  const title = props.navigation.state.params ? props.navigation.state.params.title : null;
  const onGoBack = () => {
    props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };

  const renderHeader = () => {
    return (
      <Header
        title={'INFORMATION CONTENT'}
        leftIcon={'backArrow'}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={onGoBack}
      />
    );
  };

  const renderTopTitleView = () => {
    return (
      <View style={{ marginTop: 80, bottom: 30 }}>
        <Text numberOfLines={2} style={styles.titleDesc}>
          {title || ''}
        </Text>
        <Text style={styles.description}>{desc || ''}</Text>
      </View>
    );
  };

  const renderHospitalizationData = () => {
    return relatedFAQ?.map((item: any) => {
      const [showContent, setShowContent] = useState<boolean>(false);
      return (
        <View>
          {item.faqQuestion ? (
            <CollapseCard
              heading={item.faqQuestion}
              collapse={showContent}
              containerStyle={!showContent && styles.dropDown}
              headingStyle={{ ...viewStyles.text('SB', 14, '#01475B', 1, 23) }}
              labelViewStyle={styles.collapseCardLabelViewStyle}
              onPress={() => setShowContent(!showContent)}
            >
              <View
                style={[
                  styles.cardViewStyle,
                  {
                    paddingBottom: 12,
                    paddingTop: 12,
                  },
                ]}
              >
                {!!item.faqImg ? (
                  <Image
                    style={styles.profileImage}
                    source={{
                      uri: item.faqImg,
                    }}
                    resizeMode={'contain'}
                  />
                ) : null}

                <Text style={styles.descriptionStyle}>{item.faqAnswer}</Text>
              </View>
            </CollapseCard>
          ) : null}
        </View>
      );
    });
  };

  const renderHospitalizationMainView = () => {
    return (
      <>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderTopTitleView()}
          {renderHospitalizationData()}
        </ScrollView>
      </>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderHospitalizationMainView()}
      </SafeAreaView>
    </View>
  );
};
