var helper = require('./helper');
var _ = require('lodash');
var customers = require('./customer.json');
var appStatus = require('./appStatus.json');
var u_session = { "fcaNumber": "", "lvrefno": "", "location": "", "customerName": "" };

module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        var session = req.body.session;
        console.log("u_session", JSON.stringify(u_session));
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
                if (u_session.fcaNumber == "") {
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
                } else {
                    res.json({
                        "followupEventInput": {
                            "name": "user_loggedin_event",
                            "parameters": u_session,
                            "languageCode": "en-US"
                        }
                    });
                }
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
                var helperVar = helper.getApplicationStatus(params);
                u_session = helperVar.u_session;
                res.json({
                    "followupEventInput": {
                        "name": "sec_ques_handle_event",
                        "parameters": {
                            "final_response": helperVar.response
                        },
                        "languageCode": "en-US"
                    }
                });
                break;
            case "lv.userloggedin":
                var contextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/user_loggedin_event" });
                var contextIndex = req.body.queryResult.outputContexts[contextIndex];
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": "Do you want to continue with the old LV reference number"
                            }
                        }
                    ],
                    "outputContexts": [
                        {
                            "name": session + "/contexts/old_params",
                            "lifespanCount": 5,
                            "parameters": contextIndex.parameters
                        }
                    ]
                });
                break;
            case "lv.userloggedin-yes":
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": "said yes"
                            }
                        }
                    ]
                });
                break;
            case "lv.userloggedin-no":
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
            case "lv.userloggedin-no-getLVRefNo":
                var lvrefno = req.body.queryResultqueryResult.parameters.lvrefno;
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": "new lv ref"
                            }
                        }
                    ]
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
                                "text": "Please authenticate yourself by answering the security questions"
                            }
                        },
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
                                "final_response": functionContext.parameters.final_response
                            }
                        }
                    ]
                });
                break;
            case "lv.secQuesHandler-getFirstAns":
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": "What was the make and model of your first car"
                            }
                        }
                    ]
                });
                break;
            case "lv.secQuesHandler-getFirstAns-getSecAns":
                var functionContextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/final_response" });
                var functionContext = req.body.queryResult.outputContexts[functionContextIndex];
                var params = req.body.queryResult.outputContexts[functionContextIndex].parameters;
                if (params.firstAns.toLowerCase() == customers.securityAnswers.firstAnswer && params.secondAns.toLowerCase() == customers.securityAnswers.secondAnswer) {
                    u_session.fcaNumber = customers.fcaNumber;
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "platform": "TELEPHONY",
                                "telephonySynthesizeSpeech": {
                                    "text": params.final_response
                                }
                            }
                        ]
                    });
                } else {
                    u_session = "";
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "platform": "TELEPHONY",
                                "telephonySynthesizeSpeech": {
                                    "text": "Authentication failed due to incorrect answers"
                                }
                            }
                        ]
                    });
                }
                break;
        }
    }
};
