import fs from "fs";
import path from "path";

const __dirname = import.meta.dirname;
const LOG_DIR = path.join(__dirname, "../logs");
const LOG_FILE = path.join(LOG_DIR, "test-results.log");

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

class Logger {
  constructor() {
    this.startNewSession();
  }

  startNewSession() {
    const timestamp = new Date().toISOString();
    const separator = "\n" + "=".repeat(80) + "\n";
    const header = `${separator}TEST SESSION STARTED: ${timestamp}${separator}\n`;

    fs.appendFileSync(LOG_FILE, header);
    this.log("INFO", "Test session initialized");
    this.log("INFO", `Node Environment: ${process.env.NODE_ENV}`);
    this.log(
      "INFO",
      `Database: ${process.env.TEST_DB_NAME || process.env.DB_NAME}`
    );
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      if (data instanceof Error) {
        logEntry += `\n  Error: ${data.message}`;
        logEntry += `\n  Stack: ${data.stack}`;
        if (data.code) logEntry += `\n  Code: ${data.code}`;
        if (data.detail) logEntry += `\n  Detail: ${data.detail}`;
      } else if (typeof data === "object") {
        logEntry += `\n  Data: ${JSON.stringify(data, null, 2)}`;
      } else {
        logEntry += `\n  Data: ${data}`;
      }
    }

    logEntry += "\n";

    // Write to file
    fs.appendFileSync(LOG_FILE, logEntry);

    // Also output to console for immediate feedback
    console.log(logEntry.trim());
  }

  testStart(testName) {
    this.log("TEST", `Starting: ${testName}`);
  }

  testPass(testName) {
    this.log("PASS", `✓ ${testName}`);
  }

  testFail(testName, error) {
    this.log("FAIL", `✗ ${testName}`, error);
  }

  dbQuery(query, params = null) {
    this.log("DATABASE", `Query: ${query}`, params ? { params } : null);
  }

  dbResult(result) {
    this.log("DATABASE", `Result rows: ${result?.rows?.length || 0}`);
  }

  dbError(error) {
    this.log("ERROR", "Database error occurred", error);
  }

  httpRequest(method, url, body = null) {
    this.log("HTTP", `${method.toUpperCase()} ${url}`, body ? { body } : null);
  }

  httpResponse(status, data) {
    this.log("HTTP", `Response: ${status}`, { data });
  }

  info(message, data = null) {
    this.log("INFO", message, data);
  }

  error(message, error = null) {
    this.log("ERROR", message, error);
  }

  endSession() {
    const timestamp = new Date().toISOString();
    const separator = "\n" + "=".repeat(80) + "\n";
    const footer = `${separator}TEST SESSION ENDED: ${timestamp}${separator}\n\n`;
    fs.appendFileSync(LOG_FILE, footer);
  }
}

// Export singleton instance
const logger = new Logger();

export { logger };
