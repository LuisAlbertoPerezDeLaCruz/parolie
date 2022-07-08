import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';

import * as axios from 'axios';

const db = admin.firestore();

// const LOCAL_HOST = "http://localhost:5000/";
const PRODUCTION_HOST = 'https://parolie.herokuapp.com/';

const baseUrl = PRODUCTION_HOST;

let options: any = {};
let url = '';
let path = '';

export const newUserExtend = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snapshot, context) => {
    const userDoc = snapshot.data();

    if (userDoc) {
      const email = userDoc.email;
      const name = userDoc.name;
      const uid = userDoc.uid;
      const avatars = userDoc.avatars;
      // Check if user_api exists
      path = 'users/check-email';
      url = baseUrl + path;
      options['params'] = { 'check-email': email };
      const user_api = await axios.default.get(url, options);
      if (user_api.data.found) {
        functions.logger.log('email.already exists in api:', email);
        /**
         * This should not happen
         */
        return true;
      } else {
        path = 'users';
        url = baseUrl + path;
        const new_user_api: any = await axios.default.post(url, {
          email: email,
          password: email.split('@')[0] + '12345678',
          name: name,
          uid: uid,
          avatars: avatars,
        });
        path = 'auth';
        url = baseUrl + path;
        const auth_api_token = await axios.default.post(url, {
          email: email,
          password: email.split('@')[0] + '12345678',
        });
        return db.doc(`users/${uid}`).update({
          auth_api_token: auth_api_token.data.token,
          api_user_id: new_user_api.data._id,
        });
      }
    } else {
      functions.logger.log('No such document!');
      return false;
    }
  });
