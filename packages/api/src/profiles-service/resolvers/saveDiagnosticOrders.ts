import gql from 'graphql-tag';
import { GraphQLScalarType, Kind } from 'graphql'
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { DiagnosticOrdersRepository } from 'profiles-service/repositories/diagnosticOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DiagnosticsRepository } from 'profiles-service/repositories/diagnosticsRepository';
import {
  DiagnosticOrders,
  DiagnosticOrderLineItems,
  DIAGNOSTIC_ORDER_STATUS,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  Gender,
  DiagnosticOrdersStatus,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  Diagnostics,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError, AphUserInputError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { getToken } from 'profiles-service/helpers/itdoseHelper'
import {
  DiagnosticPreBookingResult,
  DiagnosticOrderTest,
  ItdosTestDetails,
  AddProcessResult,
} from 'types/diagnosticOrderTypes';
import FormData from 'form-data'
import fetch from 'node-fetch';
import { format, differenceInYears } from 'date-fns';
import { log } from 'customWinstonLogger';
import { sendDiagnosticOrderStatusNotification } from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';

const slotIDScalarType = new GraphQLScalarType({
  name: 'slotIDScalar',
  description: 'String custom scalar type',
  serialize(value) {
    // Implement custom behavior by setting the 'result' variable
    return "" + value;
  },
  parseValue(value) {
    // Implement custom behavior here by setting the 'result' variable
    return "" + value;
  },
});

export const saveDiagnosticOrderTypeDefs = gql`
  scalar slotIDScalar
  enum DIAGNOSTIC_ORDER_STATUS {
    PICKUP_REQUESTED
    PICKUP_CONFIRMED
    ORDER_FAILED
    ORDER_CANCELLED
    PAYMENT_PENDING
    ORDER_PLACED
  }

  enum DIAGNOSTIC_ORDER_PAYMENT_TYPE {
    COD
    ONLINE_PAYMENT
  }

  input DiagnosticOrderInput {
    patientId: ID!
    patientAddressId: ID!
    city: String!
    cityId: String!
    state: String!
    stateId: String!
    slotTimings: String!
    employeeSlotId: slotIDScalar
    diagnosticEmployeeCode: String!
    diagnosticBranchCode: String!
    totalPrice: Float!
    prescriptionUrl: String!
    diagnosticDate: Date!
    centerName: String!
    centerCode: String!
    centerCity: String!
    centerState: String!
    centerLocality: String!
    bookingSource: BOOKINGSOURCE
    deviceType: DEVICETYPE
    paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE
    items: [DiagnosticLineItem]
    slotId: String
  }

  input DiagnosticLineItem {
    itemId: Int
    price: Float
    quantity: Int
  }

  type SaveDiagnosticOrderResult {
    errorCode: Int
    errorMessage: String
    orderId: String
    displayId: String
  }

  type DiagnosticOrdersResult {
    ordersList: [DiagnosticOrders]
  }

  type DiagnosticOrderResult {
    ordersList: DiagnosticOrders
  }

  enum BOOKINGSOURCE {
    MOBILE
    WEB
  }
  enum DEVICETYPE {
    IOS
    ANDROID
    DESKTOP
  }

  type DiagnosticOrders {
    id: ID!
    patientId: ID!
    patientAddressId: ID!
    city: String!
    slotTimings: String!
    employeeSlotId: String!
    diagnosticEmployeeCode: String!
    diagnosticBranchCode: String!
    totalPrice: Float!
    prescriptionUrl: String!
    diagnosticDate: DateTime!
    centerName: String!
    centerCode: String!
    centerCity: String!
    centerState: String!
    centerLocality: String!
    orderStatus: DIAGNOSTIC_ORDER_STATUS!
    orderType: String!
    displayId: Int!
    createdDate: DateTime!
    bookingSource: BOOKINGSOURCE
    deviceType: DEVICETYPE
    paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE
    diagnosticOrderLineItems: [DiagnosticOrderLineItems]
    diagnosticOrdersStatus: [DiagnosticOrdersStatus]
  }

  type DiagnosticOrderLineItems {
    id: ID!
    itemId: Int
    price: Float
    quantity: Int
    diagnostics: Diagnostics
  }

  type DiagnosticOrdersStatus {
    id: ID!
    orderStatus: DIAGNOSTIC_ORDER_STATUS
    createdDate: DateTime
  }

  extend type Mutation {
    SaveDiagnosticOrder(diagnosticOrderInput: DiagnosticOrderInput): SaveDiagnosticOrderResult!
    SaveItdoseHomeCollectionDiagnosticOrder(diagnosticOrderInput: DiagnosticOrderInput): SaveDiagnosticOrderResult!
  }
  extend type Query {
    getDiagnosticOrdersList(patientId: String): DiagnosticOrdersResult!
    getDiagnosticOrderDetails(diagnosticOrderId: String): DiagnosticOrderResult!
  }
`;

type DiagnosticOrderInput = {
  patientId: string;
  patientAddressId: string;
  city: string;
  cityId: string;
  state: string;
  stateId: string;
  slotTimings: string;
  employeeSlotId: string;
  diagnosticEmployeeCode: string;
  diagnosticBranchCode: string;
  totalPrice: number;
  prescriptionUrl: string;
  diagnosticDate: Date;
  centerName: string;
  centerCode: string;
  centerCity: string;
  centerState: string;
  centerLocality: string;
  bookingSource: BOOKING_SOURCE;
  deviceType: DEVICE_TYPE;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE;
  items: [DiagnosticLineItem];
  slotId: string;
};

type DiagnosticLineItem = {
  itemId: number;
  price: number;
  quantity: number;
  itemName: string;
};

type SaveDiagnosticOrderResult = {
  errorCode: number;
  errorMessage: string;
  orderId: string;
  displayId: string;
};

type DiagnosticOrdersResult = {
  ordersList: DiagnosticOrders[];
};

type DiagnosticOrderResult = {
  ordersList: DiagnosticOrders;
};

type PreBookingResp = {};

type DiagnosticOrderInputInputArgs = { diagnosticOrderInput: DiagnosticOrderInput };

const SaveDiagnosticOrder: Resolver<
  null,
  DiagnosticOrderInputInputArgs,
  ProfilesServiceContext,
  SaveDiagnosticOrderResult
> = async (parent, { diagnosticOrderInput }, { profilesDb }) => {
  let errorCode = 0,
    errorMessage = '',
    orderId = '',
    displayId = '';
  if (!diagnosticOrderInput.items) {
    throw new AphError(AphErrorMessages.CART_EMPTY_ERROR, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(diagnosticOrderInput.patientId);
  let patientAddress = '',
    addressZipcode = '',
    landmark = '';
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  if (
    diagnosticOrderInput.patientAddressId != '' &&
    diagnosticOrderInput.patientAddressId != null
  ) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(
      diagnosticOrderInput.patientAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
    patientAddress = patientAddressDetails.addressLine1 + ' ' + patientAddressDetails.addressLine2;
    addressZipcode = patientAddressDetails.zipcode;
    landmark = patientAddressDetails.landmark;
  }

  const diagnosticOrderattrs: Partial<DiagnosticOrders> = {
    patient: patientDetails,
    patientAddressId: diagnosticOrderInput.patientAddressId,
    totalPrice: diagnosticOrderInput.totalPrice,
    slotTimings: diagnosticOrderInput.slotTimings,
    employeeSlotId: 0,
    slotId: diagnosticOrderInput.employeeSlotId,
    diagnosticBranchCode: diagnosticOrderInput.diagnosticBranchCode,
    diagnosticEmployeeCode: diagnosticOrderInput.diagnosticEmployeeCode,
    city: diagnosticOrderInput.city,
    prescriptionUrl: diagnosticOrderInput.prescriptionUrl,
    diagnosticDate: diagnosticOrderInput.diagnosticDate,
    centerCity: diagnosticOrderInput.centerCity,
    centerCode: diagnosticOrderInput.centerCode,
    centerName: diagnosticOrderInput.centerName,
    centerLocality: diagnosticOrderInput.centerLocality,
    centerState: diagnosticOrderInput.centerState,
    bookingSource: diagnosticOrderInput.bookingSource,
    deviceType: diagnosticOrderInput.deviceType,
    orderStatus: DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
  };

  if (
    diagnosticOrderInput.paymentType &&
    diagnosticOrderInput.paymentType === DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD
  ) {
    diagnosticOrderattrs.orderStatus =
      diagnosticOrderInput.centerCode != ''
        ? DIAGNOSTIC_ORDER_STATUS.ORDER_PLACED
        : DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED;
  } else {
    diagnosticOrderattrs.orderStatus = DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING;
  }

  const diagnosticOrdersRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const diagnosticRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const saveOrder = await diagnosticOrdersRepo.saveDiagnosticOrder(diagnosticOrderattrs);
  const orderLineItems: DiagnosticOrderTest[] = [];
  const itdosLineItems: ItdosTestDetails[] = [];
  const orderItemDetails: Diagnostics[] = []
  const promises: object[] = [];
  function getItemDetails(itemId: number, quantity: number) {
    return new Promise(async (resolve, reject) => {
      const details = await diagnosticRepo.findDiagnosticById(itemId);
      if (details == null)
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
      orderItemDetails.push(details)
      const lineItem = {
        TestCode: details.itemCode,
        ItemId: details.itemId.toString(),
        ItemName: details.itemName,
        Rate: details.rate.toString(),
      };
      const itdosLineItem = {
        test_name: details.itemName,
        price: details.rate.toString(),
        quantity: quantity.toString(),
        department: 'OUTSOURCE',
        customer: 'x',
        item_id: details.itemId.toString(),
        item_name: details.itemName,
        test_code: details.itemCode,
      };
      orderLineItems.push(lineItem);
      itdosLineItems.push(itdosLineItem);
      resolve(orderLineItems);
    });
  }
  if (saveOrder) {
    orderId = saveOrder.id;
    displayId = saveOrder.displayId.toString();
    await diagnosticOrderInput.items.map(async (item) => {
      promises.push(getItemDetails(item.itemId, item.quantity));
      const details = await diagnosticRepo.findDiagnosticById(item.itemId);
      const orderItemAttrs: Partial<DiagnosticOrderLineItems> = {
        diagnosticOrders: saveOrder,
        diagnostics: details,
        ...item,
      };

      await diagnosticOrdersRepo.saveDiagnosticOrderLineItem(orderItemAttrs);
      //console.log(lineItemOrder);
    });
    await Promise.all(promises);
    const diagnosticTimings = diagnosticOrderInput.slotTimings.split('-');
    const diagnosticDate = new Date(diagnosticOrderInput.diagnosticDate);
    //console.log(diagnosticDate, format(diagnosticDate, 'dd-MMM-yyyy hh:mm'), 'diagnostic date');
    //console.log(orderLineItems, 'line items');

    //return the response if payment type is not COD

    if (
      diagnosticOrderInput.paymentType &&
      diagnosticOrderInput.paymentType != DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD
    ) {
      return {
        errorCode,
        errorMessage,
        orderId,
        displayId,
      };
    }

    let patientDob = '10-Jan-1989';
    if (patientDetails.dateOfBirth != null) {
      patientDob = format(patientDetails.dateOfBirth, 'dd-MMM-yyyy');
    }

    let visitType = 'Home Collection';
    if (diagnosticOrderInput.centerCode != '') {
      visitType = 'Center Visit';
    }

    let patientGender = Gender.MALE;
    if (patientDetails.gender != null) {
      patientGender = patientDetails.gender;
    }

    let patientId = '0';
    if (patientDetails.uhid != '' && patientDetails.uhid != null) {
      patientId = patientDetails.uhid;
    } else {
      patientId = await patientRepo.createNewUhid(patientDetails);
      if (patientId == '') {
        patientId = '0';
      }
    }

    const patientTitle = patientGender == Gender.FEMALE ? 'Ms.' : 'Mr.';
    //start of itdose api
    if (visitType != 'Home Collection') {
      const preBookingInput = [
        {
          UserName: process.env.DIAGNOSTICS_PREBOOKING_API_USERNAME,
          Password: process.env.DIAGNOSTICS_PREBOOKING_API_PASSWORD,
          InterfaceClient: process.env.DIAGNOSTICS_PREBOOKING_API_INTERFACE_CLIENT,
          Patient_ID: patientId,
          Title: patientTitle,
          PName: patientDetails.firstName + '' + patientDetails.lastName,
          House_No: '',
          LocalityID: '0',
          Locality: '',
          CityID: '',
          City: '',
          StateID: '',
          State: '',
          PinCode: addressZipcode,
          Mobile: patientDetails.mobileNumber.substr(3),
          Email: patientDetails.emailAddress == null ? '' : patientDetails.emailAddress,
          DOB: patientDob,
          Gender: patientGender,
          VisitType: visitType,
          PatientIDProof: '',
          PatientIDProofNo: '',
          Remarks: '',
          PaymentMode: 'Cash',
          PaymentModeID: '1',
          SampleCollectionDateTime: format(diagnosticDate, 'dd-MMM-yyyy hh:mm'),
          LabReferenceNo: diagnosticOrderInput.centerCode,
          tests: orderLineItems,
          Attachments: [],
          GrossAmt: '0',
          DiscAmt: '0',
          NetAmt: '0',
          PaymentRefNo: '',
          PayUTransactionID: '',
          PayUPaymentId: '',
          CouponCode: '',
          IsFirstCustomer: '',
          id: 8152197921,
          mode: 'NB',
          status: 'success',
          unmappedstatus: 'captured',
          key: 'JnQwXs',
          txnid: '',
          productinfo: 'Apollo',
          hash:
            'e02266c5a83cc2c2e5b5166e43d275e326f7596f2be556b12001874f965e03ff35822f0e3677986f3ffab080cf2cf8fbd630375a3f29e200620dab0362baeb3d',
          field8: 'Success',
          field9: 'Transaction Completed Successfully',
          payment_source: 'payu',
          PG_TYPE: 'AIRNB',
          bank_ref_no: '',
          ibibo_code: 'AIRNB',
          error_code: 'E000',
          Error_Message: 'No Error',
          is_seamless: 2,
          surl: 'https://payu.herokuapp.com/success',
          furl: 'https://payu.herokuapp.com/failure',
          PGAggregatorName: 'PayU',
          DoctorID: '',
          OtherDoctor: '',
        },
      ];

      /*const preBookingInput =
        process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
          ? [preBookingInputParameters]
          : preBookingInputParameters;*/

      const preBookingUrl = process.env.DIAGNOSTIC_PREBOOKING_URL
        ? process.env.DIAGNOSTIC_PREBOOKING_URL
        : '';

      log(
        'profileServiceLogger',
        `EXTERNAL_API_CALL_DIAGNOSTICS: ${preBookingUrl}`,
        'SaveDiagnosticOrder()->preBookingApi()->API_CALL_STARTING',
        JSON.stringify(preBookingInput),
        ''
      );
      console.log(preBookingInput, preBookingUrl, 'preBookingInput');
      const preBookingResp = await fetch(preBookingUrl, {
        method: 'POST',
        body: JSON.stringify(preBookingInput),
        headers: { 'Content-Type': 'application/json' },
      });

      //console.log(preBookingResp, 'pre booking resp');
      const textRes = await preBookingResp.text();
      log(
        'profileServiceLogger',
        'API_CALL_RESPONSE',
        'SaveDiagnosticOrder()->preBookingApi()->API_CALL_RESPONSE',
        textRes,
        ''
      );

      const preBookResp: DiagnosticPreBookingResult = JSON.parse(textRes);
      console.log(preBookResp, preBookResp.PreBookingID, 'text response');
      await diagnosticOrdersRepo.updateDiagnosticOrder(
        saveOrder.id,
        preBookResp.PreBookingID,
        '',
        DIAGNOSTIC_ORDER_STATUS.ORDER_PLACED
      );
      const diagnosticOrderStatusAttrs: Partial<DiagnosticOrdersStatus> = {
        diagnosticOrders: saveOrder,
        orderStatus: DIAGNOSTIC_ORDER_STATUS.ORDER_PLACED,
        statusDate: new Date(),
        hideStatus: false,
      };
      await diagnosticOrdersRepo.saveDiagnosticOrderStatus(diagnosticOrderStatusAttrs);

      //send order out for delivery notification
      sendDiagnosticOrderStatusNotification(
        NotificationType.DIAGNOSTIC_ORDER_SUCCESS,
        saveOrder,
        profilesDb
      );
    }
    //end of itdose api

    //console.log(diagnosticTimings, 'timings');
    //start of fareye api
    if (visitType == 'Home Collection') {
      const hubDetails = await diagnosticRepo.getHubDetails(
        diagnosticOrderInput.diagnosticBranchCode
      );
      patientDob = '1 Jan 2000';
      if (patientDetails.dateOfBirth) {
        patientDob = format(patientDetails.dateOfBirth, 'dd MMM yyyy');
      }
      const area = await diagnosticRepo.findAreabyZipCode(addressZipcode.toString());
      if (!area || !area?.area_id) {
        throw new AphUserInputError(AphErrorMessages.INVALID_ZIPCODE)
      }

      let homeCollectionData = {
        'Patient_ID': patientId,
        'Title': patientTitle,
        'PName': `${patientDetails.firstName} ${patientDetails.lastName}`,
        'Gender': patientGender,
        'DOB': patientDob,
        'Mobile': patientDetails.mobileNumber,
        'Alternatemobileno': patientDetails.mobileNumber,
        'Email': patientDetails.emailAddress,
        'LocalityID': area?.area_id,
        'Pincode': addressZipcode,
        'House_No': patientAddress,
        'Landmark': landmark,
        'Appdatetime': format(diagnosticOrderInput.diagnosticDate, 'dd-MMM-yyyy hh:mm'),
        'Client': '24*7',
        'Paymentmode': diagnosticOrderInput.paymentType,
        'Latitude': '0',
        'Longitude': '0',
        'SlotID': diagnosticOrderInput.employeeSlotId,
        'ReferedDoctor': 'Self',
        'DoctorID': 0,
        'TestDetail': new Array()
      }

      diagnosticOrderInput.items.forEach((element) => {
        orderItemDetails.forEach((item) => {
          if (item.itemId === element.itemId) {
            const itemHomeCollection = {
              'DiscAmt': '0',
              'itemid': element.itemId,
              'ItemName': item.itemName,
              'Itemtype': item.itemType,
              'NetAmt': element.price * element.quantity,
              'Rate': element.price,
              'SubCategoryID': item.labID,
              'TestCode': item.labCode
            }
            homeCollectionData.TestDetail.push(itemHomeCollection)
          }
        })
      })

      const form = new FormData();
      form.append('HomeCollectionData', JSON.stringify(homeCollectionData))

      const token = await getToken()
      let options = {
        method: 'POST',
        body: form,
        headers: { authorization: `Bearer ${token}`, ...form.getHeaders() }
      }
      const diagnosticProcessURL = process.env.DIAGNOSTIC_ITDOSE_HOMEBOOKING_URL
      if (!diagnosticProcessURL) {
        throw new AphError(AphErrorMessages.SAVE_ITDOSE_DIAGNOSTIC_ORDER_ERROR, undefined, { "cause": "add env DIAGNOSTICS_ITDOSE_LOGIN_URL" })
      }
      const diagnosticProcess = await fetch(`${diagnosticProcessURL}`, options)
        .then((res) => res.json())
        .catch((error) => {
          log(
            'profileServiceLogger',
            'API_CALL_ERROR',
            'getDiagnosticSlots()->CATCH_BLOCK',
            '',
            JSON.stringify(error)
          );
          throw new AphError(AphErrorMessages.SAVE_ITDOSE_DIAGNOSTIC_ORDER_ERROR, undefined, { "cause": error.toString() });
        });

      log(
        'profileServiceLogger',
        'API_CALL_RESPONSE',
        'SaveDiagnosticOrder()->preBookingApi()->API_CALL_RESPONSE',
        diagnosticProcess,
        ''
      );

      if (diagnosticProcess.status != true || !diagnosticProcess.data) {
        errorCode = -1;
        errorMessage = diagnosticProcess.message;
        orderId = saveOrder.id;
        await diagnosticOrdersRepo.updateDiagnosticOrder(
          saveOrder.id,
          '',
          '',
          DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED
        );
      } else {
        const preBookingID = diagnosticProcess.data.replace('PrebookingID:', '')
        await diagnosticOrdersRepo.updateDiagnosticOrder(
          saveOrder.id,
          preBookingID,
          '',
          DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED
        );
        const diagnosticOrderStatusAttrs: Partial<DiagnosticOrdersStatus> = {
          diagnosticOrders: saveOrder,
          orderStatus: diagnosticOrderattrs.orderStatus,
          statusDate: new Date(),
          hideStatus: false,
        };
        await diagnosticOrdersRepo.saveDiagnosticOrderStatus(diagnosticOrderStatusAttrs);

        //send order out for delivery notification
        sendDiagnosticOrderStatusNotification(
          NotificationType.DIAGNOSTIC_ORDER_SUCCESS,
          saveOrder,
          profilesDb
        );
      }
    }
    //end of fareye api
  }
  return {
    errorCode,
    errorMessage,
    orderId,
    displayId,
  };
};

const SaveItdoseHomeCollectionDiagnosticOrder: Resolver<
  null,
  DiagnosticOrderInputInputArgs,
  ProfilesServiceContext,
  SaveDiagnosticOrderResult
> = async (parent, { diagnosticOrderInput }, { profilesDb }) => {
  let errorCode = 0,
    errorMessage = '',
    orderId = '',
    displayId = '';

  if (!diagnosticOrderInput.slotId) {
    throw new AphError(AphErrorMessages.NO_SLOT_ID)
  }

  if (!diagnosticOrderInput.items) {
    throw new AphError(AphErrorMessages.CART_EMPTY_ERROR, undefined, {});
  }

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(diagnosticOrderInput.patientId);
  let patientAddress = '',
    addressZipcode = '',
    landmark = '';
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  if (
    diagnosticOrderInput.patientAddressId != '' &&
    diagnosticOrderInput.patientAddressId != null
  ) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(
      diagnosticOrderInput.patientAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
    patientAddress = patientAddressDetails.addressLine1 + ' ' + patientAddressDetails.addressLine2;
    addressZipcode = patientAddressDetails.zipcode;
    landmark = patientAddressDetails.landmark;
  }

  const diagnosticOrderattrs: Partial<DiagnosticOrders> = {
    patient: patientDetails,
    orderStatus: DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
    patientAddressId: diagnosticOrderInput.patientAddressId,
    totalPrice: diagnosticOrderInput.totalPrice,
    slotTimings: diagnosticOrderInput.slotTimings,
    employeeSlotId: 0,
    slotId: diagnosticOrderInput.slotId,
    diagnosticBranchCode: diagnosticOrderInput.diagnosticBranchCode,
    diagnosticEmployeeCode: diagnosticOrderInput.diagnosticEmployeeCode,
    city: diagnosticOrderInput.city,
    prescriptionUrl: diagnosticOrderInput.prescriptionUrl,
    diagnosticDate: diagnosticOrderInput.diagnosticDate,
    centerCity: diagnosticOrderInput.centerCity,
    centerCode: diagnosticOrderInput.centerCode,
    centerName: diagnosticOrderInput.centerName,
    centerLocality: diagnosticOrderInput.centerLocality,
    centerState: diagnosticOrderInput.centerState,
    bookingSource: diagnosticOrderInput.bookingSource,
    deviceType: diagnosticOrderInput.deviceType
  };

  if (
    diagnosticOrderInput.paymentType &&
    diagnosticOrderInput.paymentType === DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD
  ) {
    diagnosticOrderattrs.orderStatus =
      diagnosticOrderInput.centerCode != ''
        ? DIAGNOSTIC_ORDER_STATUS.ORDER_PLACED
        : DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED;
  } else {
    diagnosticOrderattrs.orderStatus = DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING;
  }

  const diagnosticOrdersRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const diagnosticRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const saveOrder = await diagnosticOrdersRepo.saveDiagnosticOrder(diagnosticOrderattrs);
  const orderLineItems: DiagnosticOrderTest[] = [];
  const orderItemDetails: Diagnostics[] = []
  const promises: object[] = [];
  function getItemDetails(itemId: number, quantity: number) {
    return new Promise(async (resolve, reject) => {
      const details = await diagnosticRepo.findDiagnosticById(itemId);
      if (details == null)
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID);
      orderItemDetails.push(details)
      const lineItem = {
        TestCode: details.itemCode,
        ItemId: details.itemId.toString(),
        ItemName: details.itemName,
        Rate: details.rate.toString(),
        ItemType: details.itemType,
      };
      orderLineItems.push(lineItem);
      resolve(orderLineItems);
    });
  }
  if (saveOrder) {
    orderId = saveOrder.id;
    displayId = saveOrder.displayId.toString();
    await diagnosticOrderInput.items.map(async (item) => {
      promises.push(getItemDetails(item.itemId, item.quantity));
      const details = await diagnosticRepo.findDiagnosticById(item.itemId);
      const orderItemAttrs: Partial<DiagnosticOrderLineItems> = {
        diagnosticOrders: saveOrder,
        diagnostics: details,
        ...item,
      };
      await diagnosticOrdersRepo.saveDiagnosticOrderLineItem(orderItemAttrs);
      //console.log(lineItemOrder);	
    });
    await Promise.all(promises);

    if (
      diagnosticOrderInput.paymentType &&
      diagnosticOrderInput.paymentType != DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD
    ) {
      return {
        errorCode,
        errorMessage,
        orderId,
        displayId,
      };
    }

    let patientDob = '10-Jan-1989';
    if (patientDetails.dateOfBirth != null) {
      patientDob = format(patientDetails.dateOfBirth, 'dd-MMM-yyyy');
    }

    let patientGender = Gender.MALE;
    if (patientDetails.gender != null) {
      patientGender = patientDetails.gender;
    }

    let patientId = '0';
    if (patientDetails.uhid != '' && patientDetails.uhid != null) {
      patientId = patientDetails.uhid;
    } else {
      patientId = await patientRepo.createNewUhid(patientDetails);
      if (patientId == '') {
        patientId = '0';
      }
    }

    const patientTitle = patientGender == Gender.FEMALE ? 'Ms.' : 'Mr.';

    patientDob = '1 Jan 2000';
    if (patientDetails.dateOfBirth) {
      patientDob = format(patientDetails.dateOfBirth, 'dd MMM yyyy');
    }

    const area = await diagnosticRepo.findAreabyZipCode(addressZipcode.toString());
    if (!area || !area?.area_id) {
      throw new AphUserInputError(AphErrorMessages.INVALID_ZIPCODE)
    }

    let homeCollectionData = {
      'Patient_ID': patientId,
      'Title': patientTitle,
      'PName': `${patientDetails.firstName} ${patientDetails.lastName}`,
      'Gender': patientGender,
      'DOB': patientDob,
      'Mobile': patientDetails.mobileNumber,
      'Alternatemobileno': patientDetails.mobileNumber,
      'Email': patientDetails.emailAddress,
      'LocalityID': area?.area_id,
      'Pincode': addressZipcode,
      'House_No': patientAddress,
      'Landmark': landmark,
      'Appdatetime': format(diagnosticOrderInput.diagnosticDate, 'dd-MMM-yyyy hh:mm'),
      'Client': '24*7',
      'Paymentmode': diagnosticOrderInput.paymentType,
      'Latitude': '0',
      'Longitude': '0',
      'SlotID': diagnosticOrderInput.slotId,
      'TestDetail': new Array()
    }

    diagnosticOrderInput.items.forEach((element) => {
      orderItemDetails.forEach((item) => {
        console.log(item)
        if (item.itemId === element.itemId) {
          const itemHomeCollection = {
            'DiscAmt': '0',
            'itemid': element.itemId,
            'ItemName': item.itemName,
            'Itemtype': item.itemType,
            'NetAmt': element.price * element.quantity,
            'Rate': element.price,
            'SubCategoryID': item.labID,
            'TestCode': item.labCode
          }
          homeCollectionData.TestDetail.push(itemHomeCollection)
        }
      })
    })

    console.log(homeCollectionData)

    const form = new FormData();
    form.append('HomeCollectionData', JSON.stringify(homeCollectionData))

    const token = await getToken()
    let options = {
      method: 'POST',
      body: form,
      headers: { authorization: `Bearer ${token}`, ...form.getHeaders() }
    }
    const diagnosticProcessURL = process.env.DIAGNOSTIC_ITDOSE_HOMEBOOKING_URL
    if (!diagnosticProcessURL) {
      throw new AphError(AphErrorMessages.SAVE_ITDOSE_DIAGNOSTIC_ORDER_ERROR, undefined, { "cause": "add env DIAGNOSTICS_ITDOSE_LOGIN_URL" })
    }
    const diagnosticProcess = await fetch(`${diagnosticProcessURL}`, options)
      .then((res) => res.json())
      .catch((error) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getDiagnosticSlots()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.SAVE_ITDOSE_DIAGNOSTIC_ORDER_ERROR, undefined, { "cause": error.toString() });
      });

    if (diagnosticProcess.status != true || !diagnosticProcess.data) {
      errorCode = -1;
      errorMessage = diagnosticProcess.message;
      orderId = saveOrder.id;
      await diagnosticOrdersRepo.updateDiagnosticOrder(
        saveOrder.id,
        '',
        '',
        DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED
      );
    } else {
      const preBookingID = diagnosticProcess.data.replace('PrebookingID:', '')
      await diagnosticOrdersRepo.updateDiagnosticOrder(
        saveOrder.id,
        preBookingID,
        '',
        DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED
      );
      const diagnosticOrderStatusAttrs: Partial<DiagnosticOrdersStatus> = {
        diagnosticOrders: saveOrder,
        orderStatus: diagnosticOrderattrs.orderStatus,
        statusDate: new Date(),
        hideStatus: false,
      };
      await diagnosticOrdersRepo.saveDiagnosticOrderStatus(diagnosticOrderStatusAttrs);

      //send order out for delivery notification	
      sendDiagnosticOrderStatusNotification(
        NotificationType.DIAGNOSTIC_ORDER_SUCCESS,
        saveOrder,
        profilesDb
      );
    }
  }
  return {
    errorCode,
    errorMessage,
    orderId,
    displayId,
  };
}

const getDiagnosticOrdersList: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  DiagnosticOrdersResult
> = async (parent, args, { profilesDb }) => {
  const { patientId } = args;
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientId });
  const ordersList = await diagnosticsRepo.getListOfOrders(primaryPatientIds);
  return { ordersList };
};

const getDiagnosticOrderDetails: Resolver<
  null,
  { diagnosticOrderId: string },
  ProfilesServiceContext,
  DiagnosticOrderResult
> = async (parent, args, { profilesDb }) => {
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const ordersList = await diagnosticsRepo.getOrderDetails(args.diagnosticOrderId);
  if (ordersList == null)
    throw new AphError(AphErrorMessages.INVALID_DIAGNOSTIC_ORDER_ID, undefined, {});
  return { ordersList };
};

export const saveDiagnosticOrderResolvers = {
  slotIDScalar: slotIDScalarType,
  Mutation: {
    SaveDiagnosticOrder,
    SaveItdoseHomeCollectionDiagnosticOrder,
  },
  Query: {
    getDiagnosticOrdersList,
    getDiagnosticOrderDetails,
  },
};
