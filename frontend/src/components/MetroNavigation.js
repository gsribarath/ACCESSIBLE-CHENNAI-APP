import React, { useState, useEffect } from 'react';
import MetroService from '../services/MetroService';

const MetroNavigation = () => {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [searchResults, setSearchResults] = useState({ from: [], to: [] });
  const [routeInfo, setRouteInfo] = useState(null);
  const [liveTimings, setLiveTimings] = useState(null);
  const [metroStatus, setMetroStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState({ from: false, to: false });

  // Load metro status on component mount
  useEffect(() => {
    loadMetroStatus();
    
    // Handle click outside to close dropdowns
    const handleClickOutside = (event) => {
      if (!event.target.closest('.station-input')) {
        setShowDropdown({ from: false, to: false });
        setSearchResults({ from: [], to: [] });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadMetroStatus = async () => {
    try {
      const status = await MetroService.getMetroStatus();
      setMetroStatus(status);
    } catch (err) {
      console.error('Failed to load metro status:', err);
    }
  };

  const handleStationSearch = (query, type) => {
    const results = MetroService.searchStations(query);
    setSearchResults(prev => ({ ...prev, [type]: results }));
    setShowDropdown(prev => ({ ...prev, [type]: true }));
  };

  const handleInputFocus = (type) => {
    // Show all stations when input is focused
    const allStations = MetroService.getAllStations();
    setSearchResults(prev => ({ ...prev, [type]: allStations }));
    setShowDropdown(prev => ({ ...prev, [type]: true }));
  };

  const selectStation = (station, type) => {
    if (type === 'from') {
      setFromStation(station.name);
      setShowDropdown(prev => ({ ...prev, from: false }));
      setSearchResults(prev => ({ ...prev, from: [] }));
      // Load live timings for from station
      loadLiveTimings(station.name);
    } else {
      setToStation(station.name);
      setShowDropdown(prev => ({ ...prev, to: false }));
      setSearchResults(prev => ({ ...prev, to: [] }));
    }
  };

  const loadLiveTimings = async (stationName) => {
    try {
      const timings = await MetroService.getLiveTimings(stationName);
      setLiveTimings(timings);
    } catch (err) {
      console.error('Failed to load live timings:', err);
    }
  };

  const findMetroRoute = async () => {
    if (!fromStation || !toStation) {
      setError('Please select both from and to stations');
      return;
    }

    if (fromStation === toStation) {
      setError('From and to stations cannot be the same');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const route = await MetroService.getMetroRoute(fromStation, toStation);
      setRouteInfo(route.route);
    } catch (err) {
      setError(err.message || 'Failed to find metro route');
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setFromStation('');
    setToStation('');
    setRouteInfo(null);
    setLiveTimings(null);
    setError('');
    setSearchResults({ from: [], to: [] });
  };

  return (
    <div className="metro-navigation">
      <div className="metro-header">
        <h2>Chennai Metro Navigation</h2>
        {metroStatus && (
          <div className="metro-status">
            <span className={`status-indicator ${metroStatus.operational ? 'operational' : 'disrupted'}`}>
              {metroStatus.operational ? '🟢 Operational' : '🔴 Disrupted'}
            </span>
            <small>Updated: {new Date(metroStatus.timestamp).toLocaleTimeString('en-IN')}</small>
          </div>
        )}
      </div>

      <div className="metro-form">
        <div className="station-input-group">
          <div className="station-input">
            <label htmlFor="from-station">From Station</label>
            <input
              id="from-station"
              type="text"
              value={fromStation}
              onChange={(e) => {
                setFromStation(e.target.value);
                handleStationSearch(e.target.value, 'from');
              }}
              onFocus={() => handleInputFocus('from')}
              placeholder="Enter departure station"
              autoComplete="off"
            />
            {searchResults.from.length > 0 && showDropdown.from && (
              <div className="search-dropdown">
                <div className="dropdown-header">
                  <span>Select Departure Station ({searchResults.from.length} stations)</span>
                </div>
                {(() => {
                  const blueStations = searchResults.from.filter(s => s.line === 'Blue');
                  const greenStations = searchResults.from.filter(s => s.line === 'Green');
                  
                  return (
                    <>
                      {blueStations.length > 0 && (
                        <>
                          <div className="line-separator">
                            <span className="line-badge blue">Blue Line Stations ({blueStations.length})</span>
                          </div>
                          {blueStations.map((station, index) => (
                            <div
                              key={`blue-${index}`}
                              className="search-result-item"
                              onClick={() => selectStation(station, 'from')}
                            >
                              <div className="station-info">
                                <strong>{station.name}</strong>
                                <span className="station-details">
                                  <span className="station-code">({station.code})</span>
                                  <span className={`line-badge ${station.line.toLowerCase()}`}>
                                    {station.line} Line
                                  </span>
                                  <span className="zone-info">Zone {station.zone}</span>
                                </span>
                              </div>
                              {station.facilities && station.facilities.length > 0 && (
                                <div className="facilities">
                                  {station.facilities.slice(0, 3).map((facility, idx) => (
                                    <span key={idx} className="facility-badge">
                                      {facility === 'Escalator' && '🔄'}
                                      {facility === 'Lift' && '⬆️'}
                                      {facility === 'Parking' && '🚗'}
                                      {facility === 'Food Court' && '🍽️'}
                                      {facility === 'Airport Shuttle' && '✈️'}
                                      {facility}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                      
                      {greenStations.length > 0 && (
                        <>
                          <div className="line-separator">
                            <span className="line-badge green">Green Line Stations ({greenStations.length})</span>
                          </div>
                          {greenStations.map((station, index) => (
                            <div
                              key={`green-${index}`}
                              className="search-result-item"
                              onClick={() => selectStation(station, 'from')}
                            >
                              <div className="station-info">
                                <strong>{station.name}</strong>
                                <span className="station-details">
                                  <span className="station-code">({station.code})</span>
                                  <span className={`line-badge ${station.line.toLowerCase()}`}>
                                    {station.line} Line
                                  </span>
                                  <span className="zone-info">Zone {station.zone}</span>
                                </span>
                              </div>
                              {station.facilities && station.facilities.length > 0 && (
                                <div className="facilities">
                                  {station.facilities.slice(0, 3).map((facility, idx) => (
                                    <span key={idx} className="facility-badge">
                                      {facility === 'Escalator' && '🔄'}
                                      {facility === 'Lift' && '⬆️'}
                                      {facility === 'Parking' && '🚗'}
                                      {facility === 'Food Court' && '🍽️'}
                                      {facility === 'Airport Shuttle' && '✈️'}
                                      {facility}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="station-input">
            <label htmlFor="to-station">To Station</label>
            <input
              id="to-station"
              type="text"
              value={toStation}
              onChange={(e) => {
                setToStation(e.target.value);
                handleStationSearch(e.target.value, 'to');
              }}
              onFocus={() => handleInputFocus('to')}
              placeholder="Enter destination station"
              autoComplete="off"
            />
            {searchResults.to.length > 0 && showDropdown.to && (
              <div className="search-dropdown">
                <div className="dropdown-header">
                  <span>Select Destination Station ({searchResults.to.length} stations)</span>
                </div>
                {(() => {
                  const blueStations = searchResults.to.filter(s => s.line === 'Blue');
                  const greenStations = searchResults.to.filter(s => s.line === 'Green');
                  
                  return (
                    <>
                      {blueStations.length > 0 && (
                        <>
                          <div className="line-separator">
                            <span className="line-badge blue">Blue Line Stations ({blueStations.length})</span>
                          </div>
                          {blueStations.map((station, index) => (
                            <div
                              key={`blue-${index}`}
                              className="search-result-item"
                              onClick={() => selectStation(station, 'to')}
                            >
                              <div className="station-info">
                                <strong>{station.name}</strong>
                                <span className="station-details">
                                  <span className="station-code">({station.code})</span>
                                  <span className={`line-badge ${station.line.toLowerCase()}`}>
                                    {station.line} Line
                                  </span>
                                  <span className="zone-info">Zone {station.zone}</span>
                                </span>
                              </div>
                              {station.facilities && station.facilities.length > 0 && (
                                <div className="facilities">
                                  {station.facilities.slice(0, 3).map((facility, idx) => (
                                    <span key={idx} className="facility-badge">
                                      {facility === 'Escalator' && '🔄'}
                                      {facility === 'Lift' && '⬆️'}
                                      {facility === 'Parking' && '🚗'}
                                      {facility === 'Food Court' && '🍽️'}
                                      {facility === 'Airport Shuttle' && '✈️'}
                                      {facility}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                      
                      {greenStations.length > 0 && (
                        <>
                          <div className="line-separator">
                            <span className="line-badge green">Green Line Stations ({greenStations.length})</span>
                          </div>
                          {greenStations.map((station, index) => (
                            <div
                              key={`green-${index}`}
                              className="search-result-item"
                              onClick={() => selectStation(station, 'to')}
                            >
                              <div className="station-info">
                                <strong>{station.name}</strong>
                                <span className="station-details">
                                  <span className="station-code">({station.code})</span>
                                  <span className={`line-badge ${station.line.toLowerCase()}`}>
                                    {station.line} Line
                                  </span>
                                  <span className="zone-info">Zone {station.zone}</span>
                                </span>
                              </div>
                              {station.facilities && station.facilities.length > 0 && (
                                <div className="facilities">
                                  {station.facilities.slice(0, 3).map((facility, idx) => (
                                    <span key={idx} className="facility-badge">
                                      {facility === 'Escalator' && '🔄'}
                                      {facility === 'Lift' && '⬆️'}
                                      {facility === 'Parking' && '🚗'}
                                      {facility === 'Food Court' && '🍽️'}
                                      {facility === 'Airport Shuttle' && '✈️'}
                                      {facility}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="metro-actions">
          <button 
            onClick={findMetroRoute} 
            disabled={loading || !fromStation || !toStation}
            className="btn-primary"
          >
            {loading ? 'Finding Route...' : 'Find Metro Route'}
          </button>
          <button onClick={clearRoute} className="btn-secondary">
            Clear
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* Live Timings */}
      {liveTimings && (
        <div className="live-timings">
          <h3>Live Timings - {liveTimings.station}</h3>
          <p className="last-updated">Last updated: {liveTimings.lastUpdated}</p>
          <div className="timings-list">
            {liveTimings.timings.map((timing, index) => (
              <div key={index} className="timing-item">
                <div className="timing-info">
                  <span className={`line-badge ${timing.line.toLowerCase()}`}>
                    {timing.line} Line
                  </span>
                  <span className="direction">{timing.direction}</span>
                </div>
                <div className="arrival-info">
                  <span className="arrival-time">{timing.arrival}</span>
                  <span className="minutes-away">{timing.minutesAway} min</span>
                </div>
                <span className="platform">{timing.platform}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route Information */}
      {routeInfo && (
        <div className="route-info">
          <h3>Metro Route Details</h3>
          
          <div className="route-summary">
            {/* Route Information */}
            <div className="route-section">
              <h4>Metro Route Details</h4>
              <div className="route-stations">
                <span className="from-station">{routeInfo.from}</span>
                <span className="route-arrow">→</span>
                <span className="to-station">{routeInfo.to}</span>
              </div>
              
              <div className="route-details">
                <div className="detail-item">
                  <span className="label">Duration:</span>
                  <span className="value">{routeInfo.duration} minutes</span>
                </div>
                <div className="detail-item">
                  <span className="label">Distance:</span>
                  <span className="value">{routeInfo.distance} km</span>
                </div>
                <div className="detail-item">
                  <span className="label">Line:</span>
                  <span className="value">
                    <span className="line-indicator">{routeInfo.line}</span>
                  </span>
                </div>
                {routeInfo.interchange && (
                  <div className="detail-item">
                    <span className="label">Interchange:</span>
                    <span className="value interchange">Required</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fare Information */}
            <div className="route-section">
              <h4>Fare Information</h4>
              <div className="fare-options">
                <div className="fare-option">
                  <span className="fare-type">Token:</span>
                  <span className="fare-price">{MetroService.formatPrice(routeInfo.fare.token)}</span>
                </div>
                <div className="fare-option">
                  <span className="fare-type">Metro Card:</span>
                  <span className="fare-price">{MetroService.formatPrice(routeInfo.fare.card)}</span>
                  <span className="savings">(Save ₹{routeInfo.fare.token - routeInfo.fare.card})</span>
                </div>
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="route-section">
              <h4>Accessibility Features</h4>
              <div className="accessibility-features">
                <div className={`feature ${routeInfo.accessibility.wheelchairAccessible ? 'available' : 'unavailable'}`}>
                  <span className="icon">♿</span>
                  <span>Wheelchair Accessible</span>
                </div>
                <div className={`feature ${routeInfo.accessibility.escalators ? 'available' : 'unavailable'}`}>
                  <span className="icon">🔄</span>
                  <span>Escalators</span>
                </div>
                <div className={`feature ${routeInfo.accessibility.parking ? 'available' : 'unavailable'}`}>
                  <span className="icon">🚗</span>
                  <span>Parking Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metro Status */}
      {metroStatus && (
        <div className="metro-status-details">
          <h3>Metro Network Status</h3>
          <div className="lines-status">
            {Object.entries(metroStatus.lines).map(([line, status]) => (
              <div key={line} className="line-status">
                <span className={`line-badge ${line.toLowerCase()}`}>{line} Line</span>
                <span className={`status ${status.status.toLowerCase()}`}>{status.status}</span>
                <span className="frequency">Frequency: {status.frequency}</span>
                {status.delay > 0 && (
                  <span className="delay">Delay: {status.delay} min</span>
                )}
              </div>
            ))}
          </div>
          
          {metroStatus.announcements && metroStatus.announcements.length > 0 && (
            <div className="announcements">
              <h4>Service Announcements</h4>
              <ul>
                {metroStatus.announcements.map((announcement, index) => (
                  <li key={index}>{announcement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetroNavigation;
