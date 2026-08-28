#!/usr/bin/env python3
"""
build_stats.py — turn RU SnipeZ's live data into the site's stats.json.

Run this from the bot repo, where user_data.json, ru_snipez_logs.json and the
last-opened cache live. It writes a single aggregated file and nothing else.
Raw logs never leave the machine, and no Discord user ID appears in the output.

    python build_stats.py \
        --users user_data.json \
        --logs ru_snipez_logs.json \
        --cache last_opened.json \
        --out ../ru-snipez-site/src/data/stats.json

Every aggregator below is wrapped so that a field you cannot supply yet keeps
its existing value in stats.json and stays marked as a placeholder. That means
you can run this now with only the files you have and fill in the rest later.
"""

from __future__ import annotations

import argparse
import json
import statistics
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

# --------------------------------------------------------------------------
# EDIT ME: how timestamps look in your logs.
# The bot's embeds render as "12-31-2023 02:44:34 EST", so that is the default.
# If the JSON stores ISO strings or epoch seconds instead, change parse_ts.
# --------------------------------------------------------------------------

TS_FORMAT = "%m-%d-%Y %H:%M:%S"


def parse_ts(raw):
    """Return a datetime, or None if the value is unusable."""
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return datetime.fromtimestamp(raw)
    text = str(raw).replace(" EST", "").replace(" EDT", "").strip()
    for fmt in (TS_FORMAT, "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def load(path):
    if not path:
        return None
    p = Path(path)
    if not p.exists():
        print(f"  skip: {p} not found")
        return None
    with p.open(encoding="utf-8") as fh:
        return json.load(fh)


def walk_records(blob):
    """Yield dicts out of a log file whether it is a list or a dict of lists."""
    if isinstance(blob, list):
        for item in blob:
            if isinstance(item, dict):
                yield item
    elif isinstance(blob, dict):
        for value in blob.values():
            if isinstance(value, dict):
                yield value
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        yield item


def first_key(record, *names):
    """Pull the first key that exists, so minor schema differences don't break."""
    for n in names:
        if n in record:
            return record[n]
    return None


# --------------------------------------------------------------------------
# Aggregators
# --------------------------------------------------------------------------


def count_users(users):
    if not isinstance(users, dict):
        return None
    return len(users)


def command_usage(logs):
    if logs is None:
        return None
    tally = Counter()
    for rec in walk_records(logs):
        cmd = first_key(rec, "command", "cmd", "event", "action")
        if isinstance(cmd, str) and cmd.strip():
            name = cmd.strip().lower()
            if not name.startswith("/"):
                name = "/" + name
            tally[name] += 1
    keep = [c for c in ("/snipe", "/check", "/remove") if c in tally]
    if not keep:
        return None
    return [{"command": c, "count": tally[c]} for c in keep]


def notifications_sent(logs):
    """Count delivered openings. Adjust the match list to your log vocabulary."""
    if logs is None:
        return None
    markers = {"notification", "notified", "opening", "section_open", "dm_sent", "hit"}
    n = 0
    for rec in walk_records(logs):
        blob = " ".join(
            str(v).lower() for v in rec.values() if isinstance(v, (str, int))
        )
        if any(m in blob for m in markers):
            n += 1
    return n or None


def transitions(cache):
    """
    Normalise the last-opened cache into (index, opened_at, closed_at) triples.

    Handles the two shapes this data usually takes:
      {"06812": {"opened": "...", "closed": "..."}}
      {"06812": [{"status": "open", "time": "..."}, ...]}
    """
    if not isinstance(cache, dict):
        return []

    out = []
    for index, value in cache.items():
        if isinstance(value, dict):
            o = parse_ts(first_key(value, "opened", "opened_at", "last_opened", "open"))
            c = parse_ts(first_key(value, "closed", "closed_at", "close"))
            if o:
                out.append((index, o, c))
        elif isinstance(value, list):
            pending = None
            for entry in value:
                if not isinstance(entry, dict):
                    continue
                status = str(first_key(entry, "status", "state") or "").lower()
                when = parse_ts(first_key(entry, "time", "timestamp", "at", "ts"))
                if not when:
                    continue
                if "open" in status:
                    pending = when
                elif "close" in status and pending:
                    out.append((index, pending, when))
                    pending = None
            if pending:
                out.append((index, pending, None))
    return out


def open_duration(trans):
    spans = [
        (c - o).total_seconds() for _, o, c in trans if c and c > o
    ]
    if len(spans) < 10:
        return None
    spans.sort()
    return {
        "medianSeconds": int(statistics.median(spans)),
        "p90Seconds": int(spans[int(len(spans) * 0.9)]),
    }


def openings_by_hour(trans):
    if len(trans) < 24:
        return None
    tally = Counter(o.hour for _, o, _ in trans)
    return [
        {"hour": f"{h:02d}", "openings": tally.get(h, 0)} for h in range(24)
    ]


def churn_by_subject(trans, course_lookup):
    """
    Needs a mapping from index number to subject name. Point --courses at the
    file course_info_generation.py produces and adjust the key names below.
    """
    if not trans or not isinstance(course_lookup, dict):
        return None
    tally: Counter = Counter()
    for index, _, _ in trans:
        entry = course_lookup.get(str(index))
        if isinstance(entry, dict):
            subject = first_key(entry, "subject", "subjectName", "department", "title")
            if subject:
                tally[str(subject)] += 1
    if not tally:
        return None
    return [
        {"subject": s, "openings": n} for s, n in tally.most_common(8)
    ]


def cycle_timeline(trans):
    if len(trans) < 30:
        return None
    per_day = defaultdict(int)
    for _, o, _ in trans:
        per_day[o.date()] += 1
    days = sorted(per_day)
    recent = days[-24:]
    return [
        {"day": d.strftime("%b %d"), "openings": per_day[d]} for d in recent
    ]


# --------------------------------------------------------------------------


def apply(stats, path, value, formatter=None):
    """Write a computed value into the stats tree and clear its placeholder flag."""
    if value is None:
        return False
    node = stats
    for key in path[:-1]:
        node = node[key]
    leaf = path[-1]

    if isinstance(node[leaf], dict) and "data" in node[leaf]:
        node[leaf]["data"] = value
        node[leaf]["source"] = "computed"
    elif isinstance(node[leaf], dict) and "value" in node[leaf]:
        node[leaf]["value"] = value
        node[leaf]["display"] = formatter(value) if formatter else f"{value:,}"
        node[leaf]["source"] = "computed"
    elif isinstance(node[leaf], dict):
        node[leaf].update(value)
        node[leaf]["source"] = "computed"
    else:
        node[leaf] = value
    print(f"  wrote {'.'.join(path)}")
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--users", default="user_data.json")
    ap.add_argument("--logs", default="ru_snipez_logs.json")
    ap.add_argument("--cache", default="last_opened.json")
    ap.add_argument("--courses", default=None, help="index -> course info map")
    ap.add_argument("--out", default="src/data/stats.json")
    args = ap.parse_args()

    out_path = Path(args.out)
    stats = json.loads(out_path.read_text(encoding="utf-8"))

    print("reading:")
    users = load(args.users)
    logs = load(args.logs)
    cache = load(args.cache)
    courses = load(args.courses) if args.courses else None

    trans = transitions(cache)
    print(f"  {len(trans)} open/close transitions parsed")

    print("computing:")
    apply(stats, ["headline", "students"], count_users(users), lambda v: f"{v:,}+")
    apply(stats, ["headline", "notifications"], notifications_sent(logs))
    apply(stats, ["openDuration"], open_duration(trans))
    apply(stats, ["openingsByHour"], openings_by_hour(trans))
    apply(stats, ["churnBySubject"], churn_by_subject(trans, courses))
    apply(stats, ["cycleTimeline"], cycle_timeline(trans))
    apply(stats, ["commandUsage"], command_usage(logs))

    stats["generatedOn"] = datetime.now().strftime("%Y-%m-%d")

    out_path.write_text(json.dumps(stats, indent=2) + "\n", encoding="utf-8")

    remaining = json.dumps(stats).count('"source": "placeholder"')
    print(f"\nwrote {out_path}")
    if remaining:
        print(f"{remaining} field(s) still placeholder. The site will warn until they are real.")
    else:
        print("all fields computed from real data.")


if __name__ == "__main__":
    main()
