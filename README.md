# Exposing ODA through WhatsApp

## Setup

* Open `ODA_WHATSAPP/config/Config.js` and edit the below properties:

```javascript
//##################################################GACA Bot###############################################################
//Bot
module.exports.ODA_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL || '[WEBHOOK_URL]';
module.exports.ODA_WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET || '[WEBHOOK_SECRET]';
//CM Whatsapp/Twitter Config
exports.CM_PRODUCT_TOKEN = process.env.CM_PRODUCT_TOKEN || '[CM_PRODUCT_TOKEN]';
exports.CM_FROM = process.env.CM_FROM || '[CM_FROM]'
//Channel Type
exports.CM_CHANNEL = process.env.CM_CHANNEL || '[Whatsapp][Twitter]';
//#################################################################################################################

//#### CM Details ######
exports.CM_GATEWAY_HOST = process.env.CM_GATEWAY_HOST || 'gw.cmtelecom.com'
exports.CM_GATEWAY_PATH = process.env.CM_GATEWAY_PATH || '/v1.0/message'


// General Details
exports.PROXY = process.env.PROXY || process.env.http_proxy;
exports.PORT = process.env.PORT || 8004;
