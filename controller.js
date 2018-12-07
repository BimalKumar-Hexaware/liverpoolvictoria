var helper = require('./helper');
var _ = require('lodash');
tempOppstatus = "";

module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        var session = req.body.session;
        switch (req.body.queryResult.action) {
            case "lv.statusUpdate":
                res.json({
                    "followupEventInput": {
                        "name": "func_event",
                        "parameters": {
                            "func_event": "status update"
                        },
                        "languageCode": "en-US"
                    }
                });
                break;
            case "lv.funcEvent":
                var functionContextIndex = _.indexOf(req.body.queryResult.outputContexts, { 'name': session + "/contexts/lvstatusupdate-followup" });
                console.log("outputContext", JSON.stringify(req.body.queryResult.outputContexts[functionContextIndex]));
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": "What is your FCA Number"
                            }
                        }
                    ],
                    "outputContexts": [
                        {
                            "name": "projects/lv-ouawvs/agent/sessions/gmQcsphpTkK_9jRK0wFoDw/contexts/function_name",
                            "parameters": {
                                "func_event": "status update"
                            }
                        }
                    ]
                });
                break;
            case "lv.funcEvent-getFCANum":
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": "Where are you calling from"
                            }
                        }
                    ]
                });
                break;
            /*case "lv.statusUpdate":
               res.json({
                   "fulfillmentMessages": [
                       {
                           "platform": "TELEPHONY",
                           "telephonySynthesizeSpeech": {
                               "text": "What is your FCA Number"
                           }
                       }
                   ]
               });
               break;
          case "lv.statusUpdate-getFCANo":
               res.json({
                   "fulfillmentMessages": [
                       {
                           "platform": "TELEPHONY",
                           "telephonySynthesizeSpeech": {
                               "text": "Where are you calling from"
                           }
                       }
                   ]
               });
               break;
           case "lv.statusUpdate-getFCANo-getLoc":
               res.json({
                   "fulfillmentMessages": [
                       {
                           "platform": "TELEPHONY",
                           "telephonySynthesizeSpeech": {
                               "text": "What is the LV reference of application number"
                           }
                       }
                   ]
               });
               break;
           case "lv.statusUpdate-getFCANo-getLoc-getLVRefNo":
               res.json({
                   "fulfillmentMessages": [
                       {
                           "platform": "TELEPHONY",
                           "telephonySynthesizeSpeech": {
                               "text": "Whats the customers name"
                           }
                       }
                   ]
               });
               break;
           case "lv.statusUpdate-getFCANo-getLoc-getLVRefNo-getCustName":
               res.json({
                   "fulfillmentMessages": [
                       {
                           "platform": "TELEPHONY",
                           "telephonySynthesizeSpeech": {
                               "text": "Success , it worked"
                           }
                       }
                   ]
               });
               break;*/
        }
    }
};
