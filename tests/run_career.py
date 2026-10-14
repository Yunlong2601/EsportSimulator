"""Offline Lua 5.4 tests with real JSON roundtrips; never accesses player saves.

Run: python tests/run_career.py
Requires the locally installed lupa package. No Maker build/remote cloud calls.
"""
from pathlib import Path
import json
import sys
from lupa.lua54 import LuaRuntime, lua_type

ROOT = Path(__file__).resolve().parents[1]


def run(path):
    lua = LuaRuntime(unpack_returned_tuples=True)
    lua.globals().package.path = str(ROOT / "scripts/?.lua").replace("\\", "/") + ";" + lua.globals().package.path

    def to_python(value):
        if lua_type(value) != "table":
            return value
        keys = list(value.keys())
        if keys and all(isinstance(k, (int, float)) and k == int(k) and k >= 1 for k in keys) and set(keys) == set(range(1, len(keys) + 1)):
            return [to_python(value[i]) for i in range(1, len(keys) + 1)]
        return {str(k): to_python(value[k]) for k in keys}

    def to_lua(value):
        if isinstance(value, dict):
            return lua.table_from({k: to_lua(v) for k, v in value.items()})
        if isinstance(value, list):
            return lua.table_from([to_lua(v) for v in value])
        return value

    lua.globals().cjson = lua.table_from({
        "encode": lambda value: json.dumps(to_python(value), ensure_ascii=False, allow_nan=False, separators=(",", ":")),
        "decode": lambda text: to_lua(json.loads(text, parse_int=float)),
    })
    return lua.execute(path.read_text(encoding="utf-8-sig"))


if __name__ == "__main__":
    paths = [ROOT / p for p in sys.argv[1:]] if len(sys.argv) > 1 else sorted((ROOT / "tests").glob("career_*.lua"))
    total = 0
    for test_path in paths:
        print(f"Running {test_path.relative_to(ROOT)}", flush=True)
        total += int(run(test_path) or 0)
    print(f"PASS: {len(paths)} suites, {total} assertions (offline Lua 5.4; simulated storage/UI only)")
