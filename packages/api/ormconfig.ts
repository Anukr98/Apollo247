module.exports = [
    {
        "name": 'consults-db',
        "type": "postgres",
        "cli": {
            "migrationsDir": "src/consults-service/database/migrations"
        }
    },
    {
        "name": 'doctors-db',
        "cli": {
            "migrationsDir": "src/doctors-service/database/migrations"
        }
    },
    {
        "name": 'patients-db',
        "cli": {
            "migrationsDir": "src/profiles-service/database/migrations"
        }
    }]