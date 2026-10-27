import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({ name: "douyin-mock", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "get_current_video",
    description: "获取当前正在看的抖音视频",
    inputSchema: { type: "object", properties: {} }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_current_video") {
    return { content: [{ type: "text", text: "你看到了一只会跳舞的猫，配乐很嗨，点赞10万+。" }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
