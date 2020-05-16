import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { PlannedDoctors } from 'consults-service/entities';
import { PlannedDoctorsRepo } from 'consults-service/repositories/plannedDoctorsRepository';
import { Doctor, ConsultHours } from 'doctors-service/entities';
import { format, isWithinInterval } from 'date-fns';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import _isEmpty from 'lodash/isEmpty';
import { ApiConstants } from 'ApiConstants';

export const availableDoctorsTypeDefs = gql`
  type SpecialityAndCounts {
    speciality: String
    morning: Int
    afternoon: Int
    evening: Int
    night: Int
  }

  type GetAvailableDoctorsCountResult {
    count: [SpecialityAndCounts]
  }
  extend type Query {
    getAvailableDoctorsCount(availabilityDate: Date): GetAvailableDoctorsCountResult
  }
`;
type SpecialityAndCounts = {
  speciality: string;
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
};

type GetAvailableDoctorsCountResult = {
  count: SpecialityAndCounts[];
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
  docSpecialityRepo: doctorsDb.getCustomRepository(DoctorSpecialtyRepository),
  consultHourRep: doctorsDb.getCustomRepository(DoctorConsultHoursRepository),
  plannedDoctorsRepo: consultsDb.getCustomRepository(PlannedDoctorsRepo),
});

const getAvailableDoctorsCount: Resolver<
  null,
  { availabilityDate: Date; docLimit: number; docOffset: number },
  ConsultServiceContext,
  GetAvailableDoctorsCountResult
> = async (parent, args, context) => {
  if (!args.availabilityDate) {
    throw new AphError(AphErrorMessages.INVALID_DATE_FORMAT, undefined, {});
  }
  const { docRepo, docSpecialityRepo } = getRepos(context);
  const docsList = await docRepo.getAllDoctors('0', args.docLimit, args.docOffset);
  const specialityList = await docSpecialityRepo.findAll();
  const result: SpecialityAndCounts[] = [];
  const specialitys: { [k: string]: Doctor[] } = {};
  specialityList.forEach((speciality) => {
    result.push({
      speciality: speciality.name,
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    });
  });
  docsList.forEach((doctor, index, array) => {
    if (doctor.specialty) {
      if (specialitys[doctor.specialty.name]) {
        specialitys[doctor.specialty.name].push(doctor);
      } else {
        specialitys[doctor.specialty.name] = [doctor];
      }
    }
  });
  const resultArray = await specialityResult(specialitys, result, args.availabilityDate, context);
  return { count: resultArray };
};

export const specialityResult = async (
  specialitys: { [k: string]: Doctor[] },
  result: SpecialityAndCounts[],
  availabilityDate: Date,
  context: ConsultServiceContext
) => {
  return new Promise<SpecialityAndCounts[]>(async (resolve, reject) => {
    let mainResult: SpecialityAndCounts[] = [...result];
    Object.values(specialitys).forEach(async (speciality, index, array) => {
      const details = await getSpecialityDetails(speciality, availabilityDate, context);
      const data = await addFinalResult(mainResult, result, details);
      mainResult = data;
      if (index + 1 === array.length) {
        resolve(mainResult);
      }
    });
  });
};

export const addFinalResult = async (
  mainResult: SpecialityAndCounts[],
  result: SpecialityAndCounts[],
  details: SpecialityAndCounts
) => {
  return new Promise<SpecialityAndCounts[]>(async (resolve, reject) => {
    const data: SpecialityAndCounts[] = [...mainResult];
    result.forEach((item, index, array) => {
      if (item.speciality === details.speciality) {
        data[index] = details;
      }
      if (index + 1 === array.length) {
        resolve(data);
      }
    });
  });
};

export const getSpecialityDetails = async (
  speciality: Doctor[],
  availabilityDate: Date,
  context: ConsultServiceContext
) => {
  const { consultHourRep, plannedDoctorsRepo } = getRepos(context);
  return new Promise<SpecialityAndCounts>(async (resolve, reject) => {
    let morning: number = 0;
    let afternoon: number = 0;
    let evening: number = 0;
    let night: number = 0;
    let check: boolean = true;
    speciality.forEach(async (doctor, index, array) => {
      const weekDay = format(availabilityDate, 'EEEE').toUpperCase();
      const timeSlots = await consultHourRep.getConsultHours(doctor.id, weekDay);
      if (!_isEmpty(timeSlots)) {
        check = false;
        const counts = await checkTimeslots(timeSlots);
        morning += counts[0];
        afternoon += counts[1];
        evening += counts[2];
        night += counts[3];
        check = true;
      }

      if (index + 1 === array.length) {
        const timeOut = setInterval(async () => {
          if (check) {
            clearInterval(timeOut);
            const specialityDetails: SpecialityAndCounts = {
              speciality: doctor.specialty.name,
              morning: morning,
              afternoon: afternoon,
              evening: evening,
              night: night,
            };
            const plannedDoctorsAttrs: Partial<PlannedDoctors> = {
              availabilityDate: availabilityDate,
              specialityId: doctor.specialty.id,
              updatedDate: new Date(),
              ...specialityDetails,
            };
            await plannedDoctorsRepo.saveDetails(plannedDoctorsAttrs);
            resolve(specialityDetails);
          }
        }, 50);
      }
    });
  });
};

export const checkTimeslots = async (timeSlots: ConsultHours[]) => {
  return new Promise<number[]>(async (resolve, reject) => {
    let morning: number = 0;
    let afternoon: number = 0;
    let evening: number = 0;
    let night: number = 0;
    timeSlots.forEach((timeSlot, index, array) => {
      const d = new Date(ApiConstants.SAMPLE_DATE + timeSlot.startTime);
      if (
        isWithinInterval(d, {
          start: new Date(ApiConstants.SAMPLE_DATE_MORNING_START),
          end: new Date(ApiConstants.SAMPLE_DATE_MORNING_END),
        })
      ) {
        morning++;
      } else if (
        isWithinInterval(d, {
          start: new Date(ApiConstants.SAMPLE_DATE_AFTERNOON_START),
          end: new Date(ApiConstants.SAMPLE_DATE_AFTERNOON_END),
        })
      ) {
        afternoon++;
      } else if (
        isWithinInterval(d, {
          start: new Date(ApiConstants.SAMPLE_DATE_EVENING_START),
          end: new Date(ApiConstants.SAMPLE_DATE_EVENING_END),
        })
      ) {
        evening++;
      } else if (
        isWithinInterval(d, {
          start: new Date(ApiConstants.SAMPLE_DATE_NIGHT_START),
          end: new Date(ApiConstants.SAMPLE_DATE_NIGHT_END),
        })
      ) {
        night++;
      }
      if (index + 1 === array.length) {
        resolve([morning, afternoon, evening, night]);
      }
    });
  });
};

export const availableDoctorsResolvers = {
  Query: {
    getAvailableDoctorsCount,
  },
};
