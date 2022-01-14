import promise from 'bluebird';
import request from '@request/client';
import express from 'express'
import Order from '../models/order'
import {io} from '../index' 

const router = express.Router()

import { FLICKR_API_URL, DEFAULT_PARAMS, FLICKR_CONSUMER_KEY, FLICKR_CONSUMER_SECRET } from './constants';
const purest = require('purest')({request, promise});
const flickr = purest({
  'provider': 'flickr',
  'config': require('@purest/providers'),
  'key': FLICKR_CONSUMER_KEY,
  'secret': FLICKR_CONSUMER_SECRET
});

export const getConnectionData = (req) => {
  if (req && req.session && req.session.grant && req.session.grant.step1 && req.session.grant.response) {
    const oauth_consumer_key = FLICKR_CONSUMER_KEY;
    const { oauth_token, oauth_token_secret } = req.session.grant.step1;
    const { access_token, access_secret, raw } = req.session.grant.response;
    const { user_nsid, username, fullname } = raw;
    const connectionData = { user_nsid, username, fullname, oauth_consumer_key, oauth_token, oauth_token_secret, access_token, access_secret };
    showConnectionData(connectionData);
    return connectionData;
  } else {
    return null;
  }
};

router.get('/', async (req, res) => {
    try {
      const orders = await Order.find()
      res.send(orders)
    } catch (error) {
      res.send(error)
    }
  })
  
  router.post('/', async (req, res) => {
    try {
      const order = new Order(req.body)
      await order.save()
      const orders = await Order.find()
      io.emit('order-added', orders)
      res.status(201).send(order)
    } catch (error) {
      res.send(error)
    }
  })
  
  export default router

