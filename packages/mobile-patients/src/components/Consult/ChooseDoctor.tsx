import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  CHOOSE_DOCTOR,
  BOOK_APPOINTMENT_TRANSFER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAvailableDoctors,
  getAvailableDoctorsVariables,
  getAvailableDoctors_getAvailableDoctors_availalbeDoctors,
} from '@aph/mobile-patients/src/graphql/types/getAvailableDoctors';
import {
  ChooseDoctorInput,
  BookTransferAppointmentInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { string } from '@aph/mobile-patients/src/strings/string';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import {
  bookTransferAppointment,
  bookTransferAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookTransferAppointment';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  headerText: {
    marginHorizontal: 20,
    marginTop: 24,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#01475b',
  },
  listView: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
  nameStyles: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    marginTop: 16,
    width: 186,
  },
  qualificationStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#0087ba',
    marginTop: 5,
    letterSpacing: 0.3,
    width: 186,
  },
  seperatorStyles: {
    marginLeft: 56,
    marginRight: 16,
    backgroundColor: '#02475b',
    opacity: 0.3,
    marginTop: 12,
    height: 1,
  },
  appointmentStyles: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    paddingLeft: 56,
    paddingTop: 11,
    paddingBottom: 16,
  },
});

export interface ChooseDoctorProps extends NavigationScreenProps {
  data: any;
}
export const ChooseDoctor: React.FC<ChooseDoctorProps> = (props) => {
  const [rowSelected, setRowSelected] = useState<number>(0);
  const [chooseDoctorResult, setChooseDoctorResult] = useState([]);
  const [deviceTokenApICalled, setDeviceTokenApICalled] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const appointmentData = props.navigation.state.params!.data;
  useEffect(() => {
    getNetStatus()
      .then((status) => {
        if (status) {
          chooseDoctor();
        } else {
          setNetworkStatus(true);
          setshowSpinner(false);
        }
      })
      .catch((e) => {
        CommonBugFender('ChooseDoctor_getNetStatus', e);
      });
  });

  const client = useApolloClient();

  const chooseDoctor = () => {
    const appointmentTransferInput: ChooseDoctorInput = {
      slotDateTime: appointmentData.transferDateTime,
      specialityId: appointmentData.specialtyId,
    };
    if (!deviceTokenApICalled) {
      setDeviceTokenApICalled(true);

      client
        .query<getAvailableDoctors, getAvailableDoctorsVariables>({
          query: CHOOSE_DOCTOR,
          variables: {
            ChooseDoctorInput: appointmentTransferInput,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data: any) => {
          setshowSpinner(false);
          data &&
            data.data &&
            data.data.getAvailableDoctors &&
            data.data.getAvailableDoctors.availalbeDoctors &&
            setChooseDoctorResult(data.data.getAvailableDoctors.availalbeDoctors);
        })
        .catch((e) => {
          CommonBugFender('ChooseDoctor_chooseDoctor', e);
          setshowSpinner(false);
        });
    }
  };

  const transferAppointmentAPI = () => {
    const appointmentTransferInput: BookTransferAppointmentInput = {
      patientId: props.navigation.state.params!.patientId,
      doctorId: appointmentData.doctorId,
      appointmentDateTime: appointmentData.transferDateTime, //appointmentDate,
      existingAppointmentId: appointmentData.appointmentId,
      transferId: appointmentData.transferId,
    };
    client
      .mutate<bookTransferAppointment, bookTransferAppointmentVariables>({
        mutation: BOOK_APPOINTMENT_TRANSFER,
        variables: {
          BookTransferAppointmentInput: appointmentTransferInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        props.navigation.push(AppRoutes.TabBar);
      })
      .catch((e) => {
        CommonBugFender('ChooseDoctor_transferAppointmentAPI', e);
      });
  };

  const renderRow = (
    rowData: getAvailableDoctors_getAvailableDoctors_availalbeDoctors,
    index: number
  ) => {
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            setRowSelected(index);
          }}
        >
          <View style={styles.listView}>
            <View style={{ flexDirection: 'row' }}>
              {rowSelected === index ? (
                <RadioButtonIcon
                  style={{ marginHorizontal: 18, marginTop: 18, width: 20, height: 20 }}
                />
              ) : (
                <RadioButtonUnselectedIcon
                  style={{ marginHorizontal: 18, marginTop: 18, width: 20, height: 20 }}
                />
              )}
              <View>
                <Text style={styles.nameStyles}>{rowData.doctorFirstName}</Text>
                <Text style={styles.qualificationStyles}>
                  {(rowData as any).specialityName} | {(rowData as any).experience} Yrs
                </Text>
              </View>
              {rowData.doctorPhoto &&
              rowData.doctorPhoto.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) ? (
                <Image
                  style={{ height: 40, width: 40, marginTop: 16, marginLeft: 35 }}
                  source={{ uri: rowData.doctorPhoto }}
                />
              ) : (
                <View
                  style={{ height: 40, width: 40, marginTop: 16, marginLeft: 35, borderRadius: 20 }}
                />
              )}
            </View>
            <View style={styles.seperatorStyles} />
            <Text style={styles.appointmentStyles}>
              {moment
                .utc(rowData.availableSlot)
                .local()
                .format('Do MMMM, dddd, hh:mm A')}
            </Text>
          </View>
        </TouchableOpacity>
        {index === chooseDoctorResult.length - 1 && <View style={{ height: 30, marginTop: 0 }} />}
      </>
    );
  };

  const renderList = () => {
    return (
      <View>
        <FlatList
          removeClippedSubviews={false}
          style={{
            marginTop: 16,
            marginBottom: 180,
          }}
          bounces={false}
          data={chooseDoctorResult}
          onEndReachedThreshold={0.1}
          renderItem={({ item, index }) => renderRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
        />
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <Header
          title={'CHOOSE DOCTOR'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => {
            CommonLogEvent(AppRoutes.ChooseDoctor, 'CHOOSE DOCTOR CLICKED');
            props.navigation.goBack();
          }}
        />
        <Text style={styles.headerText}>{string.LocalStrings.chooseDoctorHeaderText}</Text>
        {renderList()}
        <StickyBottomComponent defaultBG style={{ paddingHorizontal: 0 }}>
          <Button
            title={'CONFIRM'}
            style={{ flex: 1, marginHorizontal: 60 }}
            onPress={() => {
              CommonLogEvent(AppRoutes.ChooseDoctor, 'CONFIRM_CHOOSE_DOCTOR CLICKED');
              transferAppointmentAPI();
            }}
          />
        </StickyBottomComponent>
      </SafeAreaView>
      {networkStatus && (
        <BottomPopUp title={'Hi:)'} description="Please check you Internet connection!">
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setNetworkStatus(false);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showSpinner && <Spinner />}
    </View>
  );
};
