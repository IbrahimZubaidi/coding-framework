from enum import IntEnum

# ─── enums.py — shared integer enums ─────────────────────────────────────────
#
# PURPOSE
#   Map integer columns in the DB to named constants used across multiple endpoints.
#   Keeps magic numbers out of SQL and makes intent clear.
#
# WHEN TO ADD HERE vs. LOCALLY
#   · Add here  → enum is used by 2+ endpoint files (shared domain concept).
#   · Keep local → enum is only used inside one file (define it at the top of that file).
#
# HOW TO DEFINE
#   One IntEnum class per domain concept. Values must match the DB schema exactly.
#   Always verify integer codes in db/schema.sql before setting them here.
#
#   class ExampleStatus(IntEnum):
#       PENDING   = 0
#       RUNNING   = 1
#       COMPLETED = 2
#       FAILED    = 3
#
# HOW TO USE IN A QUERY
#   WHERE status = %s  →  pass (ExampleStatus.PENDING,) as the param tuple
#   WHERE status = ANY(%s::int[])  →  pass ([ExampleStatus.PENDING, ExampleStatus.RUNNING],)
#
# HOW TO USE IN A RESPONSE
#   row["status"] returns the raw integer — the client receives that integer.
#   Document the mapping in the endpoint's docstring or openapi description
#   so consumers know what each value means.
#
# EXAMPLE — for a project with user roles and experiment states:
#
#   class UserRole(IntEnum):
#       USER  = 0
#       ADMIN = 1
#
#   class ExperimentStatus(IntEnum):
#       PENDING   = 0
#       RUNNING   = 1
#       COMPLETED = 2
#       FAILED    = 3
#
#   class DatasetStatus(IntEnum):
#       UPLOADING  = 0
#       READY      = 1
#       PROCESSING = 2
#       ERROR      = 3
#
# ─────────────────────────────────────────────────────────────────────────────

# Define project enums below once db/schema.sql integer codes are confirmed.
