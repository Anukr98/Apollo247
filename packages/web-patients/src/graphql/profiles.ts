import gql from 'graphql-tag';

export const GET_PATIENTS = gql`
  query GetPatients {
    getPatients {
      patients {
        id
        mobileNumber
        firstName
        lastName
        relation
        gender
        uhid
        dateOfBirth
      }
    }
  }
`;

export const GET_PATIENT_BY_MOBILE_NUMBER = gql`
  query GetPatientByMobileNumber($mobileNumber: String) {
    getPatientByMobileNumber(mobileNumber: $mobileNumber) {
      patients {
        id
        mobileNumber
        firstName
        lastName
        relation
        gender
        uhid
        dateOfBirth
        emailAddress
        photoUrl
      }
    }
  }
`;

export const GET_CURRENT_PATIENTS = gql`
  query GetCurrentPatients {
    getCurrentPatients {
      patients {
        id
        mobileNumber
        firstName
        lastName
        relation
        gender
        uhid
        dateOfBirth
        emailAddress
        photoUrl
      }
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($patientInput: UpdatePatientInput!) {
    updatePatient(patientInput: $patientInput) {
      patient {
        id
        mobileNumber
        firstName
        lastName
        relation
        gender
        uhid
        dateOfBirth
        emailAddress
      }
    }
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation cancelAppointment($cancelAppointmentInput: CancelAppointmentInput!) {
    cancelAppointment(cancelAppointmentInput: $cancelAppointmentInput) {
      status
    }
  }
`;

export const BOOK_APPOINTMENT_RESCHEDULE = gql`
  mutation bookRescheduleAppointment(
    $bookRescheduleAppointmentInput: BookRescheduleAppointmentInput!
  ) {
    bookRescheduleAppointment(bookRescheduleAppointmentInput: $bookRescheduleAppointmentInput) {
      appointmentDetails {
        appointmentType
        id
        doctorId
        appointmentState
        appointmentDateTime
        status
        patientId
        rescheduleCount
      }
    }
  }
`;

export const GET_MEDICINE_ORDERS_LIST = gql`
  query GetMedicineOrdersList($patientId: String) {
    getMedicineOrdersList(patientId: $patientId) {
      MedicineOrdersList {
        id
        orderAutoId
        deliveryType
        medicineOrdersStatus {
          id
          orderStatus
          statusDate
          hideStatus
        }
      }
    }
  }
`;

export const GET_COUPONS = gql`
  query getCoupons {
    getCoupons {
      coupons {
        id
        code
        description
        discountType
        discount
        minimumOrderAmount
        expirationDate
        isActive
      }
    }
  }
`;

export const GET_PAST_CONSULTS_PRESCRIPTIONS = gql`
  query getPatientPastConsultsAndPrescriptions(
    $consultsAndOrdersInput: PatientConsultsAndOrdersInput
  ) {
    getPatientPastConsultsAndPrescriptions(consultsAndOrdersInput: $consultsAndOrdersInput) {
      consults {
        id
        patientId
        doctorId
        appointmentDateTime
        appointmentType
        appointmentState
        hospitalId
        isFollowUp
        followUpParentId
        followUpTo
        displayId
        bookingDate
        caseSheet {
          notes
          blobName
          consultType
          diagnosis {
            name
          }
          diagnosticPrescription {
            itemname
          }
          doctorId
          doctorType
          followUp
          followUpAfterInDays
          followUpDate
          followUpConsultType
          id
          medicinePrescription {
            medicineConsumptionDurationInDays
            medicineDosage
            id
            medicineCustomDetails
            medicineConsumptionDurationUnit
            medicineFormTypes
            medicineFrequency
            medicineInstructions
            medicineName
            medicineTimings
            medicineToBeTaken
            medicineUnit
          }
          symptoms {
            symptom
            since
            howOften
            severity
          }
          otherInstructions {
            instruction
          }
        }
        displayId
        status
        doctorInfo {
          id
          salutation
          firstName
          fullName
          lastName
          displayName
          experience
          city
          onlineConsultationFees
          physicalConsultationFees
          photoUrl
          qualification
          specialty {
            name
            image
          }
        }
      }
      medicineOrders {
        id
        orderDateTime
        quoteDateTime
        deliveryType
        currentStatus
        orderType
        estimatedAmount
        prescriptionImageUrl
        shopId
        prismPrescriptionFileId
        medicineOrderLineItems {
          medicineSKU
          medicineName
          price
          quantity
          mrp
          id
        }
      }
    }
  }
`;

