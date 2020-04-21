import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import {
  DoctorsFavouriteMedicine,
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_FREQUENCY,
  MEDICINE_CONSUMPTION_DURATION,
  MEDICINE_FORM_TYPES,
  ROUTE_OF_ADMINISTRATION,
} from 'doctors-service/entities';
import { DoctorFavouriteMedicineRepository } from 'doctors-service/repositories/doctorFavouriteMedicineRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { MEDICINE_UNIT } from 'consults-service/entities';
import { ApiConstants } from 'ApiConstants';

export const saveDoctorFavouriteMedicineTypeDefs = gql`
  enum MEDICINE_FORM_TYPES {
    GEL_LOTION_OINTMENT
    OTHERS
  }

  enum MEDICINE_TIMINGS {
    AS_NEEDED
    EVENING
    MORNING
    NIGHT
    NOON
  }

  enum MEDICINE_TO_BE_TAKEN {
    AFTER_FOOD
    BEFORE_FOOD
  }

  enum MEDICINE_CONSUMPTION_DURATION {
    DAYS
    MONTHS
    WEEKS
  }

  enum MEDICINE_UNIT {
    BOTTLE
    CAPSULE
    CREAM
    DROPS
    GEL
    INJECTION
    LOTION
    ML
    NA
    OINTMENT
    OTHERS
    POWDER
    ROTACAPS
    SACHET
    SOAP
    SOLUTION
    SPRAY
    SUSPENSION
    SYRUP
    TABLET
  }

  enum MEDICINE_FREQUENCY {
    AS_NEEDED
    FIVE_TIMES_A_DAY
    FOUR_TIMES_A_DAY
    ONCE_A_DAY
    THRICE_A_DAY
    TWICE_A_DAY
    ALTERNATE_DAY
    THREE_TIMES_A_WEEK
    ONCE_A_WEEK
    EVERY_HOUR
    EVERY_TWO_HOURS
    EVERY_FOUR_HOURS
    TWICE_A_WEEK
    ONCE_IN_15_DAYS
    ONCE_A_MONTH
  }

  enum ROUTE_OF_ADMINISTRATION {
    ORALLY
    SUBLINGUAL
    PER_RECTAL
    LOCAL_APPLICATION
    INTRAMUSCULAR
    INTRAVENOUS
    SUBCUTANEOUS
    INHALE
    GARGLE
    ORAL_DROPS
    NASAL_DROPS
    EYE_DROPS
    EAR_DROPS
  }

  input SaveDoctorsFavouriteMedicineInput {
    externalId: String
    medicineConsumptionDuration: String
    medicineConsumptionDurationInDays: Int!
    medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION
    medicineDosage: String!
    medicineFormTypes: MEDICINE_FORM_TYPES
    medicineFrequency: MEDICINE_FREQUENCY
    medicineInstructions: String
    medicineName: String!
    medicineTimings: [MEDICINE_TIMINGS]!
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineUnit: MEDICINE_UNIT!
    routeOfAdministration: ROUTE_OF_ADMINISTRATION
    medicineCustomDosage: String
  }

  type DoctorFavouriteMedicine {
    externalId: String
    id: String
    medicineConsumptionDuration: String
    medicineConsumptionDurationInDays: String
    medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION
    medicineDosage: String
    medicineFormTypes: MEDICINE_FORM_TYPES
    medicineFrequency: MEDICINE_FREQUENCY
    medicineInstructions: String
    medicineName: String
    medicineTimings: [MEDICINE_TIMINGS]
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineUnit: MEDICINE_UNIT
    routeOfAdministration: ROUTE_OF_ADMINISTRATION
    medicineCustomDosage: String
  }

  input UpdateDoctorsFavouriteMedicineInput {
    externalId: String
    id: ID!
    medicineConsumptionDuration: String
    medicineConsumptionDurationInDays: Int
    medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION
    medicineDosage: String
    medicineFormTypes: MEDICINE_FORM_TYPES
    medicineFrequency: MEDICINE_FREQUENCY
    medicineInstructions: String
    medicineName: String!
    medicineTimings: [MEDICINE_TIMINGS]!
    medicineToBeTaken: [MEDICINE_TO_BE_TAKEN]
    medicineUnit: MEDICINE_UNIT
    routeOfAdministration: ROUTE_OF_ADMINISTRATION
    medicineCustomDosage: String
  }

  type FavouriteMedicineList {
    medicineList: [DoctorFavouriteMedicine]
  }

  type GetDoctorFavouriteMedicineListResult {
    medicineList: [DoctorFavouriteMedicine]
    allowedDosages: [String]
  }

  extend type Query {
    getDoctorFavouriteMedicineList: GetDoctorFavouriteMedicineListResult
  }

  extend type Mutation {
    saveDoctorsFavouriteMedicine(
      saveDoctorsFavouriteMedicineInput: SaveDoctorsFavouriteMedicineInput
    ): FavouriteMedicineList!
    removeFavouriteMedicine(id: String): FavouriteMedicineList!
    updateDoctorFavouriteMedicine(
      updateDoctorsFavouriteMedicineInput: UpdateDoctorsFavouriteMedicineInput
    ): FavouriteMedicineList
  }
`;

