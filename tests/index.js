import TestRunner from "@locustjs/test";
import ServiceResponse from "../src";

const tests = [
  [
    "ServiceResponse: pascal",
    (expect) => {
      const sr = new ServiceResponse();

      sr.usePascalProps = true;

      expect(sr).toBeObject();
console.log(sr)
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
//   [
//     "ServiceResponse: camel",
//     (expect) => {
//       const sr = new ServiceResponse();

//       sr.usePascalProps = false;

//       expect(sr).toBeObject();

//       expect(sr.success).notToBeUndefined().toBeBool();
//       expect(sr.status).notToBeUndefined().toBeString();
//       expect(sr.message).notToBeUndefined().toBeString();
//       expect(sr.date).notToBeUndefined().toBeDate();

//       expect(sr.Success).toBeUndefined();
//       expect(sr.Status).toBeUndefined();
//       expect(sr.Message).toBeUndefined();
//       expect(sr.Date).toBeUndefined();
//     },
//   ]
];
TestRunner.start(tests);