export const GET_MEDICINE_ORDER_DETAILS = gql`
  query GetMedicineOrderDetails($patientId: String, $orderAutoId: Int) {
    getMedicineOrderDetails(patientId: $patientId, orderAutoId: $orderAutoId) {
      MedicineOrderDetails {
        id
        orderAutoId
        devliveryCharges
        estimatedAmount
        prescriptionImageUrl
        medicineOrdersStatus {
          id
          orderStatus
          statusDate
          hideStatus
        }
        medicineOrderLineItems {
          medicineSKU
          medicineName
          price
          quantity
          isMedicine
          mou
        }
        medicineOrderPayments {
          paymentType
          amountPaid
          paymentRefId
          paymentStatus
          paymentDateTime
        }
      }
    }
  }
`;

export const SAVE_ORDER_CANCEL_STATUS = gql`
  mutation saveOrderCancelStatus($orderCancelInput: OrderCancelInput) {
    saveOrderCancelStatus(orderCancelInput: $orderCancelInput) {
      requestStatus
      requestMessage
    }
  }
`;
export const ADD_CHAT_DOCUMENT = gql`
  mutation AddChatDocument($appointmentId: ID!, $documentPath: String!) {
    addChatDocument(appointmentId: $appointmentId, documentPath: $documentPath) {
      id
      documentPath
    }
  }
`;

export const GET_PATIENT_FUTURE_APPOINTMENT_COUNT = gql`
  query GetPatientFutureAppointmentCount($patientId: String) {
    getPatientFutureAppointmentCount(patientId: $patientId) {
      consultsCount
    }
  }
`;

export const ADD_PROFILE = gql`
  mutation AddNewProfile($PatientProfileInput: PatientProfileInput!) {
    addNewProfile(patientProfileInput: $PatientProfileInput) {
      patient {
        id
        uhid
        mobileNumber
        firstName
        lastName
        emailAddress
        gender
      }
    }
  }
`;

export const GET_MEDICAL_RECORD = gql`
  query getPatientMedicalRecords($patientId: ID!) {
    getPatientMedicalRecords(patientId: $patientId) {
      medicalRecords {
        id
        testName
        testDate
        recordType
        referringDoctor
        observations
        additionalNotes
        sourceName
        documentURLs
        prismFileIds
        issuingDoctor
        location
        medicalRecordParameters {
          id
          parameterName
          unit
          result
          minimum
          maximum
        }
      }
    }
  }
`;

export const EDIT_PROFILE = gql`
  mutation EditProfile($editProfileInput: EditProfileInput!) {
    editProfile(editProfileInput: $editProfileInput) {
      patient {
        id
        photoUrl
        firstName
        lastName
        relation
        gender
        dateOfBirth
        emailAddress
      }
    }
  }
`;

