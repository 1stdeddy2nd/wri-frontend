import { GeoJsonObject } from 'geojson';

export const isGeoJSON = (file: Blob): Promise<GeoJsonObject> => {
  const reader = new FileReader();
  reader.readAsText(file);
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          const geoJSON = JSON.parse(reader.result);
          const typeRes = geoJSON
              && geoJSON.type === 'FeatureCollection'
              && Array.isArray(geoJSON.features)
              && geoJSON.features.every((feature: any) => feature.geometry
                  && feature.geometry.type
                  && Array.isArray(feature.geometry.coordinates));
          if (typeRes) resolve(geoJSON);
          else reject(new Error('File type is not GeoJSON'));
        }
        reject(new Error('typeof reader result is not a string'));
      } catch (err) {
        reject(err);
      }
    };
  });
};
