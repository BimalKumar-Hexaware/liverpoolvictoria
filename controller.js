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
                var response;
                if (customers.customerName == params.customerName && customers.fcaNumber == params.fcaNumber) {
                    if (_.has(appStatus.data, params.lvrefno)) {
                        switch (params.func_event) {
                            case "status update":
                                response = appStatus.data[params.lvrefno].statusText;
                                break;
                            case "check report":
                                response = appStatus.data[params.lvrefno].statusText;
                                break;
                            case "underwriting decision":
                                response = appStatus.data[params.lvrefno].uwDecisionReason;
                                break;
                        }
                    } else {
                        response = "LV reference number is not matching.";
                    }

                } else {
                    response = "Customer name and FCA number not matching";
                }
                res.json({
                    "followupEventInput": {
                        "name": "sec_ques_handle_event",
                        "parameters": {
                            "final_response": response
                        },
                        "languageCode": "en-US"
                    }
                });
                break;
            case "lv.secQuesHandler":
                var functionContextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/sec_ques_handle_event" });
                var functionContext = req.body.queryResult.outputContexts[functionContextIndex];
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": "What was your favorite sport in high school"
                            }
                        }
                    ],
                    "outputContexts": [
                        {
                            "name": session + "/contexts/final_response",
                            "lifespanCount": 5,
                            "parameters": {
                                "func_event": functionContext.parameters.final_response
                            }
                        }
                    ]
                });
                break;
        }
    }
};