export const GET_MEDICAL_PRISM_RECORD = gql`
  query getPatientPrismMedicalRecords($patientId: ID!) {
    getPatientPrismMedicalRecords(patientId: $patientId) {
      labTests {
        id
        labTestName
        labTestSource
        labTestDate
        labTestReferredBy
        additionalNotes
        testResultPrismFileIds
        observation
        labTestResultParameters {
          parameterName
          unit
          result
          range
          setOutOfRange
          setResultDate
          setUnit
          setParameterName
          setRange
          setResult
        }
        departmentName
        signingDocName
      }
      healthChecks {
        id
        healthCheckName
        healthCheckDate
        healthCheckPrismFileIds
        healthCheckSummary
        source
        appointmentDate
        followupDate
      }
      hospitalizations {
        id
        diagnosisNotes
        dateOfDischarge
        dateOfHospitalization
        dateOfNextVisit
        hospitalizationPrismFileIds
        source
      }
      labResults {
        errorCode
        errorMsg
        errorType
        response {
          authToken
          id
          labTestName
          labTestSource
          packageId
          packageName
          # labTestDate
          date
          labTestRefferedBy
          siteDisplayName
          tag
          consultId
          additionalNotes
          observation
          labTestResults {
            parameterName
            unit
            result
            range
            outOfRange
            # resultDate
          }
          fileUrl
          testResultFiles {
            id
            fileName
            mimeType
            content
            byteContent
          }
        }
        errorCode
        errorMsg
        errorType
      }
      prescriptions {
        response {
          id
          prescriptionName
          date
          # dateOfPrescription
          # startDate
          # endDate
          prescribedBy
          notes
          prescriptionSource
          source
          fileUrl
        }
        errorCode
        errorMsg
        errorType
      }
      healthChecksNew {
        errorCode
        errorMsg
        errorType
        response {
          authToken
          userId
          id
          fileUrl
          date
          healthCheckName
          healthCheckDate
          healthCheckSummary
          healthCheckFiles {
            id
            fileName
            mimeType
            content
            byteContent
            dateCreated
          }
          source
          healthCheckType
          followupDate
        }
      }
      hospitalizationsNew {
        errorCode
        errorMsg
        errorType
        response {
          authToken
          userId
          id
          fileUrl
          date
          hospitalizationDate
          dateOfHospitalization
          hospitalName
          doctorName
          reasonForAdmission
          diagnosisNotes
          dateOfDischarge
          dischargeSummary
          doctorInstruction
          dateOfNextVisit
          hospitalizationFiles {
            id
            fileName
            mimeType
            content
            byteContent
            dateCreated
          }
          source
        }
      }
    }
  }
`;
export const GET_RECOMMENDED_PRODUCTS_LIST = gql`
  query getRecommendedProductsList($patientUhid: String!) {
    getRecommendedProductsList(patientUhid: $patientUhid) {
      recommendedProducts {
        productSku
        productName
        productImage
        productPrice
        productSpecialPrice
        isPrescriptionNeeded
        categoryName
        status
        mou
        imageBaseUrl
        id
        is_in_stock
        small_image
        thumbnail
        type_id
        quantity
        isShippable
        MaxOrderQty
        urlKey
      }
    }
  }
`;

export const GET_LATEST_MEDICINE_ORDER = gql`
  query getLatestMedicineOrder($patientUhid: String!) {
    getLatestMedicineOrder(patientUhid: $patientUhid) {
      medicineOrderDetails {
        id
        createdDate
        orderAutoId
        billNumber
        shopAddress
        prescriptionImageUrl
        medicineOrderLineItems {
          medicineSKU
          medicineName
          price
          mrp
          quantity
        }
        currentStatus
        medicineOrderShipments {
          medicineOrderInvoice {
            itemDetails
          }
        }
      }
    }
  }
`;

export const DELETE_PROFILE = gql`
  mutation DeleteProfile($patientId: String) {
    deleteProfile(patientId: $patientId) {
      status
    }
  }
`;

export const DOWNLOAD_DOCUMENT = gql`
  query downloadDocuments($downloadDocumentsInput: DownloadDocumentsInput!) {
    downloadDocuments(downloadDocumentsInput: $downloadDocumentsInput) {
      downloadPaths
    }
  }
`;

export const ADD_MEDICAL_RECORD = gql`
  mutation addPatientMedicalRecord($AddMedicalRecordInput: AddMedicalRecordInput) {
    addPatientMedicalRecord(addMedicalRecordInput: $AddMedicalRecordInput) {
      status
    }
  }
`;

export const UPLOAD_DOCUMENT = gql`
  mutation uploadDocument($UploadDocumentInput: UploadDocumentInput) {
    uploadDocument(uploadDocumentInput: $UploadDocumentInput) {
      status
      fileId
      filePath
    }
  }
`;

export const DELETE_PATIENT_MEDICAL_RECORD = gql`
  mutation deletePatientMedicalRecord($recordId: ID!) {
    deletePatientMedicalRecord(recordId: $recordId) {
      status
    }
  }
`;

export const SEND_HELP_EMAIL = gql`
  query SendHelpEmail($helpEmailInput: HelpEmailInput) {
    sendHelpEmail(helpEmailInput: $helpEmailInput)
  }
`;

// diagnosis queries

export const SEARCH_DIAGNOSTICS = gql`
  query searchDiagnostics($city: String, $patientId: String, $searchText: String!) {
    searchDiagnostics(city: $city, patientId: $patientId, searchText: $searchText) {
      diagnostics {
        id
        itemId
        itemName
        itemType
        rate
        itemType
        gender
        itemRemarks
        city
        state
        collectionType
        fromAgeInDays
        toAgeInDays
        testPreparationData
      }
    }
  }
`;

