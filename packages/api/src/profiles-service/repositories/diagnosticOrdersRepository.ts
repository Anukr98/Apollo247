import { EntityRepository, Repository, Connection } from 'typeorm';
import {
  DiagnosticOrders,
  DiagnosticOrderLineItems,
  DIAGNOSTIC_ORDER_STATUS,
  DiagnosticOrderPayments,
  DiagnosticOrdersStatus,
  Gender,
} from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { DiagnosticsRepository } from 'profiles-service/repositories/diagnosticsRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format } from 'date-fns';
import { log } from 'customWinstonLogger';
import {
  DiagnosticPreBookingResult,
  DiagnosticOrderTest,
  ItdosTestDetails,
  AddProcessResult,
} from 'types/diagnosticOrderTypes';

@EntityRepository(DiagnosticOrders)
export class DiagnosticOrdersRepository extends Repository<DiagnosticOrders> {
  saveDiagnosticOrder(diagnosticOrderAttrs: Partial<DiagnosticOrders>) {
    return this.create(diagnosticOrderAttrs)
      .save()
      .catch((diagnosticOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_DIAGNOSTIC_ORDER_ERROR, undefined, {
          diagnosticOrderError,
        });
      });
  }

  updateDiagnosticOrder(
    id: string,
    preBookingId: string,
    fareyeId: string,
    orderStatus: DIAGNOSTIC_ORDER_STATUS
  ) {
    return this.update(id, { fareyeId, preBookingId, orderStatus });
  }

  updateDiagnosticOrderDetails(id: string, diagnosticAttrs: Partial<DiagnosticOrders>) {
    return this.update(id, diagnosticAttrs);
  }

  saveDiagnosticOrderLineItem(lineItemAttrs: Partial<DiagnosticOrderLineItems>) {
    return DiagnosticOrderLineItems.create(lineItemAttrs)
      .save()
      .catch((diagnosticOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_DIAGNOSTIC_ORDER_LINE_ERROR, undefined, {
          diagnosticOrderError,
        });
      });
  }

  getListOfOrders(patient: string) {
    // return this.find({
    //   where: {
    //     patient,
    //     orderStatus: Not(DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED),
    //   },
    //   order: { createdDate: 'DESC' },
    //   relations: ['diagnosticOrderLineItems', 'diagnosticOrderLineItems.diagnostics'],
    // });

    return this.createQueryBuilder('diagnostic_orders')
      .leftJoinAndSelect('diagnostic_orders.diagnosticOrderLineItems', 'diagnosticOrderLineItems')
      .leftJoinAndSelect('diagnosticOrderLineItems.diagnostics', 'diagnostics')
      .where('(diagnostic_orders.patient = :patientId)', {
        patientId: patient,
      })
      .andWhere('diagnostic_orders.orderStatus not in(:status1,:status2)', {
        status1: DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
        status2: DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
      })
      .orderBy('diagnostic_orders.createdDate', 'DESC')
      .getMany();
  }

  getOrderDetails(id: string) {
    return this.findOne({
      where: { id },
      relations: ['diagnosticOrderLineItems', 'diagnosticOrderLineItems.diagnostics', 'patient'],
    });
  }

  getOrderDetailsById(displayId: number) {
    return this.findOne({
      where: { displayId },
      relations: ['diagnosticOrderLineItems', 'diagnosticOrderLineItems.diagnostics'],
    });
  }

  cancelDiagnosticOrder(id: string) {
    return this.update(id, { orderStatus: DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED });
  }

  saveDiagnosticOrderPayment(paymentAttrs: Partial<DiagnosticOrderPayments>) {
    return DiagnosticOrderPayments.create(paymentAttrs)
      .save()
      .catch((error) => {
        throw new AphError(AphErrorMessages.SAVE_DIAGNOSTIC_ORDER_ERROR, undefined, {
          error,
        });
      });
  }

  saveDiagnosticOrderStatus(orderStatusAttrs: Partial<DiagnosticOrdersStatus>) {
    return DiagnosticOrdersStatus.create(orderStatusAttrs)
      .save()
      .catch((diagnosticOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_STATUS_ERROR, undefined, {
          diagnosticOrderError,
        });
      });
  }

  async callDiagnosticFareEyeAPIs(diagnosticOrderInput: DiagnosticOrders, profilesDb: Connection) {
    const patientDetails = diagnosticOrderInput.patient;
    const diagnosticRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    let errorCode = 0,
      errorMessage = '',
      orderId = '';
    const displayId = '';

    let patientDob = '10-Jan-1989';
    if (patientDetails.dateOfBirth != null) {
      patientDob = format(patientDetails.dateOfBirth, 'dd-MMM-yyyy');
    }

    let patientId = '0';
    if (patientDetails.uhid != '' && patientDetails.uhid != null) {
      patientId = patientDetails.uhid;
    } else {
      patientId = await patientRepo.createNewUhid(patientDetails.id);
    }

    let visitType = 'Home Collection';
    if (diagnosticOrderInput.centerCode != '') {
      visitType = 'Center Visit';
    }

    const diagnosticTimings = diagnosticOrderInput.slotTimings.split('-');
    const diagnosticDate = new Date(diagnosticOrderInput.diagnosticDate);

    let patientGender = Gender.MALE;
    if (patientDetails.gender != null) {
      patientGender = patientDetails.gender;
    }

    const patientTitle = patientGender == Gender.FEMALE ? 'Ms.' : 'Mr.';

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
      patientAddress =
        patientAddressDetails.addressLine1 + ' ' + patientAddressDetails.addressLine2;
      addressZipcode = patientAddressDetails.zipcode;
    }

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

    await diagnosticOrderInput.diagnosticOrderLineItems.map(async (item) => {
      promises.push(getItemDetails(item.itemId, item.quantity));
      await diagnosticRepo.findDiagnosticById(item.itemId);
    });
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
          tests: diagnosticOrderInput.diagnosticOrderLineItems,
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
      await this.updateDiagnosticOrder(
        diagnosticOrderInput.id,
        preBookResp.PreBookingID,
        '',
        DIAGNOSTIC_ORDER_STATUS.ORDER_PLACED
      );
      const diagnosticOrderStatusAttrs: Partial<DiagnosticOrdersStatus> = {
        diagnosticOrders: diagnosticOrderInput,
        orderStatus: DIAGNOSTIC_ORDER_STATUS.ORDER_PLACED,
        statusDate: new Date(),
        hideStatus: false,
      };
      await this.saveDiagnosticOrderStatus(diagnosticOrderStatusAttrs);
    }
    //end of itdose call

    //console.log(diagnosticTimings, 'timings');
    if (visitType == 'Home Collection') {
      patientDob = '1 Jan 2000';
      if (patientDetails.dateOfBirth != null) {
        patientDob = format(patientDetails.dateOfBirth, 'dd MMM yyyy');
      }
      const hubDetails = await diagnosticRepo.getHubDetails(
        diagnosticOrderInput.diagnosticBranchCode
      );
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
            city_id: diagnosticOrderInput.city.toString(),
            state_id: '', //need to store state in db
            state: '', //need to store state in db
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
        await this.updateDiagnosticOrder(
          diagnosticOrderInput.id,
          '',
          '',
          DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED
        );
      } else {
        await this.updateDiagnosticOrder(
          diagnosticOrderInput.id,
          '',
          addProceResp.successList[0],
          DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED
        );
        const diagnosticOrderStatusAttrs: Partial<DiagnosticOrdersStatus> = {
          diagnosticOrders: diagnosticOrderInput,
          orderStatus: DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
          statusDate: new Date(),
          hideStatus: false,
        };
        await this.saveDiagnosticOrderStatus(diagnosticOrderStatusAttrs);
      }
    }

    return {
      errorCode,
      errorMessage,
      orderId,
      displayId,
    };
  }
}
