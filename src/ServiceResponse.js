import {
  isObject,
  isArray,
  isBool,
  isUndefined,
  isString,
  isDate,
  isSomeString,
  isNullOrEmpty,
} from "@locustjs/base";
import { convert } from "@locustjs/base";
import ServiceResponseStatus from "./ServiceResponseStatus";

const pascalCase = (x) =>
  isSomeString(x) ? x[0].toUpperCase() + x.substr(1) : "";
const camelCase = (x) =>
  isSomeString(x) ? x[0].toLowerCase() + x.substr(1) : "";
const isUpper = (x) =>
  typeof x == "string" &&
  x.split("").every((ch) => ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) <= 90);

const props = [
  ["success", isBool][("status", isString)][("message", isString)],
  ["date", isDate],
  ["data", () => true],
  ["exception", isObject],
  ["innerResponses", (x) => isArray(x) || isNullOrEmpty(x)],
  ["info", () => true],
  ["logs", (x) => isArray(x) || isNullOrEmpty(x)],
];

class ServiceResponse {
  static usePascalProps = false;
  static usePascalStatus = false;
  static statusSeparator = "";

  static formatStatus(status) {
    let result = [];

    if (ServiceResponse.usePascalStatus) {
      status.split("").forEach((ch, i) => {
        if (isUpper(ch) && i > 0) {
          result.push(ServiceResponse.statusSeparator);
        }

        result.push(ch);
      });
    } else {
      status.split("").forEach((ch, i) => {
        if (isUpper(ch) && i > 0) {
          result.push(ServiceResponse.statusSeparator);
        }

        result.push(ch.toLowerCase());
      });
    }

    return result.join("");
  }

  constructor(sr) {
    this._usePascalProps = convert.toBool(ServiceResponse.usePascalProps);

    this._setProp("success", false);
    this._setProp("status", "");
    this._setProp("message", "");
    this._setProp("date", new Date());

    this.copy(sr);
  }
  get usePascalProps() {
    return this._usePascalProps;
  }
  set usePascalProps(value) {
    const old = this._usePascalProps;

    this._usePascalProps = convert.toBool(value);

    if (old != this._usePascalProps) {
      if (this._usePascalProps) {
        for (let prop of props) {
          const camelProp = camelCase(prop[0]);
          const pascalProp = pascalCase(prop[0]);

          this._setProp(pascalProp, this[camelProp]);
          this._removeProp(camelProp);
        }
      } else {
        const camelProp = camelCase(prop[0]);
        const pascalProp = pascalCase(prop[0]);

        this._setProp(camelProp, this[pascalProp]);
        this._removeProp(pascalProp);
      }
    }
  }
  _copyProp(prop, sr, isFunc) {
    const propCamel = camelCase(prop);
    const propPascal = pascalCase(prop);

    if (
      !isUndefined(this[propCamel]) ||
      !isUndefined(this[propPascal]) ||
      !isUndefined(sr[propCamel]) ||
      !isUndefined(sr[propPascal])
    ) {
      if (sr instanceof ServiceResponse) {
        if (sr.usePascalProps) {
          if (this.usePascalProps) {
            this[propPascal] = isFunc(sr[propPascal])
              ? sr[propPascal]
              : this[propPascal];
          } else {
            this[propCamel] = isFunc(sr[propPascal])
              ? sr[propPascal]
              : this[propCamel];
          }
        } else {
          if (this.usePascalProps) {
            this[propPascal] = isFunc(sr[propCamel])
              ? sr[propCamel]
              : this[propPascal];
          } else {
            this[propCamel] = isFunc(sr[propCamel])
              ? sr[propCamel]
              : this[propCamel];
          }
        }
      } else {
        if (this.usePascalProps) {
          if (!isUndefined(sr[propPascal])) {
            this[propPascal] = isFunc(sr[propPascal])
              ? sr[propPascal]
              : this[propPascal];
          } else if (!isUndefined(sr[propCamel])) {
            this[propPascal] = isFunc(sr[propCamel])
              ? sr[propCamel]
              : this[propPascal];
          }
        } else {
          if (!isUndefined(sr[propPascal])) {
            this[propCamel] = isFunc(sr[propPascal])
              ? sr[propPascal]
              : this[propCamel];
          } else if (!isUndefined(sr[propCamel])) {
            this[propCamel] = isFunc(sr[propCamel])
              ? sr[propCamel]
              : this[propCamel];
          }
        }
      }
    }
  }
  _setProp(prop, value) {
    const propCamel = camelCase(prop);
    const propPascal = pascalCase(prop);

    if (this.usePascalProps) {
      this[propPascal] = value;
    } else {
      this[propCamel] = value;
    }
  }
  _removeProp(prop) {
    const propCamel = camelCase(prop);
    const propPascal = pascalCase(prop);

    delete this[propPascal];
    delete this[propCamel];
  }
  copy(sr) {
    if (isObject(sr)) {
      this._copyProp("success", sr, isBool);
      this._copyProp("status", sr, isString);
      this._copyProp("message", sr, isString);
      this._copyProp("subject", sr, isString);
      this._copyProp("date", sr, isDate);
      this._copyProp("exception", sr, isObject);
      this._copyProp("data", sr, () => true);
      this._copyProp("info", sr, () => true);
      this._copyProp("innerResponses", sr, isArray);
      this._copyProp("logs", sr, isArray);
    }
  }
  toJson(spacer) {
    const keys = Object.keys(this)
      .filter((key) => this[key] != null && key != "_usePascalProps")
      .map((key) => (this.usePascalProps ? key : key.toLowerCase()));

    return JSON.stringify(this, keys, spacer);
  }
  is(s) {
    return this.Status.match(new RegExp(s, "i")) != null;
  }
  setStatus(status, message, ex) {
    this._setProp("status", status);
    this._setProp("message", message);
    this._setProp("exception", ex);
    this._setProp("success", false);
  }
}

Object.keys(ServiceResponseStatus).forEach((key) => {
  const method = key[0].toLowerCase() + key.substr(1);
  const status = ServiceResponseStatus[key];

  if (ServiceResponse.prototype[method] == undefined) {
    if (key == "Succeeded") {
      ServiceResponse.prototype[method] = function (data, message) {
        this._setProp("status", ServiceResponse.formatStatus(status));
        this._setProp("message", message);
        this._setProp("success", true);
        this._removeProp("exception");
        this._setProp("data", data);
      };
    } else {
      ServiceResponse.prototype[method] = function (message, ex) {
        this._setProp("status", ServiceResponse.formatStatus(status));
        this._setProp("message", message);
        this._setProp("success", false);
        this._setProp("exception", ex);
      };
    }
  }

  if (ServiceResponse[method] == undefined) {
    ServiceResponse[method] = (...args) => {
      const result = new ServiceResponse();

      result[method](...args);

      return result;
    };
  }

  if (ServiceResponse.prototype["is" + key]) {
    ServiceResponse.prototype["is" + key] = () => {
      return this.is(ServiceResponse.formatStatus(status));
    };
  }
});

class ServicePagingResponse extends ServiceResponse {
  constructor() {
    super();

    this.Data = {
      Page: 1,
      PageSize: 10,
      RecordCount: 0,
      PageCount: 0,
      Items: [],
    };
  }
}

ServiceResponse.fromStatus = (status, message, ex) => {
  const result = new ServiceResponse();

  result.setStatus(status, message, ex);

  return result;
};

export default ServiceResponse;
export { ServicePagingResponse };
