var helper = require('./helper');
var _ = require('lodash');
var customers = require('./customer.json');
var appStatus = require('./appStatus.json');

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
            case "lv.checkReport":
                res.json({
                    "followupEventInput": {
                        "name": "func_event",
                        "parameters": {
                            "func_event": "check report"
                        },
                        "languageCode": "en-US"
                    }
                });
                break;
            case "lv.underwritingDecision":
                res.json({
                    "followupEventInput": {
                        "name": "func_event",
                        "parameters": {
                            "func_event": "underwriting decision"
                        },
                        "languageCode": "en-US"
                    }
                });
                break;
            case "lv.funcEvent":
                var functionContextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/func_event" });
                var functionContext = req.body.queryResult.outputContexts[functionContextIndex];
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
                            "name": session + "/contexts/function_name",
                            "lifespanCount": 5,
                            "parameters": {
                                "func_event": functionContext.parameters.func_event
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
            case "lv.funcEvent-getFCANum-getLocation":
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
            case "lv.funcEvent-getFCANum-getLocation-getLVRef":
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
            case "lv.funcEvent-getFCANum-getLocation-getLVRef-getCusNo":
                var functionContextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/function_name" });
                var functionContext = req.body.queryResult.outputContexts[functionContextIndex];
                var params = req.body.queryResult.outputContexts[functionContextIndex].parameters;
                if (customers.customerName == params.customerName && customers.fcaNumber == params.fcaNumber) {
                    if (_.has(appStatus.data, params.lvrefno)) {
                        switch (params.func_event) {
                            case "status update":
                                res.json({
                                    "fulfillmentMessages": [
                                        {
                                            "platform": "TELEPHONY",
                                            "telephonySynthesizeSpeech": {
                                                "text": appStatus.data[params.lvrefno].statusText
                                            }
                                        }
                                    ]
                                });
                                break;
                            case "check report":
                                res.json({
                                    "fulfillmentMessages": [
                                        {
                                            "platform": "TELEPHONY",
                                            "telephonySynthesizeSpeech": {
                                                "text": appStatus.data[params.lvrefno].statusText
                                            }
                                        }
                                    ]
                                });
                                break;
                            case "underwriting decision":
                                res.json({
                                    "fulfillmentMessages": [
                                        {
                                            "platform": "TELEPHONY",
                                            "telephonySynthesizeSpeech": {
                                                "text": appStatus.data[params.lvrefno].uwDecisionReason
                                            }
                                        }
                                    ]
                                });
                                break;
                        }
                    } else {
                        res.json({
                            "fulfillmentMessages": [
                                {
                                    "platform": "TELEPHONY",
                                    "telephonySynthesizeSpeech": {
                                        "text": "LV reference number is not matching."
                                    }
                                }
                            ]
                        });
                    }
                } else {
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "platform": "TELEPHONY",
                                "telephonySynthesizeSpeech": {
                                    "text": "Customer name and FCA number not matching"
                                }
                            }
                        ]
                    });
                }
                break;
        }
    }
};
