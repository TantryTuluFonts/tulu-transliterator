"""Builds index.html from its parts.

  engine.js      the conversion engine, exactly as written (do not edit unless you mean to change conversions)
  refcards.html  the quick reference tables
  ui.js          the interface script
  template.html  the page layout and styles

Run from the repository root:   python tools/assemble.py
"""
import os, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

def read(name):
    return open(os.path.join(HERE, name), encoding="utf-8").read()

page = (read("template.html")
        .replace("{{REFCARDS}}", read("refcards.html"))
        .replace("{{ENGINE}}", read("engine.js"))
        .replace("{{UI}}", read("ui.js")))
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8", newline="\n").write(page)
print("wrote index.html (%d bytes)" % len(page.encode("utf-8")))
print("engine sha256:", hashlib.sha256(read("engine.js").encode("utf-8")).hexdigest()[:16])
