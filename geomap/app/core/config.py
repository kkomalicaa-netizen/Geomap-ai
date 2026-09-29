from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central app config. Values come from environment / .env (see .env.example)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://geomap:geomap@localhost:5432/geomap_ai"

    # CRS
    PROJECT_CRS: str = "EPSG:32643"   # projected CRS used for metric calculations
    STORAGE_CRS: str = "EPSG:4326"    # CRS features are stored/served in

    # Uploads
    MAX_UPLOAD_MB: int = 50

    # Auth
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 120

    # Conflict engine thresholds (README §10)
    OVERLAP_CONFLICT_THRESHOLD: float = 0.20
    DISPLACEMENT_THRESHOLD_M: float = 5.0


settings = Settings()
