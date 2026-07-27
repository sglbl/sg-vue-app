#!/usr/bin/env python3
"""
Keep Supabase project alive by making periodic requests.
Supabase free tier pauses projects after 7 days of inactivity.
This script should run every 3 days via cron.
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone
import urllib.request
import urllib.error

# Add the project root to the path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("keep-alive")

from dotenv import load_dotenv

def get_env_var(name):
    return (os.getenv(name) or "").strip("\"'")

def main() -> bool:
    for env_file in ['.env.prod', '.env', '.env.local', '.env.dev']:
        env_path = os.path.join(project_root, env_file)
        if os.path.exists(env_path):
            load_dotenv(env_path, override=False)

    supabase_url = get_env_var('SUPABASE_URL')
    supabase_anon_key = get_env_var('SUPABASE_ANON_KEY')
    supabase_service_role_key = get_env_var('SUPABASE_SERVICE_ROLE_KEY')

    log.info("=" * 50)
    log.info("Supabase Keep-Alive  |  %s", datetime.now(timezone.utc).isoformat())
    log.info("Target: %s", supabase_url)
    log.info("=" * 50)

    if not supabase_url or not supabase_anon_key:
        log.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY — cannot proceed")
        return False

    def make_request(url, key, debug_name, headers=None, method='GET', data=None, json_data=None, valid_statuses=(200, 204)):
        req_headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
        }
        if headers:
            req_headers.update(headers)
        
        body = None
        if json_data is not None:
            body = json.dumps(json_data).encode('utf-8')
            req_headers["Content-Type"] = "application/json"
        elif data is not None:
            body = data if isinstance(data, bytes) else data.encode('utf-8')

        req = urllib.request.Request(url, data=body, headers=req_headers, method=method.upper())
        
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                status = resp.status
                log.info("%s -> %s", debug_name, status)
                return status in valid_statuses
        except urllib.error.HTTPError as exc:
            log.info("%s -> %s", debug_name, exc.code)
            return exc.code in valid_statuses
        except Exception as exc:
            log.warning("%s failed: %s", debug_name, exc)
            return False

    results = {}
    
    # REST API table query (hitting DB)
    results['REST API (reviews table)'] = make_request(
        f"{supabase_url}/rest/v1/reviews?select=id&limit=1",
        supabase_anon_key,
        "REST /reviews in public schema"
    )

    # Insert a row into temp_calls to generate write activity
    results['Insert temp_call'] = make_request(
        f"{supabase_url}/rest/v1/temp_calls",
        supabase_anon_key,
        "Insert into temp_calls",
        method="POST",
        json_data={},
        valid_statuses=(200, 201, 204)
    )

    # Delete temp_calls to keep table clean and trigger delete activity
    results['Delete temp_calls'] = make_request(
        f"{supabase_url}/rest/v1/temp_calls?id=not.is.null",
        supabase_anon_key,
        "Delete from temp_calls",
        method="DELETE",
        valid_statuses=(200, 204)
    )

    # GraphQL POST query - This directly hits pg_graphql which executes a db transaction
    results['GraphQL Introspection'] = make_request(
        f"{supabase_url}/graphql/v1",
        supabase_anon_key,
        "GraphQL /v1 introspection",
        method="POST",
        json_data={"query": "{ __schema { types { name } } }"}
    )
    
    # REST health
    results['REST health'] = make_request(
        f"{supabase_url}/rest/v1/",
        supabase_anon_key,
        "REST /",
        valid_statuses=(200, 204, 401)
    )
    
    # Auth health
    results['Auth health'] = make_request(
        f"{supabase_url}/auth/v1/health",
        supabase_anon_key,
        "Auth health"
    )
    
    # Storage buckets
    storage_key = supabase_service_role_key or supabase_anon_key
    results['Storage buckets'] = make_request(
        f"{supabase_url}/storage/v1/bucket",
        storage_key,
        "Storage buckets"
    )

    passed = sum(results.values())
    total = len(results)
    
    log.info("-" * 50)
    for name, ok in results.items():
        log.info("  %s  %s", "✅" if ok else "❌", name)
    log.info("-" * 50)
    log.info("Result: %d/%d checks passed", passed, total)

    return passed > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
