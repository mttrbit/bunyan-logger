import * as bunyan from 'bunyan';
import {
  LoggerSettings,
  makeLogger,
  getSettingsLevel,
} from '../core';

const prettyStream = require('bunyan-prettystream');

export interface ConsoleLoggerSettings extends LoggerSettings {
  /** defaults to short */
  mode?: 'short' | 'long' | 'dev' | 'raw';
}

export function getConsoleStream(settings?: ConsoleLoggerSettings): bunyan.Stream {
  let tempSettings = settings;
  if (!tempSettings) {
    tempSettings = {};
  }

  if (tempSettings.mode === 'raw') {
    return {
      level: getSettingsLevel(tempSettings),
      stream: process.stdout,
    };
  }

  const prettyStdOut = new prettyStream({ mode: tempSettings.mode || 'short' });
  prettyStdOut.pipe(process.stdout);
  return {
    level: getSettingsLevel(tempSettings),
    stream: prettyStdOut,
  };
}

export class ConsoleLogger {
  static create(name: string, settings?: ConsoleLoggerSettings) {
    return makeLogger(name, getConsoleStream(settings));
  }
}
