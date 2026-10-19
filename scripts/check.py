#!/usr/bin/env python3
"""Check every example against the layout rules in CONTRIBUTING.md.

Run from anywhere: python3 scripts/check.py
"""

import json
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent
problems: list[str] = []


def problem(where: str, what: str) -> None:
    problems.append(f"{where}: {what}")


index = json.loads((root / "examples.json").read_text())["examples"]
by_name = {}
for entry in index:
    if entry["name"] in by_name:
        problem("examples.json", f"{entry['name']} is listed twice")
    by_name[entry["name"]] = entry

dirs = sorted(p.parent for p in root.glob("*/ocel.json")) + sorted(p.parent for p in root.glob("apps/*/ocel.json"))
readme = (root / "README.md").read_text()
seen = set()

for d in dirs:
    name, rel = d.name, str(d.relative_to(root))
    seen.add(name)
    entry = by_name.get(name)
    if entry is None:
        problem(rel, "missing from examples.json")
    elif entry["path"] != rel:
        problem(rel, f"examples.json says its path is {entry['path']}")
    if not re.fullmatch(r"(node|go|python|rust)-[a-z0-9]+(-[a-z0-9]+)*", name):
        problem(rel, "name is not <lang>-<thing>")

    config = json.loads((d / "ocel.json").read_text())
    if config.get("slug") != name:
        problem(rel, f"ocel.json slug is {config.get('slug')!r}")
    if "provider" in config:
        problem(rel, "ocel.json names a provider")

    if (d / "package.json").exists() and json.loads((d / "package.json").read_text()).get("name") != name:
        problem(rel, "package.json name differs from the directory")
    if (d / "go.mod").exists() and not (d / "go.mod").read_text().startswith(f"module example.com/{name}\n"):
        problem(rel, f"go.mod module is not example.com/{name}")
    if (d / "Cargo.toml").exists() and f'name = "{name}"' not in (d / "Cargo.toml").read_text():
        problem(rel, "Cargo.toml package name differs from the directory")

    if not (d / ".gitignore").exists():
        problem(rel, "no .gitignore of its own")
    text = (d / "README.md").read_text() if (d / "README.md").exists() else ""
    if not text.startswith(f"# {name}\n"):
        problem(rel, f"README.md does not start with '# {name}'")
    if re.search(r"\]\(\.\./", text):
        problem(rel, "README.md links outside the example; use an absolute URL")
    if f"]({rel})" not in readme:
        problem(rel, "not linked from the root README.md")

for name in by_name.keys() - seen:
    problem("examples.json", f"{name} has no directory")

print("\n".join(problems) or f"{len(dirs)} examples ok")
sys.exit(1 if problems else 0)
