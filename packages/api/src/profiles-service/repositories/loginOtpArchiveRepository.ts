import { EntityRepository, Repository } from 'typeorm';
import { LoginOtpArchive } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(LoginOtpArchive)
export class LoginOtpArchiveRepository extends Repository<LoginOtpArchive> {
  async archiveOtpRecord(otpAttrs: Partial<LoginOtpArchive>) {
    return this.create(otpAttrs)
      .save()
      .catch((error) => {
        throw new AphError(AphErrorMessages.CREATE_OTP_ERROR, undefined, {
          error,
        });
      });
  }
}
