import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  GET_DOCTOR_DETAILS_BY_ID,
  GET_AVAILABLE_SLOTS,
  GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  setWebEngageScreenNames,
  g,
  getUserType,
  postWebEngageEvent,
  generateTimeSlots,
  timeTo12HrFormat,
  postWEGPatientAPIError,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getDoctorDetailsById,
  getDoctorDetailsByIdVariables,
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import moment from 'moment';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  DoctorPlaceholderImage,
  HospitalPhrIcon,
  VideoActiveIcon,
  HospitalPhrSearchIcon,
  Online,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  renderDoctorDetailsShimmer,
  renderDateSlotsShimmer,
  renderTotalSlotsShimmer,
  renderSlotItemShimmer,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
const { width } = Dimensions.get('window');
const tabWidth = width / 4;
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  getDoctorAvailableSlots,
  getDoctorAvailableSlots_getDoctorAvailableSlots_slotCounts,
} from '@aph/mobile-patients/src/graphql/types/getDoctorAvailableSlots';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  getDoctorPhysicalAvailableSlots,
  getDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots_slotCounts,
} from '@aph/mobile-patients/src/graphql/types/getDoctorPhysicalAvailableSlots';
import {
  DoctorType,
  ConsultMode,
  BookAppointmentInput,
  APPOINTMENT_TYPE,
  BOOKINGSOURCE,
  DEVICETYPE,
  PLAN,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { WhatsAppStatus } from '@aph/mobile-patients/src/components/ui/WhatsAppStatus';
import {
  calculateCircleDoctorPricing,
  isPhysicalConsultation,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

interface SlotSelectionProps extends NavigationScreenProps {
  doctorId: string;
  isCircleDoctor?: boolean;
  consultModeSelected: string;
}

type TimeArray = {
  label: string;
  time: string[];
}[];

type SlotsType = {
  date: string;
  count: number;
};

export const SlotSelection: React.FC<SlotSelectionProps> = (props) => {
  const doctorId = props.navigation.getParam('doctorId');
  const client = useApolloClient();
  const isCircleDoctor = props.navigation.getParam('isCircleDoctor');
  const { showAphAlert } = useUIElements();
  const [doctorDetails, setDoctorDetails] = useState<getDoctorDetailsById_getDoctorDetailsById>();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [isSlotDateSelected, setIsSlotDateSelected] = useState<boolean>(false);
  const consultOnlineTab = string.consultModeTab.VIDEO_CONSULT;
  const consultPhysicalTab = string.consultModeTab.HOSPITAL_VISIT;
  const consultedWithDoctorBefore = props.navigation.getParam('consultedWithDoctorBefore');
  const callSaveSearch = props.navigation.getParam('callSaveSearch');

  const bothConsultTabs = [
    {
      title: consultOnlineTab,
      selectedIcon: <VideoActiveIcon style={styles.videoConsultIcon} />,
      unselectedIcon: <Online style={styles.videoConsultIcon} />,
    },
    {
      title: consultPhysicalTab,
      selectedIcon: <HospitalPhrIcon style={styles.hospitalVisitIcon} />,
      unselectedIcon: <HospitalPhrSearchIcon style={styles.hospitalVisitIcon} />,
    },
  ];

  const onlineConsultTab = [
    {
      title: consultOnlineTab,
      selectedIcon: <VideoActiveIcon style={styles.videoConsultIcon} />,
      unselectedIcon: <Online style={styles.videoConsultIcon} />,
    },
  ];

  const physicalConsultTab = [
    {
      title: consultPhysicalTab,
      selectedIcon: <HospitalPhrIcon style={styles.hospitalVisitIcon} />,
      unselectedIcon: <HospitalPhrSearchIcon style={styles.hospitalVisitIcon} />,
    },
  ];

  const isOnline = doctorDetails?.availableModes?.filter(
    (consultMode: ConsultMode) => consultMode === ConsultMode.ONLINE
  );
  const isPhysical = doctorDetails?.availableModes?.filter(
    (consultMode: ConsultMode) => consultMode === ConsultMode.PHYSICAL
  );
  const isBoth = doctorDetails?.availableModes?.filter(
    (consultMode: ConsultMode) => consultMode === ConsultMode.BOTH
  );

  const consultTabs =
    doctorDetails?.doctorType !== DoctorType.PAYROLL
      ? isBoth?.length > 0
        ? bothConsultTabs
        : isOnline?.length > 0
        ? onlineConsultTab
        : isPhysical
        ? physicalConsultTab
        : onlineConsultTab
      : onlineConsultTab;

  const defaultTimeData = [
    { label: '12 AM - 6 AM', time: [] },
    { label: '6 AM - 12 PM', time: [] },
    { label: '12 PM - 6 PM', time: [] },
    { label: '6 PM - 12 AM', time: [] },
  ];

  const [selectedTab, setSelectedTab] = useState<string>(
    props.navigation.getParam('consultModeSelected') === consultPhysicalTab
      ? consultPhysicalTab
      : consultOnlineTab
  );
  const [datesSlots, setDatesSlots] = useState<SlotsType[]>();
  const [totalSlots, setTotalSlots] = useState<number>(-1);
  const [timeArray, setTimeArray] = useState<TimeArray>(defaultTimeData);
  const [loadTotalSlots, setLoadTotalSlots] = useState<boolean>(true);
  const [isOnlineSelected, setIsOnlineSelected] = useState<boolean>(
    selectedTab === consultPhysicalTab ? false : true
  );
  const [nextAvailableDate, setNextAvailableDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [firstSelectedSlot, setFirstSelectedSlot] = useState<string>('');
  const [onlineSlotsCount, setOnlineSlotsCount] = useState<
    (getDoctorAvailableSlots_getDoctorAvailableSlots_slotCounts | null)[] | null
  >();
  const [physicalSlotsCount, setPhysicalSlotsCount] = useState<
    (getDoctorPhysicalAvailableSlots_getDoctorPhysicalAvailableSlots_slotCounts | null)[] | null
  >();
  const dateScrollViewRef = useRef<any>(null);
  const slotsScrollViewRef = useRef<any>(null);
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(true);
  const isOnlineConsult = selectedTab === consultOnlineTab;
  const isPhysicalConsult = isPhysicalConsultation(selectedTab);
  const circleDoctorDetails = calculateCircleDoctorPricing(
    doctorDetails,
    isOnlineConsult,
    isPhysicalConsult
  );
  const {
    onlineConsultSlashedPrice,
    onlineConsultMRPPrice,
    physicalConsultMRPPrice,
    physicalConsultSlashedPrice,
    isCircleDoctorOnSelectedConsultMode,
  } = circleDoctorDetails;
  const { circleSubscriptionId } = useShoppingCart();
  const { locationDetails } = useAppCommonData();

  const doctorFees = isOnlineSelected
    ? doctorDetails?.onlineConsultationFees
    : doctorDetails?.physicalConsultationFees;

  const actualPrice = isCircleDoctorOnSelectedConsultMode
    ? isOnlineSelected
      ? circleSubscriptionId
        ? onlineConsultSlashedPrice
        : onlineConsultMRPPrice
      : circleSubscriptionId
      ? physicalConsultSlashedPrice
      : physicalConsultMRPPrice
    : Number(doctorFees);

  useEffect(() => {
    setWebEngageScreenNames('Doctor Profile');
    fetchDoctorDetails();
    fetchNextAvailabilitySlot(selectedTab, true);
  }, []);

  useEffect(() => {
    onlineSlotsCount && nextAvailableDate && calculateNextNDates(onlineSlotsCount);
  }, [onlineSlotsCount, nextAvailableDate]);

  useEffect(() => {
    physicalSlotsCount && nextAvailableDate && calculateNextNDates(physicalSlotsCount);
  }, [physicalSlotsCount, nextAvailableDate]);

  useEffect(() => {
    if (nextAvailableDate && timeArray) {
      for (const i in timeArray) {
        if (isSlotDateSelected && timeArray?.[i]?.time?.length > 0) {
          setFirstSelectedSlot(timeArray?.[i]?.label);
          setSelectedTimeSlot(timeArray?.[i]?.time?.[0]);
          break;
        }
        if (timeArray?.[i]?.time?.includes(nextAvailableDate)) {
          setFirstSelectedSlot(timeArray?.[i]?.label);
          setSelectedTimeSlot(nextAvailableDate);
          break;
        }
      }
    }
  }, [nextAvailableDate, timeArray, isSlotDateSelected]);

  const fetchDoctorDetails = async () => {
    try {
      const res = await client.query<getDoctorDetailsById, getDoctorDetailsByIdVariables>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        variables: { id: doctorId },
        fetchPolicy: 'no-cache',
      });
      const data = res?.data?.getDoctorDetailsById;
      if (data) {
        setDoctorDetails(data);
      } else {
        showErrorPopup();
      }
    } catch (error) {
      CommonBugFender('SlotSelection_fetchDoctorDetails', error);
      showErrorPopup();
    }
  };

  const fetchNextAvailabilitySlot = async (
    consultType: string = consultTabs[0].title,
    callOnLaunch: boolean = false
  ) => {
    try {
      const todayDate = moment(new Date()).format('YYYY-MM-DD');
      const res: any = await getNextAvailableSlots(client, [doctorId] || [], todayDate);

      const slot =
        consultType === consultOnlineTab
          ? res?.data?.[0]?.availableSlot
          : res?.data?.[0]?.physicalAvailableSlot;

      if (slot) {
        const nextAvailableDate: Date = new Date(slot);
        calculateNextNDates();
        setNextAvailableDate(slot);
        consultType === consultTabs[0].title
          ? fetchOnlineTotalAvailableSlots(nextAvailableDate, callOnLaunch)
          : fetchPhysicalTotalAvailableSlots(nextAvailableDate, callOnLaunch);

        if (!callOnLaunch) {
          const checkAvailabilityDate = datesSlots?.filter(
            (date: any) =>
              moment(date?.date)
                .toDate()
                .toDateString() ===
              moment(slot)
                .toDate()
                .toDateString()
          );
          const slotsIndex = datesSlots?.indexOf(checkAvailabilityDate?.[0]);
          const dateIndex = date().isToday ? 0 : date().isTomorrow ? 1 : slotsIndex;
          setTimeout(() => {
            dateScrollViewRef && dateScrollViewRef.current.scrollToIndex({ index: dateIndex });
          }, 500);
        }
      }
    } catch (error) {
      CommonBugFender('SlotSelection_fetchNextAvailabilitySlot', error);
    }
  };

  const fetchOnlineTotalAvailableSlots = async (
    selectedDate: any,
    callOnLaunch: boolean = false
  ) => {
    try {
      const res = await client.query<getDoctorAvailableSlots>({
        query: GET_AVAILABLE_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          DoctorAvailabilityInput: {
            availableDate: moment(selectedDate).format('YYYY-MM-DD'),
            doctorId,
          },
        },
      });
      setTimeArray(defaultTimeData);
      const availableSlots = res?.data?.getDoctorAvailableSlots?.availableSlots;
      const slotCounts = res?.data?.getDoctorAvailableSlots?.slotCounts;
      callOnLaunch && setOnlineSlotsCount(slotCounts);
      if (availableSlots) {
        setTotalSlots(availableSlots?.length);
        setTimeArrayData(availableSlots, selectedDate);
      }
    } catch (error) {
      CommonBugFender('SlotSelection_fetchTotalAvailableSlots', error);
    }
  };

  const fetchPhysicalTotalAvailableSlots = async (
    selectedDate: any,
    callOnLaunch: boolean = false
  ) => {
    try {
      const res = await client.query<getDoctorPhysicalAvailableSlots>({
        query: GET_DOCTOR_PHYSICAL_AVAILABLE_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          DoctorPhysicalAvailabilityInput: {
            availableDate: moment(selectedDate).format('YYYY-MM-DD'),
            doctorId,
            facilityId: doctorDetails?.doctorHospital?.[0]?.facility?.id || '',
          },
        },
      });
      setTimeArray(defaultTimeData);
      const availableSlots = res?.data?.getDoctorPhysicalAvailableSlots?.availableSlots;
      const slotCounts = res?.data?.getDoctorPhysicalAvailableSlots?.slotCounts;
      callOnLaunch && setPhysicalSlotsCount(slotCounts);
      if (availableSlots) {
        setTotalSlots(availableSlots?.length);
        setTimeArrayData(availableSlots, selectedDate);
      }
    } catch (error) {
      console.log('SlotSelection_fetchTotalAvailableSlotsPhysical', error);
      CommonBugFender('SlotSelection_fetchTotalAvailableSlots', error);
    }
  };

  const setTimeArrayData = async (availableSlots: string[], date: Date) => {
    setLoadTotalSlots(true);
    const array = await generateTimeSlots(availableSlots, date);

    const arrayRrequired = array.filter((i) => i.time.length > 0);

    setLoadTotalSlots(false);
    setTimeArray(arrayRrequired);
  };

  const calculateNextNDates = (slotDateAndCount?: any) => {
    var today = new Date();
    var tomorrow = moment(new Date()).add(1, 'day');
    if (nextAvailableDate) {
      const dateString = moment(nextAvailableDate)
        .toDate()
        .toDateString();
      var isToday = today.toDateString() == dateString;
      const isTomorrow = tomorrow.toDate().toDateString() == dateString;
      if (isToday || isTomorrow) {
        setSelectedDateIndex(isTomorrow ? 1 : 0);
      }
    }
    if (slotDateAndCount?.length > 0) {
      const sortedData = slotDateAndCount?.sort((a: any, b: any) => {
        return new Date(a?.date) - new Date(b?.date);
      });
      let dates: any = [
        { date: 'Today', count: sortedData?.[0]?.slotCount },
        { date: 'Tomorrow', count: sortedData?.[1]?.slotCount },
      ];
      for (let i = 0; i < sortedData?.length - 2; i++) {
        dates.push({
          date: moment(new Date()).add(i + 2, 'day'),
          count: sortedData?.[i + 2]?.slotCount,
        });
      }
      const nextSlotDate = dates?.filter((date: SlotsType, index: number) => {
        if (index > 1) {
          return (
            moment(date?.date)
              .toDate()
              .toDateString() ===
            moment(nextAvailableDate)
              .toDate()
              .toDateString()
          );
        }
      });
      const dateIndex = dates
        ?.map((date: SlotsType) => {
          return date?.date;
        })
        ?.indexOf(nextSlotDate?.[0]?.date);
      if (dateIndex > -1) {
        setSelectedDateIndex(dateIndex);
        setTimeout(() => {
          dateScrollViewRef && dateScrollViewRef.current.scrollToIndex({ index: dateIndex });
        }, 500);
      }
      setDatesSlots(dates);
    }
  };

  const showErrorPopup = () => {
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: 'Something went wrong.',
    });
  };

  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title="SELECT TIME SLOT"
        container={styles.headerConatiner}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderDoctorDetails = () => {
    return (
      <View style={styles.doctorDetailsView}>
        <View style={styles.doctorDetailsContainer}>
          {renderDoctorImage()}
          <View
            style={{
              marginLeft: 16,
              width: isCircleDoctorOnSelectedConsultMode ? width - 110 : width - 95,
            }}
          >
            {renderDoctorName()}
            {renderSpecialities()}
          </View>
        </View>
        <TouchableOpacity onPress={() => navigateToDoctorProfile()}>
          <Text style={styles.viewProfile}>View Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const navigateToDoctorProfile = () => {
    callWEGEvent(WebEngageEventName.VIEW_PROFILE_SLOT_SCREEN);
    props.navigation.navigate(AppRoutes.DoctorDetails, {
      doctorId,
    });
  };

  const callWEGEvent = (eventName: WebEngageEventName, extraAttributes?: any) => {
    try {
      let eventAttributes: any = {
        'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        Relation: g(currentPatient, 'relation'),
        'Patient Age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Patient Gender': g(currentPatient, 'gender'),
        'Mobile Number': g(currentPatient, 'mobileNumber'),
        'Customer ID': g(currentPatient, 'id'),
        User_Type: getUserType(allCurrentPatients),
        'Doctor Name': doctorDetails?.fullName,
        'Doctor Id': doctorDetails?.id,
        'Doctor Speciality': doctorDetails?.specialty?.name,
      };
      if (extraAttributes) {
        eventAttributes = { ...eventAttributes, ...extraAttributes };
      }
      postWebEngageEvent(eventName, eventAttributes);
    } catch (error) {}
  };

  const renderDoctorName = () => {
    return <Text style={styles.doctorName}>{doctorDetails?.fullName}</Text>;
  };

  const renderSpecialities = () => {
    return (
      <View style={styles.specialityRow}>
        <Text style={styles.speciality}>
          {doctorDetails?.specialty?.name}
          {' | '}
          {doctorDetails?.experience} YR{Number(doctorDetails?.experience) == 1 ? '' : 'S'} Exp.
        </Text>
      </View>
    );
  };

  const renderDoctorImage = () => {
    return (
      <View>
        {isCircleDoctorOnSelectedConsultMode ? (
          <ImageBackground
            source={require('@aph/mobile-patients/src/components/ui/icons/doctor_ring.webp')}
            style={styles.drImageBackground}
            resizeMode="cover"
          >
            {renderDoctorProfile()}
          </ImageBackground>
        ) : (
          <View>{renderDoctorProfile()}</View>
        )}
      </View>
    );
  };

  const renderDoctorProfile = () => {
    return (
      <View style={{ marginLeft: isCircleDoctorOnSelectedConsultMode ? 3.5 : 0 }}>
        {!!g(doctorDetails, 'photoUrl') ? (
          <Image
            style={styles.doctorProfile}
            source={{
              uri: doctorDetails?.photoUrl!,
            }}
            resizeMode="cover"
          />
        ) : (
          <DoctorPlaceholderImage style={styles.doctorProfile} />
        )}
      </View>
    );
  };
  const renderConsultTypeTabs = () => {
    return (
      <TabsComponent
        style={{ backgroundColor: 'white' }}
        data={consultTabs}
        onChange={(tab: string) => {
          setSelectedTab(tab);
          setIsOnlineSelected(tab === consultOnlineTab);
          if (tab !== selectedTab) {
            setTotalSlots(-1);
            setLoadTotalSlots(true);
            fetchNextAvailabilitySlot(tab);
          }
        }}
        selectedTab={selectedTab}
        showTitleAndIcons={true}
      />
    );
  };

  const renderSlotsDates = () => {
    return (
      <FlatList
        data={datesSlots}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item, index }) => renderSlotsDatesItems(item, index)}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        ref={dateScrollViewRef}
      />
    );
  };

  const renderSlotsDatesItems = (item: SlotsType, index: number) => {
    const textColor =
      index === selectedDateIndex || item?.count === 0
        ? 'white'
        : theme.colors.SEARCH_UNDERLINE_COLOR;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dateView,
          {
            marginLeft: index === 0 ? 18 : 8,
            marginRight: index === datesSlots?.length - 1 ? 18 : 0,
            backgroundColor:
              index === selectedDateIndex && item?.count > 0
                ? theme.colors.SEARCH_UNDERLINE_COLOR
                : item?.count === 0
                ? theme.colors.GRAYED
                : 'white',
          },
        ]}
        onPress={() => handleDateSelection(item, index)}
      >
        {totalSlots === -1 ? (
          renderDateSlotsShimmer()
        ) : (
          <View style={styles.centerView}>
            <Text style={[styles.date, { color: textColor }]}>
              {index < 2 ? item?.date : moment(item?.date).format('DD MMM')}
            </Text>
            <Text style={[styles.dateSlots, { color: textColor }]}>
              {item?.count === 0 ? 'No' : item?.count} slot{item?.count === 1 ? '' : 's'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleDateSelection = (item: SlotsType, index: number) => {
    if (selectedDateIndex === index) return;
    setIsSlotDateSelected(true);
    setSelectedDateIndex(index);
    const todayDate = moment(new Date());
    const tomorrowDate = moment(new Date()).add('1', 'day');
    const date = index === 0 ? todayDate : index === 1 ? tomorrowDate : item?.date;
    setLoadTotalSlots(true);
    isOnlineSelected
      ? fetchOnlineTotalAvailableSlots(date)
      : fetchPhysicalTotalAvailableSlots(date);
  };

  const renderSelectedDate = () => {
    return <Text style={styles.selectedDate}>{dateTitle()}</Text>;
  };

  const dateTitle = () => {
    let selectedDateTitle = datesSlots?.[selectedDateIndex]?.date;
    if (selectedDateIndex < 2) {
      const todayDate = moment(new Date()).format('DD MMM');
      const tomorrowDate = moment(new Date())
        .add('1', 'day')
        .format('DD MMM');
      selectedDateTitle = selectedDateTitle?.concat(
        `, ${selectedDateIndex === 0 ? todayDate : tomorrowDate}`
      );
    } else {
      selectedDateTitle = moment(datesSlots?.[selectedDateIndex]?.date).format('MMM Do, YYYY');
    }
    return selectedDateTitle;
  };

  const renderTotalSlots = () => {
    return (
      <FlatList
        data={timeArray}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item, index }) => renderSlotsItems(item, index)}
        bounces={false}
        showsVerticalScrollIndicator={false}
        ref={slotsScrollViewRef}
        ListHeaderComponent={renderListHeaderComponent()}
        ListFooterComponent={
          totalSlots === 0 && !loadTotalSlots ? <View /> : renderFooterComponent()
        }
      />
    );
  };

  const renderListHeaderComponent = () => {
    return (
      <View>
        {renderSlotsDates()}
        {totalSlots > -1 && renderSelectedDate()}
        {totalSlots === 0 && !loadTotalSlots && renderNoSlotsView()}
      </View>
    );
  };

  const renderFooterComponent = () => {
    if (loadTotalSlots) return;
    return (
      <View>
        <View style={styles.notesContainer}>
          {renderGeneralNotes()}
          <WhatsAppStatus
            onPress={() => {
              whatsAppUpdate ? setWhatsAppUpdate(false) : setWhatsAppUpdate(true);
            }}
            isSelected={whatsAppUpdate}
          />
          {!isOnlineSelected && (
            <Text style={styles.physicalConsultNoteTxt}>Note: Pay at Reception is available.</Text>
          )}
        </View>
      </View>
    );
  };

  const renderProceedButton = () => {
    return (
      <View style={styles.bottomBtnContainer}>
        <Button
          disabled={loadTotalSlots}
          title="PROCEED"
          style={styles.viewAvailableSlotsBtn}
          onPress={() => handleProceed()}
        />
      </View>
    );
  };

  const handleProceed = () => {
    const consultOnlineTab = string.consultModeTab.CONSULT_ONLINE;
    const consultPhysicalTab = string.consultModeTab.MEET_IN_PERSON;

    const bothTabs = [{ title: consultOnlineTab }, { title: consultPhysicalTab }];
    const onlineTab = [{ title: consultOnlineTab }];
    const physicalTab = [{ title: consultPhysicalTab }];
    const tabs =
      doctorDetails?.doctorType !== DoctorType.PAYROLL
        ? isBoth?.length > 0
          ? bothTabs
          : isOnline?.length > 0
          ? onlineTab
          : isPhysical
          ? physicalTab
          : onlineTab
        : onlineTab;

    const clinics = doctorDetails?.doctorHospital || [];
    const doctorClinics = clinics?.filter(
      (item: getDoctorDetailsById_getDoctorDetailsById_doctorHospital) => {
        if (item?.facility?.facilityType) return item?.facility?.facilityType === 'HOSPITAL';
      }
    );

    const hospitalId = doctorClinics?.[0]?.facility?.id || '';

    const eventAttributes = {
      Source: 'Profile',
      'Consult Mode': isOnlineSelected ? 'Online' : 'Physical',
      'Consult Date Time': new Date(selectedTimeSlot),
    };

    callWEGEvent(WebEngageEventName.CONSULT_NOW_CLICKED, eventAttributes);

    const appointmentInput: BookAppointmentInput = {
      patientId: currentPatient?.id,
      doctorId,
      appointmentDateTime: selectedTimeSlot,
      appointmentType: isOnlineSelected ? APPOINTMENT_TYPE.ONLINE : APPOINTMENT_TYPE.PHYSICAL,
      hospitalId,
      bookingSource: BOOKINGSOURCE.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
      actualAmount: actualPrice,
      pinCode: locationDetails?.pincode,
      subscriptionDetails:
        circleSubscriptionId && isCircleDoctorOnSelectedConsultMode
          ? {
              userSubscriptionId: circleSubscriptionId,
              plan: PLAN.CARE_PLAN,
            }
          : null,
    };

    const passProps = {
      doctor: doctorDetails,
      tabs: tabs,
      selectedTab: selectedTab,
      price: actualPrice,
      appointmentInput: appointmentInput,
      consultedWithDoctorBefore: consultedWithDoctorBefore,
      patientId: currentPatient?.id,
      callSaveSearch: callSaveSearch,
      nextAvailableSlot: nextAvailableDate,
      selectedTimeSlot: selectedTimeSlot,
      whatsAppUpdate: whatsAppUpdate,
      isDoctorsOfTheHourStatus: doctorDetails?.doctorsOfTheHourStatus,
    };
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_PROCEED_CLICKED_ON_SLOT_SELECTION] = {
      docName: g(doctorDetails, 'fullName')!,
      specialtyName: g(doctorDetails, 'specialty', 'name')!,
      experience: Number(g(doctorDetails, 'experience')!),
      languagesKnown: g(doctorDetails, 'languages')! || 'NA',
      appointmentType: isOnlineSelected ? APPOINTMENT_TYPE.ONLINE : APPOINTMENT_TYPE.PHYSICAL,
      docId: g(doctorDetails, 'id')!,
      SpecialtyId: g(doctorDetails, 'specialty', 'id')!,
      'Patient UHID': g(currentPatient, 'uhid'),
      appointmentDateTime: moment(selectedTimeSlot).toDate(),
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      onlineConsultFee: onlineConsultMRPPrice || undefined,
      physicalConsultFee: physicalConsultMRPPrice || undefined,
      Source: isOnlineSelected ? 'Consult Now' : 'Schedule for Later',
      User_Type: getUserType(allCurrentPatients),
      price: actualPrice,
      docHospital: doctorDetails?.doctorHospital?.[0]?.facility?.name || undefined,
      docCity: doctorDetails?.doctorHospital?.[0]?.facility?.city || undefined,
    };
    postCleverTapEvent(
      CleverTapEventName.CONSULT_PROCEED_CLICKED_ON_SLOT_SELECTION,
      cleverTapEventAttributes
    );
    isOnlineSelected
      ? props.navigation.navigate(AppRoutes.PaymentCheckout, passProps)
      : props.navigation.navigate(AppRoutes.PaymentCheckoutPhysical, passProps);
  };

  const date = () => {
    var today = new Date();
    var tomorrow = moment(new Date()).add(1, 'day');
    var isToday =
      today.toDateString() ==
      moment(nextAvailableDate)
        .toDate()
        .toDateString();
    const isTomorrow =
      tomorrow.toDate().toDateString() ==
      moment(nextAvailableDate)
        .toDate()
        .toDateString();
    return {
      isToday,
      isTomorrow,
    };
  };
  const renderNoSlotsView = () => {
    var today = new Date();
    var tomorrow = moment(new Date()).add(1, 'day');
    const availabilityTitle = date().isToday
      ? 'Today'
      : date().isTomorrow
      ? 'Tomorrow'
      : `${moment(nextAvailableDate).format('DD MMMM')}`;
    const attributes = {
      'Landing screen date': date().isToday
        ? `${moment(today).format('LL')}`
        : date().isTomorrow
        ? `${moment(tomorrow).format('LL')}`
        : `${moment(nextAvailableDate).format('LL')}`,
    };
    return (
      <View style={styles.noSlotsContainer}>
        <Text style={styles.noSlotsAvailableText}>No slots available!</Text>
        <Text style={styles.nextAvailabilityTitle}>Next availability - {availabilityTitle}</Text>
        <Button
          title="VIEW AVAILABLE SLOTS"
          style={styles.viewAvailableSlotsBtn}
          onPress={() => showNextAvailableSlot(attributes)}
        />
      </View>
    );
  };

  const showNextAvailableSlot = (attributes?: any) => {
    callWEGEvent(WebEngageEventName.VIEW_AVAILABLE_SLOTS, attributes);
    const checkAvailabilityDate = datesSlots?.filter(
      (date: any) =>
        moment(date?.date)
          .toDate()
          .toDateString() ===
        moment(nextAvailableDate)
          .toDate()
          .toDateString()
    );
    const slotsIndex = datesSlots?.indexOf(checkAvailabilityDate?.[0]);
    const dateIndex = date().isToday ? 0 : date().isTomorrow ? 1 : slotsIndex;
    setTimeout(() => {
      dateScrollViewRef && dateScrollViewRef.current.scrollToIndex({ index: dateIndex });
    }, 500);
    setIsSlotDateSelected(true);
    setSelectedDateIndex(dateIndex);
    setLoadTotalSlots(true);
    isOnlineSelected
      ? fetchOnlineTotalAvailableSlots(nextAvailableDate)
      : fetchPhysicalTotalAvailableSlots(nextAvailableDate);
  };

  const renderSlotsItems = (
    item: {
      label: string;
      time: string[];
    },
    index: number
  ) => {
    if (totalSlots === 0 && !loadTotalSlots) return;
    return (
      <View key={index}>
        <View style={styles.slotsRow}>
          <Text style={styles.time}>{item?.label}</Text>
          {loadTotalSlots ? (
            renderTotalSlotsShimmer()
          ) : (
            <Text style={styles.slotsAvailability}>
              {item?.time?.length > 0 ? item?.time?.length : 'No'} Slots Available
            </Text>
          )}
          {item?.time?.length > 0 && firstSelectedSlot !== item?.label && !loadTotalSlots ? (
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => {
                const attributes = {
                  'Bucket viewed': item?.label,
                };
                callWEGEvent(WebEngageEventName.VIEW_SLOTS_CLICKED, attributes);
                setFirstSelectedSlot(item?.label);
                setSelectedTimeSlot(item?.time?.[0]);
                setTimeout(() => {
                  slotsScrollViewRef.current.scrollToIndex({ index });
                }, 300);
              }}
            >
              <Text style={styles.viewBtnTxt}>View</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {firstSelectedSlot === item?.label && item?.time?.length > 0 ? (
          <View style={styles.slotContainer}>
            {item?.time?.map((slot: string, index: number) => {
              if (loadTotalSlots) {
                return renderSlotItemShimmer();
              } else {
                return (
                  <Button
                    key={index}
                    title={timeTo12HrFormat(slot)}
                    style={[
                      styles.buttonStyle,
                      {
                        backgroundColor:
                          selectedTimeSlot === slot ? theme.colors.APP_GREEN : 'white',
                      },
                    ]}
                    titleTextStyle={[
                      styles.buttonTextStyle,
                      {
                        color: selectedTimeSlot === slot ? 'white' : theme.colors.APP_GREEN,
                      },
                    ]}
                    onPress={() => setSelectedTimeSlot(slot)}
                  />
                );
              }
            })}
          </View>
        ) : null}
      </View>
    );
  };

  const renderGeneralNotes = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate(AppRoutes.CommonWebView, {
            url: AppConfig.Configuration.APOLLO_TERMS_CONDITIONS,
          });
        }}
      >
        <Text style={styles.noteTxt}>
          By proceeding, I agree that I have read and understood the{' '}
          <Text style={{ color: theme.colors.SKY_BLUE }}>Terms & Conditions</Text> of usage of 24x7
          and consent to the same.{' '}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <View style={styles.container}>
        {renderHeader()}
        {doctorDetails
          ? renderDoctorDetails()
          : renderDoctorDetailsShimmer({ height: isCircleDoctor ? 120 : 105 })}
        {renderConsultTypeTabs()}
        {renderTotalSlots()}
        {totalSlots === 0 && !loadTotalSlots ? <View /> : renderProceedButton()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerConatiner: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  doctorDetailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorProfile: {
    height: 50,
    borderRadius: 25,
    width: 50,
    alignSelf: 'center',
  },
  doctorName: {
    ...theme.viewStyles.text('M', 18, theme.colors.LIGHT_BLUE),
  },
  speciality: {
    ...theme.viewStyles.text('M', 12, theme.colors.SKY_BLUE),
  },
  specialityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 100,
    flexWrap: 'wrap',
  },
  videoConsultIcon: {
    width: 22,
    height: 15,
  },
  hospitalVisitIcon: {
    width: 20,
    height: 24,
  },
  dateView: {
    height: 54,
    width: 101,
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    ...theme.viewStyles.text('SB', 15, 'white'),
  },
  dateSlots: {
    ...theme.viewStyles.text('R', 14, 'white'),
  },
  selectedDate: {
    ...theme.viewStyles.text('SB', 15, theme.colors.LIGHT_BLUE),
    textAlign: 'center',
  },
  centerView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotsRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  time: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
  },
  slotsAvailability: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
    opacity: 0.5,
    marginLeft: 20,
    width: 130,
  },
  buttonStyle: {
    ...theme.viewStyles.cardViewStyle,
    width: tabWidth - 22,
    marginRight: 8,
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
    height: 40,
  },
  buttonTextStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.APP_GREEN),
  },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  viewBtnTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW),
    marginLeft: 5,
  },
  viewBtn: {
    width: 70,
  },
  viewProfile: {
    ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW),
    marginTop: 8,
    marginLeft: 16,
  },
  doctorDetailsView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    paddingBottom: 14,
  },
  noSlotsContainer: {
    alignItems: 'center',
  },
  noSlotsAvailableText: {
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_BORDER_FAILURE),
    marginTop: 30,
  },
  nextAvailabilityTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
    opacity: 0.5,
    marginTop: 54,
  },
  viewAvailableSlotsBtn: {
    width: width - 36,
    marginTop: 6,
  },
  notesContainer: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  noteTxt: {
    ...theme.viewStyles.text('M', 10, theme.colors.LIGHT_BLUE),
    textAlign: 'center',
  },
  physicalConsultNoteTxt: {
    ...theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE),
    textAlign: 'center',
  },
  bottomBtnContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  drImageBackground: {
    height: 65,
    width: 65,
    justifyContent: 'center',
  },
});
