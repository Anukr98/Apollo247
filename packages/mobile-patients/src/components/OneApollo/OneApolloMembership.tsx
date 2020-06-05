import React, { useEffect, useState } from 'react';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationActions, NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { OneApollo, CreditsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MyMembership } from './MyMembership';
import { MyTransactions } from './MyTransactions';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_ONEAPOLLO_USER } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { requiredSubselectionMessage } from 'graphql/validation/rules/ScalarLeafs';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface OneApolloProps extends NavigationScreenProps {}

export const OneApolloMembership: React.FC<OneApolloProps> = (props) => {
  const [name, setName] = useState<String>('user');
  const [tier, settier] = useState<String>('Silver');
  const [credits, setCredits] = useState(0);
  const [screen, setScreen] = useState<String>('MyMembership');
  const [earned, setEarned] = useState(0);
  const [redeemed, setRedeemed] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert } = useUIElements();

  const tierData: any = {
    Gold: {
      image: require('../ui/icons/gold.png'),
      title: 'Gold Member',
    },
    Silver: {
      image: require('../ui/icons/silver.png'),
      title: 'Silver Member',
    },
    Platinum: {
      image: require('../ui/icons/platinum.png'),
      title: 'Platinum Member',
    },
  };

  useEffect(() => {
    client
      .query({
        query: GET_ONEAPOLLO_USER,
        variables: {
          patientId: currentPatient && currentPatient.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        setLoading(false);
        console.log(res.data.getOneApolloUser);
        setName(res.data.getOneApolloUser.name);
        setCredits(res.data.getOneApolloUser.availableHC);
        settier(res.data.getOneApolloUser.tier);
        setEarned(res.data.getOneApolloUser.earnedHC);
        setRedeemed(res.data.getOneApolloUser.earnedHC - res.data.getOneApolloUser.availableHC);
      })
      .catch((error) => {
        setLoading(false);
        CommonBugFender('fetchingOneApolloUser', error);
        console.log(error);
        renderErrorPopup(`Something went wrong, plaease try again after sometime`);
      });
  }, []);

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const renderHeader = () => {
    return (
      <Header
        leftIcon={'backArrow'}
        title={'ONEAPOLLO MEMBERSHIP'}
        onPressLeftIcon={() => {
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderMembershipinfo = () => {
    return (
      <View style={styles.membershipinfo}>
        <View style={{ flex: 0.25, justifyContent: 'center' }}>
          <OneApollo style={{ height: 0.1 * windowWidth, width: 0.13 * windowWidth }} />
        </View>
        <View style={{ flex: 0.75, justifyContent: 'center' }}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.tierText}>{tierData[`${tier}`].title}</Text>
        </View>
      </View>
    );
  };

  const renderCreditsCard = () => {
    return (
      <View style={styles.creditsCard}>
        <View style={{ flex: 0.25, justifyContent: 'center', alignItems: 'center' }}>
          <CreditsIcon style={{ height: 32, width: 41 }} />
        </View>
        <View style={{ flex: 0.75, alignItems: 'center', flexDirection: 'row' }}>
          <Text style={styles.creditText}>Available HC</Text>
          <Text style={styles.credits}>{credits}</Text>
        </View>
      </View>
    );
  };

  const renderMembershipCard = () => {
    return (
      <View style={styles.membership}>
        <ImageBackground
          source={tierData[`${tier}`].image}
          style={styles.backgroundImage}
          imageStyle={{ borderRadius: 10 }}
        >
          {renderMembershipinfo()}
          {renderCreditsCard()}
        </ImageBackground>
      </View>
    );
  };

  const renderOneApolloHeader = () => {
    return (
      <View style={styles.oneApolloHeader}>
        <TouchableOpacity
          style={{
            ...styles.headerContainer,
            borderBottomColor:
              screen == 'MyMembership' ? theme.colors.SEARCH_UNDERLINE_COLOR : '#f7f8f5',
          }}
          onPress={() => {
            setScreen('MyMembership');
          }}
        >
          <Text
            style={{
              ...styles.headerText,
              color: screen == 'MyMembership' ? theme.colors.LIGHT_BLUE : 'rgba(1,28,36,0.6)',
            }}
          >
            My Membership{' '}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.headerContainer,
            borderBottomColor:
              screen == 'MyTransactions' ? theme.colors.SEARCH_UNDERLINE_COLOR : '#f7f8f5',
          }}
          onPress={() => {
            setScreen('MyTransactions');
          }}
        >
          <Text
            style={{
              ...styles.headerText,
              color: screen == 'MyTransactions' ? theme.colors.LIGHT_BLUE : 'rgba(1,28,36,0.6)',
            }}
          >
            My Transactions
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderScreen = () => {
    switch (screen) {
      case 'MyMembership':
        return <MyMembership tier={tier} />;
        break;
      case 'MyTransactions':
        return <MyTransactions earned={earned} redeemed={redeemed} />;
        break;
    }
  };

  return (
    <SafeAreaView style={{ ...theme.viewStyles.container, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderMembershipCard()}
        {renderOneApolloHeader()}
        {renderScreen()}
      </ScrollView>
      {loading && <Spinner />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  membership: {
    height: 0.62 * windowWidth,
    paddingTop: 0.04 * windowWidth,
    alignItems: 'center',
  },
  backgroundImage: {
    height: 0.46 * windowWidth,
    width: 0.9 * windowWidth,
    alignItems: 'center',
  },
  membershipinfo: {
    height: 0.16 * windowWidth,
    width: 0.7 * windowWidth,
    flexDirection: 'row',
    marginTop: 0.11 * windowWidth,
  },
  creditsCard: {
    height: 0.14 * windowWidth,
    width: 0.6 * windowWidth,
    marginTop: 0.12 * windowWidth,
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  oneApolloHeader: {
    height: 0.08 * windowHeight,
    backgroundColor: '#f7f8f5',
    flexDirection: 'row',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  nameText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 24,
  },
  tierText: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: '#525252',
    lineHeight: 24,
  },
  creditText: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 24,
    marginRight: 25,
  },
  credits: {
    ...theme.fonts.IBMPlexSansMedium(19),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 24,
  },
  headerText: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 24,
  },
  headerContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
  },
});
