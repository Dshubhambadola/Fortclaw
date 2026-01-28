import type { FortclawPluginApi } from "../../src/plugins/types.js";

import { createLlmTaskTool } from "./src/llm-task-tool.js";

export default function register(api: FortclawPluginApi) {
  api.registerTool(createLlmTaskTool(api), { optional: true });
}
