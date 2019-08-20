import { EntityRepository, Repository, Brackets } from 'typeorm';
import { Doctor, ConsultMode } from 'doctors-service/entities';
import {
  Range,
  FilterDoctorInput,
} from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import { format, differenceInMinutes } from 'date-fns';

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
      .getMany();
  }

  async filterDoctors(filterInput: FilterDoctorInput) {
    const { specialty, city, experience, gender, fees, language, availability } = filterInput;

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

    let doctorsResult = await queryBuilder.getMany();

    // const doctorIds = doctorsResult.map((doctor) => {
    //   return doctor.id;
    // });

    //filtering doctors by date
    if (availability && availability.length > 0) {
      const selectedDays: string[] = [];

      availability.forEach((date: string) => {
        const weekDay = format(new Date(date), 'EEEE').toUpperCase();
        selectedDays.push(weekDay);
      });

      type AvailabilityData = {
        slotsCount: number;
      };
      type DoctorConsultModes = {
        online: AvailabilityData;
        physical: AvailabilityData;
      };
      type DoctorDateData = { [index: string]: DoctorConsultModes };
      type DoctorData = { [index: string]: DoctorDateData };
      const doctorData: DoctorData = {};
      doctorsResult = doctorsResult.filter((doctor) => {
        return (
          doctor.consultHours.filter((day) => {
            if (selectedDays.includes(day.weekDay)) {
              const doctorDateData: DoctorDateData = {};
              const slotsCount = this.getNumberOfIntervalSlots(day.startTime, day.endTime, 15);
              const availableDate = availability[selectedDays.indexOf(day.weekDay)];
              doctorDateData[availableDate] = {
                online: { slotsCount: 0 },
                physical: { slotsCount: 0 },
              };
              if (day.consultMode == ConsultMode.ONLINE) {
                doctorDateData[availableDate].online.slotsCount = slotsCount;
              } else if (day.consultMode == ConsultMode.PHYSICAL) {
                doctorDateData[availableDate].physical.slotsCount = slotsCount;
              } else {
                doctorDateData[availableDate].physical.slotsCount = slotsCount;
                doctorDateData[availableDate].online.slotsCount = slotsCount;
              }
              doctorData[doctor.id] = doctorDateData;
            }
            return selectedDays.includes(day.weekDay);
          }).length > 0
        );
      });
      console.log(doctorData);
    }
    return doctorsResult;
  }

  //returns number of time interval slots between the start and end times
  getNumberOfIntervalSlots(startTime: string, endTime: string, interval: number) {
    const dayStartTime = `${format(new Date(), 'yyyy-MM-dd')} ${startTime.toString()}`;
    const dayEndTime = `${format(new Date(), 'yyyy-MM-dd')} ${endTime.toString()}`;
    const startDateTime = new Date(dayStartTime);
    const endDateTime = new Date(dayEndTime);
    const slotsCount = Math.ceil(differenceInMinutes(endDateTime, startDateTime) / 15);
    console.log(slotsCount);
    return slotsCount;
  }
}
