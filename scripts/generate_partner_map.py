"""Generate desktop and mobile partner maps from Natural Earth Admin 0."""

from __future__ import annotations

import json
from collections.abc import Callable
from pathlib import Path
from urllib.request import urlopen


SOURCE = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
    "master/geojson/ne_110m_admin_0_countries.geojson"
)
PUBLIC = Path(__file__).parents[1] / "public"
OUTPUT = PUBLIC / "partners-world-map.svg"
OUTPUT_MOBILE = PUBLIC / "partners-world-map-mobile.svg"
OUTPUT_LANDSCAPE = PUBLIC / "partners-world-map-landscape.svg"

ACTIVE_COUNTRIES = {
    "China",
    "Germany",
    "Poland",
    "Switzerland",
    "United Kingdom",
    "United States of America",
}

WORLD_MARKERS = [
    ("United States", -98.5, 38.5, 260, 183, "middle"),
    ("England", -1.5, 52.4, 515, 65, "middle"),
    ("Germany", 10.5, 51.1, 635, 62, "middle"),
    ("Poland / HQ", 19.1, 52.0, 720, 87, "start"),
    ("Switzerland", 8.2, 46.8, 660, 162, "start"),
    ("China", 104.2, 35.9, 946, 196, "middle"),
]


def project_world(longitude: float, latitude: float) -> tuple[float, float]:
    width, height = 1200, 520
    top_lat, bottom_lat = 85, -60
    x = (longitude + 180) / 360 * width
    latitude = max(bottom_lat, min(top_lat, latitude))
    y = (top_lat - latitude) / (top_lat - bottom_lat) * height
    return x, y


def project_europe(longitude: float, latitude: float) -> tuple[float, float]:
    x = 25 + (longitude + 12) / 44 * 670
    y = 345 + (61 - latitude) / 27 * 225
    return x, y


def coordinate_rings(geometry: dict) -> list[list[list[float]]]:
    if geometry["type"] == "Polygon":
        return geometry["coordinates"]
    if geometry["type"] == "MultiPolygon":
        return [ring for polygon in geometry["coordinates"] for ring in polygon]
    return []


def ring_path(
    ring: list[list[float]],
    projector: Callable[[float, float], tuple[float, float]],
) -> str:
    chunks: list[str] = []
    previous_longitude: float | None = None

    for longitude, latitude, *_ in ring:
        x, y = projector(longitude, latitude)
        command = "L"
        if previous_longitude is None or abs(longitude - previous_longitude) > 180:
            command = "M"
        chunks.append(f"{command}{x:.1f},{y:.1f}")
        previous_longitude = longitude

    if chunks:
        chunks.append("Z")
    return "".join(chunks)


def country_class(name: str) -> str:
    if name == "Poland":
        return "country country--base"
    if name in ACTIVE_COUNTRIES:
        return "country country--active"
    return "country"


def render_countries(
    geojson: dict,
    projector: Callable[[float, float], tuple[float, float]],
) -> str:
    countries: list[str] = []
    for feature in geojson["features"]:
        name = feature["properties"].get("ADMIN", "")
        if name == "Antarctica":
            continue

        path = "".join(
            ring_path(ring, projector)
            for ring in coordinate_rings(feature["geometry"])
        )
        if path:
            countries.append(
                f'<path class="{country_class(name)}" d="{path}">'
                f"<title>{name}</title></path>"
            )
    return "".join(countries)


def home_icon(x: float, y: float) -> str:
    return (
        f'<g class="home" transform="translate({x:.1f} {y:.1f})">'
        '<path d="M0 6 7 0l7 6v9H9v-5H5v5H0Z" /></g>'
    )


def marker(
    name: str,
    longitude: float,
    latitude: float,
    label_x: float,
    label_y: float,
    anchor: str,
    projector: Callable[[float, float], tuple[float, float]],
) -> str:
    x, y = projector(longitude, latitude)
    is_base = name.startswith("Poland")
    modifier = " marker--base" if is_base else ""
    house = home_icon(label_x - 20, label_y - 13) if is_base else ""
    return (
        f'<g class="marker{modifier}"><title>{name}</title>'
        f'<path class="leader" d="M{x:.1f},{y:.1f} L{label_x},{label_y - 5}" />'
        f'<circle class="ring" cx="{x:.1f}" cy="{y:.1f}" r="8" />'
        f'<circle class="dot" cx="{x:.1f}" cy="{y:.1f}" r="3" />'
        f"{house}"
        f'<text x="{label_x}" y="{label_y}" text-anchor="{anchor}">{name}</text>'
        "</g>"
    )


