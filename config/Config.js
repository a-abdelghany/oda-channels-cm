// ODA Details
module.exports.ODA_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL || 'https://botv2frk1I0056HE58FAAbots-mpaasocimt.botmxp.ocp.oraclecloud.com:443/connectors/v1/tenants/idcs-6d466372210e4300bb31f4db15e8e96c/listeners/webhook/channels/490cc1df-7e6a-46dc-bb08-3cb159f253bb';
module.exports.ODA_WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET || 'G3TEKZfGU8zVuaVECYPYNSGEYrucVTpF';

// CM Details
exports.CM_PRODUCT_TOKEN = process.env.CM_PRODUCT_TOKEN || 'B5F20A86-E267-45B3-A14E-2B7459EDA360';
exports.CM_FROM = process.env.CM_FROM || '0031762011571'
exports.CM_GATEWAY_URL = process.env.CM_GATEWAY_URL || 'https://gw.cmtelecom.com/v1.0/message'


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
