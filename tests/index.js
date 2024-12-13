import TestRunner from "@locustjs/test";
import { ServiceResponse } from "../src";
import ServiceResponseStatus from "../src/ServiceResponseStatus";

const tests = [
  [
    "ServiceResponse: pascal",
    (expect) => {
      const sr = new ServiceResponse();

      sr.usePascalProps = true;

      expect(sr).toBeObject();

      expect(sr.Success).notToBeUndefined().toBeBool();
      expect(sr.Status).notToBeUndefined().toBeString();
      expect(sr.Message).notToBeUndefined().toBeString();
      expect(sr.Date).notToBeUndefined().toBeDate();

      expect(sr.success).toBeUndefined();
      expect(sr.status).toBeUndefined();
      expect(sr.message).toBeUndefined();
      expect(sr.date).toBeUndefined();
    },
  ],
  [
    "ServiceResponse: camel",
    (expect) => {
      const sr = new ServiceResponse();

      sr.usePascalProps = true;
      sr.usePascalProps = false;

      expect(sr).toBeObject();

      expect(sr.success).notToBeUndefined().toBeBool();
      expect(sr.status).notToBeUndefined().toBeString();
      expect(sr.message).notToBeUndefined().toBeString();
      expect(sr.date).notToBeUndefined().toBeDate();

      expect(sr.Success).toBeUndefined();
      expect(sr.Status).toBeUndefined();
      expect(sr.Message).toBeUndefined();
      expect(sr.Date).toBeUndefined();
    },
  ],
  [
    "ServiceResponse: static status methods",
    (expect) => {
      const sr = new ServiceResponse();

      for (let key of Object.keys(ServiceResponseStatus)) {
        const methodName = key[0].toLowerCase() + key.substr(1);

        expect(ServiceResponse[methodName]).toBeFunction();
      }
    },
  ],
  ,
  [
    "ServiceResponse: instance status methods",
    (expect) => {
      const sr = new ServiceResponse();

      for (let key of Object.keys(ServiceResponseStatus)) {
        const methodName = key[0].toLowerCase() + key.substr(1);

        expect(sr[methodName]).toBeFunction();
      }
    },
  ],
  [
    "ServiceResponse: is status methods",
    (expect) => {
      const sr = new ServiceResponse();

      for (let key of Object.keys(ServiceResponseStatus)) {
        expect(sr["is" + key]).toBeFunction();
      }
    },
  ],
  [
    "ServiceResponse: status methods functionality",
    (expect) => {
      const sr = new ServiceResponse();

      for (let key of Object.keys(ServiceResponseStatus)) {
        const methodName = key[0].toLowerCase() + key.substr(1);

        sr[methodName]();

        expect(sr["is" + key]()).toBeTrue();

        if (sr.isSucceeded()) {
          expect(sr.success).toBeTrue();
        } else {
          expect(sr.success).toBeFalse();
        }
      }
    },
  ],
  [
    "ServiceResponse: status formatting (intrinsic statuses)",
    (expect) => {
      const sr1 = new ServiceResponse();

      sr1.notFound();

      expect(sr1.status).toBe("notfound");

      // ------------------------------------

      ServiceResponse.statusSeparator = "-";

      const sr2 = new ServiceResponse();

      sr2.notFound();

      expect(sr2.status).toBe("not-found");

      // ------------------------------------

      ServiceResponse.statusSeparator = "";
      ServiceResponse.usePascalStatus = true;

      const sr3 = new ServiceResponse();

      sr3.notFound();

      expect(sr3.status).toBe("NotFound");

      ServiceResponse.usePascalStatus = false;

      // ------------------------------------

      ServiceResponse.statusSeparator = "-";
      ServiceResponse.usePascalStatus = true;

      const sr4 = new ServiceResponse();

      sr4.notFound();

      expect(sr4.status).toBe("Not-Found");

      ServiceResponse.usePascalStatus = false;
    },
  ],
  [
    "ServiceResponse: status formatting",
    (expect) => {
      const sr1 = new ServiceResponse();

      ServiceResponse.statusSeparator = "-";
      ServiceResponse.usePascalStatus = false;

      sr1.status = ServiceResponse.formatStatus("AppNotFound");

      expect(sr1.status).toBe("app-not-found");

      // ------------------------------------

      const sr2 = new ServiceResponse();

      ServiceResponse.statusSeparator = "-";
      ServiceResponse.usePascalStatus = true;

      sr2.status = ServiceResponse.formatStatus("AppNotFound");

      expect(sr2.status).toBe("App-Not-Found");

      ServiceResponse.usePascalStatus = false;
    },
  ],
  [
    "ServiceResponse: copy 1",
    (expect) => {
      const sr1 = new ServiceResponse();
      const sr2 = new ServiceResponse();

      ServiceResponse.statusSeparator = "";
      ServiceResponse.usePascalStatus = true;

      sr1.notFound();

      sr2.copy(sr1);

      expect(sr2.status).toBe("NotFound");

      ServiceResponse.usePascalStatus = false;
    },
  ],
  [
    "ServiceResponse: copy 2",
    (expect) => {
      const sr1 = new ServiceResponse();
      const sr2 = new ServiceResponse();

      sr1.notFound();

      sr2.usePascalProps = true;

      sr2.copy(sr1);

      expect(sr2.status).toBeUndefined();
      expect(sr2.Status).toBeDefined();
      expect(sr2.Status).toBe("notfound");
    },
  ],
  [
    "ServiceResponse: copy (extra props)",
    (expect) => {
      const sr1 = new ServiceResponse();
      const sr2 = new ServiceResponse();

      ServiceResponse.statusSeparator = "";
      ServiceResponse.usePascalStatus = true;

      sr1.foo = "Foo";
      sr1.notFound();

      sr2.copy(sr1);

      expect(sr2.status).toBe("NotFound");
      expect(sr2.foo).toBeDefined();
      expect(sr2.foo).toBe(sr1.foo);

      ServiceResponse.usePascalStatus = false;
    },
  ],
  [
    "ServiceResponse: toJson",
    (expect) => {
      const sr = new ServiceResponse();

      sr.failed();

      expect(sr.toJson()).toBe(JSON.stringify(sr));
    },
  ],
  [
    "ServiceResponse: fromStatus",
    (expect) => {
      const sr = ServiceResponse.fromStatus("my-status");

      expect(sr.status).toBe("my-status");
    },
  ],
  [
    "ServiceResponse: messageKey 1",
    (expect) => {
      const sr = new ServiceResponse();

      sr.messageKey = "some-key";

      expect(sr.messageKey).toBe("some-key");
      expect(sr.messageKey).toBeDefined();
      expect(JSON.stringify(sr).indexOf("messageKey")).toBe(-1);
    },
  ],
  [
    "ServiceResponse: messageKey 2",
    (expect) => {
      const sr = new ServiceResponse();

      sr.messageKey = "some-key";

      sr.usePascalProps = true;

      expect(sr.messageKey).toBeUndefined();
      expect(sr.MessageKey).toBeDefined();
      expect(sr.MessageKey).toBe("some-key");
      expect(JSON.stringify(sr).indexOf("MessageKey")).toBe(-1);
    },
  ],
  [
    "ServiceResponse: messageKey 3",
    (expect) => {
      const sr1 = new ServiceResponse();
      const sr2 = new ServiceResponse();

      sr1.messageKey = "some-key";

      sr2.usePascalProps = true;

      sr2.copy(sr1);

      expect(sr2.messageKey).toBeUndefined();
      expect(sr2.MessageKey).toBeDefined();
      expect(sr2.MessageKey).toBe("some-key");
    },
  ],
];

TestRunner.start(tests, true);
