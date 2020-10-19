import { errorHandler } from '@hirez_io/auto-spies-core';
import { Spy } from '../auto-spies.types';
import { FakeClass } from './fake-classes-to-test';
import { createSpyFromClass } from '../create-spy-from-class';

let fakeClassSpy: Spy<FakeClass>;
let fakeValue: any;
let actualResult: any;
let actualError: any;
let fakeArgs: any[];
const WRONG_VALUE = 'WRONG VALUE';
let throwArgumentsErrorSpyFunction: jasmine.Spy;
let errorIsExpected: boolean;

function verifyArgumentsErrorWasThrown({
  actualArgs,
  expectedMethodName,
}: {
  actualArgs: any[];
  expectedMethodName: string;
}) {
  expect(throwArgumentsErrorSpyFunction).toHaveBeenCalledWith(actualArgs, expectedMethodName);
}

describe('createSpyFromClass - promises', () => {
  Given(() => {
    fakeValue = 'FAKE PROMISE VALUE';
    actualResult = null;
    actualError = null;
    fakeArgs = [];
    errorIsExpected = false;

    throwArgumentsErrorSpyFunction = spyOn(errorHandler, 'throwArgumentsError');

    fakeClassSpy = createSpyFromClass(FakeClass);
  });

  describe('WHEN a promise returning method is called', () => {
    When(async () => {
      try {
        actualResult = await fakeClassSpy.getPromise(...fakeArgs);
      } catch (error) {
        if (!errorIsExpected) {
          throw error;
        }
        actualError = error;
      }
    });

    describe('THEN should be able to fake resolve', () => {
      Given(() => {
        fakeClassSpy.getPromise.resolveWith(fakeValue);
      });
      Then(() => {
        expect(actualResult).toBe(fakeValue);
      });
    });

    describe('THEN should be able to fake reject', () => {
      Given(() => {
        errorIsExpected = true;
        fakeClassSpy.getPromise.rejectWith(fakeValue);
      });
      Then(() => {
        expect(actualError).toBe(fakeValue);
      });
    });
  });

  describe('WHEN a promise returning method is called with exact params ', () => {
    Given(() => {
      fakeArgs = [1, 2];
    });

    When(async () => {
      try {
        actualResult = await fakeClassSpy.getPromise(...fakeArgs);
      } catch (error) {
        if (!errorIsExpected) {
          throw error;
        }
        actualError = error;
      }
    });

    describe('GIVEN calledWith of resolveWith is configured with exact params', () => {
      Given(() => {
        fakeClassSpy.getPromise.calledWith(...fakeArgs).resolveWith(fakeValue);
      });
      describe('GIVEN it is configured once THEN resolve with value', () => {
        Then(() => {
          expect(actualResult).toBe(fakeValue);
        });
      });

      describe(`GIVEN another calledWith is configured
                WHEN method is called twice`, () => {
        let actualResult2: any;
        let fakeArgs2: any[];
        let fakeValue2: any;
        Given(() => {
          actualResult2 = undefined;
          fakeValue2 = 'FAKE VALUE 2';
          fakeArgs2 = [3, 4];
          fakeClassSpy.getPromise.calledWith(...fakeArgs2).resolveWith(fakeValue2);
        });

        When(async () => {
          try {
            actualResult2 = await fakeClassSpy.getPromise(...fakeArgs2);
          } catch (error) {
            if (!errorIsExpected) {
              throw error;
            }
            actualError = error;
          }
        });

        Then('return the correct value for each call', () => {
          expect(actualResult).toBe(fakeValue);
          expect(actualResult2).toBe(fakeValue2);
        });
      });
    });

    describe('GIVEN calledWith of resolveWith is configured with wrong params', () => {
      Given(() => {
        fakeClassSpy.getPromise.calledWith(WRONG_VALUE).resolveWith(fakeValue);
      });

      Then('do NOT throw an error', () => {
        expect(throwArgumentsErrorSpyFunction).not.toHaveBeenCalled();
      });
    });

    describe(`GIVEN a calledWith of resolveWith is configured to throw on mismatch
              WHEN called with the wrong parameters`, () => {
      let expectedMethodName: string;
      Given(() => {
        expectedMethodName = 'getPromise';
        fakeClassSpy.getPromise.mustBeCalledWith(WRONG_VALUE).resolveWith(fakeValue);
      });

      Then('throw an error', () => {
        verifyArgumentsErrorWasThrown({
          expectedMethodName,
          actualArgs: fakeArgs,
        });
      });
    });

    describe('GIVEN calledWith of rejectWith is configured with exact params', () => {
      Given(() => {
        errorIsExpected = true;
        fakeClassSpy.getPromise.calledWith(...fakeArgs).rejectWith(fakeValue);
      });

      Then('reject with value', () => {
        expect(actualError).toBe(fakeValue);
      });
    });

    describe('GIVEN mustBeCalledWith of rejectWith is configured with exact params', () => {
      Given(() => {
        errorIsExpected = true;
        fakeClassSpy.getPromise.mustBeCalledWith(...fakeArgs).rejectWith(fakeValue);
      });

      Then('reject with value', () => {
        expect(actualError).toBe(fakeValue);
      });
    });

    describe('GIVEN calledWith of rejectWith is configured with wrong params', () => {
      Given(() => {
        fakeClassSpy.getPromise.calledWith(WRONG_VALUE).rejectWith(fakeValue);
      });

      Then('do NOT throw an error', () => {
        expect(throwArgumentsErrorSpyFunction).not.toHaveBeenCalled();
      });
    });

    describe(`GIVEN calledWith of rejectWith is configured to throw on mismatch
              WHEN called with the wrong parameters`, () => {
      let expectedMethodName: string;
      Given(() => {
        expectedMethodName = 'getPromise';
        fakeClassSpy.getPromise.mustBeCalledWith(WRONG_VALUE).rejectWith(fakeValue);
      });

      Then('throw an error', () => {
        verifyArgumentsErrorWasThrown({
          expectedMethodName,
          actualArgs: fakeArgs,
        });
      });
    });
  });
});
