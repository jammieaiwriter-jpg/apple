#!/usr/bin/env python3
"""Validate the repaired pilot without changing protected upstream assets."""

from __future__ import annotations

from pilot_common import report_count_errors, validate_pilot, write_reports


def main() -> int:
    result = validate_pilot()
    write_reports(result)
    result["errors"].extend(report_count_errors(result))
    result["errors"] = sorted(set(result["errors"]))
    result["integrityPass"] = not result["errors"]
    if not result["integrityPass"]:
        result["releaseDecision"] = "NO-GO"
        write_reports(result)
    print(f"Integrity={'PASS' if result['integrityPass'] else 'FAIL'}; release={result['releaseDecision']}")
    for error in result["errors"]:
        print(f"ERROR: {error}")
    for gate in result["noGoGates"]:
        print(f"NO-GO: {gate}")
    return 0 if result["integrityPass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
