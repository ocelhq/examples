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

not_examples = {"apps", "config", "scripts"}
dirs = sorted(p for p in root.iterdir() if p.is_dir() and not p.name.startswith(".") and p.name not in not_examples)
dirs += sorted(p for p in (root / "apps").iterdir() if p.is_dir())
readme = (root / "README.md").read_text()
seen = set()
pins: dict[str, set[str]] = {}


def pinned(d: pathlib.Path) -> list[str]:
    found = []
    if (d / "package.json").exists():
        manifest = json.loads((d / "package.json").read_text())
        for deps in (manifest.get("dependencies", {}), manifest.get("devDependencies", {})):
            found += [v for k, v in deps.items() if k == "ocel" or k.startswith("@ocel/")]
    if (d / "go.mod").exists():
        found += re.findall(r"^\s*(?:require\s+)?ocel\.dev v(\S+)", (d / "go.mod").read_text(), re.M)
    if (d / "requirements.txt").exists():
        found += re.findall(r"^ocel(?:\[[^\]]*\])?==(\S+)", (d / "requirements.txt").read_text(), re.M)
    if (d / "Cargo.toml").exists():
        found += re.findall(r'^ocel-sdk\s*=\s*(?:\{[^}]*version\s*=\s*)?"([^"]+)"', (d / "Cargo.toml").read_text(), re.M)
    return found

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

    if (d / "ocel.json").exists():
        config = json.loads((d / "ocel.json").read_text())
        if config.get("slug") != name:
            problem(rel, f"ocel.json slug is {config.get('slug')!r}")
        if "provider" in config:
            problem(rel, "ocel.json names a provider")
        if not config.keys() - {"$schema", "slug"}:
            problem(rel, "ocel.json holds only a slug; drop it")

    if (d / "package.json").exists() and json.loads((d / "package.json").read_text()).get("name") != name:
        problem(rel, "package.json name differs from the directory")
    if (d / "go.mod").exists() and not (d / "go.mod").read_text().startswith(f"module example.com/{name}\n"):
        problem(rel, f"go.mod module is not example.com/{name}")
    if (d / "Cargo.toml").exists() and f'name = "{name}"' not in (d / "Cargo.toml").read_text():
        problem(rel, "Cargo.toml package name differs from the directory")

    for app in [d, *(p.parent for p in d.glob("*/*/package.json"))]:
        for version in pinned(app):
            pins.setdefault(version, set()).add(str(app.relative_to(root)))

    if not (d / ".gitignore").exists():
        problem(rel, "no .gitignore of its own")
    text = (d / "README.md").read_text() if (d / "README.md").exists() else ""
    if not text.startswith(f"# {name}\n"):
        problem(rel, f"README.md does not start with '# {name}'")
    if not re.search(r"^ocel dev -- \S", text, re.M):
        problem(rel, "README.md never runs `ocel dev -- <command>`")
    if re.search(r"\]\(\.\./", text):
        problem(rel, "README.md links outside the example; use an absolute URL")
    if f"]({rel})" not in readme:
        problem(rel, "not linked from the root README.md")

if len(pins) > 1:
    for version, where in sorted(pins.items()):
        problem("SDK pin", f"{version} in {', '.join(sorted(where))}")

for name in by_name.keys() - seen:
    problem("examples.json", f"{name} has no directory")

print("\n".join(problems) or f"{len(dirs)} examples ok")
sys.exit(1 if problems else 0)
