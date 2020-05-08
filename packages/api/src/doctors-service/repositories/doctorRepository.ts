import { EntityRepository, Repository, Brackets, Connection, Not } from 'typeorm';
import {
  Doctor,
  ConsultMode,
  DoctorType,
  DOCTOR_ONLINE_STATUS,
  CityPincodeMapper,
  ConsultHours,
} from 'doctors-service/entities';
import { ES_DOCTOR_SLOT_STATUS } from 'consults-service/entities';
import {
  Range,
  FilterDoctorInput,
  DoctorAvailability,
  DateAvailability,
  ConsultModeAvailability,
  AppointmentDateTime,
  DoctorSlotAvailability,
  DoctorSlotAvailabilityObject,
  DoctorsObject,
} from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import { format, differenceInMinutes, addMinutes, addDays } from 'date-fns';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { ApiConstants } from 'ApiConstants';
//import { DoctorNextAvaialbleSlotsRepository } from 'consults-service/repositories/DoctorNextAvaialbleSlotsRepository';

type DoctorSlot = {
  slotId: number;
  slot: string;
  status: string;
  slotType: string;
};

@EntityRepository(Doctor)
export class DoctorRepository extends Repository<Doctor> {
  async getDoctorSlots(
    availableDate: Date,
    doctorId: string,
    consultsDb: Connection,
    doctorsDb: Connection
  ) {
    let previousDate: Date = availableDate;
    let prevDaySlots = 0;
    previousDate = addDays(availableDate, -1);
    const checkStart = `${previousDate.toDateString()} 18:30:00`;
    const checkEnd = `${availableDate.toDateString()} 18:30:00`;
    console.log(checkStart, checkEnd, 'check start end');
    let weekDay = format(previousDate, 'EEEE').toUpperCase();
    let timeSlots = await ConsultHours.find({
      where: { doctor: doctorId, weekDay },
      order: { startTime: 'ASC' },
    });
    weekDay = format(availableDate, 'EEEE').toUpperCase();
    const timeSlotsNext = await ConsultHours.find({
      where: { doctor: doctorId, weekDay },
      order: { startTime: 'ASC' },
    });
    if (timeSlots.length > 0) {
      prevDaySlots = 1;
    }
    timeSlots = timeSlots.concat(timeSlotsNext);
    let availableSlots: string[] = [];
    const doctorSlots: DoctorSlot[] = [];
    let rowCount = 0;
    let slotCount = 0;
    if (timeSlots && timeSlots.length > 0) {
      timeSlots.map((timeSlot) => {
        let st = `${availableDate.toDateString()} ${timeSlot.startTime.toString()}`;
        const ed = `${availableDate.toDateString()} ${timeSlot.endTime.toString()}`;
        let consultStartTime = new Date(st);
        let consultEndTime = new Date(ed);

        if (consultEndTime < consultStartTime) {
          st = `${previousDate.toDateString()} ${timeSlot.startTime.toString()}`;
          consultStartTime = new Date(st);
        }
        const duration = parseFloat((60 / timeSlot.consultDuration).toFixed(1));
        if (timeSlot.weekDay != timeSlot.actualDay) {
          consultEndTime = addMinutes(consultEndTime, 1);
        }
        let slotsCount =
          (Math.abs(differenceInMinutes(consultEndTime, consultStartTime)) / 60) * duration;
        if (slotsCount - Math.floor(slotsCount) == 0.5) {
          slotsCount = Math.ceil(slotsCount);
        } else {
          slotsCount = Math.floor(slotsCount);
        }
        const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
        let startTime = new Date(previousDate.toDateString() + ' ' + stTime);
        if (prevDaySlots == 0) {
          startTime = new Date(addDays(previousDate, 1).toDateString() + ' ' + stTime);
        }
        if (rowCount > 0) {
          const nextDate = addDays(previousDate, 1);
          const ed = `${nextDate.toDateString()} ${timeSlot.startTime.toString()}`;
          const td = `${nextDate.toDateString()} 00:00:00`;
          if (new Date(ed) >= new Date(td) && timeSlot.weekDay != timeSlots[rowCount - 1].weekDay) {
            previousDate = addDays(previousDate, 1);
            startTime = new Date(previousDate.toDateString() + ' ' + stTime);
          }
        }

        Array(slotsCount)
          .fill(0)
          .map(() => {
            const stTime = startTime;
            startTime = addMinutes(startTime, timeSlot.consultDuration);
            const stTimeHours = stTime
              .getUTCHours()
              .toString()
              .padStart(2, '0');
            const stTimeMins = stTime
              .getUTCMinutes()
              .toString()
              .padStart(2, '0');
            const startDateStr = format(stTime, 'yyyy-MM-dd');
            const endStr = ':00.000Z';
            const generatedSlot = `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
            const timeWithBuffer = addMinutes(new Date(), timeSlot.consultBuffer);

            if (new Date(generatedSlot) > timeWithBuffer) {
              if (
                new Date(generatedSlot) >= new Date(checkStart) &&
                new Date(generatedSlot) < new Date(checkEnd)
              ) {
                if (!availableSlots.includes(generatedSlot)) {
                  const slotInfo = {
                    slotId: ++slotCount,
                    slot: generatedSlot,
                    status: ES_DOCTOR_SLOT_STATUS.OPEN,
                    slotType: timeSlot.consultMode,
                  };
                  doctorSlots.push(slotInfo);
                  availableSlots.push(generatedSlot);
                }
              }
            }
            return `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
          });
        const lastSlot = new Date(availableSlots[availableSlots.length - 1]);
        const lastMins = Math.abs(differenceInMinutes(lastSlot, consultEndTime));
        if (lastMins < timeSlot.consultDuration) {
          availableSlots.pop();
          doctorSlots.pop();
        }
        rowCount++;
      });
    }
    const appts = consultsDb.getCustomRepository(AppointmentRepository);
    const apptSlots = await appts.findByDateDoctorId(doctorId, availableDate);
    if (apptSlots && apptSlots.length > 0) {
      apptSlots.map((appt) => {
        const apptDt = format(appt.appointmentDateTime, 'yyyy-MM-dd');
        const sl = `${apptDt}T${appt.appointmentDateTime
          .getUTCHours()
          .toString()
          .padStart(2, '0')}:${appt.appointmentDateTime
          .getUTCMinutes()
          .toString()
          .padStart(2, '0')}:00.000Z`;
        if (availableSlots.indexOf(sl) >= 0) {
          doctorSlots[availableSlots.indexOf(sl)].status = ES_DOCTOR_SLOT_STATUS.BOOKED;
          //availableSlots.splice(availableSlots.indexOf(sl), 1);
        }
      });
    }
    const doctorBblockedSlots = await appts.getDoctorBlockedSlots(
      doctorId,
      availableDate,
      doctorsDb,
      availableSlots
    );
    if (doctorBblockedSlots.length > 0) {
      availableSlots = availableSlots.filter((val) => {
        !doctorBblockedSlots.includes(val);
        if (doctorBblockedSlots.includes(val)) {
          doctorSlots[availableSlots.indexOf(val)].status = ES_DOCTOR_SLOT_STATUS.BLOCKED;
        }
      });
    }
    return doctorSlots;
  }

