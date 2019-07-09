"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMobileNumberValid = function (mobileNumber) {
    var validFirstDigits = ['6', '7', '8', '9'];
    if (mobileNumber.length === 10 && validFirstDigits.indexOf(mobileNumber[0]) > -1) {
        return true;
    }
    if (mobileNumber.length > 0 &&
        mobileNumber.length < 10 &&
        validFirstDigits.indexOf(mobileNumber[0]) > -1) {
        return true;
    }
    return false;
};
exports.isDigit = function (char) {
    return /^[0-9\b]+$/.test(char);
};
exports.isNameValid = function (name) {
    return /^[a-zA-Z ]*$/.test(name.trim()) && name.trim().length > 1;
};
exports.isDobValid = function (ddmmyyyy) {
    var isCorrectFormat = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(ddmmyyyy);
    if (!isCorrectFormat)
        return false;
    var dateParts = ddmmyyyy.split('/');
    var dd = parseInt(dateParts[0]);
    var mm = parseInt(dateParts[1]);
    var yyyy = parseInt(dateParts[2]);
    var date = new Date(mm + "/" + dd + "/" + yyyy);
    var isInvalid = isNaN(date.valueOf());
    var isInFuture = date > new Date();
    return isInvalid || isInFuture ? false : true;
};
exports.isEmailValid = function (email) {
    return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email);
};
//# sourceMappingURL=validators.js.map