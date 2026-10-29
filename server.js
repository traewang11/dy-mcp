import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const app = express();
const port = process.env.PORT || 8000;

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

// 关键修改：监听 /mcp 这个网址
app.get('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp', res);
  await server.connect(transport);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`MCP server listening on port ${port}`);
});
