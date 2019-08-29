declare interface Window {
  __TEST__: string;
}
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'local' | 'development' | 'staging' | 'production';

    USE_SSL: 'true' | 'false';

    FIREBASE_PROJECT_ID: string;
    GOOGLE_APPLICATION_CREDENTIALS: string;

    USE_AZURE_SERVICE_BUS: 'true' | 'false';
    AZURE_SERVICE_BUS_CONNECTION_STRING: string;
    AZURE_SERVICE_BUS_PORT: string;
    RABBITMQ_HOST: string;
    RABBITMQ_PORT: string;
    RABBITMQ_USER: string;
    RABBITMQ_PASSWORD: string;
    MESSAGE_QUEUE_QUEUE_NAME: string;

    AZURE_STORAGE_EMULATOR_PORT: string;
    AZURE_STORAGE_CONNECTION_STRING_API: string;
    AZURE_STORAGE_CONNECTION_STRING_WEB_PATIENTS: string;
    AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS: string;
    AZURE_STORAGE_CONTAINER_NAME: string;

    WEB_PATIENTS_PORT: string;
    WEB_DOCTORS_PORT: string;

    API_GATEWAY_HOST: string;
    API_GATEWAY_PORT: string;

    CONSULTS_SERVICE_HOST: string;
    CONSULTS_SERVICE_PORT: string;
    CONSULTS_DB_HOST: string;
    CONSULTS_DB_PORT: string;
    CONSULTS_DB_USER: string;
    CONSULTS_DB_PASSWORD: string;

    DOCTORS_SERVICE_HOST: string;
    DOCTORS_SERVICE_PORT: string;
    DOCTORS_DB_HOST: string;
    DOCTORS_DB_PORT: string;
    DOCTORS_DB_USER: string;
    DOCTORS_DB_PASSWORD: string;

    PROFILES_SERVICE_HOST: string;
    PROFILES_SERVICE_PORT: string;
    PROFILES_DB_HOST: string;
    PROFILES_DB_PORT: string;
    PROFILES_DB_USER: string;
    PROFILES_DB_PASSWORD: string;
  }
}
