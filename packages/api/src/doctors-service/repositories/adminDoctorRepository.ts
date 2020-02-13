import { EntityRepository, Repository } from 'typeorm';
import { AdminDoctorMapper } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(AdminDoctorMapper)
export class AdminDoctorMap extends Repository<AdminDoctorMapper> {
  getAllDoctors(offset?: number, limit?: number) {
    return this.find({});
  }

  findadminuserById(adminuserId: string) {
    return this.find({
      relations: [
        'doctor',
        'adminuser',
        'doctor.specialty',
        'doctor.consultHours',
        'doctor.starTeam',
        'doctor.bankAccount',
        'doctor.packages',
      ],
      where: [{ adminuserId }],
    }).catch((getError) => {
      throw new AphError(AphErrorMessages.GET_ADMIN_USER_ERROR, undefined, {
        getError,
      });
    });
  }

  findByadminId(doctor: string) {
    return this.find({
      where: [{ doctor }],
      relations: [
        'doctor',
        'adminuser',
        'doctor.specialty',
        'doctor.consultHours',
        'doctor.starTeam',
        'doctor.bankAccount',
        'doctor.packages',
      ],
    });
  }

  getAdminIds(doctor: string) {
    return this.find({
      where: { doctor },
      relations: ['adminuser'],
    });
  }

  saveadmindoctor(adminDoctor: Partial<AdminDoctorMapper>[]) {
    return this.save(adminDoctor).catch((saveAdminDoctorsError) => {
      throw new AphError(AphErrorMessages.SAVE_ADMIN_DOCTORS_ERROR, undefined, {
        saveAdminDoctorsError,
      });
    });
  }
}
