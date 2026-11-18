
// =====================================================
// 30 DAY MAP CHALLENGE - DAY 18: NULL
// WHERE IS THE SNOW?
// Modeled Snowfall in the Philippines (2000-2025)
//
// Data: ECMWF ERA5-Land Daily Aggregated
// Unit: millimeters of water equivalent
// =====================================================


// -----------------------------------------------------
// 1. STUDY AREA: PHILIPPINES
// -----------------------------------------------------

var philippines = ee.FeatureCollection(
  'USDOS/LSIB_SIMPLE/2017'
).filter(
  ee.Filter.eq('country_na', 'Philippines')
);

var aoi = philippines.geometry();

Map.centerObject(philippines, 6);

print('Philippines boundary features:',
      philippines.size());


// -----------------------------------------------------
// 2. STUDY PERIOD
// -----------------------------------------------------

var startDate = '2000-01-01';
var endDate = '2026-01-01'; // Exclusive end date

var startYear = 2000;
var endYear = 2025;


// -----------------------------------------------------
// 3. LOAD ERA5-LAND SNOWFALL DATA
// -----------------------------------------------------

var era5 = ee.ImageCollection(
  'ECMWF/ERA5_LAND/DAILY_AGGR'
)
.filterDate(startDate, endDate)
.filterBounds(aoi)
.select('snowfall_sum');

print('Number of daily images:', era5.size());
print('First available image:', era5.first());
print('Last available image:',
      era5.sort('system:time_start', false).first());


// -----------------------------------------------------
// 4. CONVERT SNOWFALL TO MILLIMETERS
// -----------------------------------------------------

// Original unit: meters of water equivalent
// Output unit: millimeters of water equivalent
// Negative values are set to zero to avoid
// nonphysical negative accumulation.

var snowfallMM = era5.map(function(image) {

  var snow = image
    .max(0)
    .multiply(1000)
    .rename('snowfall_mm');

  return snow.copyProperties(
    image, ['system:time_start']
  );

});


// -----------------------------------------------------
// 5. CALCULATE TOTAL SNOWFALL (2000-2025)
// -----------------------------------------------------

var totalSnow = snowfallMM
  .sum()
  .rename('total_snowfall_mm')
  .clip(aoi);


// -----------------------------------------------------
// 6. COUNT VALID DAILY OBSERVATIONS
// -----------------------------------------------------

var validCount = snowfallMM
  .count()
  .rename('valid_days')
  .clip(aoi);

var validMask = validCount.gt(0);

// A zero value is valid if data are present.
// Missing values remain masked.

totalSnow = totalSnow.updateMask(validMask);


// -----------------------------------------------------
// 7. SNOWFALL OCCURRENCE CLASSIFICATION
// -----------------------------------------------------

// 0 = No modeled snowfall
// 1 = Positive modeled snowfall
// NoData = No valid observations

var snowClass = totalSnow
  .gt(0)
  .rename('snow_class')
  .updateMask(validMask)
  .toByte();


// -----------------------------------------------------
// 8. NUMBER OF DAYS WITH MODELED SNOWFALL
// -----------------------------------------------------

// Threshold of 0 mm water equivalent.
// Positive model values count as occurrence.

var snowDays = snowfallMM.map(function(image) {

  return image.gt(0)
    .rename('snow_day')
    .updateMask(image.mask());

}).sum()
  .rename('snow_days')
  .updateMask(validMask)
  .clip(aoi)
  .toInt16();


// -----------------------------------------------------
// 9. CALCULATE SUMMARY STATISTICS
// -----------------------------------------------------

var stats = totalSnow.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: aoi,
  scale: 11132,
  maxPixels: 1e10,
  tileScale: 4
});

print('Total snowfall min/max (mm):', stats);

var daysStats = snowDays.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: aoi,
  scale: 11132,
  maxPixels: 1e10,
  tileScale: 4
});

print('Snowfall days min/max:', daysStats);

var coverageStats = validCount.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: aoi,
  scale: 11132,
  maxPixels: 1e10,
  tileScale: 4
});