type FavouriteMedicineList = {
  medicineList: DoctorsFavouriteMedicine[];
};

type GetDoctorFavouriteMedicineListResult = {
  medicineList: DoctorsFavouriteMedicine[];
  allowedDosages: String[];
};

type SaveDoctorsFavouriteMedicineInput = {
  externalId: string;
  medicineConsumptionDuration: string;
  medicineConsumptionDurationInDays: number;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION;
  medicineDosage: string;
  medicineFormTypes: MEDICINE_FORM_TYPES;
  medicineFrequency: MEDICINE_FREQUENCY;
  medicineInstructions: string;
  medicineName: string;
  medicineTimings: MEDICINE_TIMINGS[];
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];
  medicineUnit: MEDICINE_UNIT;
  routeOfAdministration?: ROUTE_OF_ADMINISTRATION;
  medicineCustomDosage?: string;
};

type SaveDoctorsFavouriteMedicineInputArgs = {
  saveDoctorsFavouriteMedicineInput: SaveDoctorsFavouriteMedicineInput;
};

const saveDoctorsFavouriteMedicine: Resolver<
  null,
  SaveDoctorsFavouriteMedicineInputArgs,
  DoctorsServiceContext,
  FavouriteMedicineList
> = async (parent, { saveDoctorsFavouriteMedicineInput }, { doctorsDb, mobileNumber }) => {
  //doctor check
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  if (saveDoctorsFavouriteMedicineInput.medicineName.trim().length == 0)
    throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const favouriteMedicineRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);

  //check for medicine name exsitence
  const getMedicineByName = await favouriteMedicineRepo.getFavouriteMedicineByName(
    saveDoctorsFavouriteMedicineInput.medicineName.toLowerCase(),
    doctordata.id
  );
  if (getMedicineByName !== null && getMedicineByName.length > 0)
    throw new AphError(AphErrorMessages.MEDICINE_ALREADY_EXIST);

  //add fav medicine
  const saveDoctorFavouriteMedicineAttrs: Partial<DoctorsFavouriteMedicine> = {
    ...saveDoctorsFavouriteMedicineInput,
    doctor: doctordata,
  };
  await favouriteMedicineRepo.saveDoctorFavouriteMedicine(saveDoctorFavouriteMedicineAttrs);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);
  const favouriteTestList = await favouriteTestRepo.favouriteMedicines(doctordata.id);
  return { medicineList: favouriteTestList };
};

