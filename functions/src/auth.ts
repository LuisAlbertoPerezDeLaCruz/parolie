import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';

import * as axios from 'axios';

const db = admin.firestore();

import { GlobalConstants } from './common/global-constants';

const baseUrl = GlobalConstants.apiURL;

let options: any = {};
let url = '';
let path = '';

const avatars: any = {
  application: '',
  google: '',
};
const statuses: any = {
  created_profile: false,
  aproved: false,
};

export const createUserApiRecord = functions.auth
  .user()
  .onCreate(async (user, context) => {
    await db.doc(`users/${user.uid}`).set({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      avatars: avatars,
      statuses: statuses,
      role: 'CLIENT',
      roles: ['CLIENT'],
      created: '** No Updated Yet **',
    });
    const docRef = db.doc(`users/${user.uid}`);
    docRef
      .get()
      .then(async (doc: any) => {
        if (doc.exists) {
          console.log('Document data:', doc.data());
          functions.logger.log('Document data:', doc.data());
          const email = doc.data().email;
          const name = doc.data().name;
          // Check if user_api exists
          path = 'users/check-email';
          url = baseUrl + path;
          options['params'] = { 'check-email': email };
          const user_api = await axios.default.get(url, options);
          if (user_api.data.found) {
            console.log('email.already exists in api');
            return true;
          } else {
            path = 'users';
            url = baseUrl + path;
            await axios.default.post(url, {
              email: email,
              password: email.split('@')[0] + '12345678',
              name: name,
              uid: user.uid,
            });
            path = 'auth';
            url = baseUrl + path;
            const auth_api_token = await axios.default.post(url, {
              email: email,
              password: email.split('@')[0] + '12345678',
            });
            return docRef.update({
              auth_api_token: auth_api_token.data.token,
            });
          }
        } else {
          console.log('No such document!');
          functions.logger.log('No such document!');
          return false;
        }
      })
      .catch((error) => {
        console.log('Error getting document:', error);
        functions.logger.log('Error getting document:', error);
      });
  });