  getDoctorProfileData(id: string) {
    return this.findOne({
      where: [{ id, isActive: true }],
      relations: ['specialty', 'doctorHospital', 'doctorHospital.facility'],
    });
  }

  getCityMappingPincode(pincode: string) {
    return CityPincodeMapper.findOne({ pincode });
  }

  getDoctorDetails(firebaseToken: string) {
    return this.findOne({
      where: [{ firebaseToken, isActive: true }],
    });
  }

  async isJuniorDoctor(id: string) {
    const count = await this.count({
      where: { id, doctorType: DoctorType.JUNIOR, isActive: true },
    });
    return count > 0 ? true : false;
  }

  searchDoctorByMobileNumber(mobileNumber: string, isActive: Boolean) {
    return this.findOne({
      where: [{ mobileNumber, isActive }],
    });
  }

  findByMobileNumber(mobileNumber: string, isActive: Boolean) {
    return this.findOne({
      where: [{ mobileNumber, isActive }],
      relations: [
        'specialty',
        'doctorHospital',
        'doctorHospital.facility',
        'consultHours',
        'starTeam',
        'bankAccount',
        'packages',
        'starTeam.associatedDoctor',
        'starTeam.associatedDoctor.specialty',
        'starTeam.associatedDoctor.doctorHospital',
        'starTeam.associatedDoctor.doctorHospital.facility',
        'doctorSecretary',
        'doctorSecretary.secretary',
      ],
    });
  }

  updateFirebaseId(id: string, firebaseToken: string) {
    return this.update(id, { firebaseToken: firebaseToken });
  }

  updateDelegateNumber(id: string, delegateNumber: string) {
    return this.update(id, { delegateNumber });
  }

  updateDoctorSignature(id: string, signature: string) {
    return this.update(id, { signature });
  }

  findById(id: string) {
    return this.findOne({
      where: [{ id, isActive: true }],
      relations: [
        'specialty',
        'doctorHospital',
        'doctorHospital.facility',
        'consultHours',
        'starTeam',
        'bankAccount',
        'packages',
        'starTeam.associatedDoctor',
        'starTeam.associatedDoctor.specialty',
        'starTeam.associatedDoctor.doctorHospital',
        'starTeam.associatedDoctor.doctorHospital.facility',
      ],
    });
  }

