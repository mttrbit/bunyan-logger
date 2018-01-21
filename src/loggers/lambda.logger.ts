import * as Logger from 'bunyan';
import * as _ from 'lodash';
import { Context, APIGatewayEvent } from 'aws-lambda';

import { getSettingsLevel } from '../core';

type LoggedContext = {
  functionName: string;
  flowId: string;
  awsRequestId: string;
  functionVersion: string;
};

export type Headers = { [name: string]: string };

export function contextSerializer(context) {
  return _.omit(context, ['log', 'child']);
}

export function errorSerializer(err) {
  const bunyanError = Logger.stdSerializers.err(err);
  if (!_.isObject(err) || !_.isObject(bunyanError)) {
    return bunyanError;
  }

  return _.assign({}, err, bunyanError);
}

function makeLogger({
  functionName,
  flowId,
  awsRequestId,
  functionVersion,
}: LoggedContext): Logger {
  const options: Logger.LoggerOptions = {
    flowId,
    awsRequestId,
    functionVersion,
    name: functionName,
    level: process.env.LOG_LEVEL || Logger.INFO,
    serializers: {
      err: errorSerializer,
      error: errorSerializer,
      context: contextSerializer,
    },
  };

  return Logger.createLogger(options);
}

export class LambdaLogger {
  static create(headers: Headers, context: Context) {
    let xFlowId = undefined;

    if (headers && headers['X-Flow-ID']) {
      /*
       * The flow id of the request, which is written into
       * the logs and passed to called services. Helpful for
       * operational troubleshooting and log analysis. It
       * supports traceability of requests and identifying
       * request flows through system of many services.
       */
      xFlowId = headers['X-Flow-ID'];
    }

    const loggedContext: LoggedContext = {
      functionName: context.functionName,
      flowId: xFlowId ? xFlowId : context.awsRequestId,
      awsRequestId: context.awsRequestId,
      functionVersion: context.functionVersion,
    };

    return makeLogger(loggedContext);
  }
}
