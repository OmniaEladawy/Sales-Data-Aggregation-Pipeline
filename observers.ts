//observer pattern
import { Observer, PipelineEvent } from "./types.js";

//implementation for logging and error tracking
export class ConsoleLogger implements Observer {
  update(event: PipelineEvent): void {
    console.log(`[ConsoleLogger] ${event.timestamp} - ${event.message}`);
  }
}

export class ErrorTracker implements Observer {
  update(event: PipelineEvent): void {
    if (event.type === "source_failed") {
      console.error(`[ErrorTracker] ${event.timestamp} - ${event.message}`);
    }
  }
}

export function createObserver(type: string): Observer {
  switch (type) {
    case "console-logger":
      return new ConsoleLogger();
    case "error-tracker":
      return new ErrorTracker();
    default:
      throw new Error(`Unknown observer type: ${type}`);
  }
}
