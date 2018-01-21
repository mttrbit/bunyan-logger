# bunyan-logger

## Introduction

A typescript library for logging.

This library extends the `bunyan` npm with factories to create Logger instances:

1. ConsoleLogger - create a Console logger
2. LambdaLogger  - create a Lambda logger
3. DebugLogger   - create a Debug logger

## Getting Started

### Installation
Install via `yarn`
```
yarn add mttrbit/bunyan-logger
```

## Example: Console

```typescript
import {ConsoleLogger,Logger,ConsoleLoggerSettings} from "du-log";

const settings: ConsoleLoggerSettings = {
  level: "info", // Optional: default 'info' ('trace'|'info'|'debug'|'warn'|'error'|'fatal')
  mode: "short" // Optional: default 'short' ('short'|'long'|'dev'|'raw')
}

const logger: Logger = ConsoleLogger.create("<app name>", settings);

// or create a logger with default values (in 'short' mode and at 'info' level)
const defaultLogger: Logger = ConsoleLogger.create("<app name>");

// Register 'logger' with IoC
```

## Example: Lambda
```typescript

```
