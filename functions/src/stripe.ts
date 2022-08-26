import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const Stripe = require('stripe');

const secret = functions.config().stripe.secret;
const endpointSecret = functions.config().stripe.signing;
const stripe = new Stripe(secret, {
  apiVersion: '2020-08-27',
  typescript: true,
});

export const createStripeCustomer = functions.auth
  .user()
  .onCreate(async (snap, context) => {
    functions.logger.log('snap: ', snap);
    const customer = await stripe.customers.create({
      email: snap.email,
    });
    const batch = admin.firestore().batch();

    const userRef = admin.firestore().collection('users').doc(snap.uid);
    const cusRef = admin.firestore().collection('customers').doc(snap.uid);

    batch.update(userRef, { customerId: customer.id });
    batch.set(cusRef, { customerId: customer.id });

    return batch.commit();
  });

export const startPaymentIntent = functions.https.onCall(
  async (data, context) => {
    functions.logger.log('called: ', data);
    const user = await admin
      .firestore()
      .collection('users')
      .doc(data.userId)
      .get();
    const userData = user.data();
    functions.logger.log('the user: ', userData);
    if (userData) {
      const intent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        customer: userData.customerId,
        setup_future_usage: data.setup_future_usage,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      await admin
        .firestore()
        .collection('orders')
        .doc(intent.id)
        .set({
          reservation: data.reservation,
          status: 'Waiting for payment',
          amount: data.amount / 100,
          customerId: userData.customerId,
          userId: data.userId,
        });

      return intent;
    } else {
      return false;
    }
  }
);

export const webhook = functions.https.onRequest(async (request, response) => {
  const sig = request.headers['stripe-signature'] || '';

  let event = null;

  functions.logger.log('request.rawBody: ', request.rawBody);
  functions.logger.log('sig: ', sig);
  functions.logger.log('endpointSecret: ', endpointSecret);

  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      endpointSecret
    );
  } catch (err) {
    // invalid signature
    functions.logger.log('err: ', err);
    response.status(400).end();
    return;
  }

  let intent: any = null;
  let status = 'Succeeded';

  switch (event['type']) {
    case 'payment_intent.succeeded':
      intent = event.data.object;
      break;
    case 'payment_intent.payment_failed':
      intent = event.data.object;
      status = 'Payment failed';
      break;
  }

  if (intent) {
    try {
      const invoiceUrl = intent.charges.data[0].receipt_url;
      functions.logger.log('invoice: ', invoiceUrl);
      await admin.firestore().collection('orders').doc(intent.id).update({
        status,
        invoice: invoiceUrl,
      });
    } catch (e) {
      functions.logger.log('Error while getting invoice: ', e);
    }
  }

  response.sendStatus(200);
});

export const customerPaymentMethods = functions.https.onCall(
  async (data, context) => {
    functions.logger.log('called: ', data);
    const paymentMethods = await stripe.paymentMethods.list({
      customer: data.customerId,
      type: 'card',
    });
    return paymentMethods;
  }
);

export const getStripeCustomerData = functions.https.onCall(async (data) => {
  const customer_id = data.customer_id;
  const customer = await stripe.customers.retrieve(customer_id);
  return customer;
});

export const getCustomerPaymentMethods = functions.https.onCall(
  async (data) => {
    const customer_id = data.customer_id;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer_id,
      type: 'card',
    });
    return paymentMethods;
  }
);