  findDoctorByIdWithoutRelations(id: string) {
    return this.findOne({
      where: [{ id, isActive: true }],
    });
  }

  getAllDoctorsInfo(id: string, limit: number, offset: number) {
    if (id == '0') {
      return this.find({
        where: [{ isActive: true }],
        relations: [
          'specialty',
          'doctorHospital',
          'doctorHospital.facility',
          'consultHours',
          'starTeam',
          'bankAccount',
          'packages',
          'starTeam.associatedDoctor',
          'starTeam.associatedDoctor.specialty',
          'starTeam.associatedDoctor.doctorHospital',
          'starTeam.associatedDoctor.doctorHospital.facility',
        ],
        take: limit,
        skip: offset,
      });
    } else {
      return this.find({
        where: [{ id, isActive: true }],
        relations: [
          'specialty',
          'doctorHospital',
          'doctorHospital.facility',
          'consultHours',
          'starTeam',
          'bankAccount',
          'packages',
          'starTeam.associatedDoctor',
          'starTeam.associatedDoctor.specialty',
          'starTeam.associatedDoctor.doctorHospital',
          'starTeam.associatedDoctor.doctorHospital.facility',
        ],
      });
    }
  }

  findByIdWithStatusExclude(id: string) {
    return this.findOne({
      where: [{ id }],
      relations: [
        'specialty',
        'doctorHospital',
        'doctorHospital.facility',
        'consultHours',
        'starTeam',
        'bankAccount',
        'packages',
        'starTeam.associatedDoctor',
        'starTeam.associatedDoctor.specialty',
        'starTeam.associatedDoctor.doctorHospital',
        'starTeam.associatedDoctor.doctorHospital.facility',
      ],
    });
  }

  getSearchDoctorsByIds(doctorIds: string[]) {
    return this.createQueryBuilder('doctor')
      .select('doctor.id', 'typeId')
      .addSelect("doctor.firstName || ' ' || doctor.lastName", 'name')
      .addSelect('doctor.photoUrl', 'image')
      .addSelect('doctor.doctorType', 'doctorType')
      .where('doctor.id IN (:...doctorIds)', { doctorIds })
      .getRawMany();
  }

  searchByName(searchString: string, cityName: string) {
    const cities: string[] = [
      ApiConstants.DOCTOR_SEARCH_DEFAULT_CITY1.toString(),
      ApiConstants.DOCTOR_SEARCH_DEFAULT_CITY2.toString(),
    ];
    if (cityName.trim() != '') {
      cities.push(cityName);
    }
    return (
      this.createQueryBuilder('doctor')
        .leftJoinAndSelect('doctor.specialty', 'specialty')
        .leftJoinAndSelect('doctor.consultHours', 'consultHours')
        .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
        .leftJoinAndSelect('doctorHospital.facility', 'facility')
        .where('doctor.doctorType != :junior', { junior: DoctorType.JUNIOR })
        .andWhere('doctor.isActive = true')
        .andWhere('doctor.isSearchable = true')
        //.andWhere('facility.city IN (:...cities)', { cities })
        .andWhere(
          new Brackets((qb) => {
            qb.andWhere('LOWER(doctor.firstName) LIKE :searchString', {
              searchString: `${searchString}%`,
            });
            qb.orWhere('LOWER(doctor.lastName) LIKE :searchString', {
              searchString: `${searchString}%`,
            });
            qb.orWhere("LOWER(doctor.firstName || ' ' || doctor.lastName) LIKE :searchString", {
              searchString: `${searchString}%`,
            });
          })
        )
        .orderBy('doctor.experience', 'DESC')
        .getMany()
    );
  }

