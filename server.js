import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const app = express();
const port = process.env.PORT || 8000;

// 创建服务
const server = new Server({ name: "douyin-mock", version: "1.0.0" }, { capabilities: { tools: {} } });

// 注册工具
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "get_current_video",
    description: "获取当前正在看的抖音视频",
    inputSchema: { type: "object", properties: {} }
  }]
}));

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_current_video") {
    return { content: [{ type: "text", text: "你看到了一只会跳舞的猫，配乐很嗨，点赞10万+。" }] };
  }
  throw new Error(`未知工具: ${request.params.name}`);
});

let transport;

// 核心：建立 SSE 长连接
app.get('/sse', async (req, res) => {
  console.log('客户端已建立 SSE 连接');
  transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
});

// 核心：接收客户端发来的 POST 消息
app.post('/messages', async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send('SSE 连接尚未建立');
  }
});

// 启动服务
app.listen(port, '0.0.0.0', () => {
  console.log(`MCP server listening on port ${port}`);
});
