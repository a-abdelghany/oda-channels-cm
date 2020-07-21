// ODA Details
//Pizza Bot
//module.exports.ODA_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL || 'https://botv2frk1I0056HE58FAAbots-mpaasocimt.botmxp.ocp.oraclecloud.com:443/connectors/v1/tenants/idcs-6d466372210e4300bb31f4db15e8e96c/listeners/webhook/channels/490cc1df-7e6a-46dc-bb08-3cb159f253bb';
// module.exports.ODA_WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET || 'G3TEKZfGU8zVuaVECYPYNSGEYrucVTpF';
//GACA Bot
module.exports.ODA_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL || 'https://oda-9f5ea08ea98d4248972c35faacd35d8f-da15.data.digitalassistant.oci.oraclecloud.com/connectors/v2/listeners/webhook/channels/27ba0684-513d-47fb-a06a-1e8b92e5b90a';
module.exports.ODA_WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET || 'rzAWgOBnBS3XvwsWgVLwsjZ2AsmhiVpy';

//#### CM Details ######
exports.CM_GATEWAY_HOST = process.env.CM_GATEWAY_HOST || 'gw.cmtelecom.com'
exports.CM_GATEWAY_PATH = process.env.CM_GATEWAY_PATH || '/v1.0/message'
//CM Whatsapp Config
//exports.CM_PRODUCT_TOKEN = process.env.CM_PRODUCT_TOKEN || 'B5F20A86-E267-45B3-A14E-2B7459EDA360';
//exports.CM_FROM = process.env.CM_FROM || '0031762011571'
//CM Twitter Config
exports.CM_PRODUCT_TOKEN = process.env.CM_PRODUCT_TOKEN || 'B5F20A86-E267-45B3-A14E-2B7459EDA360';
exports.CM_FROM = process.env.CM_FROM || '1285550484590407681'




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
