import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    OneToOne,
    JoinColumn,
    OneToMany,
    ManyToOne,
    Index,
    UpdateDateColumn,
    CreateDateColumn,
    AfterUpdate,
    AfterInsert,
} from 'typeorm';

import { AppointmentCallDetails } from './index'


/* Call feedback multi-select response types and values */

export enum CALL_FEEDBACK_RESPONSES_TYPES {
    AUDIO = 'Audio',
    VIDEO = 'Video',
    AUDIOVIDEO = 'Audio & Video'
}

export enum CALL_FEEDBACK_RESPONSES {

    AUDIO_CALL_NOT_PICKED = 'Patient did not pickup the call',
    AUDIO_CALL_DISCONNECTED_ABRUPTLY = 'Call disconnected abruptly',
    AUDIO_NO_SOUND_HEARED = 'Could not hear any sound',
    AUDIO_NO_SOUND_RECEIVED = 'Patient could not hear me',
    AUDIO_ECHO = 'Audio echo was heard',
    AUDIO_STRANGE_NOISE = 'I heard a strange noise (not background noise)',
    AUDIO_VOLUME_LOW = 'Volume was low',
    VIDEO_CALL_NOT_PICKED = 'Patient did not pickup the call',
    VIDEO_CALL_DISCONNECTED_ABRUPTLY = 'Call disconnected abruptly',
    VIDEO_NOT_VISIBLE = 'Could not see anything in the video',
    VIDEO_NOT_CLEAR = 'Video was working but video was not clear',
    VIDEO_NOT_RECEIVED = 'Patient could not see my video',
    VIDEO_FREEZE = 'Video froze during the call',
    VIDEO_STOPPED = 'Video stopped working during the call',
    VIDEO_AUDIO_NOT_SYNC = 'Video and audio was not in sync',
    OTHER = 'Other'

}

@Entity()

/* Entity for saving call feedbacks for appointment calls */

export class AppointmentCallFeedback extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => AppointmentCallDetails, (appointmentCallDetailss: AppointmentCallDetails) => appointmentCallDetailss.appointmentCallFeedback)
    @JoinColumn({ name: 'appointmentCallDetailsId' })
    appointmentCallDetails: AppointmentCallDetails

    @Column({ nullable: false })
    appointmentCallDetailsId: string

    @Column({ nullable: false })
    ratingValue: number

    @Column({ nullable: true })
    feedbackResponseType: CALL_FEEDBACK_RESPONSES_TYPES

    /* Type JSON of format - 
    {"audio":[{"responseName":"AUDIO_ECHO"},{"responseName":"OTHER","comment":"Patient voice was muffled"}],"video":[{"responseName":"VIDEO_NOT_CLEAR"},{"responseName":"VIDEO_NOT_RECEIVED"}]} 
    */
    @Column({ nullable: true, type: 'json' })
    feedbackResponses: string

    @Column({ nullable: true })
    createdDate: Date;

    @BeforeInsert()
    updateDateCreation() {
        this.createdDate = new Date();
    }

}