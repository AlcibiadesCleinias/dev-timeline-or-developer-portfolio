"""Fetch projects from Notion database and output PROJECTS_JSON.

Usage:
    NOTION_TOKEN=ntn_... python scripts/notion_to_projects_json.py

    # or pass DB ID explicitly:
    NOTION_TOKEN=ntn_... python scripts/notion_to_projects_json.py --db-id <id>

Outputs JSON to stdout. Pipe to file or use in CI/CD.
"""
import json
import os
import sys
import urllib.request
from datetime import datetime
from typing import List, Optional

# --- Serialization model (mirrors notebook's SeralizedProject) ---

REQUIRED_FIELDS = {"title", "start", "description", "stack"}


def serialize_project(props: dict, page_url: str) -> Optional[dict]:
    """Convert a Notion page's properties into the serialized project format."""
    title = _get_title(props)
    if not title:
        return None

    start = _get_date(props, "Start Date")
    if not start:
        return None

    stack = _get_multi_select_names(props, "Stack")
    tags_raw = _get_multi_select_names(props, "Tags")
    awards_raw = _get_multi_select_names(props, "Awards")

    # Tags as CamelCase (matching notebook: "".join(map(str.title, tag.split(" "))))
    additional_tags = (
        ["".join(w.title() for w in t.split(" ")) for t in tags_raw]
        if tags_raw
        else None
    )

    # Public URL — first comma-separated value from rich_text
    public_url_text = _get_rich_text(props, "Public Url")
    public_url = (
        public_url_text.split(",")[0].strip() if public_url_text else None
    )

    # Notion URL
    more_info_url = _get_url(props, "notionUrl") or page_url

    # Awards as comma-joined string
    awards = ", ".join(awards_raw) if awards_raw else None

    return {
        "title": title,
        "subtitle": _get_rich_text(props, "Subtitle"),
        "start": start,
        "description": _get_rich_text(props, "Description") or "",
        "stack": stack,
        "additionalTags": additional_tags,
        "publicUrl": public_url,
        "moreInfoUrl": more_info_url,
        "awards": awards,
    }


# --- Notion property helpers ---


def _get_title(props: dict) -> Optional[str]:
    parts = props.get("Title", {}).get("title", [])
    return "".join(p.get("plain_text", "") for p in parts).strip() or None


def _get_rich_text(props: dict, key: str) -> Optional[str]:
    parts = props.get(key, {}).get("rich_text", [])
    text = "".join(p.get("plain_text", "") for p in parts).strip()
    return text or None


def _get_url(props: dict, key: str) -> Optional[str]:
    return props.get(key, {}).get("url") or None


def _get_multi_select_names(props: dict, key: str) -> List[str]:
    items = props.get(key, {}).get("multi_select", [])
    return [item["name"] for item in items]


def _get_date(props: dict, key: str) -> Optional[str]:
    date_obj = props.get(key, {}).get("date")
    if date_obj and date_obj.get("start"):
        dt = datetime.fromisoformat(date_obj["start"])
        return str(int(dt.timestamp() * 1000))
    return None


# --- Notion API ---

DEFAULT_DB_ID = "4533587e-8431-4f95-9515-dc9a482c7eea"
NOTION_VERSION = "2022-06-28"


def fetch_all_pages(token: str, db_id: str) -> list:
    """Fetch all pages from a Notion database (handles pagination)."""
    all_results = []
    has_more = True
    cursor = None

    while has_more:
        body = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor

        req = urllib.request.Request(
            f"https://api.notion.com/v1/databases/{db_id}/query",
            data=json.dumps(body).encode(),
            headers={
                "Authorization": f"Bearer {token}",
                "Notion-Version": NOTION_VERSION,
                "Content-Type": "application/json",
            },
            method="POST",
        )

        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())

        all_results.extend(data.get("results", []))
        has_more = data.get("has_more", False)
        cursor = data.get("next_cursor")

    return all_results


def main():
    token = os.environ.get("NOTION_TOKEN")
    if not token:
        print("Error: NOTION_TOKEN environment variable is required", file=sys.stderr)
        sys.exit(1)

    db_id = DEFAULT_DB_ID
    if "--db-id" in sys.argv:
        idx = sys.argv.index("--db-id")
        db_id = sys.argv[idx + 1]

    pages = fetch_all_pages(token, db_id)
    print(f"Fetched {len(pages)} pages from Notion", file=sys.stderr)

    projects = []
    for page in pages:
        project = serialize_project(page["properties"], page.get("url", ""))
        if project:
            projects.append(project)

    # Sort by start descending (newest first)
    projects.sort(key=lambda p: int(p["start"] or "0"), reverse=True)

    print(json.dumps(projects, ensure_ascii=False))


if __name__ == "__main__":
    main()
