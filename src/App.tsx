import React, { ChangeEvent, FormEvent } from 'react';
import './App.css';
import {
  MapContainer, TileLayer, LayersControl, GeoJSON,
} from 'react-leaflet';
import axios from 'axios';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { GeoJsonObject } from 'geojson';
import L from 'leaflet';
import { isGeoJSON } from './utils/func';
import { SwalError, SwalSubmit } from './components/swal';

const { BaseLayer } = LayersControl;

function App() {
  const mapRef = React.useRef<L.Map | null>(null);
  const geoJSONRef = React.useRef<L.GeoJSON | null>(null);

  const [sendData, setSendData] = React.useState<{name: string, geojson: GeoJsonObject| undefined}>({
    name: '',
    geojson: undefined,
  });
  const [validated, setValidated] = React.useState(false);
  const [currentGeoJSON, setCurrentGeoJSON] = React.useState<GeoJsonObject>();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity() && sendData.geojson) {
      SwalSubmit({
        onSubmit: () => axios.post('/api', sendData),
      });
    }
    setValidated(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const inputFile = input.files[0];
      isGeoJSON(inputFile)
        .catch((err: Error) => {
          input.value = '';
          SwalError(err.message);
        })
        .then((x) => {
          if (x) {
            setSendData((prev) => ({ ...prev, geojson: x }));
            setCurrentGeoJSON(x);
          }
        });
    }
  };

  // zoom and move map when change selected geoJSON
  React.useEffect(() => {
    if (!!mapRef.current && !!geoJSONRef.current && !!currentGeoJSON) {
      const center = geoJSONRef.current.getBounds().getCenter();
      mapRef.current?.flyTo(center, 6, { duration: 2, animate: true });
    }
  }, [mapRef, geoJSONRef, currentGeoJSON]);

  const [geoJSONList, setGeoJSONList] = React.useState<{[x: string]: GeoJsonObject}>();
  React.useEffect(() => {
    axios.get<{[x:string] : GeoJsonObject}>('/api', {
      timeout: 5000,
    })
      .then((res) => {
        setGeoJSONList(res.data);
      })
      .catch((e) => SwalError(e.message));
  }, []);

  const listMemo = React.useMemo(() => {
    if (geoJSONList) {
      return Object.keys(geoJSONList).map((x) => (
        <Form.Check
          type="radio"
          id="radio"
          name="radio"
          key={x}
          label={x}
          onChange={() => setCurrentGeoJSON(geoJSONList[x])}
          checked={geoJSONList[x] === currentGeoJSON}
        />
      ));
    }
    return null;
  }, [geoJSONList, currentGeoJSON]);

  return (
    <div className="d-flex vh-100">
      <div className="flex-grow-1">
        <MapContainer
          center={[-8.16666648, 113.50000106]}
          zoom={6}
          scrollWheelZoom={false}
          ref={mapRef}
        >
          <LayersControl>
            <BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
              />
            </BaseLayer>
            <BaseLayer name="Google Basemap">
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
                attribution="&copy; <a href=&quot;https://opensourceoptions.com/blog/how-to-add-google-satellite-imagery-and-google-maps-to-qgis&quot;>Google Basemap</a> contributors"
              />
            </BaseLayer>
            <BaseLayer name="ESRI ArcGIS World Street Map">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; <a href=&quot;https://help.socialpinpoint.com/en/articles/5114868-common-esri-arcgis-base-map-urls&quot;>ESRI ArcGIS</a> contributors"
              />
            </BaseLayer>
          </LayersControl>
          {currentGeoJSON && <GeoJSON data={currentGeoJSON} ref={geoJSONRef} />}
        </MapContainer>
      </div>
      <div style={{ width: 400 }} className="p-2">
        <h3>World Resources Institute</h3>
        <hr />
        <Form onSubmit={handleSubmit} noValidate validated={validated}>
          <InputGroup className="mb-3" hasValidation>
            <Form.Group className="w-100">
              <Form.Label>Input your GEOJSON</Form.Label>
              <Form.Control
                type="file"
                required
                multiple={false}
                accept="application/json"
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                GeoJSON is required
              </Form.Control.Feedback>
            </Form.Group>
          </InputGroup>
          <InputGroup className="mb-3" hasValidation>
            <Form.Group className="w-100">
              <Form.Label>Input name</Form.Label>
              <Form.Control
                required
                onChange={(e) => {
                  setSendData((prev) => ({ ...prev, name: e.target.value }));
                }}
                value={sendData.name}
                placeholder="Insert unique name"
              />
              <Form.Control.Feedback type="invalid">
                Name is required
              </Form.Control.Feedback>
            </Form.Group>
          </InputGroup>
          <div className="d-flex justify-content-end">
            <Button type="submit">Submit</Button>
          </div>
        </Form>
        <hr />
        <h5>List of DB GeoJSON</h5>
        {sendData.geojson && (
        <Form.Check
          id="radio"
          type="radio"
          name="radio"
          label="Current input GeoJSON"
          checked={currentGeoJSON === sendData.geojson}
          onChange={() => setCurrentGeoJSON(sendData.geojson)}
        />
        )}
        {listMemo}
      </div>
    </div>
  );
}

export default App;
