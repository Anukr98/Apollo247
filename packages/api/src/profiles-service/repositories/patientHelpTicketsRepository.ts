import { EntityRepository, Repository } from 'typeorm';
import { PatientHelpTickets } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientHelpTickets)
export class PatientHelpTicketRepository extends Repository<PatientHelpTickets> {
  saveHelpTicket(helpTicketAttrs: Partial<PatientHelpTickets>) {
    return this.create(helpTicketAttrs)
      .save()
      .catch((helpTicketError) => {
        throw new AphError(AphErrorMessages.SAVE_HELP_TICKET_ERROR, undefined, {
          helpTicketError,
        });
      });
  }
}