  searchBySpecialty(specialtyId: string) {
    return this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'facility')
      .where('doctor.specialty = :specialtyId', {
        specialtyId,
      })
      .andWhere('doctor.doctorType != :junior', { junior: DoctorType.JUNIOR })
      .andWhere('doctor.isActive = true')
      .orderBy('doctor.experience', 'DESC')
      .getMany();
  }

  findOtherDoctorsOfSpecialty(specialtyId: string, doctorId: string) {
    return this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'facility')
      .where('doctor.specialty = :specialtyId', {
        specialtyId,
      })
      .andWhere('doctor.isActive = true')
      .andWhere('doctor.doctorType != :junior', { junior: DoctorType.JUNIOR })
      .andWhere('doctor.id NOT IN (:doctorId)', { doctorId })
      .orderBy('doctor.experience', 'DESC')
      .getMany();
  }

  sortByRankingAlgorithm(
    a: Doctor,
    b: Doctor,
    docIds: string[],
    facilityDistances?: { [index: string]: string }
  ) {
    //STAR_APOLLO doctor on top(ignoring star appollo sorting)
    if (a.doctorType == DoctorType.STAR_APOLLO && b.doctorType != DoctorType.STAR_APOLLO) return -1;
    if (a.doctorType != DoctorType.STAR_APOLLO && b.doctorType == DoctorType.STAR_APOLLO) return 1;

    //Previously consulted non-payroll doctors on next
    if (docIds.includes(a.id) && a.doctorType != DoctorType.PAYROLL && !docIds.includes(b.id))
      return -1;
    if (!docIds.includes(a.id) && docIds.includes(b.id) && b.doctorType != DoctorType.PAYROLL)
      return 1;

    //close/same city apollo doctors on next, prior to far/other city apollo doctors
    if (facilityDistances && Object.keys(facilityDistances).length > 0) {
      const aFcltyId = a.doctorHospital[0].facility.id;
      const bFcltyId = b.doctorHospital[0].facility.id;
      if (facilityDistances[aFcltyId] === undefined || facilityDistances[aFcltyId] == '') {
        facilityDistances[aFcltyId] = Number.MAX_SAFE_INTEGER.toString();
      }
      if (facilityDistances[bFcltyId] === undefined || facilityDistances[bFcltyId] == '') {
        facilityDistances[bFcltyId] = Number.MAX_SAFE_INTEGER.toString();
      }
      if (parseInt(facilityDistances[aFcltyId], 10) < parseInt(facilityDistances[bFcltyId], 10))
        return -1;
      if (parseInt(facilityDistances[aFcltyId], 10) > parseInt(facilityDistances[bFcltyId], 10))
        return 1;
    }

    //payroll doctors at last
    if (a.doctorType != DoctorType.PAYROLL && b.doctorType == DoctorType.PAYROLL) return -1;
    if (a.doctorType == DoctorType.PAYROLL && b.doctorType != DoctorType.PAYROLL) return 1;

    //Experienced doctor on top
    if (a.experience > b.experience) return -1;
    if (a.experience < b.experience) return 1;

    return 0;
  }

  async getDoctorsNextAvailableSlot(
    doctorIds: string[],
    consultModeFilter: ConsultMode,
    doctorsDb: Connection,
    consultsDb: Connection
  ) {
    const appts = consultsDb.getCustomRepository(AppointmentRepository);
    //const nextSlotRepo = consultsDb.getCustomRepository(DoctorNextAvaialbleSlotsRepository);
    const doctorAvailalbeSlots: DoctorSlotAvailability[] = [];

    const consultHrsRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);

    function slots(doctorId: string) {
      return new Promise<DoctorSlotAvailability>(async (resolve) => {
        let onlineSlot: string = '';
        let physicalSlot: string = '';

        const consultHrsOnline = await consultHrsRepo.checkByDoctorAndConsultMode(
          doctorId,
          'ONLINE'
        );
        if (consultHrsOnline > 0) {
          //if the slot is empty check for next day
          let nextDate = new Date();
          let counter = 0;
          while (true) {
            const nextSlot = await appts.getDoctorNextSlotDate(
              doctorId,
              nextDate,
              doctorsDb,
              'ONLINE',
              new Date()
            );
            if (nextSlot != '' && nextSlot != undefined) {
              onlineSlot = nextSlot;
              break;
            }

            //checking availability for pre-defined days
            if (
              process.env.MAX_DOCTOR_AVAILABILITY_CHECK_DAYS &&
              // eslint-disable-next-line radix
              counter >= parseInt(process.env.MAX_DOCTOR_AVAILABILITY_CHECK_DAYS)
            ) {
              onlineSlot = '';
              break;
            }

            nextDate = addDays(nextDate, 1);
            counter++;
          }
        }

        const consultHrsPhysical = await consultHrsRepo.checkByDoctorAndConsultMode(
          doctorId,
          'PHYSICAL'
        );
        if (consultHrsPhysical > 0) {
          //if the slot is empty check for next day
          let nextDate = new Date();
          let counter = 0;
          while (true) {
            const nextSlot = await appts.getDoctorNextSlotDate(
              doctorId,
              nextDate,
              doctorsDb,
              'PHYSICAL',
              new Date()
            );
            if (nextSlot != '' && nextSlot != undefined) {
              physicalSlot = nextSlot;
              break;
            }
            //checking availability for pre-defined days
            if (
              process.env.MAX_DOCTOR_AVAILABILITY_CHECK_DAYS &&
              // eslint-disable-next-line radix
              counter >= parseInt(process.env.MAX_DOCTOR_AVAILABILITY_CHECK_DAYS)
            ) {
              physicalSlot = '';
              break;
            }
            nextDate = addDays(nextDate, 1);
            counter++;
          }
        }

        let referenceSlot = '';
        if (consultModeFilter == ConsultMode.ONLINE) {
          referenceSlot = onlineSlot;
        } else if (consultModeFilter == ConsultMode.PHYSICAL) {
          referenceSlot = physicalSlot;
        } else {
          if (onlineSlot == '' && physicalSlot != '') referenceSlot = physicalSlot;
          else if (physicalSlot == '' && onlineSlot != '') referenceSlot = onlineSlot;
          else referenceSlot = onlineSlot < physicalSlot ? onlineSlot : physicalSlot;
        }

        // if (referenceSlot == '') {
        //   referenceSlot = format(addDays(new Date(), 2), 'yyyy-MM-dd HH:mm');
        // }

        const doctorSlot: DoctorSlotAvailability = {
          doctorId,
          onlineSlot,
          physicalSlot,
          referenceSlot,
          currentDateTime: new Date(),
          availableInMinutes: Math.abs(differenceInMinutes(new Date(), new Date(referenceSlot))),
        };
        doctorAvailalbeSlots.push(doctorSlot);
        resolve(doctorSlot);
      });
    }
    const promises: object[] = [];
    doctorIds.map(async (doctorId) => {
      promises.push(slots(doctorId));
    });
    await Promise.all(promises);
    return { doctorAvailalbeSlots };
  }

  async getConsultAndBookNowDoctors(
    doctorNextAvailSlots: DoctorSlotAvailability[],
    finalDoctorsList: Doctor[]
  ) {
    //sort doctors by available time
    doctorNextAvailSlots.sort((a, b) => a.availableInMinutes - b.availableInMinutes);

    const consultNowDoctorSlots = doctorNextAvailSlots.filter((doctor) => {
      return doctor.availableInMinutes <= 60;
    });
    const bookNowDoctorSlots = doctorNextAvailSlots.filter((doctor) => {
      return doctor.availableInMinutes > 60 || isNaN(doctor.availableInMinutes);
    });
    //create key-pair object to map with doctors data object
    const timeSortedConsultNowDoctorSlots: DoctorSlotAvailabilityObject = {};
    consultNowDoctorSlots.forEach((doctorSlot) => {
      timeSortedConsultNowDoctorSlots[doctorSlot.doctorId] = doctorSlot;
    });

    const timeSortedBookNowDoctorSlots: DoctorSlotAvailabilityObject = {};
    bookNowDoctorSlots.forEach((doctorSlot) => {
      timeSortedBookNowDoctorSlots[doctorSlot.doctorId] = doctorSlot;
    });

    //map to real doctors data
    const consultNowDoctorsObject: DoctorsObject = {};
    for (const docId in timeSortedConsultNowDoctorSlots) {
      const matchedDoctor = finalDoctorsList.filter((finalDoc) => {
        return finalDoc.id == docId;
      });
      consultNowDoctorsObject[docId] = matchedDoctor[0];
    }

    const bookNowDoctorsObject: DoctorsObject = {};
    for (const docId in timeSortedBookNowDoctorSlots) {
      const matchedDoctor = finalDoctorsList.filter((finalDoc) => {
        return finalDoc.id == docId;
      });
      bookNowDoctorsObject[docId] = matchedDoctor[0];
    }

    return {
      consultNowDoctors: Object.values(consultNowDoctorsObject),
      bookNowDoctors: Object.values(bookNowDoctorsObject),
    };
  }

  async filterDoctors(filterInput: FilterDoctorInput) {
    const { specialty, city, experience, gender, fees, language } = filterInput;
    let pincodeCity = '';
    if (filterInput.pincode) {
      const pincodeCityDetails = await this.getCityMappingPincode(filterInput.pincode);
      if (pincodeCityDetails) pincodeCity = pincodeCityDetails.city;
    }
    const cities: string[] = [
      ApiConstants.DOCTOR_SEARCH_DEFAULT_CITY1.toString(),
      ApiConstants.DOCTOR_SEARCH_DEFAULT_CITY2.toString(),
    ];
    if (pincodeCity.trim() != '') {
      cities.push(pincodeCity);
    }
    const queryBuilder = this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'facility')
      .where('doctor.specialty = :specialty', { specialty })
      .andWhere('doctor.isActive = true')
      .andWhere('doctor.isSearchable = true')
      //.andWhere('facility.city IN (:...cities)', { cities })
      .andWhere('doctor.doctorType != :junior', { junior: DoctorType.JUNIOR });

    if (gender && gender.length > 0) {
      queryBuilder.andWhere('doctor.gender IN (:...gender)', { gender });
    }
    if (language && language.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          language.forEach((lang: String) => {
            lang = lang.toLocaleLowerCase();
            qb.orWhere(
              new Brackets((qb) => {
                qb.where("LOWER(doctor.languages) LIKE '%" + lang + "%'");
              })
            );
          });
        })
      );
    }

    if (fees && fees.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          fees.forEach((fee: Range) => {
            qb.orWhere(
              new Brackets((qb) => {
                fee.maximum === -1
                  ? qb.where('doctor.onlineConsultationFees >= ' + fee.minimum)
                  : qb
                      .where('doctor.onlineConsultationFees >= ' + fee.minimum)
                      .andWhere('doctor.onlineConsultationFees <= ' + fee.maximum);
              })
            );
          });
        })
      );
    }

    if (experience && experience.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          experience.forEach((exp: Range) => {
            qb.orWhere(
              new Brackets((qb) => {
                exp.maximum === -1
                  ? qb.where('doctor.experience >= ' + exp.minimum)
                  : qb
                      .where('doctor.experience >= ' + exp.minimum)
                      .andWhere('doctor.experience <= ' + exp.maximum);
              })
            );
          });
        })
      );
    }

    let doctorsResult = await queryBuilder.orderBy('doctor.experience', 'DESC').getMany();
    //console.log(JSON.stringify(doctorsResult));

    if (city && city.length > 0) {
      doctorsResult = doctorsResult.filter((doctor) => {
        const matchedDocHospitals = doctor.doctorHospital.filter((doctorHospital) => {
          return city.includes(doctorHospital.facility.city);
        });
        return matchedDocHospitals.length > 0;
      });
    }

    return doctorsResult;
  }

  getDoctorsAvailability(
    consultModeFilter: ConsultMode,
    doctors: Doctor[],
    selectedDates: string[],
    now?: AppointmentDateTime
  ) {
    const doctorAvailability: DoctorAvailability = {};
    //filtering doctors by consultHours of selected dates
    const selectedDays: string[] = [];
    selectedDates.forEach((date: string) => {
      const weekDay = format(new Date(date), 'EEEE').toUpperCase();
      selectedDays.push(weekDay);
    });

    doctors.forEach((doctor) => {
      const dateAvailability: DateAvailability = {};

      doctor.consultHours.forEach((day) => {
        //logic when availableNow filter is selected
        if (now) {
          let nowDate = format(now.startDateTime, 'yyyy-MM-dd');

          const nowStartTime = format(now.startDateTime, 'HH:mm');
          if (nowStartTime >= '18:30') {
            nowDate = format(addDays(now.startDateTime, 1), 'yyyy-MM-dd');
          }
          const nowDay = format(new Date(nowDate), 'EEEE').toUpperCase();

          if (
            day.weekDay == nowDay &&
            (consultModeFilter == ConsultMode.BOTH ||
              day.consultMode == ConsultMode.BOTH ||
              day.consultMode == consultModeFilter)
          ) {
            const alignedStartTime = this.getNextAlignedSlot(now.startDateTime);
            const alignedEndTime = this.getNextAlignedSlot(now.endDateTime);
            const nowSlots = this.getSlotsInBetween(alignedStartTime, alignedEndTime);

            //getting consult hours that are available in now slot(1 hour)
            const consultHourSlots = this.getSlotsInBetween(day.startTime, day.endTime);
            const consultHoursFilteredSlots = nowSlots.filter((value) =>
              consultHourSlots.includes(value)
            );

            if (dateAvailability[nowDate] == null) {
              dateAvailability[nowDate] = { onlineSlots: 0, physicalSlots: 0, bothSlots: 0 };
            }

            if (day.consultMode == ConsultMode.ONLINE) {
              dateAvailability[nowDate].onlineSlots += consultHoursFilteredSlots.length;
            } else if (day.consultMode == ConsultMode.PHYSICAL) {
              dateAvailability[nowDate].physicalSlots += consultHoursFilteredSlots.length;
            } else {
              dateAvailability[nowDate].bothSlots += consultHoursFilteredSlots.length;
            }
          }
        }

        //logic when dates are selected
        const slotsCount = this.getNumberOfIntervalSlots(day.startTime, day.endTime);
        if (selectedDays.length > 0) {
          if (
            selectedDays.includes(day.weekDay) &&
            (consultModeFilter == ConsultMode.BOTH ||
              day.consultMode == ConsultMode.BOTH ||
              day.consultMode == consultModeFilter)
          ) {
            const availabilityDate = selectedDates[selectedDays.indexOf(day.weekDay)];
            const defaultConsultModeSlotsCount: ConsultModeAvailability = {
              onlineSlots: 0,
              physicalSlots: 0,
              bothSlots: 0,
            };
            if (dateAvailability[availabilityDate] == null) {
              dateAvailability[availabilityDate] = defaultConsultModeSlotsCount;
            }
            if (day.consultMode == ConsultMode.ONLINE) {
              dateAvailability[availabilityDate].onlineSlots += slotsCount;
            } else if (day.consultMode == ConsultMode.PHYSICAL) {
              dateAvailability[availabilityDate].physicalSlots += slotsCount;
            } else {
              dateAvailability[availabilityDate].bothSlots += slotsCount;
            }
          }
        }

        //logic when no availabileNow filter and dates are selected
        if (now == null && selectedDates.length === 0) {
          const defaultConsultModeSlotsCount: ConsultModeAvailability = {
            onlineSlots: 0,
            physicalSlots: 0,
            bothSlots: 0,
          };
          if (dateAvailability[day.weekDay] == null) {
            dateAvailability[day.weekDay] = defaultConsultModeSlotsCount;
          }
          if (day.consultMode == ConsultMode.ONLINE) {
            dateAvailability[day.weekDay].onlineSlots += slotsCount;
          } else if (day.consultMode == ConsultMode.PHYSICAL) {
            dateAvailability[day.weekDay].physicalSlots += slotsCount;
          } else {
            dateAvailability[day.weekDay].bothSlots += slotsCount;
          }
        }
      });

      doctorAvailability[doctor.id] = dateAvailability;
    });

    return doctorAvailability;
  }

  getDateObjectsFromTimes(startTime: string, endTime: string) {
    const referenceDate = new Date();
    //start Date should be changed to previous day Date if times overlap b/w two days
    const startDateTime =
      startTime > endTime
        ? `${format(addDays(referenceDate, -1), 'yyyy-MM-dd')} ${startTime.toString()}`
        : `${format(referenceDate, 'yyyy-MM-dd')} ${startTime.toString()}`;
    const endDateTime = `${format(referenceDate, 'yyyy-MM-dd')} ${endTime.toString()}`;

    const startDateObj = new Date(startDateTime);
    const endDateObj = new Date(endDateTime);
    return { startDateObj, endDateObj };
  }

  //returns number of time slots between any two times in a day
  getNumberOfIntervalSlots(startTime: string, endTime: string) {
    const { startDateObj, endDateObj } = this.getDateObjectsFromTimes(startTime, endTime);
    const slotsCount = Math.ceil(Math.abs(differenceInMinutes(endDateObj, startDateObj)) / 15);
    return slotsCount;
  }

  //return all time slots between any two times in a day
  getSlotsInBetween(startTime: string, endTime: string) {
    const { startDateObj, endDateObj } = this.getDateObjectsFromTimes(startTime, endTime);
    const slotsCount = Math.ceil(Math.abs(differenceInMinutes(endDateObj, startDateObj)) / 15);

    const slotTime = startDateObj.getUTCHours() + ':' + startDateObj.getUTCMinutes();
    let slotDateTime = new Date(format(startDateObj, 'yyyy-MM-dd') + ' ' + slotTime);
    const availableSlots = Array(slotsCount)
      .fill(0)
      .map(() => {
        const tempSlotTime = slotDateTime;
        slotDateTime = addMinutes(slotDateTime, 15);
        const stTimeHours = tempSlotTime
          .getUTCHours()
          .toString()
          .padStart(2, '0');
        const stTimeMins = tempSlotTime
          .getUTCMinutes()
          .toString()
          .padStart(2, '0');
        return `${stTimeHours}:${stTimeMins}`;
      });
    return availableSlots;
  }

  //get time with minutes aligned to next 15 multiple
  getNextAlignedSlot(curDate: Date) {
    let nextHour = curDate.getUTCHours();
    let nextMin = this.getNextMins(curDate.getUTCMinutes());
    if (nextMin === 60) {
      nextHour++;
      nextMin = 0;
    }
    return `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`;
  }

  //returns next 15 multiple number(max limited to 60)
  getNextMins(min: number) {
    if (min == 0) return 0;
    if (min > 0 && min <= 15) return 15;
    else if (min > 15 && min <= 30) return 30;
    else if (min > 30 && min <= 45) return 45;
    else return 60;
  }

  //don't use this method. Should be used only for data tool.
  getAllInactiveAndActiveDoctors() {
    return this.createQueryBuilder('doctor')
      .getMany()
      .catch((getDoctorsError) => {
        throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR, undefined, {
          getDoctorsError,
        });
      });
  }

  getDoctorUniqueTerm(doctor: Partial<Doctor>) {
    if (doctor.mobileNumber)
      return doctor.mobileNumber
        .toString()
        .trim()
        .toLowerCase();
    else return '';
  }

  async insertOrUpdateAllDoctors(doctors: Partial<Doctor>[]) {
    //get all the existing specialties
    const allExistingDoctors = await this.getAllInactiveAndActiveDoctors();

    doctors.forEach((doctor) => {
      allExistingDoctors.forEach((existingDoctor) => {
        if (this.getDoctorUniqueTerm(doctor) == this.getDoctorUniqueTerm(existingDoctor)) {
          doctor.id = existingDoctor.id;
          doctor.updatedDate = new Date();
          return;
        }
      });
    });

    //insert/update new doctors
    return this.save(doctors).catch((saveDoctorsError) => {
      throw new AphError(AphErrorMessages.SAVE_DOCTORS_ERROR, undefined, {
        saveDoctorsError,
      });
    });
  }

  getJuniorDoctorsList(offset?: number, limit?: number) {
    const queryBuilder = this.createQueryBuilder('doctor')
      .andWhere('doctor.isActive = true')
      .andWhere('doctor.doctorType = :junior', { junior: DoctorType.JUNIOR })
      .take(limit)
      .skip(offset)
      .orderBy('doctor.firstName')
      .getMany();
    return queryBuilder;
  }

  updateNextAvailSlot(id: string, nextAvailableSlot: Date) {
    return this.update(id, { nextAvailableSlot });
  }

  getAllDoctors(doctorId: string, limit: number, offset: number) {
    if (doctorId == '0') {
      return this.find({
        where: {
          doctorType: Not('JUNIOR'),
        },
        relations: ['specialty', 'doctorHospital', 'doctorHospital.facility'],
        take: limit,
        skip: offset,
        order: { createdDate: 'ASC' },
      });
    } else {
      return this.find({
        where: {
          id: doctorId,
          doctorType: Not('JUNIOR'),
        },
        relations: ['specialty', 'doctorHospital', 'doctorHospital.facility'],
        take: limit,
        skip: offset,
        order: { createdDate: 'ASC' },
      });
    }
  }

  getAllSeniorDoctors() {
    return this.find({
      select: ['id', 'mobileNumber', 'displayName'],
      where: {
        doctorType: Not('JUNIOR'),
        isActive: true,
      },
    });
  }
  getSeniorDoctorCount() {
    return this.count({
      where: {
        doctorType: Not('JUNIOR'),
      },
    });
  }

  getJuniorDoctorCount() {
    return this.count({
      where: {
        doctorType: 'JUNIOR',
      },
    });
  }
  getAllJuniorDoctors(doctorId: string, limit: number, offset: number) {
    if (doctorId == '0') {
      return this.find({
        where: {
          doctorType: DoctorType.JUNIOR,
        },
        take: limit,
        skip: offset,
        order: { createdDate: 'ASC' },
      });
    } else {
      return this.find({
        where: {
          id: doctorId,
          doctorType: DoctorType.JUNIOR,
        },
        take: limit,
        skip: offset,
        order: { createdDate: 'ASC' },
      });
    }
  }
  async getToatalDoctorsForSpeciality(specialty: string, doctype: number) {
    if (doctype === 1) {
      const queryBuilder = this.createQueryBuilder('doctor').where(
        'doctor.specialty = :specialty',
        { specialty }
      );
      const doctorsResult = await queryBuilder.getMany();
      return doctorsResult.length;
    } else {
      const queryBuilder = this.createQueryBuilder('doctor').where(
        'doctor.specialty = :specialty',
        { specialty }
      );
      const doctorsResult = await queryBuilder.getMany();
      const doc: Doctor[] = [];
      await doctorsResult.map((doctor) => {
        if (doctor.onlineStatus === DOCTOR_ONLINE_STATUS.ONLINE) {
          doc.push(doctor);
        }
      });
      return doc.length;
    }
  }
  async getSpecialityDoctors(specialty: string) {
    const queryBuilder = this.createQueryBuilder('doctor').where('doctor.specialty = :specialty', {
      specialty,
    });
    const doctorsResult = await queryBuilder.getMany();
    return doctorsResult;
  }
}

@EntityRepository(CityPincodeMapper)
export class CityPincodeMapperRepository extends Repository<CityPincodeMapper> {
  async addPincodeDetails(pincodeAttrs: Partial<CityPincodeMapper>, flag: boolean) {
    if (flag) {
      const pincodeExist = await this.findOne({ where: { pincode: pincodeAttrs.pincode } });
      if (pincodeExist)
        return this.update(pincodeExist.id, pincodeAttrs).catch((error) => {
          throw new AphError(AphErrorMessages.UPDATE_PINCODES_ERROR, undefined, { error });
        });
    } else {
      return this.save(pincodeAttrs).catch((error) => {
        throw new AphError(AphErrorMessages.SAVE_PINCODES_ERROR, undefined, { error });
      });
    }
  }
}
