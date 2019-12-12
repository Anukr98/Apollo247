import { EntityRepository, Repository } from 'typeorm';
import {
  Doctor,
  Facility,
  AdminUsers,
  DoctorAndHospital,
  Secretary,
  DoctorSecretary,
} from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(Doctor)
export class AdminDoctor extends Repository<Doctor> {
  getAllDoctors(offset?: number, limit?: number) {
    return this.find({
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
      skip: offset,
      take: limit,
      order: { firstName: 'ASC' },
    }).catch((getError) => {
      throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR, undefined, {
        getError,
      });
    });
  }

  searchByMobileNumber(mobileNumber: string) {
    return this.findOne({
      where: [{ mobileNumber }],
    }).catch((getError) => {
      throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR, undefined, {
        getError,
      });
    });
  }

  createDoctor(doctor: Partial<Doctor>) {
    return this.save(doctor).catch((saveDoctorsError) => {
      throw new AphError(AphErrorMessages.SAVE_DOCTORS_ERROR, undefined, {
        saveDoctorsError,
      });
    });
  }
}

@EntityRepository(Facility)
export class AdminFacility extends Repository<Facility> {
  getAllFacilities(offset?: number, limit?: number) {
    return this.find({ skip: offset, take: limit }).catch((getFacilitiesError) => {
      throw new AphError(AphErrorMessages.GET_FACILITIES_ERROR, undefined, {
        getFacilitiesError,
      });
    });
  }

  findById(id: string) {
    return this.findOne({ where: { id } }).catch((getFacilitiesError) => {
      throw new AphError(AphErrorMessages.GET_FACILITIES_ERROR, undefined, {
        getFacilitiesError,
      });
    });
  }
}

@EntityRepository(AdminUsers)
export class AdminUser extends Repository<AdminUsers> {
  checkValidAccess(mobileNumber: string, isActive: boolean) {
    return this.findOne({
      where: [{ mobileNumber, isActive }],
    }).catch((getError) => {
      throw new AphError(AphErrorMessages.GET_ADMIN_USER_ERROR, undefined, {
        getError,
      });
    });
  }
}

@EntityRepository(DoctorAndHospital)
export class AdminDoctorAndHospital extends Repository<DoctorAndHospital> {
  createDoctorAndHospital(doctorAndHospital: Partial<DoctorAndHospital>) {
    return this.save(doctorAndHospital).catch((saveError) => {
      throw new AphError(AphErrorMessages.SAVE_DOCTORANDHOSPITAL_ERROR, undefined, {
        saveError,
      });
    });
  }
}

@EntityRepository(Secretary)
export class AdminSecretaryRepository extends Repository<Secretary> {
  getSecretaryById(id: string) {
    return this.findOne({ where: { id } });
  }
}

@EntityRepository(DoctorSecretary)
export class AdminDoctorSecretaryRepository extends Repository<DoctorSecretary> {
  saveDoctorSecretary(doctorSecretaryDetails: Partial<DoctorSecretary>) {
    return this.create(doctorSecretaryDetails)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_DOCTORSECRETARY_ERROR, undefined, {
          createErrors,
        });
      });
  }

  findRecord(doctor: string, secretary: string) {
    return this.findOne({ where: { doctor, secretary } }).catch((getErrors) => {
      throw new AphError(AphErrorMessages.GET_SECRETARY_ERROR, undefined, {
        getErrors,
      });
    });
  }

  removeFromDoctorSecretary(id: string) {
    return this.delete(id).catch((getErrors) => {
      throw new AphError(AphErrorMessages.DELETE_SECRETARY_ERROR, undefined, {
        getErrors,
      });
    });
  }
}
