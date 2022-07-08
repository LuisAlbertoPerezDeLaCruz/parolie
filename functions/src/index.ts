import * as admin from 'firebase-admin';
admin.initializeApp();

// Stripe functions
export { createStripeCustomer } from './stripe';
export { startPaymentIntent } from './stripe';
export { webhook } from './stripe';
export { customerPaymentMethods } from './stripe';
export { getStripeCustomerData } from './stripe';
export { getCustomerPaymentMethods } from './stripe';

// Storage functions
export { resizeAvatar } from './storage';

// Firestore functions
export { newUserExtend } from './firestore';

// auth functions
export { createUserApiRecord } from './auth';
