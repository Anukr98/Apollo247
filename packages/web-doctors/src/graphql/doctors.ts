import gql from 'graphql-tag';

export const UPDATE_DOCTOR_ONLINE_STATUS = gql`
  mutation UpdateDoctorOnlineStatus($doctorId: String!, $onlineStatus: DOCTOR_ONLINE_STATUS!) {
    updateDoctorOnlineStatus(doctorId: $doctorId, onlineStatus: $onlineStatus) {
      doctor {
        id
        onlineStatus
      }
    }
  }
`;

export const GET_BLOCKED_CALENDAR = gql`
  query GetBlockedCalendar($doctorId: String!) {
    getBlockedCalendar(doctorId: $doctorId) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const ADD_BLOCKED_CALENDAR_ITEM = gql`
  mutation AddBlockedCalendarItem($doctorId: String!, $start: DateTime!, $end: DateTime!) {
    addBlockedCalendarItem(doctorId: $doctorId, start: $start, end: $end) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const UPDATE_BLOCKED_CALENDAR_ITEM = gql`
  mutation UpdateBlockedCalendarItem(
    $id: Int!
    $doctorId: String!
    $start: DateTime!
    $end: DateTime!
  ) {
    updateBlockedCalendarItem(id: $id, doctorId: $doctorId, start: $start, end: $end) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const REMOVE_BLOCKED_CALENDAR_ITEM = gql`
  mutation RemoveBlockedCalendarItem($id: Int!) {
    removeBlockedCalendarItem(id: $id) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;

export const BLOCK_MULTIPLE_CALENDAR_ITEMS = gql`
  mutation BlockMultipleCalendarItems($blockCalendarInputs: BlockMultipleItems!) {
    blockMultipleCalendarItems(blockCalendarInputs: $blockCalendarInputs) {
      blockedCalendar {
        id
        doctorId
        start
        end
      }
    }
  }
`;
/* get doctor details by doctor id */
export const GET_DOCTOR_DETAILS_BY_ID = gql`
  query GetDoctorDetailsById($id: String!) {
    getDoctorDetailsById(id: $id) {
      id
      salutation
      firstName
      lastName
      displayName
      mobileNumber
      experience
      specialization
      languages
      city
      awards
      photoUrl
      registrationNumber
      onlineConsultationFees
      physicalConsultationFees
      qualification
      doctorType
      starTeam {
        associatedDoctor {
          firstName
          lastName
          experience
          qualification
          id
          photoUrl
          specialty {
            id
            name
            image
          }
          doctorHospital {
            facility {
              name
              facilityType
              streetLine1
              streetLine2
              streetLine3
              city
              country
              latitude
              longitude
              id
            }
          }
        }
      }
      specialty {
        id
        image
        name
      }
      zip
      doctorType
      doctorHospital {
        facility {
          city
          country
          facilityType
          latitude
          longitude
          name
          state
          streetLine1
          streetLine2
          streetLine3
          id
        }
      }
      consultHours {
        consultMode
        consultType
        endTime
        id
        startTime
        weekDay
        actualDay
        isActive
      }
    }
  }
`;

export const GET_JD_DASHBOARD = gql`
  query GetJuniorDoctorDashboard($fromDate: Date!, $toDate: Date!, $offset: Int!, $limit: Int!) {
    getJuniorDoctorDashboard(fromDate: $fromDate, toDate: $toDate, offset: $offset, limit: $limit) {
      consultsBookedButNotInQueue
      juniorDoctorDetails {
        firstName
        lastName
        salutation
        onlineStatus
        id
      }
      juniorDoctorQueueItems {
        doctorid
        queuedconsultscount
      }
    }
  }
`;

export const GET_DOCTOR_FAVOURITE_MEDICINE = gql`
  query GetDoctorFavouriteMedicineList {
    getDoctorFavouriteMedicineList {
      medicineList {
        medicineConsumptionDurationInDays
        medicineConsumptionDuration
        medicineConsumptionDurationUnit
        medicineFormTypes
        medicineFrequency
        medicineDosage
        medicineUnit
        medicineInstructions
        medicineTimings
        medicineToBeTaken
        medicineName
        id
        externalId
      }
    }
  }
`;
export const GET_DOCTOR_FAVOURITE_TESTS = gql`
  query GetDoctorFavouriteTestList {
    getDoctorFavouriteTestList {
      testList {
        id
        itemname
      }
    }
  }
`;

export const GET_DOCTOR_NEXT_AVAILABILITY = gql`
  query GetDoctorNextAvailableSlot($DoctorNextAvailableSlotInput: DoctorNextAvailableSlotInput) {
    getDoctorNextAvailableSlot(DoctorNextAvailableSlotInput: $DoctorNextAvailableSlotInput) {
      doctorAvailalbeSlots {
        doctorId
        availableSlot
      }
    }
  }
`;

export const GET_DOCTOR_AVAILABLE_SLOTS = gql`
  query GetDoctorAvailableSlots($DoctorAvailabilityInput: DoctorAvailabilityInput) {
    getDoctorAvailableSlots(DoctorAvailabilityInput: $DoctorAvailabilityInput) {
      availableSlots
    }
  }
`;