const getDoctorFavouriteMedicineList: Resolver<
  null,
  {},
  DoctorsServiceContext,
  GetDoctorFavouriteMedicineListResult
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const favouriteTestRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);
  const favouriteTestList = await favouriteTestRepo.favouriteMedicines(doctordata.id);
  return {
    medicineList: favouriteTestList,
    allowedDosages: ApiConstants.ALLOWED_DOSAGES.split(','),
  };
};

const removeFavouriteMedicine: Resolver<
  null,
  { id: string },
  DoctorsServiceContext,
  FavouriteMedicineList
> = async (parent, args, { mobileNumber, doctorsDb }) => {
  if (args.id.trim().length == 0) throw new AphError(AphErrorMessages.INVALID_ENTITY);

  const favouriteMedicineRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  // check if id exists or not
  const checkid = await favouriteMedicineRepo.findById(args.id);
  if (checkid == null) throw new AphError(AphErrorMessages.INVALID_FAVOURITE_ID);

  //delete medicine
  await favouriteMedicineRepo.removeFavouriteMedicineById(args.id);

  const doctorsOtherFavouriteMedicines = await favouriteMedicineRepo.favouriteMedicines(<string>(
    doctordata.id
  ));

  return { medicineList: doctorsOtherFavouriteMedicines };
};

type UpdateDoctorsFavouriteMedicineInput = {
  externalId: string;
  id: string;
  medicineConsumptionDuration: string;
  medicineConsumptionDurationInDays: number;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION;
  medicineDosage: string;
  medicineFormTypes: MEDICINE_FORM_TYPES;
  medicineFrequency: MEDICINE_FREQUENCY;
  medicineInstructions: string;
  medicineName: string;
  medicineTimings: MEDICINE_TIMINGS[];
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];
  medicineUnit: string;
  routeOfAdministration?: ROUTE_OF_ADMINISTRATION;
  medicineCustomDosage?: string;
};

type UpdateDoctorsFavouriteMedicineInputArgs = {
  updateDoctorsFavouriteMedicineInput: UpdateDoctorsFavouriteMedicineInput;
};

const updateDoctorFavouriteMedicine: Resolver<
  null,
  UpdateDoctorsFavouriteMedicineInputArgs,
  DoctorsServiceContext,
  FavouriteMedicineList
> = async (parent, { updateDoctorsFavouriteMedicineInput }, { doctorsDb, mobileNumber }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  if (updateDoctorsFavouriteMedicineInput.medicineName.trim().length == 0)
    throw new AphError(AphErrorMessages.INVALID_ENTITY);

  //check if id exists or not
  const favouriteMedicineRepo = doctorsDb.getCustomRepository(DoctorFavouriteMedicineRepository);
  const checkId = await favouriteMedicineRepo.findById(updateDoctorsFavouriteMedicineInput.id);
  if (checkId == null) throw new AphError(AphErrorMessages.INVALID_FAVOURITE_ID);

  //check for medicine name exsitence
  const getMedicineByName = await favouriteMedicineRepo.checkMedicineNameWhileUpdate(
    updateDoctorsFavouriteMedicineInput.medicineName.toLowerCase(),
    updateDoctorsFavouriteMedicineInput.id
  );
  if (getMedicineByName !== null && getMedicineByName.length > 0)
    throw new AphError(AphErrorMessages.MEDICINE_ALREADY_EXIST);

  //update medicine
  await favouriteMedicineRepo.updateFavouriteMedicine(
    updateDoctorsFavouriteMedicineInput.id,
    updateDoctorsFavouriteMedicineInput
  );

  //get medicine list
  const doctorsOtherFavouriteMedicines = await favouriteMedicineRepo.favouriteMedicines(
    doctordata.id
  );

  return { medicineList: doctorsOtherFavouriteMedicines };
};

export const saveDoctorFavouriteMedicineResolver = {
  Query: {
    getDoctorFavouriteMedicineList,
  },
  Mutation: {
    saveDoctorsFavouriteMedicine,
    removeFavouriteMedicine,
    updateDoctorFavouriteMedicine,
  },
};
