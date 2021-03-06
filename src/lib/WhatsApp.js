// const WhatsAppSender = require('./WhatsAppSender');
const https = require('https')
const Config = require('../../config/Config');
//const txtMessageTemplate = require('../../config/CMMessageTemplates/ToUserTextMessage.json');
const richMessageTemplate = require('../../config/CMMessageTemplates/ToUserRichContent.json');
const _ = require('underscore');
const { MessageModel } = require('@oracle/bots-node-sdk/lib');
const log4js = require('log4js');
const { config } = require('process');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
let logger = log4js.getLogger('WhatsAppUIBuilder');
logger.level = 'debug';

// Smooch Restrictions
const MAX_TEXT_LENGTH = 128;
const MAX_CARDS = 10;
const MAX_CARD_ACTIONS = 3

/**
 * Utility Class to send and recieve messages from WhatsApp & Twitter through CM.
 */
class WhatsApp {
    constructor() {
        //this.whatsAppSender = new WhatsAppSender();
    }

    /**
     * Recieves a message from smooch and convert to ODA payload
     * @returns {object []} array of messages in ODA format.
     * @param {object} payload - Smooch Message Object
     */
    recieve(payload) {
        let self = this;
        ////////////////////////////////////////////////CM///////////////////////////////////////////////////////
        // let {
        //     from,
        //     to,
        //     message
        // } = payload;
        // let userId = from.number;
        // //--Adapting text message to ODA text Conversation model
        // let text = this._handleArabicNumbers(message.text);
        // let messagePayload = MessageModel.textConversationMessage(text);
        // //--Creating ODA text message.
        // let odaMessages = [];
        // odaMessages.push({
        //     userId: userId,
        //     // userId: to,
        //     messagePayload: messagePayload,
        //     metadata: {
        //         webhookChannel: Config.CM_CHANNEL
        //     }
        // });
        // return odaMessages;
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        let {
            from,
            to,
            message
        } = payload;
        let userId = from.number;
        let responses = [];
        responses = self._processWhatsAppMessages(message, userId);
        return responses;
        /////////////////////////////////////////////////////////////////////////////////////////////////////////




        //TODO - Handle all message cases.
        // let {
        //     trigger,
        //     appUser
        // } = payload;
        // let userId = appUser._id;
        // let responses = [];

        // switch (trigger) {
        //     // Recieved Text message from smooch
        //     case 'message:appUser':
        //         {
        //             responses = self._processWhatsAppMessages(payload.messages, userId);
        //             break;
        //         };
        //     // Recieved a button postback from smooch
        //     case 'postback':
        //         {
        //             responses = self._processWhatsAppButtons(trigger, payload, userId);
        //             break;
        //         }
        //     // Smooch API v1.1
        //     case 'message:delivery:user':
        //         {

        //         }
        //     // Smooch API v1.1
        //     case 'message:delivery:channel':
        //         {
        //             let messages = [payload.message];
        //             self._processWhatsAppDeliveryMessages(messages);
        //             break
        //         }
        //     // smooch API v1.0
        //     case 'delivery:success':
        //         {
        //             self._processWhatsAppDeliveryMessages(payload.messages);
        //             break;
        //         }
        // }

        //return responses;
    }

    _handleArabicNumbers(text) {
        return text.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    }

