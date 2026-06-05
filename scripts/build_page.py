"""Build a single-file static showcase page.

The standalone index avoids file:// script-loading problems on locked-down
browser or Windows setups while keeping CSS, data, and app logic editable in
separate source files.
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def main() -> None:
    html = read("template.html")
    html = html.replace("/* __INLINE_CSS__ */", read("styles.css").strip())
    html = html.replace("/* __INLINE_DATA__ */", read("data/project-data.js").strip())
    html = html.replace("/* __INLINE_APP__ */", read("app.js").strip())
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    print(f"Wrote {ROOT / 'index.html'}")


if __name__ == "__main__":
    main()
