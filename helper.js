var customers = require('./customer.json');
var appStatus = require('./appStatus.json');
var _ = require('lodash');

var self = {
    "getApplicationStatus": function (params) {
        var response;
        var u_session = { "fcaNumber": "", "lvrefno": "", "location": "", "customerName": "" };
        if (customers.customerName == params.customerName && customers.fcaNumber == params.fcaNumber) {
            if (_.has(appStatus.data, params.lvrefno)) {
                u_session.customerName = params.customerName;
                u_session.location = params.location;
                u_session.lvrefno = params.lvrefno;
                u_session.fcaNumber = params.fcaNumber;
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
        return { "response": response, "u_session": u_session };
    }
};

module.exports = self;