export interface IPatientDetails {
  __typename: string;
  dateOfBirth?: string;
  emailAddress?: string;
  firstName?: string;
  gender?: string;
  id: string;
  lastName?: string;
  mobileNumber?: string;
  patientMedicalHistory: {
    __typename?: string;
    bp?: string;
    dietAllergies?: string;
    drugAllergies?: string;
    height?: string;
    menstrualHistory?: string;
    pastMedicalHistory?: string;
    pastSurgicalHistory?: string;
    temperature?: string;
    weight?: string;
  };
  photoUrl?: string;
  relation?: string;
  uhid?: string;
}

export interface IPatientProps {
  item: IPatientDetails;
}
