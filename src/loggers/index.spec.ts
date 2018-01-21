import * as chai from 'chai';
import { Context } from 'aws-lambda';
import 'mocha';
import {
  Logger,
  makeLogger,
  getLoggerOptions,
  ConsoleLogger,
  ConsoleLoggerSettings,
  getConsoleStream,
  LambdaLogger,
  DebugLogger,
  getDebugStream,
  DebugLoggerSettings,
} from '../index';

const expect = chai.expect;

function testLogger(logger: Logger, msg: string) {
  logger.trace(msg);
  logger.debug(msg);
  logger.info(msg);
  logger.warn(msg);
  logger.error(msg);
  logger.fatal(msg);
}

describe('getLoggerOptions', () => {
  it('should be able to getLoggerOptions with no streams', () => {
    const options = getLoggerOptions('TestLog');
    expect(options).to.be.not.undefined;
    expect(options).to.be.not.null;
    expect(options.streams).to.be.undefined;
    expect(options.name).to.be.eq('TestLog', 'should have name provided');
    testLogger(Logger.createLogger(options), 'Raw Helllo');
  });

  it('should be able to getLoggerOptions with 1 stream', () => {
    const settings: ConsoleLoggerSettings = {
      mode: 'long',
      level: 'warn',
    };

    const options = getLoggerOptions('TestLog', getConsoleStream(settings));
    expect(options).to.be.not.undefined;
    expect(options).to.be.not.null;
    expect(options.streams.length).to.be.eq(1, '1 stream expected');
    expect(options.name).to.be.eq('TestLog', 'should have name provided');
    testLogger(Logger.createLogger(options), settings.level);
  });

  it('should be able to getLoggerOptions with default level of INFO - short mode', () => {
    const settings: ConsoleLoggerSettings = {
      mode: 'short',
    };

    const options = getLoggerOptions('TestLog', getConsoleStream(settings));
    expect(options).to.be.not.undefined;
    expect(options).to.be.not.null;
    expect(options.streams.length).to.be.eq(1, '1 streams expected');
    expect(options.name).to.be.eq('TestLog', 'should have name provided');
    testLogger(Logger.createLogger(options), 'INFO');
  });

  it('should be able to getLoggerOptions with default level of INFO - dev mode', () => {
    const settings: ConsoleLoggerSettings = {
      mode: 'dev',
    };

    const options = getLoggerOptions('TestLog', getConsoleStream(settings));
    expect(options).to.be.not.undefined;
    expect(options).to.be.not.null;
    expect(options.streams.length).to.be.eq(1, '1 streams expected');
    expect(options.name).to.be.eq('TestLog', 'should have name provided');
    testLogger(Logger.createLogger(options), 'INFO');
  });

  it('should be able to getLoggerOptions with multiple console streams', () => {
    const options = getLoggerOptions(
      'TestLog',
      getConsoleStream({
        mode: 'long',
        level: 'trace',
      }),
      getConsoleStream({
        mode: 'raw',
        level: 'warn',
      }),
      getConsoleStream({
        mode: 'short',
        level: 'fatal',
      }),
    );

    expect(options).to.be.not.undefined;
    expect(options).to.be.not.null;
    expect(options.streams.length).to.be.eq(3, '3 streams expected');
    expect(options.name).to.be.eq('TestLog', 'should have name provided');
    testLogger(Logger.createLogger(options), '1:TRACE 2:WARN 3:FATAL');
  });

  it('should not be able to getLoggerOptions with name undefined, null or empty', () => {
    expect(() => getLoggerOptions('', getConsoleStream())).to.throw(Error);
    expect(() => getLoggerOptions(null, getConsoleStream())).to.throw(Error);
    expect(() => getLoggerOptions(undefined, getConsoleStream())).to.throw(Error);
  });
});

function createMultiLogger(
  name: string,
  settings1: ConsoleLoggerSettings,
  settings2: ConsoleLoggerSettings,
) {
  return makeLogger(name, getConsoleStream(settings1), getConsoleStream(settings2));
}

describe('Console Logger', () => {
  it('should be able to create a TRACE instance', () => {
    const settings: ConsoleLoggerSettings = {
      mode: 'long',
      level: 'trace',
    };

    const logger: Logger = ConsoleLogger.create('TestLog', settings);
    expect(logger).to.be.not.undefined;
    expect(logger).to.be.not.null;
    testLogger(logger, settings.level);
  });

  it('should be able to create an instance without settings', () => {
    const logger: Logger = ConsoleLogger.create('TestLog');
    expect(logger).to.be.not.undefined;
    expect(logger).to.be.not.null;
    testLogger(logger, 'INFO');
  });

  it('should be able to create an instance with 2 streams at different levels', () => {
    const logger: Logger = createMultiLogger(
      'TestLog',
      {
        mode: 'long',
        level: 'trace',
      },
      {
        mode: 'short',
        level: 'warn',
      },
    );
    expect(logger).to.be.not.undefined;
    expect(logger).to.be.not.null;
    testLogger(logger, 'long/trace + short/warn');
  });

  it('should be able to create an instance with 2 streams at different levels', () => {
    const logger: Logger = createMultiLogger(
      'TestLog',
      {
        mode: 'long',
        level: 'warn',
      },
      {
        mode: 'short',
        level: 'trace',
      },
    );
    expect(logger).to.be.not.undefined;
    expect(logger).to.be.not.null;
    testLogger(logger, 'long/warn + short/trace');
  });
});

describe('LambdaLogger', () => {
  it('should be able to create an instance with duFlowId!=awsRequestId', () => {
    const headers = {
      'X-Flow-ID': '123456789',
    };
    const context = {
      functionName: 'test',
      awsRequestId: '1234wwe454334',
    };

    const logger: Logger = LambdaLogger.create(headers, context as Context);
    expect(logger).to.be.not.undefined;
    expect(logger).to.be.not.null;
    testLogger(logger, 'INFO');
  });

  it('should be able to create an instance with duFlowId==awsRequestId', () => {
    const headers = {
    };
    const context = {
      functionName: 'test',
      awsRequestId: '1234wwe454334',
    };

    const logger: Logger = LambdaLogger.create(headers, context as Context);
    expect(logger).to.be.not.undefined;
    expect(logger).to.be.not.null;
    testLogger(logger, 'INFO');
  });
});

describe('DebugLogger', () => {
  it('should be able to create an instance', () => {
    const settings: DebugLoggerSettings = {
      mode: 'raw',
    };

    const logger: Logger = DebugLogger.create('TestLog', settings);
    expect(logger).to.be.not.undefined;
    expect(logger).to.be.not.null;
    testLogger(logger, 'INFO');
  });
});
