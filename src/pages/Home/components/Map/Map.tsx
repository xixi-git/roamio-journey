import { useMemo, useState } from 'react';
import { ChevronDown, Globe2, Minus, Plus } from 'lucide-react';
import { ComposableMap, Geography, Geographies, Marker } from 'react-simple-maps/core';
import { ZoomableGroup } from 'react-simple-maps/zoom';
import { getLocalToday, isTripPast, parseTripDate } from '../../../../features/trips/model';
import type { Trip } from '../../../../features/trips/types';
import './Map.css';

const GEOGRAPHY_URL = '/world/countries-110m.json';
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 2;
const COUNTRY_NUMERIC_CODES: Record<string, string> = {
  AT: '040', PT: '620', DK: '208', FR: '250', JP: '392', ID: '360', TR: '792', US: '840',
};
const COUNTRY_NAME_ALIASES: Record<string, string> = {
  'united states': 'united states of america',
  'turkiye': 'turkey',
};

function normalizeCountryName(value: unknown) {
  const normalized = String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return COUNTRY_NAME_ALIASES[normalized] ?? normalized;
}

function tripDays(trip: Trip) {
  return Math.round((parseTripDate(trip.end).getTime() - parseTripDate(trip.start).getTime()) / 86400000) + 1;
}

export default function HomeMap({ trips }: { trips: Trip[] }) {
  const [selectedCode, setSelectedCode] = useState('all');
  const [zoom, setZoom] = useState(1);
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const today = getLocalToday();
  const visitedTrips = trips.filter((trip) => isTripPast(trip, today));
  const plannedTrips = trips.filter((trip) => !isTripPast(trip, today));
  const visitedCountries = new Set(visitedTrips.map((trip) => trip.countryCode));
  const travelDays = visitedTrips.reduce((total, trip) => total + tripDays(trip), 0);
  const countries = useMemo(() => [...new Map(trips.map((trip) => [trip.countryCode, trip])).values()], [trips]);
  const selectedTrip = countries.find((trip) => trip.countryCode === selectedCode) ?? null;

  const zoomIn = () => setZoom((current) => Math.min(MAX_ZOOM, Math.round((current + 0.1) * 10) / 10));
  const zoomOut = () => setZoom((current) => Math.max(MIN_ZOOM, Math.round((current - 0.1) * 10) / 10));

  return (
    <section className="home-panel map-panel">
      <div className="panel-heading map-heading">
        <h2><Globe2 />Map</h2>
        <label className="map-country-select">
          <span className="sr-only">Highlight a country</span>
          <select value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}>
            <option value="all">All countries</option>
            {countries.map((trip) => <option value={trip.countryCode} key={trip.countryCode}>{trip.country}</option>)}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>
      </div>
      <div className="map-stats">
        <strong>{travelDays}</strong><span>Travel Days</span>
        <strong>{visitedCountries.size}</strong><span>Countries<br />Visited</span>
        <strong>{plannedTrips.length}</strong><span>Trips Planned</span>
      </div>
      <ComposableMap
        className="world-map"
        width={800}
        height={380}
        projection="geoEquirectangular"
        role="img"
        aria-label={`World map showing ${visitedCountries.size} visited countries and ${plannedTrips.length} upcoming trips`}
      >
        <ZoomableGroup
          key={zoom}
          center={coordinates}
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          filterZoomEvent={(event) => event.type !== 'wheel'}
          onMoveEnd={(pos) => {
            setCoordinates(pos.coordinates || [0, 0]);
          }}
        >
          <Geographies geography={GEOGRAPHY_URL}>
            {({ geographies }) => geographies.map((geography) => {
              const geographyCode = String(geography.id ?? '').padStart(3, '0');
              const isSelected = selectedCode !== 'all' && (
                geographyCode === COUNTRY_NUMERIC_CODES[selectedCode]
                || normalizeCountryName(geography.properties?.name) === normalizeCountryName(selectedTrip?.country)
              );
              return (
                <Geography
                  key={geography.rsmKey}
                  geography={geography}
                  className={`map-country ${isSelected ? 'selected' : ''}`}
                  fill={isSelected ? '#9382f7' : '#f3f7f5'}
                  stroke="#ffffff"
                  strokeWidth={0.65}
                  vectorEffect="non-scaling-stroke"
                  aria-label={geography.properties?.name}
                />
              );
            })}
          </Geographies>
          {trips.map((trip) => {
            const visited = isTripPast(trip, today);
            return (
              <Marker
                key={`${trip.countryCode}-${trip.city}`}
                coordinates={[trip.coordinates.lon, trip.coordinates.lat]}
                className={`map-destination ${visited ? 'visited' : 'planned'}`}
              >
                <title>{`${trip.city}, ${trip.country} · ${visited ? 'Visited' : 'Planned'}`}</title>
                <circle className="destination-halo" r={5} />
                <circle className="destination-dot" r={2.1} />
                <text x={7} y={-5}>{trip.city}</text>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
      {selectedTrip && <div className="selected-country-label"><i />{selectedTrip.country}</div>}
      <div className="map-legend"><span><i className="planned-key" />Planned</span><span><i className="visited-key" />Visited</span><span><i className="selected-key" />Selected</span></div>
      <div className="map-zoom">
        <button type="button" aria-label="Zoom in" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}><Plus /></button>
        <output aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" aria-label="Zoom out" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}><Minus /></button>
      </div>
    </section>
  );
}
