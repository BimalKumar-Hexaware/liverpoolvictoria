var customers = require('./customer.json');
var appStatus = require('./appStatus.json');
var _ = require('lodash');

var self = {
    "getApplicationStatus": function (params) {
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
        return response;
    }
};

module.exports = self;