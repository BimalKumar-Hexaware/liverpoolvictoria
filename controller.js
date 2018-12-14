var helper = require('./helper');
var _ = require('lodash');
var Speech = require('ssml-builder');
var customers = require('./customer.json');
var appStatus = require('./appStatus.json');
var config = require('./config.json');
var u_session = { "fcaNumber": "", "lvrefno": "", "location": "", "customerName": "" };

module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        var session = req.body.session;
        console.log("u_session", JSON.stringify(u_session));
        switch (req.body.queryResult.action) {
            case "input.welcome":
                var speech = new Speech();
                speech.say('Hi').pause('500ms').sentence('welcome to liverpool victoria').sentence('I am your virtual agent')
                    .sentence('How can I help you today').pause('500ms')
                    .sentence('You can connect to our customer executive at any point by saying').pause("500ms").say("connect to agent");
                var speechOutput = speech.ssml(false);
                console.log("speechOutput", speechOutput);
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "ssml": speechOutput
                            }
                        }
                    ]
                });
                break;
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
                                    "text": "Can you please provide your FCA number"
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
                    u_session.func_event = functionContext.parameters.func_event;
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
                                "text": "Please provide the LV reference number"
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
                                "text": "Can I have the customers name"
                            }
                        }
                    ]
                });
                break;
            case "lv.funcEvent-getFCANum-getLocation-getLVRef-getCusNo":
                var functionContextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/function_name" });
                var functionContextParams = req.body.queryResult.outputContexts[functionContextIndex].parameters;
                var response = helper.getApplicationStatus(functionContextParams);
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
                var oldParamsIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/old_params" });
                var oldParamsContext = req.body.queryResult.outputContexts[oldParamsIndex].parameters;

                console.log("oldParamsContext", JSON.stringify(oldParamsContext));
                var response = helper.getApplicationStatus(oldParamsContext);
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": response
                            }
                        },
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": config.prompt_msg
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
                                "text": "What is the LV reference number"
                            }
                        }
                    ]
                });
                break;
            case "lv.userloggedin-no-getLVRefNo":
                var oldParamsIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/old_params" });
                var oldParamsContextParams = req.body.queryResult.outputContexts[oldParamsIndex].parameters;
                oldParamsContextParams.lvrefno = req.body.queryResult.parameters.lvrefno;
                console.log("params", JSON.stringify(oldParamsContextParams));
                var response = helper.getApplicationStatus(oldParamsContextParams);
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": response
                            }
                        },
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": config.prompt_msg
                            }
                        }
                    ]
                });
                break;
            case "lv.secQuesHandler":
                var functionContextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/sec_ques_handle_event" });
                var functionContextParam = req.body.queryResult.outputContexts[functionContextIndex];
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
                                "final_response": functionContextParam.parameters.final_response
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
                var finalResContextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/final_response" });
                var finalResContextParams = req.body.queryResult.outputContexts[finalResContextIndex].parameters;

                var functionContextIndex = _.findIndex(req.body.queryResult.outputContexts, { 'name': session + "/contexts/function_name" });
                var functionContextParams = req.body.queryResult.outputContexts[functionContextIndex].parameters;

                if (finalResContextParams.firstAns.toLowerCase() == customers.securityAnswers.firstAnswer && finalResContextParams.secondAns.toLowerCase() == customers.securityAnswers.secondAnswer) {
                    u_session.customerName = functionContextParams.customerName;
                    u_session.location = functionContextParams.location;
                    u_session.lvrefno = functionContextParams.lvrefno;
                    u_session.fcaNumber = functionContextParams.fcaNumber;
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "platform": "TELEPHONY",
                                "telephonySynthesizeSpeech": {
                                    "text": finalResContextParams.final_response
                                }
                            },
                            {
                                "platform": "TELEPHONY",
                                "telephonySynthesizeSpeech": {
                                    "text": config.prompt_msg
                                }
                            }
                        ],
                        "outputContexts": []
                    });
                } else {
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "platform": "TELEPHONY",
                                "telephonySynthesizeSpeech": {
                                    "text": "Authentication failed due to incorrect answers"
                                }
                            },
                            {
                                "platform": "TELEPHONY",
                                "telephonySynthesizeSpeech": {
                                    "text": config.prompt_msg
                                }
                            }
                        ]
                    });
                }
                break;
            case "lv.thankIntent":
                u_session = { "fcaNumber": "", "lvrefno": "", "location": "", "customerName": "" };
                res.json({
                    "fulfillmentMessages": [
                        {
                            "platform": "TELEPHONY",
                            "telephonySynthesizeSpeech": {
                                "text": config.thank_msg
                            }
                        }
                    ]
                });
                break;
        }
    }
};
