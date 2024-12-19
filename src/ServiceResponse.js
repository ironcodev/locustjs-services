import {
  isObject,
  isArray,
  isBool,
  isUndefined,
  isString,
  isDate,
  isNull,
  isSomeObject,
  isSomeString,
} from "@locustjs/base";
import { convert } from "@locustjs/base";
import { isUpper, camelCase } from "@locustjs/extensions-string";
import ServiceResponseStatus from "./ServiceResponseStatus";
import { clean } from "@locustjs/extensions-object";

const isNullOrUndefined = (x) => isNull(x) || isUndefined(x);

const props = {
  success: ["Success", isBool],
  status: ["Status", isString],
  subject: ["Subject", isString],
  message: ["Message", isString],
  messageKey: ["MessageKey", isString],
  messageArgs: ["MessageArgs", () => true],
  date: ["Date", isDate],
  data: ["Data", () => true],
  exception: ["Exception", isObject],
  innerResponses: ["InnerResponses", isArray],
  info: ["Info", isString],
  bag: ["Bag", () => true],
  logs: ["Logs", isArray],
};

class ServiceResponse {
  static usePascalProps = false;
  static usePascalStatus = false;
  static statusSeparator = "";
  static messageKeySeparator = ".";

  static formatStatus(status) {
    let result = [];

    if (isString(status)) {
      status.split("").forEach((ch, i) => {
        if (isUpper(ch) && i > 0) {
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
      value: convert.toBool(ServiceResponse.usePascalProps),
    });

    // messageKey and messageArgs are special properties.
    // we don't want them to be serialized in JSON, since they
    // are only used in translating the ServiceResponse and
    // providing a translated message.
    // Thus, we define them using Object.defineProperty()
    // with `enumerable: false`

    if (this.usePascalProps) {
      Object.defineProperty(this, "MessageKey", {
        enumerable: false,
        writable: true,
        configurable: true,
        value: undefined,
      });

      Object.defineProperty(this, "MessageArgs", {
        enumerable: false,
        writable: true,
        configurable: true,
        value: undefined,
      });
    } else {
      Object.defineProperty(this, "messageKey", {
        enumerable: false,
        writable: true,
        configurable: true,
        value: undefined,
      });

      Object.defineProperty(this, "messageArgs", {
        enumerable: false,
        writable: true,
        configurable: true,
        value: undefined,
      });
    }

    this.copy(sr);
  }
  usePascalPropsChanged(oldValue, newValue) {}
  get usePascalProps() {
    return this._usePascalProps;
  }
  set usePascalProps(value) {
    if (isBool(value)) {
      const old = this._usePascalProps;

      this._usePascalProps = value;

      if (old != this._usePascalProps) {
        if (old) {
          Object.defineProperty(this, "messageKey", {
            enumerable: false,
            writable: true,
            configurable: true,
            value: this.MessageKey,
          });

          Object.defineProperty(this, "messageArgs", {
            enumerable: false,
            writable: true,
            configurable: true,
            value: this.MessageArgs,
          });

          delete this.MessageKey;
          delete this.MessageArgs;
        } else {
          Object.defineProperty(this, "MessageKey", {
            enumerable: false,
            writable: true,
            configurable: true,
            value: this.messageKey,
          });

          Object.defineProperty(this, "MessageArgs", {
            enumerable: false,
            writable: true,
            configurable: true,
            value: this.messageArgs,
          });

          delete this.messageKey;
          delete this.messageArgs;
        }

        for (let prop of Object.keys(this)) {
          if (prop != "_usePascalProps") {
            const pascalProp = old ? prop : props[prop][0];
            const camelProp = old ? camelCase(prop) : prop;

            this._setProp(camelProp, value ? this[prop] : this[pascalProp]);

            if (value) {
              delete this[prop];
            } else {
              delete this[pascalProp];
            }
          }
        }

        this.usePascalPropsChanged(old, value);
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
          if (!isUndefined(sr[propPascal])) {
            value = sr[propPascal];
          } else if (!isUndefined(sr[propCamel])) {
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
  _getProp(prop) {
    const entry = props[prop];
    const propCamel = prop;
    const propPascal = entry[0];
    const p = this.usePascalProps ? propPascal : propCamel;

    return this[p];
  }
  _removeProp(prop) {
    const entry = props[prop];

    delete this[prop];
    delete this[entry[0]];
  }
  copy(sr) {
    if (isObject(sr)) {
      for (let prop of Object.keys(sr)) {
        this._copyProp(prop, sr);
      }

      if (sr.messageKey !== undefined) {
        this._copyProp("messageKey", sr);
      }

      if (sr.MessageKey !== undefined) {
        this._copyProp("MessageKey", sr);
      }

      if (sr.messageArgs !== undefined) {
        this._copyProp("messageArgs", sr);
      }

      if (sr.MessageArgs !== undefined) {
        this._copyProp("MessageArgs", sr);
      }
    }
  }
  toJson(spacer) {
    const res = clean({ ...this }, "all");

    return JSON.stringify(res, null, spacer);
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

    return this;
  }
  setException(ex) {
    this._setProp("exception", ex);

    return this;
  }
  setData(data) {
    this._setProp("data", data);

    return this;
  }
  setInfo(info) {
    if (isString(key)) {
      this._setProp("info", info);
    }

    return this;
  }
  setBag(bag) {
    if (isObject(args)) {
      this._setProp("bag", bag);
    }

    return this;
  }
  setMessageKey(...args) {
    const arr = [];

    for (let arg of args) {
      if (isString(arg)) {
        arr.push(arg);
      }
    }

    if (arr.length > 1) {
      arr.push(this._getProp("status"));
    }

    if (arr.length) {
      this._setProp(
        "messageKey",
        arr.join(ServiceResponse.messageKeySeparator)
      );
    }

    return this;
  }
  setArgs(args) {
    if (isObject(args)) {
      this._setProp("messageArgs", args);
    }

    return this;
  }
  addArg(args, value) {
    if (isObject(args)) {
      this._setProp("messageArgs", {
        ...this._getProp("messageArgs"),
        ...args,
      });
    } else if (isSomeString(args)) {
      this._setProp("messageArgs", {
        ...this._getProp("messageArgs"),
        [args]: value,
      });
    }

    return this;
  }
  addResponse(res, subject) {
    if (isSomeObject(res) && res instanceof ServiceResponse) {
      let innerResponses = this._getProp("innerResponses");

      if (!isArray(innerResponses)) {
        innerResponses = [];

        this._setProp("innerResponses", innerResponses);
      }

      if (isString(subject)) {
        res._setProp("subject", subject);
      }

      innerResponses.push(res);
    }

    return this;
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

        return this;
      };
    } else {
      ServiceResponse.prototype[methodName] = function (message, ex) {
        this._setProp("status", ServiceResponse.formatStatus(status));

        if (isString(message)) {
          this._setProp("message", message);
        }

        this._setProp("success", false);
        this._setProp("exception", ex);

        return this;
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

class ServicePagingResponse extends ServiceResponse {
  constructor() {
    super();

    this._setProp(
      "data",
      ServiceResponse.usePascalProps
        ? {
            Page: 1,
            PageSize: 10,
            RecordCount: 0,
            PageCount: 0,
            Items: [],
          }
        : {
            page: 1,
            pageSize: 10,
            recordCount: 0,
            pageCount: 0,
            items: [],
          }
    );
  }
  usePascalPropsChanged(oldValue, newValue) {
    if (oldValue) {
      this.data = {
        page: this.Data.Page,
        pageSize: this.Data.PageSize,
        recordCount: this.Data.RecordCount,
        pageCount: this.Data.PageCount,
        items: this.Data.Items,
      };

      delete this.Data;
    } else {
      this.data = {
        Page: this.data.page,
        PageSize: this.data.pageSize,
        RecordCount: this.data.recordCount,
        PageCount: this.data.pageCount,
        Items: this.data.items,
      };

      delete this.data;
    }
  }
}

ServiceResponse.fromStatus = (status, message, ex) => {
  const result = new ServiceResponse();

  result.setStatus(status, message, ex);

  return result;
};

export { ServiceResponse, ServicePagingResponse };
