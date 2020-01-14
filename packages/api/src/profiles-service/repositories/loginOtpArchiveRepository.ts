import { EntityRepository, Repository, MoreThanOrEqual } from 'typeorm';
import { LoginOtpArchive, OTP_STATUS } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { subMinutes } from 'date-fns';
import { ApiConstants } from 'ApiConstants';

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