STYLES = """
    .ocean { fill: #070707; }
    .country { fill: #111412; stroke: #3b443f; stroke-width: .75; vector-effect: non-scaling-stroke; }
    .country--active { fill: #17352a; stroke: #82f5c6; stroke-width: 1; }
    .country--base { fill: #43191c; stroke: #ff5c63; stroke-width: 1.4; }
    .leader { fill: none; stroke: #82f5c6; stroke-width: 1; stroke-dasharray: 3 4; vector-effect: non-scaling-stroke; }
    .ring { fill: #82f5c622; stroke: #82f5c6; stroke-width: 1; vector-effect: non-scaling-stroke; }
    .dot { fill: #82f5c6; }
    .marker--base .leader, .marker--base .ring { stroke: #ff5c63; }
    .marker--base .ring { fill: #ff5c6328; }
    .marker--base .dot, .home { fill: #ff5c63; }
    .marker--base text { fill: #ff747a; }
    text { fill: #fff; stroke: #070707; stroke-width: 4; paint-order: stroke; font: 600 13px ui-monospace, monospace; letter-spacing: .06em; text-transform: uppercase; }
"""


def render_desktop(geojson: dict) -> str:
    countries = render_countries(geojson, project_world)
    markers = "".join(
        marker(*item, projector=project_world) for item in WORLD_MARKERS
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520" role="img" aria-labelledby="title description">
  <title id="title">Alien Bazaar partner countries</title>
  <desc id="description">Partner locations in the United States, England, Germany, Switzerland, Poland and China. Alien Bazaar is based in Poland.</desc>
  <style>{STYLES}</style>
  <rect class="ocean" width="1200" height="520" />
  <g>{countries}</g>
  <g>{markers}</g>
</svg>
'''


def render_landscape(geojson: dict) -> str:
    countries = render_countries(geojson, project_world)
    markers = "".join(
        marker(*item, projector=project_world) for item in WORLD_MARKERS
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 20 1200 360" role="img" aria-labelledby="title description">
  <title id="title">Alien Bazaar partner countries</title>
  <desc id="description">Partner locations in the United States, England, Germany, Switzerland, Poland and China. Alien Bazaar is based in Poland.</desc>
  <style>{STYLES}</style>
  <rect class="ocean" y="20" width="1200" height="360" />
  <g>{countries}</g>
  <g>{markers}</g>
</svg>
'''


def render_mobile(geojson: dict) -> str:
    world = render_countries(geojson, project_world)
    europe = render_countries(geojson, project_europe)

    us = marker("United States", -98.5, 38.5, 152, 118, "middle", lambda lon, lat: tuple(value * .6 for value in project_world(lon, lat)))
    china = marker("China", 104.2, 35.9, 568, 126, "middle", lambda lon, lat: tuple(value * .6 for value in project_world(lon, lat)))
    europe_markers = "".join(
        marker(*item, projector=project_europe)
        for item in [
            ("England", -1.5, 52.4, 150, 373, "middle"),
            ("Germany", 10.5, 51.1, 360, 382, "middle"),
            ("Poland / HQ", 19.1, 52.0, 535, 382, "start"),
            ("Switzerland", 8.2, 46.8, 350, 500, "middle"),
        ]
    )

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 570" role="img" aria-labelledby="title description">
  <title id="title">Alien Bazaar partner countries</title>
  <desc id="description">Partner locations in the United States, England, Germany, Switzerland, Poland and China. Alien Bazaar is based in Poland.</desc>
  <style>{STYLES} text {{ font-size: 16px; }} .inset-label {{ fill: #8b928d; font-size: 11px; letter-spacing: .16em; }}</style>
  <rect class="ocean" width="720" height="570" />
  <g transform="scale(.6)">{world}</g>
  <g>{us}{china}</g>
  <path d="M20 326H700" stroke="#39413c" stroke-width="1" />
  <text class="inset-label" x="28" y="345">EUROPE / BASE: POLAND</text>
  <defs><clipPath id="europe"><rect x="20" y="350" width="680" height="205" /></clipPath></defs>
  <g clip-path="url(#europe)">{europe}</g>
  <g>{europe_markers}</g>
  <rect x="20.5" y="350.5" width="679" height="204" fill="none" stroke="#39413c" />
</svg>
'''


def main() -> None:
    with urlopen(SOURCE) as response:
        geojson = json.load(response)

    OUTPUT.write_text(render_desktop(geojson), encoding="utf-8")
    OUTPUT_MOBILE.write_text(render_mobile(geojson), encoding="utf-8")
    OUTPUT_LANDSCAPE.write_text(render_landscape(geojson), encoding="utf-8")


if __name__ == "__main__":
    main()
