FROM python:3.11-slim

# GDAL/GEOS/PROJ system libs required by geopandas/fiona/shapely
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin libgdal-dev libgeos-dev libproj-dev g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# spatial_pipeline lives one level up in the repo; mounted at /spatial_pipeline
# by docker-compose and added to PYTHONPATH so `app.services` can import it.
ENV PYTHONPATH="/app:/spatial_pipeline/.."

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