    /**
     * Send ODA message to smooch. Converts message from ODA format to Smooch message format.
     * @param {object} payload - ODA Message Payload
     */
    send(payload) {
        let self = this;
        let response = {};
        let {
            userId,
            messagePayload
        } = payload;
        let {
            type,
            actions,
            globalActions,
            footerText
        } = messagePayload;
        logger.info(">>>>>>> PAYLOAD: " + JSON.stringify(messagePayload) + " <<<<<<<<<<<<<<<<<<");

        switch (type) {
            case 'text':
                {
                    //to process the twitter buttons, but if there are no actions or their count is more than 3 then text based options is used as an alternative.
                    let actionsLength = 0;
                    if (actions && actions.length) {
                        actionsLength = actions.length;
                    }
                    if (globalActions && globalActions.length) {
                        actionsLength = globalActions.length;
                    }
                    if (Config.CM_CHANNEL == "Twitter" && actionsLength <= 20) {
                        let cmActions = self._processODAActionsForTwitter(actions, globalActions);
                        let messageBody = JSON.stringify(messagePayload.text).slice(1, -1);
                        logger.info("\n\n>>>>>>> Text: " + messageBody + " <<<<<<<<<<<<<<<<<<");

                        response = self._processODATextMessage(messageBody, cmActions, userId);
                    } else {
                        // Create Actions for every card.
                        let cmActions = self._processODAActions(actions, globalActions);
                        let messageBody = "";
                        if (cmActions) {
                            messageBody = JSON.stringify(messagePayload.text).slice(1, -1) + JSON.stringify(cmActions).slice(1, -1);
                        } else {
                            messageBody = JSON.stringify(messagePayload.text).slice(1, -1);
                        }
                        logger.info("\n\n>>>>>>> Text: " + messageBody + " <<<<<<<<<<<<<<<<<<");

                        response = self._processODATextMessage(messageBody, null, userId);
                        //response = self._processODATextMessage(messagePayload.text, userId);
                    }
                    break;
                };
            case 'card':
                {
                    response = self._processODACards(messagePayload, userId);
                    break;
                }
            case 'attachment':
                {
                    response = self._processODAAttachment(messagePayload, userId);
                    break;
                }
            default:
                {
                    throw new Error('Unsupported format')
                };
        }

        ////////////////////////////////CM Alternative//////////////////////////////////////
        this._sendToCM(response);
        return;
        /////////////////////////////////////////////////////////////////////////////////////

        /*

        let smoochPayloads = [];

        // Process ODA Actions and Global Actions;
        let smoochActions = self._processODAActions(actions, globalActions, footerText);

        if (smoochActions && smoochActions.length > 0) {
            if (type === 'text') {
                response.text = response.text.concat(smoochActions);
                if (footerText) {
                    response.text = response.text.concat("\n\n").concat(footerText);
                }
                smoochPayloads.push(response);
            } else {
                smoochPayloads.push(response);

                if (footerText) {
                    smoochActions = smoochActions.concat("\n\n").concat(footerText);
                }

                //TODO                smoochPayloads.push(self._processODATextMessage(smoochActions));
            }

        } else {
            smoochPayloads.push(response);
        }

        self._sendToSmooch(userId, smoochPayloads);
        */
    }
    /**
     * Send Message to smooch.
     * @param {string} userId - User ID
     * @param {object[]} messages - Array of Smooch message payload to be sent.
     */
    _sendToSmooch(userId, messages) {
        let self = this;
        messages.forEach(message => {
            message.role = 'appMaker';
            // self.whatsAppSender.queueMessage(userId, message);
        });
    }

