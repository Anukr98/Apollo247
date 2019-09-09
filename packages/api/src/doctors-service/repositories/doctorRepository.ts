import { EntityRepository, Repository, Brackets } from 'typeorm';
import { Doctor, ConsultMode, DoctorType } from 'doctors-service/entities';
import {
  Range,
  FilterDoctorInput,
  DoctorAvailability,
  DateAvailability,
  ConsultModeAvailability,
  AppointmentDateTime,
} from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import { format, differenceInMinutes, differenceInHours, addMinutes } from 'date-fns';

@EntityRepository(Doctor)
export class DoctorRepository extends Repository<Doctor> {
  getDoctorProfileData(id: string) {
    return this.findOne({
      where: [{ id }],
      relations: ['specialty', 'doctorHospital'],
    });
  }

  getDoctorDetails(firebaseToken: string) {
    return this.findOne({
      where: [{ firebaseToken }],
    });
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
      where: [{ id }],
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
      .where('doctor.id IN (:...doctorIds)', { doctorIds })
      .getRawMany();
  }

  searchByName(searchString: string) {
    return this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'doctorHospital.facility')
      .where('LOWER(doctor.firstName) LIKE :searchString', {
        searchString: `${searchString}%`,
      })
      .orWhere('LOWER(doctor.lastName) LIKE :searchString', {
        searchString: `${searchString}%`,
      })
      .orWhere("LOWER(doctor.firstName || ' ' || doctor.lastName) LIKE :searchString", {
        searchString: `${searchString}%`,
      })
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

    return 0;
  }

  filterDoctors(filterInput: FilterDoctorInput) {
    const { specialty, city, experience, gender, fees, language } = filterInput;

    const queryBuilder = this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'doctorHospital.facility')
      .where('doctor.specialty = :specialty', { specialty });

    if (city && city.length > 0) {
      queryBuilder.andWhere('doctor.city IN (:...city)', { city });
    }
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

    return queryBuilder.orderBy('doctor.experience', 'DESC').getMany();
  }

  getDoctorsAvailability(doctors: Doctor[], selectedDates: string[], now?: AppointmentDateTime) {
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
          const nowDate = format(now.startDateTime, 'yyyy-MM-dd');
          const nowDay = format(new Date(nowDate), 'EEEE').toUpperCase();
          if (day.weekDay == nowDay) {
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
          if (selectedDays.includes(day.weekDay)) {
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

  //returns number of time slots between any two times in a day
  getNumberOfIntervalSlots(startTime: string, endTime: string) {
    const dayStartTime = `${format(new Date(), 'yyyy-MM-dd')} ${startTime.toString()}`;
    const dayEndTime = `${format(new Date(), 'yyyy-MM-dd')} ${endTime.toString()}`;
    const startDateTime = new Date(dayStartTime);
    const endDateTime = new Date(dayEndTime);
    const slotsCount = Math.ceil(Math.abs(differenceInMinutes(endDateTime, startDateTime)) / 15);
    return slotsCount;
  }

  //return all time slots between any two times in a day
  getSlotsInBetween(startTime: string, endTime: string) {
    const startDateTimeString = `${format(new Date(), 'yyyy-MM-dd')} ${startTime.toString()}`;
    const endDateTimeString = `${format(new Date(), 'yyyy-MM-dd')} ${endTime.toString()}`;
    const startDateTime = new Date(startDateTimeString);
    const endDateTime = new Date(endDateTimeString);

    const slotsCount = Math.ceil(Math.abs(differenceInHours(endDateTime, startDateTime))) * 4;

    const slotTime = startDateTime.getHours() + ':' + startDateTime.getMinutes();
    let slotDateTime = new Date(format(startDateTime, 'yyyy-MM-dd') + ' ' + slotTime);
    const availableSlots = Array(slotsCount)
      .fill(0)
      .map(() => {
        const tempSlotTime = slotDateTime;
        slotDateTime = addMinutes(slotDateTime, 15);
        const stTimeHours = tempSlotTime
          .getHours()
          .toString()
          .padStart(2, '0');
        const stTimeMins = tempSlotTime
          .getMinutes()
          .toString()
          .padStart(2, '0');
        return `${stTimeHours}:${stTimeMins}`;
      });
    return availableSlots;
  }

  //get time with minutes aligned to next 15 multiple
  getNextAlignedSlot(curDate: Date) {
    let nextHour = curDate.getHours();
    let nextMin = this.getNextMins(curDate.getMinutes());
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
}