print('Valid daily observations:', coverageStats);


// -----------------------------------------------------
// 10. TERRAIN DATA FOR MAP BACKGROUND
// -----------------------------------------------------

var elevation = ee.Image(
  'USGS/SRTMGL1_003'
).select('elevation')
 .clip(aoi);

var hillshade = ee.Terrain.hillshade(
  elevation.unmask(0)
).clip(aoi);


// -----------------------------------------------------
// 11. VISUALIZATION
// -----------------------------------------------------

// Dark gray land with subtle elevation differences
var elevationVis = {
  min: 0,
  max: 2500,
  palette: [
    '253443',
    '506173',
    '8c9ba7',
    'd7e0e5',
    'f5f7f8'
  ]
};

// Total snowfall
var snowVis = {
  min: 0,
  max: 10,
  palette: [
    'e8eef2',
    'a8d8ea',
    '56b4d3',
    '2171b5',
    '08306b'
  ]
};

// Positive snowfall pixels only
var positiveSnow = totalSnow.updateMask(
  totalSnow.gt(0)
);

// Display terrain
Map.addLayer(
  elevation,
  elevationVis,
  'Elevation',
  true
);

// Display snowfall (positive values)
Map.addLayer(
  positiveSnow,
  snowVis,
  'Positive modeled snowfall',
  true
);

// Display zero snowfall classification
Map.addLayer(
  snowClass.eq(0).selfMask(),
  {palette: ['dce3e8']},
  'Zero modeled snowfall',
  false
);

// Display valid data coverage
Map.addLayer(
  validMask.selfMask(),
  {palette: ['80cbc4']},
  'Valid data coverage',
  false
);

// Philippines boundary
Map.addLayer(
  philippines.style({
    color: 'ffffff',
    fillColor: '00000000',
    width: 1
  }),
  {},
  'Philippines boundary',
  true
);


// -----------------------------------------------------
// 12. EXPORT TOTAL SNOWFALL
// -----------------------------------------------------

Export.image.toDrive({
  image: totalSnow,
  description: 'PH_Total_Snowfall_2000_2025',
  folder: 'GEE_Snowfall_NULL',
  fileNamePrefix: 'PH_Total_Snowfall_2000_2025',
  region: aoi,
  scale: 11132,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});


// -----------------------------------------------------
// 13. EXPORT SNOWFALL CLASSIFICATION
// -----------------------------------------------------

// Use -9999 for NoData so it is distinguishable
// from valid zero snowfall.

Export.image.toDrive({
  image: snowClass.unmask(-9999).toInt16(),
  description: 'PH_Snowfall_Class',
  folder: 'GEE_Snowfall_NULL',
  fileNamePrefix: 'PH_Snowfall_Class',
  region: aoi,
  scale: 11132,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF',
  formatOptions: {
    noData: -9999
  }
});


// -----------------------------------------------------
// 14. EXPORT SNOWFALL DAYS
// -----------------------------------------------------

Export.image.toDrive({
  image: snowDays,
  description: 'PH_Snowfall_Days_2000_2025',
  folder: 'GEE_Snowfall_NULL',
  fileNamePrefix: 'PH_Snowfall_Days_2000_2025',
  region: aoi,
  scale: 11132,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});


// -----------------------------------------------------
// 15. EXPORT ELEVATION
// -----------------------------------------------------

Export.image.toDrive({
  image: elevation,
  description: 'PH_Elevation',
  folder: 'GEE_Snowfall_NULL',
  fileNamePrefix: 'PH_Elevation',
  region: aoi,
  scale: 90,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});


// -----------------------------------------------------
// 16. EXPORT COUNTRY BOUNDARY
// -----------------------------------------------------

Export.table.toDrive({
  collection: philippines,
  description: 'PH_Boundary',
  folder: 'GEE_Snowfall_NULL',
  fileFormat: 'SHP'
});

print('Analysis setup complete.');
print('Review the Console before interpreting results.');
print('Open Tasks to start the exports.');