    /**
     * Send Message to CM by making a POST request to CM REST APIs.
     * @param {string} payload - Message strucure accpeted by CM APIs
     */
    _sendToCM(payload) {

        const data = JSON.stringify(payload);

        const options = {
            hostname: Config.CM_GATEWAY_HOST,
            path: Config.CM_GATEWAY_PATH,
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        }

        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`)

            res.on('data', d => {
                process.stdout.write(d)
            })
        })

        req.on('error', error => {
            console.error(error)
        })

        req.write(data)
        req.end()
    }


    /**
     * Process CM messages and convert to ODA message format.
     * @returns {object []} Array of ODA messages.
     * @param {object[]} message - CM Messages array to be processed.
     * @param {string} userId - User ID.
     */
    _processWhatsAppMessages(message, userId) {
        let self = this;
        let odaMessages = [];
        let keys = Object.keys(message);
        let addToListFlag = false;
        keys.forEach(key => {
            let messagePayload = {}
            switch (key) {
                case 'text':
                    {
                        if (message.text) {
                            let text = this._handleArabicNumbers(message.text);
                            messagePayload = self._processWhatsAppTextMessage(text);
                            addToListFlag = true;
                        }
                        break;
                    }
                case 'custom':
                    {
                        if (message.custom && message.custom.location) {
                            messagePayload = self._processWhatsAppLocationMessage(message.custom.location);
                            addToListFlag = true;
                        }
                        break;
                    }
                case 'media':
                    {
                        if (message.media && message.media.mediaUri) {
                            // logger.info("-------------------------------------------------------------------");
                            // logger.info("Found an image, link: " + message.media.mediaUri);
                            messagePayload = self._processWhatsAppMediaMessage(message.media.mediaUri, message.media.contentType);
                            // logger.info("-------------------------------------------------------------------");
                            // logger.info("Process media message response: " + JSON.stringify(messagePayload));
                            // logger.info("-------------------------------------------------------------------");
                            addToListFlag = true;
                        }
                        break;
                    }
            }
            if (addToListFlag) {
                odaMessages.push({
                    userId: userId,
                    messagePayload: messagePayload,
                    metadata: {
                        webhookChannel: Config.CM_CHANNEL
                    }
                });
                addToListFlag = false;
            }
        });
        logger.info("-------------------------------------------------------------------");
        logger.info("Final response: " + JSON.stringify(odaMessages));
        logger.info("-------------------------------------------------------------------");
        return odaMessages;
    }

    /**
     * Process Smooch delivery messages.
     * @returns null
     * @param {object[]} messages - Smooch Messages Array.
     */
    _processWhatsAppDeliveryMessages(messages) {
        let self = this;
        messages.forEach(message => {
            // self.whatsAppSender.messageDelivered(message._id);
        });
    }

    /**
     * Process Smooch buttons and conver to ODA message format.
     * @returns {object []} Array of ODA messages.
     * @param {string} trigger 
     * @param {object []} payload - array of smooch buttons
     */
    _processWhatsAppButtons(trigger, payload, userId) {
        let self = this;
        switch (trigger) {
            case 'postback':
                {
                    return self._processWhatsAppPostbacks(payload.postbacks, userId)
                }
        }

    }

    /**
     * Convert Smooch postbacks into ODA Buttons.
     * @returns {object[]} Array of ODA messages.
     * @param {object []} postbacks - Smooch postbacks array
     * @param {String} userId - User ID.
     */
    _processWhatsAppPostbacks(postbacks, userId) {
        let odaResponses = [];
        postbacks.forEach(postback => {
            let {
                type
            } = postback.action;
            let {
                action,
                state,
                variables
            } = JSON.parse(postback.action.payload);
            let odaPostback = {
                action: action,
                state: state,
                variables: variables
            }
            odaResponses.push({
                userId: userId,
                messagePayload: {
                    type: type,
                    postback: odaPostback
                }
            });
        });
        return odaResponses;

    }
    /**
     * Convert Smooch text message to ODA text message
     * @returns {object} ODA Text message.
     * @param {string} message - Smooch text Message.
     */
    _processWhatsAppTextMessage(text) {
        let response = MessageModel.textConversationMessage(text);
        return response;
    }

    /**
     * Convert Smooch Coordinates message to ODA Coordinates Message
     * @returns ODA Coordinates Message
     * @param {object} coordinates - Smooch object holding user coordinates.
     */
    _processWhatsAppLocationMessage(coordinates) {
        let messagePayload = {
            type: 'location',
            location: {
                longitude: coordinates.longitude,
                latitude: coordinates.latitude
            }
        };
        return messagePayload;

    }

    /**
     * Convert Smooch Media (images and attachments) messages to ODA attachements.
     * @returns {object} ODA attachment message.
     * @param {string} mediaUrl - media URL
     * @param {*} mediaType - media Type
     */
    _processWhatsAppMediaMessage(mediaUrl, mediaType) {
        let response = {
            type: 'attachment',
            attachment: {}
        };
        switch (mediaType) {
            case 'image/png':
            case 'image/jpeg':
                {
                    response.attachment.type = 'image',
                        response.attachment.url = mediaUrl;
                    break;
                }
        }
        return response;
    }

    /**
     * Process and convert ODA text message to CM Text message. If buttons 'actions' and 'globalActions' are available, they are processed too.
     * @returns {object} CM format message.
     * @param {string} text - ODA messagePayload.text
     * @param {string} userId - user mobile number 
     */
    _processODATextMessage(text, actions, userId) {
        let self = this;
        logger.info("Generating a Text Message");

        text = text.replace(/\\n/g, "\n");

        let cmText;
        if (Config.CM_CHANNEL == "Twitter") {
            if (actions && actions.length) {
                let suggestions = [];
                actions.forEach(element => {
                    let suggestionsItem = {
                        "action": "Reply",
                        "label": element.length <= 36 ? element : (element.slice(0, 28) + "...")
                    }
                    suggestions.push(suggestionsItem);
                });
                cmText = [{
                    "text": text,
                    "suggestions": suggestions
                }];
            } else {
                cmText = [{
                    "text": text
                }];
            }
        } else {
            cmText = [{
                "text": text
            }];
        }
        return self._cmRichContentResponse(cmText, userId);
    }

    /**
     * Convert ODA Cards into Smooch Carousel message payload
     * @returns {object} Smooch carousel message payload.
     * @param {object} messagePayload - ODA Message Payload
     */
    _processODACards(messagePayload, userId) {
        let self = this;
        logger.info("Generating a Carousel");
        let cmCards = self._createCMCard(messagePayload);
        return self._cmRichContentResponse(cmCards, userId);
    }

    /**
     * Convert ODA Cards into Smooch Carousel message payload
     * @returns {object} Smooch carousel message payload.
     * @param {object} messagePayload - ODA Message Payload
     */
    _processODAAttachment(messagePayload, userId) {
        let self = this;
        logger.info("Generating Attachment");
        let cmAttachment = self._createCMAttachment(messagePayload.attachment);
        return self._cmRichContentResponse(cmAttachment, userId);
    }

    _cmRichContentResponse(richContent, userId) {
        let response = richMessageTemplate;
        response.messages.msg[0].richContent.conversation = richContent;

        response = JSON.stringify(response).replace("{{PRODUCT_TOKEN}}", Config.CM_PRODUCT_TOKEN);
        response = response.replace("{{TO_NUMBER}}", userId);
        response = response.replace("{{FROM_NUMBER}}", Config.CM_FROM);
        response = response.replace("{{MESSAGE_TEXT}}", "ODA");
        response = response.replace("{{ALLOWED_CHANNEL}}", Config.CM_CHANNEL);
        logger.info("RESPONSE: " + response);
        response = JSON.parse(response);

        return response;
    }


    /**
     * Convert ODA Attachment Payload to Smooch Attachment message payload.
     * @returns {object} Smooch Attachment message Payload.
     * @param {object} attachment - ODA messagePayload.attachment
     */
    _processODAAttachmentOLD(attachment) {
        let self = this;
        logger.info("Generating attachments");
        let {
            type,
            url
        } = attachment;
        type = type == 'image' ? type : 'file';
        let response = {
            type: type,
            mediaUrl: url,
            text: ""
        };

        return response;
    }

    /**
     * Convert ODA Card Object into Smooch Card Object
     * @returns {object} Smooch Card Object
     * @param {object} odaCard - ODA Card object
     */
    _createSmoochCard(odaCard) {
        let self = this;
        let {
            title,
            description,
            imageUrl,
            actions,
            footerText
        } = odaCard;

        description = description ? description : "";
        // Create Smooch Card
        let smoochCard = {
            title: title,
            // Smooch limits a card description to 128 characters only.
            description: description.length > MAX_TEXT_LENGTH ? description.substr(0, MAX_TEXT_LENGTH - 1) : description,
            mediaUrl: imageUrl,
            size: "large",
            // Smooch requires a minimum of 1 action button per card; so I add a dummy action with no label
            actions: [{
                type: "postback",
                "text": "",
                payload: ""
            }]
        };

        // Limit the number of actions to conform with Smooch restrictions
        if (actions.length > MAX_CARD_ACTIONS) {
            actions = actions.slice(0, MAX_CARD_ACTIONS - 1);
        }

        // Create Smooch Actions for every card.
        let smoochActions = self._processODAActions(actions, footerText);
        if (smoochActions) {
            // Smooch has a limit of 128 characters for description. Actions are added as text to a card description.
            // if Actions, exists, then we should trucn the original desription to fit the actions.
            smoochActions = '\n\n'.concat(smoochActions.length > MAX_TEXT_LENGTH ? smoochActions.substr(0, MAX_TEXT_LENGTH - 2) : smoochActions);
            let actionsCharLength = smoochActions.length;
            let allowedCharsLength = MAX_TEXT_LENGTH - actionsCharLength;
            smoochCard.description = description.substr(0, allowedCharsLength - 1);
            smoochCard.description = smoochCard.description.concat(smoochActions);
        }
        //smoochCard.actions = smoochActions;
        return smoochCard;
    }


    /**
    * Convert ODA attachment Object into CM rich content payload
    * @returns {object} Smooch Attachment message Payload.
    * @param {object} attachment - ODA messagePayload.attachment
    */
    _createCMAttachment(attachment) {
        let self = this;
        let attachmentBodyArray = [];
        let {
            type,
            url
        } = attachment;

        //TODO - Add other file types
        type = type == 'image' ? type : 'file';

        let fileName = url.split('/');
        fileName = fileName[fileName.length - 1];
        let fileExt = fileName.split('.');
        let mediaName = fileExt[0];
        fileExt = fileExt[fileExt.length - 1];
        try {
            if (fileExt.toLowerCase() == 'pdf' || fileExt.toLowerCase() == 'doc' || fileExt.toLowerCase() == 'docx') {
                type = 'application';
            }
            if (fileExt.toLowerCase() == 'jpg') {
                fileExt = 'jpeg';
            }
            if (fileExt.toLowerCase() == 'doc') {
                fileExt = 'msword';
            }
            if (fileExt.toLowerCase() == 'docx') {
                fileExt = 'vnd.openxmlformats-officedocument.wordprocessingml.document';
            }
        } finally {
        }

        let mimeType = type + "/" + fileExt;
        let attachmentBody = {
            // "text": "",
            "media": {
                "mediaName": mediaName,
                "mediaUri": url,
                "mimeType": mimeType
            }
        };
        attachmentBodyArray.push(attachmentBody);
        return attachmentBodyArray;
    }

    /**
    * Convert ODA Card Object into CM rich content payload
    * @returns {object} CM rich content payload Object
    * @param {object} odaCard - ODA Card object
    */
    _createCMCard(messagePayload) {
        let cmCards = [];
        let self = this;

        messagePayload.cards.forEach(card => {
            let fullDescription = "";
            let {
                title,
                description,
                imageUrl,
                actions,
                footerText
            } = card;

            description = description ? description : "";

            // Create CM rich content section
            // let cardTitle = {
            //     "text": "*" + title + "* \n"
            // };

            fullDescription += "*" + title + "* \n\n";
            fullDescription += description + "\n\n";
            //cmCards.push(cardTitle);

            // Create Actions for every card.
            let cmActions = self._processODAActions(actions, messagePayload.globalActions);

            if (cmActions) {
                fullDescription += cmActions;
            }


            //TODO - Adjust mime types
            let imageName = imageUrl.split('/');
            imageName = imageName[imageName.length - 1];
            let imageExt = imageName.split('.');
            imageExt = imageExt[imageExt.length - 1];
            let mimeType = "image/" + imageExt;
            let cardImage;
            if (Config.CM_CHANNEL == 'Whatsapp') {
                cardImage = {
                    "media": {
                        "mediaName": fullDescription,
                        "mediaUri": imageUrl,
                        "mimeType": mimeType
                    }
                };
            } else if (Config.CM_CHANNEL == 'Twitter') {
                cardImage = {
                    "text": fullDescription,
                    "media": {
                        "mediaName": imageName,
                        "mediaUri": imageUrl,
                        "mimeType": mimeType
                    }
                };
            }

            cmCards.push(cardImage);

        });
        return cmCards;
    }

    /**
     * Convert ODA Action to Smooch Action. 'Share' actions are not supported.
     * @returns {string} Smooch Action Label.
     * @param {object} odaAction - ODA Action.
     */
    _createSmoochAction(odaAction) {
        let {
            type,
            label,
            url,
            phoneNumber,
        } = odaAction;

        if (type == 'share') {
            return;
        }
        let smoochButton = {
            text: label
        }

        // Nothing to do for postback/Location buttons, all what is needed to set ODA action text to SmoochAction label which is done already at the beggining of method.
        switch (type) {
            case 'url':
                {
                    smoochButton.text = smoochButton.text.concat(": ").concat(url);
                    break;
                }
            case 'call':
                {
                    smoochButton.text = smoochButton.text.concat(": ").concat(phoneNumber);
                    break;
                }
            // Share buttons not supported
            case 'share':
                {
                    return null;
                }
        }
        return smoochButton.text;
    }

    /**
    * Convert ODA Actions into CM Twitter Actions.
    * @returns {object[]} Array of CM Actions.
    * @param {object[]} actions - ODA Actions Array.
     * @param {object[]} globalActions - ODA Global Actions Array.
     */
    _processODAActionsForTwitter(actions, globalActions) {
        let self = this;
        logger.info("Generating Buttons");

        // Combine Actions and Global Actions
        actions = actions ? actions : [];
        globalActions = globalActions ? globalActions : [];
        actions = actions.concat(globalActions);

        if (actions && actions.length) {
            let response = [];
            // Group Actions by type;
            actions = _.groupBy(actions, 'type');

            let postbackActions = _.pick(actions, ['postback']);
            let otherActions = _.omit(actions, ['postback']);

            // process postback buttons lastly
            response = generateActions(otherActions);
            response = response.concat(generateActions(postbackActions));
            function generateActions(actions) {
                let response = [];
                for (var key in actions) {
                    actions[key].forEach(action => {
                        let actionAstext = self._createSmoochAction(action)
                        if (actionAstext) {
                            response.push(actionAstext);
                        }
                    });
                }
                return response;
            }
            return response;
        } else
            return;
    }



    /**
     * Convert ODA Actions into CM Actions.
     * @returns {object[]} Array of CM Actions.
     * @param {object[]} actions - ODA Actions Array.
     * @param {object[]} globalActions - ODA Global Actions Array.
     */
    _processODAActions(actions, globalActions) {
        let self = this;
        logger.info("Generating Buttons");

        // Combine Actions and Global Actions
        actions = actions ? actions : [];
        globalActions = globalActions ? globalActions : [];
        actions = actions.concat(globalActions);

        if (actions && actions.length) {
            let response = "";
            // Group Actions by type;
            actions = _.groupBy(actions, 'type');

            let postbackActions = _.pick(actions, ['postback']);
            let otherActions = _.omit(actions, ['postback']);

            // process postback buttons lastly
            response = generateActions(otherActions);
            response = response.concat(generateActions(postbackActions));

            function generateActions(actions) {
                let response = "";
                for (var key in actions) {
                    actions[key].forEach(action => {
                        let actionAstext = self._createSmoochAction(action)
                        if (actionAstext) {
                            response = response.concat("\n").concat(actionAstext);
                        }
                    });
                }
                return response;
            }

            return response;

        } else
            return;
    }
};
module.exports = WhatsApp;