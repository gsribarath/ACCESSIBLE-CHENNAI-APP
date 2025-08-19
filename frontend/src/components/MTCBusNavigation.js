import React, { useState, useEffect } from 'react';
import MTCBusService from '../services/MTCBusService';

const MTCBusNavigation = () => {
  const [fromArea, setFromArea] = useState('');
  const [toArea, setToArea] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ from: [], to: [], routes: [], areas: [], stops: [] });
  const [busRoutes, setBusRoutes] = useState([]);
  const [liveBusTimings, setLiveBusTimings] = useState(null);
  const [mtcStatus, setMTCStatus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState('route-search'); // 'route-search', 'live-timings', 'route-info'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState({ from: false, to: false, search: false });

  useEffect(() => {
    loadMTCStatus();
    
    // Handle click outside to close dropdowns
    const handleClickOutside = (event) => {
      if (!event.target.closest('.bus-input-container')) {
        setShowDropdown({ from: false, to: false, search: false });
        setSearchResults({ from: [], to: [], routes: [], areas: [], stops: [] });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadMTCStatus = async () => {
    try {
      const status = await MTCBusService.getMTCStatus();
      setMTCStatus(status);
    } catch (err) {
      console.error('Failed to load MTC status:', err);
    }
  };

  const handleAreaSearch = (query, type) => {
    if (!query) {
      setSearchResults(prev => ({ ...prev, [type]: [] }));
      return;
    }
    
    const areas = MTCBusService.getAllAreas().filter(area =>
      area.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(prev => ({ ...prev, [type]: areas.slice(0, 8) }));
  };

  const handleGeneralSearch = (query) => {
    if (!query || query.length < 2) {
      setSearchResults(prev => ({ ...prev, routes: [], areas: [], stops: [] }));
      return;
    }
    
    const results = MTCBusService.searchAll(query);
    setSearchResults(prev => ({ ...prev, ...results }));
  };

  const selectArea = (area, type) => {
    if (type === 'from') {
      setFromArea(area);
      setShowDropdown(prev => ({ ...prev, from: false }));
    } else {
      setToArea(area);
      setShowDropdown(prev => ({ ...prev, to: false }));
    }
    setSearchResults(prev => ({ ...prev, [type]: [] }));
  };

  const searchBusRoutes = async () => {
    if (!fromArea || !toArea) {
      setError('Please select both starting point and destination');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const routes = MTCBusService.getRoutesBetween(fromArea, toArea);
      setBusRoutes(routes);
      
      if (routes.length === 0) {
        setError('No direct bus routes found. Try searching nearby areas or use connecting routes.');
      }
    } catch (err) {
      setError('Failed to find bus routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadLiveBusTimings = async (busStop) => {
    setLoading(true);
    try {
      const timings = await MTCBusService.getLiveBusTimings(busStop);
      setLiveBusTimings(timings);
    } catch (err) {
      setError('Failed to load live bus timings');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setFromArea('');
    setToArea('');
    setSearchQuery('');
    setBusRoutes([]);
    setLiveBusTimings(null);
    setSelectedRoute(null);
    setError('');
    setSearchResults({ from: [], to: [], routes: [], areas: [], stops: [] });
  };

  return (
    <div className="mtc-bus-navigation">
      {/* Header */}
      <div className="mtc-header">
        <h2>MTC Bus Services</h2>
        {mtcStatus && (
          <div className="mtc-status">
            <span className={`status-indicator ${mtcStatus.operational ? 'operational' : 'disrupted'}`}>
              {mtcStatus.operational ? '🟢 Operational' : '🔴 Disrupted'}
            </span>
            <div className="fleet-info">
              <small>{mtcStatus.totalBuses} Buses • {mtcStatus.totalRoutes} Routes</small>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'route-search' ? 'active' : ''}`}
          onClick={() => setActiveTab('route-search')}
        >
          Route Search
        </button>
        <button
          className={`tab-button ${activeTab === 'live-timings' ? 'active' : ''}`}
          onClick={() => setActiveTab('live-timings')}
        >
          Live Timings
        </button>
        <button
          className={`tab-button ${activeTab === 'route-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('route-info')}
        >
          Route Info
        </button>
      </div>

      {/* Route Search Tab */}
      {activeTab === 'route-search' && (
        <div className="route-search-section">
          <h3>Find Bus Routes</h3>
          
          <div className="route-inputs">
            <div className="bus-input-container">
              <label>From</label>
              <input
                type="text"
                value={fromArea}
                onChange={(e) => {
                  setFromArea(e.target.value);
                  handleAreaSearch(e.target.value, 'from');
                  setShowDropdown(prev => ({ ...prev, from: true }));
                }}
                onFocus={() => {
                  handleAreaSearch(fromArea, 'from');
                  setShowDropdown(prev => ({ ...prev, from: true }));
                }}
                placeholder="Enter starting area"
                autoComplete="off"
              />
              {searchResults.from.length > 0 && showDropdown.from && (
                <div className="search-dropdown">
                  <div className="dropdown-header">Areas ({searchResults.from.length})</div>
                  {searchResults.from.map((area, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      onClick={() => selectArea(area, 'from')}
                    >
                      📍 {area}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bus-input-container">
              <label>To</label>
              <input
                type="text"
                value={toArea}
                onChange={(e) => {
                  setToArea(e.target.value);
                  handleAreaSearch(e.target.value, 'to');
                  setShowDropdown(prev => ({ ...prev, to: true }));
                }}
                onFocus={() => {
                  handleAreaSearch(toArea, 'to');
                  setShowDropdown(prev => ({ ...prev, to: true }));
                }}
                placeholder="Enter destination area"
                autoComplete="off"
              />
              {searchResults.to.length > 0 && showDropdown.to && (
                <div className="search-dropdown">
                  <div className="dropdown-header">Areas ({searchResults.to.length})</div>
                  {searchResults.to.map((area, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      onClick={() => selectArea(area, 'to')}
                    >
                      📍 {area}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="search-actions">
            <button 
              onClick={searchBusRoutes} 
              disabled={loading || !fromArea || !toArea}
              className="btn-primary"
            >
              {loading ? 'Searching...' : 'Find Bus Routes'}
            </button>
            <button onClick={clearSearch} className="btn-secondary">
              Clear
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Bus Routes Results */}
          {busRoutes.length > 0 && (
            <div className="bus-routes-results">
              <h4>Available Bus Routes ({busRoutes.length})</h4>
              <div className="routes-list">
                {busRoutes.map((route, index) => (
                  <div key={index} className="route-card">
                    <div className="route-header">
                      <span className="route-number">{route.routeNumber}</span>
                      <span className={`route-type ${route.type.toLowerCase()}`}>
                        {route.type}
                      </span>
                      <span className="route-time">
                        ~{route.estimatedTime} min
                      </span>
                    </div>
                    
                    <div className="route-name">{route.name}</div>
                    
                    <div className="route-details">
                      <div className="route-path">
                        <span className="from-stop">{route.fromStop}</span>
                        <span className="arrow">→</span>
                        <span className="to-stop">{route.toStop}</span>
                      </div>
                      
                      <div className="route-info">
                        <span className="frequency">Every {route.frequency}</span>
                        <span className="fare">₹{route.fare.ordinary} - ₹{route.fare.deluxe}</span>
                        <span className="hours">{route.operatingHours}</span>
                      </div>

                      {route.accessibility && route.accessibility.length > 0 && (
                        <div className="accessibility-tags">
                          {route.accessibility.map((feature, idx) => (
                            <span key={idx} className="accessibility-tag">
                              {feature === 'Low Floor' && '♿'}
                              {feature === 'Wheelchair Accessible' && '♿'}
                              {feature === 'AC Available' && '❄️'}
                              {feature === 'AC' && '❄️'}
                              {feature === 'USB Charging' && '🔌'}
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Timings Tab */}
      {activeTab === 'live-timings' && (
        <div className="live-timings-section">
          <h3>Live Bus Timings</h3>
          
          <div className="bus-input-container">
            <label>Select Bus Stop</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleGeneralSearch(e.target.value);
                setShowDropdown(prev => ({ ...prev, search: true }));
              }}
              placeholder="Search bus stops, areas, or routes"
              autoComplete="off"
            />
            {(searchResults.stops.length > 0 || searchResults.areas.length > 0) && showDropdown.search && (
              <div className="search-dropdown">
                {searchResults.stops.length > 0 && (
                  <>
                    <div className="dropdown-header">Bus Stops</div>
                    {searchResults.stops.map((stop, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onClick={() => {
                          setSearchQuery(stop);
                          loadLiveBusTimings(stop);
                          setShowDropdown(prev => ({ ...prev, search: false }));
                        }}
                      >
                        🚏 {stop}
                      </div>
                    ))}
                  </>
                )}
                {searchResults.areas.length > 0 && (
                  <>
                    <div className="dropdown-header">Areas</div>
                    {searchResults.areas.map((area, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onClick={() => {
                          setSearchQuery(area);
                          loadLiveBusTimings(area);
                          setShowDropdown(prev => ({ ...prev, search: false }));
                        }}
                      >
                        📍 {area}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Live Timings Display */}
          {liveBusTimings && (
            <div className="live-timings-display">
              <h4>🚏 {liveBusTimings.busStop}</h4>
              <p className="last-updated">Last updated: {liveBusTimings.lastUpdated}</p>
              
              <div className="bus-timings-list">
                {liveBusTimings.timings.map((timing, index) => (
                  <div key={index} className="timing-card">
                    <div className="timing-header">
                      <span className="route-number">{timing.routeNumber}</span>
                      <span className={`route-type ${timing.type.toLowerCase()}`}>
                        {timing.type}
                      </span>
                      <div className="arrival-time">
                        <span className="next-arrival">{timing.nextArrival}</span>
                        <span className="minutes-away">{timing.minutesAway} min away</span>
                      </div>
                    </div>
                    
                    <div className="route-name">{timing.routeName}</div>
                    
                    <div className="timing-details">
                      <span className="frequency">Next: {timing.nextBus}</span>
                      <span className="fare">₹{timing.fare.ordinary}</span>
                      <span className="frequency-info">Every {timing.frequency}</span>
                    </div>

                    {timing.accessibility && timing.accessibility.length > 0 && (
                      <div className="accessibility-info">
                        {timing.accessibility.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="accessibility-badge">
                            {feature === 'Low Floor' && '♿'}
                            {feature === 'Wheelchair Accessible' && '♿'}
                            {feature === 'AC Available' && '❄️'}
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Route Info Tab */}
      {activeTab === 'route-info' && (
        <div className="route-info-section">
          <h3>Route Information</h3>
          
          <div className="bus-input-container">
            <label>Search Routes</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleGeneralSearch(e.target.value);
                setShowDropdown(prev => ({ ...prev, search: true }));
              }}
              placeholder="Search by route number, name, or area"
              autoComplete="off"
            />
            {searchResults.routes.length > 0 && showDropdown.search && (
              <div className="search-dropdown">
                <div className="dropdown-header">Routes ({searchResults.routes.length})</div>
                {searchResults.routes.map((route, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => {
                      setSelectedRoute(route);
                      setSearchQuery(`${route.routeNumber} - ${route.name}`);
                      setShowDropdown(prev => ({ ...prev, search: false }));
                    }}
                  >
                    <div className="route-search-item">
                      <span className="route-number">{route.routeNumber}</span>
                      <span className="route-name">{route.name}</span>
                      <span className={`route-type ${route.type.toLowerCase()}`}>
                        {route.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Route Details */}
          {selectedRoute && (
            <div className="selected-route-details">
              <div className="route-detail-header">
                <h4>Route {selectedRoute.routeNumber}: {selectedRoute.name}</h4>
                <span className={`route-type-badge ${selectedRoute.type.toLowerCase()}`}>
                  {selectedRoute.type}
                </span>
              </div>

              <div className="route-detail-grid">
                <div className="detail-section">
                  <h5>Service Information</h5>
                  <div className="detail-item">
                    <span className="label">Operating Hours:</span>
                    <span className="value">{selectedRoute.operatingHours}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Frequency:</span>
                    <span className="value">{selectedRoute.frequency}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Distance:</span>
                    <span className="value">{selectedRoute.distance}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h5>Fare Information</h5>
                  <div className="detail-item">
                    <span className="label">Ordinary:</span>
                    <span className="value">₹{selectedRoute.fare.ordinary}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Deluxe:</span>
                    <span className="value">₹{selectedRoute.fare.deluxe}</span>
                  </div>
                  <div className="special-offers">
                    <div className="offer">🆓 Free for women (ordinary buses)</div>
                    <div className="offer">♿ Free for disabled with attender</div>
                  </div>
                </div>
              </div>

              <div className="route-stops">
                <h5>Key Stops</h5>
                <div className="stops-list">
                  {selectedRoute.keyStops.map((stop, index) => (
                    <div key={index} className="stop-item">
                      <span className="stop-number">{index + 1}</span>
                      <span className="stop-name">{stop}</span>
                      {index < selectedRoute.keyStops.length - 1 && (
                        <span className="stop-connector">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedRoute.accessibility && selectedRoute.accessibility.length > 0 && (
                <div className="accessibility-section">
                  <h5>Accessibility Features</h5>
                  <div className="accessibility-features">
                    {selectedRoute.accessibility.map((feature, index) => (
                      <span key={index} className="accessibility-feature">
                        {feature === 'Low Floor' && '♿ '}
                        {feature === 'Wheelchair Accessible' && '♿ '}
                        {feature === 'AC Available' && '❄️ '}
                        {feature === 'AC' && '❄️ '}
                        {feature === 'USB Charging' && '🔌 '}
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MTC Service Status */}
      {mtcStatus && (
        <div className="mtc-service-status">
          <h3>MTC Service Information</h3>
          
          <div className="service-stats">
            <div className="stat-item">
              <span className="stat-number">{mtcStatus.totalBuses}</span>
              <span className="stat-label">Total Buses</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{mtcStatus.totalRoutes}</span>
              <span className="stat-label">Bus Routes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{mtcStatus.serviceAreas}</span>
              <span className="stat-label">Service Areas</span>
            </div>
          </div>

          {mtcStatus.announcements && mtcStatus.announcements.length > 0 && (
            <div className="service-announcements">
              <h4>Service Announcements</h4>
              <ul>
                {mtcStatus.announcements.map((announcement, index) => (
                  <li key={index}>{announcement}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="contact-info">
            <h4>Contact Information</h4>
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-label">Customer Care:</span>
                <span className="contact-value">📞 9445030516</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Toll Free:</span>
                <span className="contact-value">📞 149</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Website:</span>
                <span className="contact-value">🌐 mtcbus.tn.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MTCBusNavigation;
