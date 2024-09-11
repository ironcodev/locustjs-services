'use strict';

var base = require('@locustjs/base');
var extensionsString = require('@locustjs/extensions-string');

const ServiceResponseStatus = {
    Succeeded: 'Succeeded',
    Failed: 'Failed',
    Faulted: 'Faulted',
    Flawed: 'Flawed',
    Deleted: 'Deleted',
    Removed: 'Removed',
    Recovered: 'Recovered',
    Errored: 'Errored',

    AccessDenied: 'AccessDenied',
    NotAuthenticated: 'NotAuthenticated',
    NotAuthorized: 'NotAuthorized',
    Forbidden: 'Forbidden',
    NotAllowed: 'NotAllowed',
    NotPermitted: 'NotPermitted',
    NotPossible: 'NotPossible',

    NotFound: 'NotFound',
    AlreadyExists: 'AlreadyExists',
    NotValid: 'NotValid',
    NotProvided: 'NotProvided',
    NoData: 'NoData',
    InvalidData: 'InvalidData',
    IncorrectData: 'IncorrectData',
    InUse: 'InUse',
    
    ParentNotFound: 'ParentNotFound',
    ParentExists: 'ParentExists',
    ParentInvalid: 'ParentInvalid',
    ParentIncorrect: 'ParentIncorrect',
    ParentNotValid: 'ParentNotValid',
    ParentInUse: 'ParentInUse',
    ParentAccessDenied: 'ParentAccessDenied',
    
    ChildNotFound: 'ChildNotFound',
    ChildExists: 'ChildExists',
    ChildInvalid: 'ChildInvalid',
    ChildIncorrect: 'ChildIncorrect',
    ChildNotValid: 'ChildNotValid',
    ChildInUse: 'ChildInUse',
    ChildAccessDenied: 'ChildAccessDenied',

    MissingDependency: 'MissingDependency',
    InvalidDependency: 'InvalidDependency',
    IncorrectDependency: 'IncorrectDependency',
};

const isNullOrUndefined = (x) => base.isNull(x) || base.isUndefined(x);

const props = {
  success: ["Success", base.isBool],
  status: ["Status", base.isString],
  subject: ["Subject", base.isString],
  message: ["Message", base.isString],
  messageKey: ["MessageKey", base.isString],
  messageArgs: ["MessageArgs", base.isObject],
  date: ["Date", base.isDate],
  data: ["Data", () => true],
  exception: ["Exception", base.isObject],
  innerResponses: ["InnerResponses", (x) => base.isArray(x)],
  info: ["Info", base.isString],
  bag: ["Bag", () => true],
  logs: ["Logs", (x) => base.isArray(x)],
};

class ServiceResponse {
  static usePascalProps = false;
  static usePascalStatus = false;
  static statusSeparator = "";

  static formatStatus(status) {
    let result = [];

    if (base.isString(status)) {
      status.split("").forEach((ch, i) => {
        if (extensionsString.isUpper(ch) && i > 0) {
          result.push(ServiceResponse.statusSeparator);
        }

        result.push(ServiceResponse.usePascalStatus ? ch : ch.toLowerCase());
      });
    }

    return result.join("");
  }

  constructor(sr) {
    this._setProp("success", false);
    this._setProp("status", "");
    this._setProp("message", "");
    this._setProp("date", new Date());

    Object.defineProperty(this, "_usePascalProps", {
      enumerable: false,
      writable: true,
      configurable: false,
      value: base.convert.toBool(ServiceResponse.usePascalProps),
    });

    this.copy(sr);
  }
  get usePascalProps() {
    return this._usePascalProps;
  }
  set usePascalProps(value) {
    if (base.isBool(value)) {
      const old = this._usePascalProps;

      this._usePascalProps = value;

      if (old != this._usePascalProps) {
        for (let prop of Object.keys(this)) {
          if (prop != "_usePascalProps") {
            const pascalProp = old ? prop : props[prop][0];
            const camelProp = old ? extensionsString.camelCase(prop) : prop;

            this._setProp(camelProp, value ? this[prop] : this[pascalProp]);

            if (value) {
              delete this[prop];
            } else {
              delete this[pascalProp];
            }
          }
        }
      }
    }
  }
  _copyProp(prop, sr) {
    const entry = props[prop];

    if (!entry) {
      this[prop] = sr[prop];
    } else {
      const propCamel = prop;
      const propPascal = entry[0];

      if (
        !isNullOrUndefined(sr[propCamel]) ||
        !isNullOrUndefined(sr[propPascal])
      ) {
        let value;

        if (sr instanceof ServiceResponse) {
          value = sr.usePascalProps ? sr[propPascal] : sr[propCamel];
        } else {
          if (!base.isUndefined(sr[propPascal])) {
            value = sr[propPascal];
          } else if (!base.isUndefined(sr[propCamel])) {
            value = sr[propCamel];
          }
        }

        this._setProp(prop, value);
      }
    }
  }
  _setProp(prop, value) {
    const entry = props[prop];

    if (entry[1](value)) {
      if (this.usePascalProps) {
        this[entry[0]] = value;
      } else {
        this[prop] = value;
      }
    }
  }
  _removeProp(prop) {
    const entry = props[prop];

    delete this[prop];
    delete this[entry[0]];
  }
  copy(sr) {
    if (base.isObject(sr)) {
      for (let prop of Object.keys(sr)) {
        this._copyProp(prop, sr);
      }
    }
  }
  toJson(spacer) {
    return JSON.stringify(this, null, spacer);
  }
  is(s) {
    const status = this.usePascalProps ? this.Status : this.status;

    return status && status.match(new RegExp(s, "i")) != null;
  }
  setStatus(status, message, ex) {
    this._setProp("status", ServiceResponse.formatStatus(status));
    this._setProp("message", message);
    this._setProp("exception", ex);
    this._setProp(
      "success",
      this.is(
        ServiceResponse.formatStatus("success") ||
          ServiceResponse.formatStatus("succeeded")
      )
    );
  }
}

Object.keys(ServiceResponseStatus).forEach((key) => {
  const methodName = key[0].toLowerCase() + key.substr(1);
  const status = ServiceResponseStatus[key];

  if (ServiceResponse.prototype[methodName] == undefined) {
    if (key == "Succeeded") {
      ServiceResponse.prototype[methodName] = function (data, message) {
        this._setProp("status", ServiceResponse.formatStatus(status));
        this._setProp("message", message);
        this._setProp("success", true);
        this._removeProp("exception");
        this._setProp("data", data);
      };
    } else {
      ServiceResponse.prototype[methodName] = function (message, ex) {
        this._setProp("status", ServiceResponse.formatStatus(status));
        this._setProp("message", message);
        this._setProp("success", false);
        this._setProp("exception", ex);
      };
    }
  }

  if (ServiceResponse[methodName] == undefined) {
    ServiceResponse[methodName] = (...args) => {
      const result = new ServiceResponse();

      result[methodName](...args);

      return result;
    };
  }

  if (ServiceResponse.prototype["is" + key] == undefined) {
    ServiceResponse.prototype["is" + key] = function () {
      return this.is(ServiceResponse.formatStatus(status));
    };
  }
});

ServiceResponse.fromStatus = (status, message, ex) => {
  const result = new ServiceResponse();

  result.setStatus(status, message, ex);

  return result;
};

module.exports = ServiceResponse;
