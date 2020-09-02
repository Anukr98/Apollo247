require('dotenv').config()
const { Client, Pool } = require('pg');
const FormData = require('form-data')
const fetch = require('node-fetch')
const async = require('async')

const client = new Client({
    user: process.env.PROFILES_DB_USER,
    password: process.env.PROFILES_DB_PASSWORD,
    host: process.env.PROFILES_DB_HOST,
    port: parseInt(process.env.PROFILES_DB_PORT, 10),
    database: `profiles_${process.env.DB_NODE_ENV}`,
    max: 20,
    //idleTimeoutMillis: 300000,
    //connectionTimeoutMillis: 20000,
})

const truncatePincodeTable = async (client) => {
    const str = 'TRUNCATE TABLE diagnostic_itdose_pincode_hubs'
    client.query(str, (err) => {
        if (err) {
            throw new Error(err)
        }
        console.log(str)
        return true
    })
}

const insertPincodes = async (client, pincodeMaster) => {
    async.eachSeries(pincodeMaster, (element, callback) => {
        let { StateID, State, CityID, City, AreaID, Area, PinCode } = element
        Area = Area.replace(/'/g, "''")
        if (PinCode) {
            try {
                PinCode = parseInt(PinCode, 10)
                console.log(PinCode)
            } catch{
                console.log('pincode not supported')
                return callback()
            }
        }
        const str = `INSERT INTO diagnostic_itdose_pincode_hubs(state_id, state, city_id, city, area_id, area, pincode) VALUES (${StateID}, '${State}', ${CityID}, '${City}', ${AreaID}, '${Area}', ${PinCode})`
        console.log(str)
        client.query(str, (err) => {
            if (err) {
                return callback(err)
            }
            return callback()
        })
    }, (err) => {
        if (err) {
            console.log("element not inserted due to an error")
            throw new Error(err)
        }
        console.log("all pincodes updated")
        process.kill(process.pid)
        return true
    })
}


const getPincodeMaster = async (token) => {
    const apiUrl = process.env.DIAGNOSTIC_ITDOSE_GETPINCODE_URL
    if (!apiUrl) {
        throw new Error("add env DIAGNOSTIC_ITDOSE_GETPINCODE_URL")
    }
    let options = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` }
    }
    const pincodeMaster = await fetch(apiUrl, options)
        .then((res) => res.json())
        .catch((error) => {

            throw new Error(error)
        });
    if (pincodeMaster.status != true || !pincodeMaster.data) {
        throw new AphError(AphErrorMessages.ITDOSE_GET_SLOTS_ERROR, undefined, { "response": pincodeMaster });
    }
    return pincodeMaster.data
}

const getToken = async () => {
    let token
    const diagnosticLoginURL = process.env.DIAGNOSTIC_ITDOSE_LOGIN_URL
    if (!diagnosticLoginURL) {
        throw new Error("add env DIAGNOSTICS_ITDOSE_LOGIN_URL")
    }
    const diagnosticItdoseUsername = process.env.DIAGNOSTIC_ITDOSE_USERNAME
    const diagnosticItdosePassword = process.env.DIAGNOSTIC_ITDOSE_PASSWORD
    if (!diagnosticItdoseUsername || !diagnosticItdosePassword) {
        throw new Error("add env DIAGNOSTICS_ITDOSE_LOGIN credentials")
    }
    const apiUrl = `${diagnosticLoginURL}`
    const form = new FormData();
    form.append('Username', diagnosticItdoseUsername);
    form.append('Password', diagnosticItdosePassword)
    form.append('Client', '24*7')
    let options = {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
    }
    const getToken = await fetch(apiUrl, options)
        .then((res) => res.json())
        .catch((error) => {
            console.log(error)
            log(
                'profileServiceLogger',
                'ITdose_LOGIN_API',
                'getTokenWithExpiry()->CATCH_BLOCK',
                '',
                JSON.stringify(error)
            );
            throw new Error(error)
        });
    if (getToken.status != true) {
        throw new Error(`unexpected status, want: true; got: ${getToken.status}`);
    }
    token = getToken.data[0].Token
    return token
}

const start = async () => {
    token = await getToken()
    pincodes = await getPincodeMaster(token)
    client.connect().catch(function (err) { console.log("error while connection", err) });
    await truncatePincodeTable(client)
    await insertPincodes(client, pincodes)
}

start()
