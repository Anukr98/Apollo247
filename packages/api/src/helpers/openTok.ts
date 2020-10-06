import openTok, { TokenOptions } from 'opentok';
import { fromUnixTime } from 'date-fns';

type OpenTalkDetails = {
  sessionId: string;
  token: string;
};

export async function getSessionToken(existingSessionId: string): Promise<OpenTalkDetails> {
  const opentok_key = process.env.OPENTOK_KEY ? process.env.OPENTOK_KEY : '';
  const opentok_secret = process.env.OPENTOK_SECRET ? process.env.OPENTOK_SECRET : '';
  const opentok = new openTok(opentok_key, opentok_secret);
  const tokenExpiryTime = process.env.OPENTOK_TOKEN_EXPIRY_IN_SECONDS
    ? new Date().getTime() / 1000 + Number(process.env.OPENTOK_TOKEN_EXPIRY_IN_SECONDS)
    : new Date().getTime() / 1000 + 7 * 24 * 60 * 60; //7days

  let sessionId = '',
    token = '';

  const tokenOptions: TokenOptions = {
    role: 'moderator',
    data: '',
    expireTime: tokenExpiryTime,
  };

  if (existingSessionId) {
    sessionId = existingSessionId;
    token = opentok.generateToken(existingSessionId, tokenOptions);
    return { sessionId, token };
  }
  return new Promise<{ sessionId: string; token: string }>(async (resolve, reject) => {
    opentok.createSession(
      {
        mediaMode: 'routed',
        archiveMode: 'always',
      },
      (error, session) => {
        if (error) {
          reject(error);
        }
        if (session) {
          sessionId = session.sessionId;
          token = opentok.generateToken(sessionId, tokenOptions);
        }
        resolve({ sessionId, token });
      }
    );
  });
}

export async function getExpirationTime(token: string) {
  let decodedToken = token.replace('T1==', '');
  decodedToken = Buffer.from(decodedToken, 'base64').toString();
  const expireTimeString = decodedToken.substring(decodedToken.indexOf('expire_time=')).split('&');
  const tokenExpiryDate = fromUnixTime(Number(expireTimeString[0].replace('expire_time=', '')));
  return tokenExpiryDate;
}
