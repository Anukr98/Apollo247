
module.exports = [
    {
        "name": 'consults-db',
        "type": "postgres",
        "cli": {
            "migrationsDir": "src/consults-service/database/migration"
        },
    },
    {
        "name": 'doctors-db',
        "cli": {
            "migrationsDir": "src/doctors-service/database/migration"
        }
    },
    {
        "name": 'profiles-db',
        "cli": {
            "migrationsDir": "src/profiles-service/database/migration"
        }
    }]