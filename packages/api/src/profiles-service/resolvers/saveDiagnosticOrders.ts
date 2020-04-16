import gql from 'graphql-tag';
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
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import {
  DiagnosticPreBookingResult,
  DiagnosticOrderTest,
  ItdosTestDetails,
  AddProcessResult,
} from 'types/diagnosticOrderTypes';
import { format, differenceInYears } from 'date-fns';
import { log } from 'customWinstonLogger';
import {
  sendDiagnosticOrderStatusNotification,
  NotificationType,
} from 'notifications-service/resolvers/notifications';
import { BOOKINGSOURCE, DEVICETYPE } from 'consults-service/entities';

export const saveDiagnosticOrderTypeDefs = gql`
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
    employeeSlotId: Int!
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
  }

  type DiagnosticOrders {
    id: ID!
    patientId: ID!
    patientAddressId: ID!
    city: String!
    slotTimings: String!
    employeeSlotId: Int!
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
  employeeSlotId: number;
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
  bookingSource: BOOKINGSOURCE;
  deviceType: DEVICETYPE;
  paymentType: DIAGNOSTIC_ORDER_PAYMENT_TYPE;
  items: [DiagnosticLineItem];
};

type DiagnosticLineItem = {
  itemId: number;
  price: number;
  quantity: number;
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
  const patientDetails = await patientRepo.findById(diagnosticOrderInput.patientId);
  let patientAddress = '',
    addressZipcode = '';
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
  }

  const diagnosticOrderattrs: Partial<DiagnosticOrders> = {
    patient: patientDetails,
    patientAddressId: diagnosticOrderInput.patientAddressId,
    totalPrice: diagnosticOrderInput.totalPrice,
    slotTimings: diagnosticOrderInput.slotTimings,
    employeeSlotId: diagnosticOrderInput.employeeSlotId,
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
  const promises: object[] = [];
  function getItemDetails(itemId: number, quantity: number) {
    return new Promise(async (resolve, reject) => {
      const details = await diagnosticRepo.findDiagnosticById(itemId);
      if (details == null)
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
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
      patientId = await patientRepo.createNewUhid(patientDetails.id);
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
      if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'as') {
        patientDob = '1 Jan 2000';
        if (patientDetails.dateOfBirth) {
          patientDob = format(patientDetails.dateOfBirth, 'dd MMM yyyy');
        }
      } else {
        patientDob = '30';
        if (patientDetails.dateOfBirth) {
          patientDob = Math.abs(
            differenceInYears(new Date(), patientDetails.dateOfBirth)
          ).toString();
        }
      }
      const addProcessInput = [
        {
          processDefinitionCode: 'home_collection',
          processData: {
            time_slot: diagnosticTimings[0].trim().toString() + ':00',
            first_name: patientDetails.firstName,
            last_name: patientDetails.lastName,
            dob: patientDob,
            sex: patientDetails.gender == null ? 'Male' : patientDetails.gender,
            address: patientAddress,
            pincode: addressZipcode,
            email_address: patientDetails.emailAddress == null ? '' : patientDetails.emailAddress,
            investigation: itdosLineItems,
            discount: '0',
            remarks: 'remarks',
            city: diagnosticOrderInput.city,
            branch_ds: diagnosticOrderInput.diagnosticBranchCode,
            mobile_number: patientDetails.mobileNumber.substr(3),
            booking_date: format(diagnosticOrderInput.diagnosticDate, 'yyyy-MM-dd'),
            last_test_taken: '',
            landmark: '',
            last_test_date1: '',
            last_feedback_given: '',
            last_rating_given: '',
            totalCalculatedPrice: diagnosticOrderInput.totalPrice.toString(),
            tempTotal: '',
            last_total_amount_collected: '',
            pincod_area_name: hubDetails ? hubDetails.pincodeAreaname : '',
            alternate_contact_number: '',
            mode_of_payment: 'Cash',
            pcc_drop_point: '2',
            current_city: diagnosticOrderInput.city,
            list_additional_customer_details: [],
            cce_name: '2',
            pcc_email: '2',
            branch: diagnosticOrderInput.diagnosticBranchCode,
            source_of_collection: 'PRE BOOKING',
            client: 'Others',
            Patient_ID: patientDetails.id,
            visit_id: '',
            doctor_id: '',
            title: patientTitle,
            payment_mode_id: '1',
            locality_id: '0',
            house_no: '',
            locality: '',
            city_id: diagnosticOrderInput.cityId.toString(),
            state_id: diagnosticOrderInput.stateId.toString(),
            state: diagnosticOrderInput.state,
            patient_id_proof: '',
            patient_id_proof_no: '',
            lab_reference_no: '21',
            attachments: 'na',
            gross_amt: '0',
            disc_amt: '0',
            net_amt: '0',
            payment_ref_no: '',
            pay_u_transaction_id: '',
            pay_u_payment_id: '1',
            coupon_code: '',
            is_first_customer: '',
            id: '8660',
            mode: 'M',
            status1: 'success',
            un_mapped_status: 'capture',
            key: 'JnQwXs',
            txn_id: '',
            product_info: 'Apollo',
            hash1:
              'e02266c5a83cc2c2e5b5166e43d275e326f7596f2be556b12001874f965e03ff35822f0e3677986f3ffab080cf2cf8fbd630375a3f29e200620dab0362baeb3d',
            field8: 'Success',
            field9: 'Transact',
            payment_source: 'payu',
            pg_type: 'ng',
            bank_ref_no: '',
            ibibo_code: 'AIRNB',
            error_code: 'E000',
            error_message: 'No Erro',
            is_seamless: '2',
            surl: 'https://payu.herokuapp.com/success',
            furl: 'https://payu.herokuapp.com/failure',
            pg_aggregator_name: 'PayU',
            other_doctor: '',
            label: '',
            middle_name: '',
          },
          processUserMappings: [
            {
              flowCode: 'home_collection',
              cityCode: hubDetails ? hubDetails.city : '',
              branchCode: diagnosticOrderInput.diagnosticBranchCode,
              employeeCode: diagnosticOrderInput.diagnosticEmployeeCode,
              slot: diagnosticOrderInput.employeeSlotId.toString(),
              scheduleDate: format(diagnosticOrderInput.diagnosticDate, 'yyyy-MM-dd'),
            },
          ],
        },
      ];
      const addProcessUrl = process.env.DIAGNOSTIC_ADD_PROCESS_URL
        ? process.env.DIAGNOSTIC_ADD_PROCESS_URL
        : '';
      console.log(addProcessInput, 'addProcessInput');
      log(
        'profileServiceLogger',
        `EXTERNAL_API_CALL_DIAGNOSTICS: ${addProcessUrl}`,
        'SaveDiagnosticOrder()->addProcessUrlApi->API_CALL_STARTING',
        JSON.stringify(addProcessInput),
        ''
      );

      const addProcessResp = await fetch(addProcessUrl, {
        method: 'POST',
        body: JSON.stringify(addProcessInput),
        headers: { 'Content-Type': 'application/json' },
      });

      //console.log(addProcessResp, 'add process resp');
      const textProcessRes = await addProcessResp.text();
      log(
        'profileServiceLogger',
        'API_CALL_RESPONSE',
        'SaveDiagnosticOrder()->preBookingApi()->API_CALL_RESPONSE',
        textProcessRes,
        ''
      );

      const addProceResp: AddProcessResult = JSON.parse(textProcessRes);
      if (addProceResp.failureList.length > 0) {
        errorCode = -1;
        errorMessage = addProceResp.failureList[0].failReason;
        orderId = '';
        await diagnosticOrdersRepo.updateDiagnosticOrder(
          saveOrder.id,
          '',
          '',
          DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED
        );
      } else {
        await diagnosticOrdersRepo.updateDiagnosticOrder(
          saveOrder.id,
          '',
          addProceResp.successList[0],
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

const getDiagnosticOrdersList: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  DiagnosticOrdersResult
> = async (parent, args, { profilesDb }) => {
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const ordersList = await diagnosticsRepo.getListOfOrders(args.patientId);
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
  Mutation: {
    SaveDiagnosticOrder,
  },
  Query: {
    getDiagnosticOrdersList,
    getDiagnosticOrderDetails,
  },
};
