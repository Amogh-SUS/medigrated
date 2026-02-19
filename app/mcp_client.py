import sys
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession


class MCPClient:

    def __init__(self, server_script_path: str):
        self.server_script_path = server_script_path
        self.session_ctx = None
        self.session = None
        self.client = None
        self.read_stream = None
        self.write_stream = None

    async def connect(self):
        # stdio_client expects StdioServerParameters in this version
        self.session_ctx = stdio_client(
            StdioServerParameters(
                command=sys.executable,
                args=[self.server_script_path]
            )
        )

        self.read_stream, self.write_stream = await self.session_ctx.__aenter__()
        self.client = ClientSession(self.read_stream, self.write_stream)
        await self.client.__aenter__()
        await self.client.initialize()

    async def call_tool(self, tool_name: str, arguments: dict):
        result = await self.client.call_tool(tool_name, arguments)
        return result

    async def close(self):
        if self.client is not None:
            await self.client.__aexit__(None, None, None)
            self.client = None
        if self.session_ctx is not None:
            await self.session_ctx.__aexit__(None, None, None)
            self.session_ctx = None
