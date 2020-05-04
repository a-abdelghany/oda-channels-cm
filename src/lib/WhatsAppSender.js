const HttpsProxyAgent = require('https-proxy-agent');
const Config = require('../../config/Config');
const Emitter = require('events').EventEmitter;
const log4js = require('log4js');
let logger = log4js.getLogger('WhatsAppSender');
logger.level = 'debug';

/**
 * Queue, Dequeue and Send messages to CM
 */
class WhatsAppSender {

    constructor() {

        this.messagesQueue = [];
        this.eventsEmitter = new Emitter();
        this.WBHK_SECRET = Config.SMOOCH_WEBHOOK_SECRET
        this.APP_ID = Config.SMOOCH_APP_ID;
        let proxy = Config.PROXY;
        // Configure CM Agent with Proxy
        if (proxy) {
            logger.info('using proxy server %j', proxy);
            const agent = new HttpsProxyAgent(proxy);
            // this.smoochAgent = new SmoochCore({
            //     keyId: Config.SMOOCH_KEY_ID,
            //     secret: Config.SMOOCH_SECRET,
            //     scope: 'app',
            //     httpAgent: agent
            // });

        }
        // No Proxy
        else {
            // this.smoochAgent = new SmoochCore({
            //     keyId: Config.SMOOCH_KEY_ID,
            //     secret: Config.SMOOCH_SECRET,
            //     scope: 'app',
            // });
        }

        this._setupEvents();

        logger.info('WhatsApp Sender initialized');
    }

    /**
     * Setup Queue events.
     * @returns null
     */
    _setupEvents() {
        let self = this;
        // Queue message to deliver to CM
        self.eventsEmitter.on(Config.EVENT_QUEUE_MESSAGE_TO_CM,
            async function (payload) {
                self.messagesQueue.unshift(payload);
                if (self.messagesQueue.length == 1) {
                    try {
                        await self._sendMessageToCM(payload);
                    } catch (error) {
                        throw error;
                    }
                }
            });

        // CM Message delivered.
        self.eventsEmitter.on(Config.EVENT_SMOOCH_MESSAGE_DELIVERED,
            function (messageId) {
                logger.info('message with ID (' + messageId + ') delivered.....');
                self.messagesQueue.pop();
                self.eventsEmitter.emit(Config.EVENT_PROCESS_NEXT_SMOOCH_MESSAGE);
            });
        // Process next CM message from queue
        self.eventsEmitter.on(Config.EVENT_PROCESS_NEXT_SMOOCH_MESSAGE,
            function () {
                if (self.messagesQueue.length > 0) {
                    let nextMessage = self.messagesQueue[self.messagesQueue.length - 1];
                    // self._sendMessageToSmooch(nextMessage, self.smoochAgent);
                }
            });
    }

    /**
     * Send Message Message to CM.
     * @returns null
     * @param {object} payload - CM Message Payload to send.
     */
    async _sendMessageToCM(payload) {
        let self = this;
        try {
            let {
                userId,
                message
            } = payload;

           let whatsAppResponse ;
 //           let whatsAppResponse = await self.smoochAgent.appUsers.sendMessage(userId, message);

            // As smooch doesn't send delivery messages for WEB, IOS, ANDROID, the response of sending a message
            // is considered a successful delivery message according to smooch documentation.
            // we need to get the user current active & primary channel and filter for WEB|IOS|ANDROID and only mark the message
            // as delivered in this case. Otherwise, a 'delivry:successful' trigger event is fired from 'smooch-server.js for all other third part channels
            let smoochUser = await self.smoochAgent.appUsers.get(userId);
            let activeChannel = smoochUser.appUser.clients.find(client => client.active && client.primary);
            let platform = activeChannel.platform.toUpperCase();
            if (platform === 'WEB' || platform === 'IOS' || platform === 'ANDROID') {
                self.eventsEmitter.emit(Constants.EVENT_SMOOCH_MESSAGE_DELIVERED);
            }
        } catch (error) {
            throw error;
        }

    }
    
    /**
     * Queue Message to be sent to CM.
     * @returns null
     * @param {string} userId - ODA/CM UserId
     * @param {object} message - CM Message payload.
     */
    queueMessage(userId, message) {
        let self = this;
        self.eventsEmitter.emit(Config.EVENT_QUEUE_MESSAGE_TO_CM, {
            userId: userId,
            message: message
        });
    }

    /**
     * Remove message from cache after being delivered.
     * @returns null
     * @param {string} messageId - CM messageId that was delivered
     */
    messageDelivered(messageId) {
        let self = this;
        self.eventsEmitter.emit(Config.EVENT_CM_MESSAGE_DELIVERED, messageId);
    }


}
module.exports = WhatsAppSender;