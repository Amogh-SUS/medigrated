from mcp.server.fastmcp import FastMCP
from services.hospital_service import recommend_hospital
from services.drug_service import get_drug_information

mcp = FastMCP("Medical Tools MCP Server")


@mcp.tool()
def recommend_hospital_tool(city: str, severity_level: str, specialist_type: str = None) -> dict:
    return recommend_hospital(city, severity_level, specialist_type)


@mcp.tool()
def get_drug_information_tool(drug_name: str) -> dict:
    return get_drug_information(drug_name)


if __name__ == "__main__":
    mcp.run()