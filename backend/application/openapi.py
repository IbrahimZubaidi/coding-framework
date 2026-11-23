# openapi.py — OpenAPI tag groups shown in /docs
#
# Each entry defines a named group that router.include_router(..., tags=["Name"]) references.
# Add one entry per feature domain. Order here controls the order in /docs.
#
# Pattern:
#   {"name": "Tag Name", "description": "What this group covers"}
#
# The tag string in include_router must match "name" exactly (case-sensitive).
#
# Example for IMF AutoML — replace/extend with actual project domains:

tags_metadata = [
    {"name": "Auth",        "description": "User registration, login, logout, token refresh"},
    {"name": "Account",     "description": "User profile and password management"},
    {"name": "Datasets",    "description": "Upload, preview, and manage datasets"},
    {"name": "Experiments", "description": "Create and manage AutoML experiments"},
    {"name": "Models",      "description": "Trained model results, metrics, and downloads"},
    {"name": "Predictions", "description": "Run predictions against trained models"},
    {"name": "Admin - Cache",     "description": "Cache inspection and flush"},
    {"name": "Admin - Telemetry", "description": "Request and DB performance metrics"},
]
