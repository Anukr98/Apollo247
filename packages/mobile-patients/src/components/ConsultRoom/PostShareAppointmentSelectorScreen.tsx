import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import moment from 'moment';

import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';

import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationEvents, NavigationScreenProps } from 'react-navigation';
import { DoctorPlaceholderImage } from '@aph/mobile-patients/src/components/ui/Icons';
import { g, storagePermissions } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  getPatientAllAppointments,
  getPatientAllAppointmentsVariables,
  getPatientAllAppointments_getPatientAllAppointments_activeAppointments,
} from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import { GET_PATIENT_ACTIVE_FOLLOWUP_APPOINTMENTS } from '@aph/mobile-patients/src/graphql/profiles';
const { width, height } = Dimensions.get('window');
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { renderPostShareAppointmentLoadingShimmer } from '../ui/ShimmerFactory';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

const styles = StyleSheet.create({
  nameTextContainerStyle: {
    flex: 1,
  },
  selectAppointments: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(16),
    marginHorizontal: 16,
    marginVertical: 10,
  },

  appointmentListContainer: {
    flex: 1,
    width: '100%',
  },
  appointmentItemCardContainer: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 7,
    marginHorizontal: 16,
    marginBottom: 7,
  },

  doctorName: {
    ...theme.viewStyles.text('M', 18, '#000'),
  },
  department: {
    ...theme.viewStyles.text('M', 12, theme.colors.SKY_BLUE),
    textTransform: 'capitalize',
  },
  patientname: {
    marginTop: 7,
    ...theme.viewStyles.text('R', 12, theme.colors.SKY_BLUE),
  },
  consultationType: {
    ...theme.viewStyles.text('R', 14, '#A8A9A4'),
    textTransform: 'capitalize',
    marginTop: 7,
  },
  datAndTime: {
    ...theme.viewStyles.text('M', 14, '#000'),
  },
  doctorProfileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
});

export interface PostShareAppointmentSelectorScreenProps extends NavigationScreenProps {}

export const PostShareAppointmentSelectorScreen: React.FC<PostShareAppointmentSelectorScreenProps> = (
  props
) => {
  const flatListRef = useRef<FlatList<any> | undefined | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [appointmentList, setAppointmentList] = useState<any>([]);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const sharedFiles = props.navigation.getParam('sharedFiles');

  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title={'SEND TO'}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      let userId = await AsyncStorage.getItem('selectedProfileId');

      userId = JSON.parse(userId || 'null');

      //console.log('check patient --', currentPatient);

      const { data } = await client.query<
        getPatientAllAppointments,
        getPatientAllAppointmentsVariables
      >({
        query: GET_PATIENT_ACTIVE_FOLLOWUP_APPOINTMENTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: '',
          patientMobile: currentPatient?.mobileNumber,
          offset: 0,
          limit: 100,
        },
      });

      const activeAppointments = data?.getPatientAllAppointments?.activeAppointments;
      const followUpAppointments = data?.getPatientAllAppointments?.followUpAppointments;

      const sharableAttachmentAppointment = [...activeAppointments, ...followUpAppointments];

      if (!sharableAttachmentAppointment || sharableAttachmentAppointment.length == 0) {
        showAphAlert!({
          title: 'Uh oh! :(',
          description: 'No appointment details to show .',
        });
      }

      sharableAttachmentAppointment.sort((apnmt1: any, apnmt2: any) => {
        return moment.utc(apnmt2.appointmentDateTime).diff(moment.utc(apnmt1.appointmentDateTime));
      });

      setAppointmentList(sharableAttachmentAppointment);
    } catch (error) {
      showAphAlert!({
        title: 'Uh oh! :(',
        description: "Couldn't load appointment details.",
      });
    } finally {
      setLoading(false);
    }
  };

  function renderAppointmentListItem(item: any, index: number) {
    return (
      <TouchableOpacity
        style={styles.appointmentItemCardContainer}
        onPress={() => {
          if (Platform.OS === 'android') {
            storagePermissions(() => {
              openOnlineAppointmentChatScreen(item);
            });
          } else {
            openOnlineAppointmentChatScreen(item);
          }
          ReceiveSharingIntent.clearReceivedFiles();
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {item?.doctorInfo?.thumbnailUrl ? (
            <Image
              resizeMode="cover"
              source={{ uri: item?.doctorInfo?.thumbnailUrl }}
              style={styles.doctorProfileIcon}
            />
          ) : (
            <DoctorPlaceholderImage style={styles.doctorProfileIcon} />
          )}

          <View>
            <Text style={styles.doctorName}>{item?.doctorInfo?.displayName}</Text>
            <Text style={styles.department}>
              {item?.doctorInfo?.specialty?.specialistSingularTerm}
            </Text>
            <Text style={styles.consultationType}>{item?.appointmentType}</Text>
            <Text style={styles.datAndTime}>
              {moment(item?.bookingDate).format('DD MMM YYYY, hh:mm A')}
            </Text>

            <Text style={styles.patientname}>{item?.patientName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const openOnlineAppointmentChatScreen = (item: any) => {
    if (item.appointmentType === 'ONLINE') {
      props.navigation.goBack();

      props.navigation.navigate(AppRoutes.ChatRoom, {
        data: item,
        callType: '',
        prescription: '',
        sharedFilesList: sharedFiles,
      });
    } else {
      showAphAlert!({
        title: 'Uh oh! :(',
        description: 'You can only share files with online appointments',
      });
    }
  };

  const renderAppointmentList = () => {
    return (
      <View style={styles.appointmentListContainer}>
        <FlatList
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          ref={(ref) => (flatListRef.current = ref)}
          data={appointmentList || []}
          renderItem={({ item, index }) => renderAppointmentListItem(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={appointmentList ? appointmentList.length : 0}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderHeader()}

      <Text style={styles.selectAppointments}>Select appointments </Text>

      {loading ? renderPostShareAppointmentLoadingShimmer() : renderAppointmentList()}
    </SafeAreaView>
  );
};
