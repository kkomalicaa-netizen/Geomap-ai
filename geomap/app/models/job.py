# Kept as a separate module to match the README's recommended project structure
# (models/layer.py, models/conflict.py, models/job.py). The actual table is
# defined in layer.py since SQLAlchemy needs it declared alongside SpatialLayer
# for the relationship/FK to resolve cleanly — this just re-exports it.
from app.models.layer import ProcessingJob  # noqa: F401
