import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const app = express();
const port = process.env.PORT || 8000;

// 创建 MCP Server 实例
const server = new Server(
  { name: "douyin-mock", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 注册工具列表
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

// 核心：SSE 连接端点
app.get('/sse', async (req, res) => {
  console.log('客户端请求建立 SSE 连接...');
  // 创建 SSE 传输层，并指定后续接收消息的路径为 /messages
  const transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
  console.log('SSE 连接已建立，会话 ID:', transport.sessionId);
});

// 核心：接收客户端 POST 消息的端点
app.post('/messages', async (req, res) => {
  console.log('收到客户端 POST 消息...');
  // 注意：这里需要将具体的 transport 实例传入，简化场景下可能依赖全局或重新获取
  // 对于 Render 这种无状态部署，SSE 模式可能会因实例重启而断开，需要客户端重连。
  // 更稳健的做法是使用 Session 管理，但为了快速跑通，我们先保持简单。
});

// 健康检查端点，Render 会定期检查
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`MCP server listening on port ${port}`);
});
