import * as Logger from 'bunyan';
import {
  LoggerSettings,
  getSettingsLevel,
} from '../core';

const bunyanDebugStream = require('bunyan-debug-stream');

function makeLogger(name: string, ...streams: Logger.Stream[]): Logger {
  return Logger.createLogger(getLoggerOptions(name, ...streams));
}

function getLoggerOptions(
  name: string,
  ...streams: Logger.Stream[],
): Logger.LoggerOptions {
  if (!name) {
    throw Error('Cannot create LoggerOptions without a log name');
  }
  const options: Logger.LoggerOptions = {
    name,
    src: true,
    date: Date,
    serializers: bunyanDebugStream.serializers,
  };
  if (streams && streams.length) {
    options.streams = streams;
  }
  return options;
}

function getBasepath(settings: DebugLoggerSettings) {
  // this should be the root folder of your project.
  return settings.basepath || './';
}

export interface DebugLoggerSettings extends LoggerSettings {
  mode?: 'short' | 'long' | 'dev' | 'raw';
  basepath?: string;
}

export function getDebugStream(settings?: DebugLoggerSettings): Logger.Stream {
  let tempSettings = settings;
  if (!tempSettings) {
    tempSettings = {};
  }

  return {
    level: getSettingsLevel(tempSettings),
    type: 'raw',
    stream: bunyanDebugStream({
      basepath: getBasepath(tempSettings),
      forceColor: true,
      colors: {
        info: 'blue',
        error: ['red', 'bold'],
      },
    }),
  };
}

export class DebugLogger {
  static create(name: string, settings?: DebugLoggerSettings) {
    return makeLogger(name, getDebugStream(settings));
  }
}
