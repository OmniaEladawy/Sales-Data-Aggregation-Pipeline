import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFile } from "fs/promises";
import path from "path";
import { SalesDataPipeline } from "./pipline";
import { createDefaultPipelineConfig } from "./pipeline-config";
import { Observer, PipelineEvent } from "./types";

const PORT = Number(process.env.PORT ?? 3000);
const UI_DIR = path.join(process.cwd(), "ui");

class MemoryObserver implements Observer {
  private events: PipelineEvent[] = [];

  update(event: PipelineEvent): void {
    this.events.push(event);
  }

  getEvents(): PipelineEvent[] {
    return [...this.events];
  }
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function sendFile(
  response: ServerResponse,
  filePath: string,
  contentType: string,
): Promise<void> {
  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentType });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

async function handlePipelineRequest(response: ServerResponse): Promise<void> {
  const memoryObserver = new MemoryObserver();
  const pipeline = new SalesDataPipeline(createDefaultPipelineConfig(), [
    memoryObserver,
  ]);

  try {
    const result = await pipeline.execute();
    sendJson(response, 200, {
      generatedAt: new Date().toISOString(),
      result,
      events: memoryObserver.getEvents(),
    });
  } catch (error) {
    sendJson(response, 500, {
      error:
        error instanceof Error ? error.message : "The pipeline failed to run.",
      events: memoryObserver.getEvents(),
    });
  }
}

async function requestHandler(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const method = request.method ?? "GET";
  const url = request.url ?? "/";

  if (method !== "GET") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  if (url === "/" || url === "/index.html") {
    await sendFile(
      response,
      path.join(UI_DIR, "index.html"),
      "text/html; charset=utf-8",
    );
    return;
  }

  if (url === "/styles.css") {
    await sendFile(
      response,
      path.join(UI_DIR, "styles.css"),
      "text/css; charset=utf-8",
    );
    return;
  }

  if (url === "/app.js") {
    await sendFile(
      response,
      path.join(UI_DIR, "app.js"),
      "application/javascript; charset=utf-8",
    );
    return;
  }

  if (url === "/api/pipeline") {
    await handlePipelineRequest(response);
    return;
  }

  if (url === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}

createServer((request, response) => {
  void requestHandler(request, response);
}).listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});
