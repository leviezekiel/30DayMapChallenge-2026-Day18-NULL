# 30DayMapChallenge-2026-Day18-NULL
Mapping modeled snowfall absence in the Philippines (2000–2025) using ECMWF ERA5-Land, Google Earth Engine, and QGIS.

# Where Is the Snow?
### 30DayMapChallenge 2026 — Day 18: NULL

**Mapping Modeled Snowfall in the Philippines (2000–2025)**

## Project Overview

This project examines modeled snowfall across the Philippines from January 1, 2000, to December 31, 2025, using the ECMWF ERA5-Land Daily Aggregated dataset in Google Earth Engine.

The project was developed for Day 18 (NULL) of the #30DayMapChallenge 2026.

## Objectives

- Calculate total modeled snowfall across the Philippines.
- Examine the occurrence of positive modeled snowfall.
- Distinguish valid zero values from missing or undefined data.
- Visualize the results using QGIS.

## Data Sources

- **ECMWF ERA5-Land Daily Aggregated:** Daily snowfall (`snowfall_sum`), approximately 11 km resolution.
- **NASA SRTM:** Elevation data for terrain visualization.
- **USDOS LSIB Simplified 2017:** Philippine national boundary.

## Methodology

Daily snowfall data for 2000–2025 were processed using Google Earth Engine. Snowfall values were converted from meters to millimeters of water equivalent and summed to calculate total modeled snowfall.

A binary classification was generated to distinguish zero modeled snowfall from positive modeled snowfall. Valid daily data coverage was also assessed.

The resulting raster was visualized in QGIS using a minimalist thematic design and optional elevation-based hillshading.

## Results

The analysis returned:

| Parameter | Result |
|---|---|
| Total modeled snowfall | 0 mm water equivalent |
| Modeled snowfall days | 0 days |
| Valid daily data coverage | 9,497 days |
| Study period | 2000–2025 |

## Limitations

ERA5-Land is a climate reanalysis product, not a direct ground-based observation dataset. Its approximate 11 km spatial resolution may not capture localized atmospheric conditions, particularly in mountainous environments.

The simplified Philippine boundary may exclude smaller islands. Negative modeled snowfall accumulation values were set to zero during preprocessing.

The results therefore describe modeled snowfall within the analyzed grid cells and do not establish that snowfall has never occurred in the Philippines.

## Software

- Google Earth Engine — Climate data processing and analysis
- QGIS — Cartographic visualization

## Code

The Google Earth Engine JavaScript analysis is available in `snowfall_analysis.js`.

## References

Muñoz-Sabater, J., et al. (2021). ERA5-Land: A state-of-the-art global reanalysis dataset for land applications. *Earth System Science Data, 13*, 4349–4383. https://doi.org/10.5194/essd-13-4349-2021

Google Earth Engine Data Catalog: https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_DAILY_AGGR

## Challenge

**#30DayMapChallenge 2026 — Day 18: NULL**

*The data weren't missing. The snow was.*
