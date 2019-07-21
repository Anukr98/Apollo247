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
        typeOfConsult
        inviteStatus
      }
      clinics {
        name
        location
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
        typeOfConsult
        inviteStatus
      }
      consultationHours {
        days
        timings
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
      }
      specialties {
        name
        image
      }
    }
  }
`;

export const FILTER_DOCTORS = gql`
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
