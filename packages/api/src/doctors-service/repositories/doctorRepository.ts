import { EntityRepository, Repository, Brackets, Connection } from 'typeorm';
import { Doctor, ConsultMode, DoctorType } from 'doctors-service/entities';
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

@EntityRepository(Doctor)
export class DoctorRepository extends Repository<Doctor> {
  getDoctorProfileData(id: string) {
    return this.findOne({
      where: [{ id, isActive: true }],
      relations: ['specialty', 'doctorHospital'],
    });
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
      where: [{ mobileNumber, isActive }, { delegateNumber: mobileNumber, isActive: isActive }],
      relations: [
        'specialty',
        'doctorHospital',
        'consultHours',
        'starTeam',
        'bankAccount',
        'packages',
        'doctorHospital.facility',
        'starTeam.associatedDoctor',
        'starTeam.associatedDoctor.specialty',
        'starTeam.associatedDoctor.doctorHospital',
        'starTeam.associatedDoctor.doctorHospital.facility',
      ],
    });
  }

  updateFirebaseId(id: string, firebaseToken: string) {
    return this.update(id, { firebaseToken: firebaseToken });
  }

  updateDelegateNumber(id: string, delegateNumber: string) {
    return this.update(id, { delegateNumber });
  }

  findById(id: string) {
    return this.findOne({
      where: [{ id, isActive: true }],
      relations: [
        'specialty',
        'doctorHospital',
        'consultHours',
        'consultHours.facility',
        'starTeam',
        'bankAccount',
        'packages',
        'doctorHospital.facility',
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

  searchByName(searchString: string) {
    return this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'doctorHospital.facility')
      .where('doctor.doctorType != :junior', { junior: DoctorType.JUNIOR })
      .andWhere('doctor.isActive = true')
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
      .getMany();
  }

  searchBySpecialty(specialtyId: string) {
    return this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'doctorHospital.facility')
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
      .leftJoinAndSelect('doctorHospital.facility', 'doctorHospital.facility')
      .where('doctor.specialty = :specialtyId', {
        specialtyId,
      })
      .andWhere('doctor.isActive = true')
      .andWhere('doctor.doctorType != :junior', { junior: DoctorType.JUNIOR })
      .andWhere('doctor.id NOT IN (:doctorId)', { doctorId })
      .orderBy('doctor.experience', 'DESC')
      .getMany();
  }

  sortByRankingAlgorithm(a: Doctor, b: Doctor, docIds: string[]) {
    //STAR_APOLLO doctor on top
    if (a.doctorType == DoctorType.STAR_APOLLO && b.doctorType != DoctorType.STAR_APOLLO) return -1;
    if (a.doctorType != DoctorType.STAR_APOLLO && b.doctorType == DoctorType.STAR_APOLLO) return 1;

    //Previously consulted non-payroll doctors on next
    if (docIds.includes(a.id) && a.doctorType != DoctorType.PAYROLL && !docIds.includes(b.id))
      return -1;
    if (!docIds.includes(a.id) && docIds.includes(b.id) && b.doctorType != DoctorType.PAYROLL)
      return 1;

    //same city doctors on next (location logic is not yet finalized)

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
    const doctorAvailalbeSlots: DoctorSlotAvailability[] = [];

    function slots(doctorId: string) {
      return new Promise<DoctorSlotAvailability>(async (resolve) => {
        let onlineSlot: string = '';
        let physicalSlot: string = '';

        const consultHrsRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
        const consultHrsOnline = await consultHrsRepo.checkByDoctorAndConsultMode(
          doctorId,
          'ONLINE'
        );
        if (consultHrsOnline > 0) {
          //if the slot is empty check for next day
          let nextDate = new Date();
          while (true) {
            const nextSlot = await appts.getDoctorNextSlotDate(
              doctorId,
              nextDate,
              doctorsDb,
              'ONLINE'
            );
            if (nextSlot != '' && nextSlot != undefined) {
              onlineSlot = nextSlot;
              break;
            }
            nextDate = addDays(nextDate, 1);
          }
        }

        const consultHrsPhysical = await consultHrsRepo.checkByDoctorAndConsultMode(
          doctorId,
          'PHYSICAL'
        );
        if (consultHrsPhysical > 0) {
          //if the slot is empty check for next day
          let nextDate = new Date();
          while (true) {
            const nextSlot = await appts.getDoctorNextSlotDate(
              doctorId,
              nextDate,
              doctorsDb,
              'PHYSICAL'
            );
            if (nextSlot != '' && nextSlot != undefined) {
              physicalSlot = nextSlot;
              break;
            }
            nextDate = addDays(nextDate, 1);
          }
        }

        let referenceSlot;
        if (consultModeFilter == ConsultMode.ONLINE) {
          referenceSlot = onlineSlot;
        } else if (consultModeFilter == ConsultMode.PHYSICAL) {
          referenceSlot = physicalSlot;
        } else {
          if (onlineSlot == '' && physicalSlot != '') referenceSlot = physicalSlot;
          else if (physicalSlot == '' && onlineSlot != '') referenceSlot = onlineSlot;
          else referenceSlot = onlineSlot < physicalSlot ? onlineSlot : physicalSlot;
        }

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
      return doctor.availableInMinutes > 60;
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

    const queryBuilder = this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'doctorHospital.facility')
      .where('doctor.specialty = :specialty', { specialty })
      .andWhere('doctor.isActive = true')
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

  getJuniorDoctorsList() {
    const queryBuilder = this.createQueryBuilder('doctor')
      .andWhere('doctor.isActive = true')
      .andWhere('doctor.doctorType = :junior', { junior: DoctorType.JUNIOR })
      .getMany();
    return queryBuilder;
  }
}