export const GET_DIAGNOSTIC_DATA = gql`
  query getDiagnosticsData {
    getDiagnosticsData {
      diagnosticOrgans {
        id
        organName
        organImage
        diagnostics {
          id
          itemId
          itemName
          gender
          rate
          itemRemarks
          city
          state
          itemType
          fromAgeInDays
          toAgeInDays
          testPreparationData
          collectionType
        }
      }
      diagnosticHotSellers {
        id
        packageName
        price
        packageImage
        diagnostics {
          id
          itemId
          itemName
          gender
          rate
          itemRemarks
          city
          state
          itemType
          fromAgeInDays
          toAgeInDays
          testPreparationData
          collectionType
        }
      }
    }
  }
`;

export const GET_DIAGNOSTICS_CITES = gql`
  query getDiagnosticsCites($patientId: String, $cityName: String) {
    getDiagnosticsCites(patientId: $patientId, cityName: $cityName) {
      diagnosticsCities {
        cityname
        statename
        cityid
        stateid
      }
    }
  }
`;

export const GET_DIAGNOSTIC_ORDER_LIST = gql`
  query GetDiagnosticOrdersList($patientId: String) {
    getDiagnosticOrdersList(patientId: $patientId) {
      ordersList {
        id
        patientAddressId
        city
        slotTimings
        employeeSlotId
        diagnosticEmployeeCode
        diagnosticBranchCode
        totalPrice
        prescriptionUrl
        diagnosticDate
        centerName
        centerCode
        centerCity
        centerState
        centerLocality
        orderStatus
        orderType
        displayId
        createdDate
        diagnosticOrderLineItems {
          id
          itemId
          quantity
          price
          diagnostics {
            id
            itemId
            itemName
          }
        }
      }
    }
  }
`;

export const GET_DIAGNOSTIC_ORDER_LIST_DETAILS = gql`
  query GetDiagnosticOrderDetails($diagnosticOrderId: String) {
    getDiagnosticOrderDetails(diagnosticOrderId: $diagnosticOrderId) {
      ordersList {
        id
        patientAddressId
        city
        slotTimings
        employeeSlotId
        diagnosticEmployeeCode
        diagnosticBranchCode
        totalPrice
        prescriptionUrl
        diagnosticDate
        centerName
        centerCode
        centerCity
        centerState
        centerLocality
        orderStatus
        orderType
        displayId
        createdDate
        diagnosticOrderLineItems {
          id
          itemId
          price
          quantity
          diagnostics {
            id
            itemId
            itemName
            gender
            rate
            itemRemarks
            city
            state
            itemType
            fromAgeInDays
            collectionType
          }
        }
      }
    }
  }
`;

export const SEARCH_DIAGNOSTICS_BY_ID = gql`
  query searchDiagnosticsById($itemIds: String) {
    searchDiagnosticsById(itemIds: $itemIds) {
      diagnostics {
        id
        itemId
        itemName
        itemType
        rate
        itemType
        gender
        itemRemarks
        city
        state
        collectionType
        fromAgeInDays
        toAgeInDays
        testPreparationData
      }
    }
  }
`;

export const GET_DIAGNOSTIC_SLOTS = gql`
  query getDiagnosticSlots(
    $patientId: String
    $hubCode: String
    $selectedDate: Date
    $zipCode: Int
  ) {
    getDiagnosticSlots(
      patientId: $patientId
      hubCode: $hubCode
      selectedDate: $selectedDate
      zipCode: $zipCode
    ) {
      diagnosticBranchCode
      diagnosticSlot {
        employeeCode
        employeeName
        slotInfo {
          endTime
          status
          startTime
          slot
        }
      }
    }
  }
`;
export const SAVE_DIAGNOSTIC_ORDER = gql`
  mutation SaveDiagnosticOrder($diagnosticOrderInput: DiagnosticOrderInput) {
    SaveDiagnosticOrder(diagnosticOrderInput: $diagnosticOrderInput) {
      errorCode
      errorMessage
      orderId
      displayId
    }
  }
`;

export const GET_SITEMAP = gql`
  mutation generateSitemap {
    generateSitemap {
      specialityUrls {
        urlName
        url
      }
      doctorUrls {
        urlName
        url
      }
      articleUrls {
        urlName
        url
      }
      healthAreasUrls {
        urlName
        url
      }
      shopByCategoryUrls {
        urlName
        url
      }
      medicinesUrls {
        urlName
        url
      }
      staticPageUrls {
        urlName
        url
      }
    }
  }
`;
