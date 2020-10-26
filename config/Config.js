// ODA Details
//##################################################ODA###############################################################
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

// WhatsApp Sender event IDs
exports.EVENT_QUEUE_MESSAGE_TO_CM = "100";
exports.EVENT_QUEUE_MESSAGE_TO_BOT = "200";
exports.EVENT_CM_MESSAGE_DELIVERED = "1000";
exports.EVENT_PROCESS_NEXT_CM_MESSAGE = "2000";





// SMOOCH Details
//exports.SMOOCH_APP_ID = process.env.SMOOCH_APP_ID || 'SMOOCH_APP_ID';
//exports.SMOOCH_KEY_ID = process.env.SMOOCH_KEY_ID || 'SMOOCH_KEY_ID';
//exports.SMOOCH_SECRET = process.env.SMOOCH_SECRET || 'SMOOCH_SECRET';
//exports.SMOOCH_WEBHOOK_SECRET = process.env.SMOOCH_WEBHOOK_SECRET || 'SMOOCH_WEBHOOK_SECRET';
