import gql from 'graphql-tag';

export const GET_DOCTOR_DETAILS_BY_ID = gql`
  query getDoctorProfileById($id: String!) {
    getDoctorProfileById(id: $id) {
      profile {
        id
        firstName
        lastName
        mobileNumber
        experience
        speciality
        specialization
        isStarDoctor
        education
        services
        languages
        city
        awards
        photoUrl
        registrationNumber
        isProfileComplete
        availableForPhysicalConsultation
        availableForVirtualConsultation
        onlineConsultationFees
        physicalConsultationFees
        package
        inviteStatus
      }
      clinics {
        name
        image
        addressLine1
        addressLine2
        addressLine3
        city
      }
      starDoctorTeam {
        id
        firstName
        lastName
        mobileNumber
        experience
        speciality
        specialization
        isStarDoctor
        education
        services
        languages
        city
        awards
        photoUrl
        registrationNumber
        isProfileComplete
        availableForPhysicalConsultation
        availableForVirtualConsultation
        onlineConsultationFees
        physicalConsultationFees
        package
        inviteStatus
      }
      consultationHours {
        days
        startTime
        endTime
        availableForPhysicalConsultation
        availableForVirtualConsultation
        type
      }
    }
  }
`;

export const SEARCH_DOCTORS_AND_SPECIALITY = gql`
  query SearchDoctorAndSpecialty($searchText: String!) {
    SearchDoctorAndSpecialty(searchText: $searchText) {
      doctors {
        id
        firstName
        lastName
        speciality
        experience
        education
        availableForPhysicalConsultation
        availableForVirtualConsultation
        photoUrl
        city
      }
      specialties {
        name
        image
      }
    }
  }
`;

export const DOCTORS_BY_SPECIALITY = gql`
  query getSpecialtyDoctorsWithFilters($filterInput: filterInput) {
    getSpecialtyDoctorsWithFilters(filterInput: $filterInput) {
      doctors {
        id
        firstName
        lastName
        speciality
        availableForPhysicalConsultation
        availableForVirtualConsultation
        education
        city
        photoUrl
        experience
      }
    }
  }
`;
