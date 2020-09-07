import { AphError } from "AphError";
import { AphErrorMessages } from "@aph/universal/dist/AphErrorMessages";
import { log } from 'customWinstonLogger';
import LRUCache from 'lru-cache';
import { parse, differenceInMilliseconds, getTime } from 'date-fns'
import FormData from 'form-data'
import fetch from 'node-fetch';

const cache = new LRUCache()

export const getToken = async (
) => {
    let token
    // get cache
    token = cache.get('token')
    console.log("get cache ", token)
    if (token) {
        return token
    }
    const diagnosticLoginURL = process.env.DIAGNOSTIC_ITDOSE_LOGIN_URL
    if (!diagnosticLoginURL) {
        throw new AphError(AphErrorMessages.ITDOSE_GET_TOKEN_ERROR, undefined, { "cause": "add env DIAGNOSTICS_ITDOSE_LOGIN_URL" })
    }
    const diagnosticItdoseUsername = process.env.DIAGNOSTIC_ITDOSE_USERNAME
    const diagnosticItdosePassword = process.env.DIAGNOSTIC_ITDOSE_PASSWORD
    if (!diagnosticItdoseUsername || !diagnosticItdosePassword) {
        throw new AphError(AphErrorMessages.ITDOSE_GET_TOKEN_ERROR, undefined, { "cause": "add env DIAGNOSTICS_ITDOSE_LOGIN credentials" })
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
            throw new AphError(AphErrorMessages.ITDOSE_GET_TOKEN_ERROR, undefined, { err: error });
        });
    if (getToken.status != true) {
        throw new AphError(AphErrorMessages.ITDOSE_GET_TOKEN_ERROR, undefined, { "cause": `unexpected status, want: true; got: ${getToken.status}` });
    }
    let expirationTime
    if (!getToken.data || !getToken.data[0]) {
        throw new AphError(AphErrorMessages.ITDOSE_GET_TOKEN_ERROR, undefined, { "cause": `unexpected response, got: ${getToken}` });
    }
    expirationTime = getToken.data[0].TokenExpiry
    token = getToken.data[0].Token
    const parsedDate = parse(expirationTime, 'M/dd/yyyy pp', new Date())
    const expirationInMS = differenceInMilliseconds(parsedDate, new Date())

    // set cache with expiration
    console.log('cache set with expiration', expirationInMS)
    cache.set('token', token, expirationInMS)

    return token
}

export const updateToken = async () => {
    cache.del('token')
}