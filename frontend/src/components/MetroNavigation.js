import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import MetroService from '../services/MetroService';
import { usePreferences } from '../context/PreferencesContext';

// Debounce helper for smooth performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const MetroNavigation = memo(() => {
  const { getCardStyles, getTextStyles } = usePreferences();
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [searchResults, setSearchResults] = useState({ from: [], to: [] });
  const [routeInfo, setRouteInfo] = useState(null);
  const [liveTimings, setLiveTimings] = useState(null);
  const [metroStatus, setMetroStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState({ from: false, to: false });
  const [showSchedule, setShowSchedule] = useState(false);
  const [searchQueryFrom, setSearchQueryFrom] = useState('');
  const [searchQueryTo, setSearchQueryTo] = useState('');
  const debouncedSearchFrom = useDebounce(searchQueryFrom, 100);
  const debouncedSearchTo = useDebounce(searchQueryTo, 100);

  // Memoized station search for performance
  const memoizedSearchStations = useMemo(() => {
    return (query) => MetroService.searchStations(query);
  }, []);

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

  const handleStationSearch = useCallback((query, type) => {
    // Use requestAnimationFrame for smooth UI
    requestAnimationFrame(() => {
      const results = MetroService.searchStations(query);
      setSearchResults(prev => ({ ...prev, [type]: results }));
      setShowDropdown(prev => ({ ...prev, [type]: true }));
    });
  }, []);

  const handleInputFocus = useCallback((type) => {
    // Show all stations when input is focused with requestAnimationFrame
    requestAnimationFrame(() => {
      const allStations = MetroService.getAllStations();
      setSearchResults(prev => ({ ...prev, [type]: allStations }));
      setShowDropdown(prev => ({ ...prev, [type]: true }));
    });
  }, []);

  const selectStation = useCallback((station, type) => {
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
  }, []);

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

  // Metro Schedule Data based on Chennai Metro Timetable
  const metroSchedule = {
    weekdays: {
      blueLineCorridor1: {
        route: "WIMCO NAGAR DEPOT ↔ AIRPORT (via WIMCO NAGAR, WASHERMANPET, CENTRAL, AGDMS, ALANDUR)",
        schedule: [
          {
            direction: "From Airport",
            firstTrain: "04:51Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 7 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 6 mins",
            extendedNonPeak: "2200-2300Hrs Every 15mins",
            specialNote: "3 mins frequency between Washermanpet & Alandur"
          },
          {
            direction: "From Wimco Nagar Depot",
            firstTrain: "04:56Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 7 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 6 mins",
            extendedNonPeak: "2200-2300Hrs Every 15mins"
          }
        ]
      },
      interCorridor: {
        route: "CHENNAI CENTRAL ↔ AIRPORT (via EGMORE, CMBT, ALANDUR)",
        schedule: [
          {
            direction: "From Chennai Central",
            firstTrain: "04:55Hrs",
            lastTrain: "23:17Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 14 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 12 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          },
          {
            direction: "From Airport",
            firstTrain: "05:02Hrs",
            lastTrain: "23:08Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 14 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 12 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          }
        ]
      },
      greenLineCorridor2: {
        route: "CHENNAI CENTRAL ↔ ST. THOMAS MOUNT (via EGMORE, CMBT, ALANDUR)",
        schedule: [
          {
            direction: "From Chennai Central",
            firstTrain: "05:02Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 14 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 12 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          },
          {
            direction: "From St. Thomas Mount",
            firstTrain: "05:01Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 14 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 12 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          }
        ]
      }
    },
    saturday: {
      blueLineCorridor1: {
        route: "WIMCO NAGAR DEPOT ↔ AIRPORT (via WIMCO NAGAR, WASHERMANPET, CENTRAL, AGDMS, ALANDUR)",
        schedule: [
          {
            direction: "From Airport",
            firstTrain: "04:51Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 7 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 6 mins",
            extendedNonPeak: "2200-2300Hrs Every 15mins"
          },
          {
            direction: "From Wimco Nagar Depot",
            firstTrain: "04:56Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 7 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 6 mins",
            extendedNonPeak: "2200-2300Hrs Every 15mins"
          }
        ]
      },
      interCorridor: {
        route: "CHENNAI CENTRAL ↔ AIRPORT (via EGMORE, CMBT, ALANDUR)",
        schedule: [
          {
            direction: "From Chennai Central",
            firstTrain: "04:55Hrs",
            lastTrain: "23:17Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 14 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 12 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          },
          {
            direction: "From Airport",
            firstTrain: "05:02Hrs",
            lastTrain: "23:08Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 14 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 12 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          }
        ]
      },
      greenLineCorridor2: {
        route: "CHENNAI CENTRAL ↔ ST. THOMAS MOUNT (via EGMORE, CMBT, ALANDUR)",
        schedule: [
          {
            direction: "From Chennai Central",
            firstTrain: "05:02Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 14 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 12 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          },
          {
            direction: "From St. Thomas Mount",
            firstTrain: "05:01Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-0800Hrs,1100-1700Hrs & 2000-2200Hrs Every 14 mins",
            peakFrequency: "0800-1100Hrs & 1700-2000Hrs Every 12 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          }
        ]
      }
    },
    sunday: {
      blueLineCorridor1: {
        route: "WIMCO NAGAR DEPOT ↔ AIRPORT (via WIMCO NAGAR, WASHERMANPET, CENTRAL, AGDMS, ALANDUR)",
        schedule: [
          {
            direction: "From Airport",
            firstTrain: "05:02Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-1200Hrs & 2000-2200 Every 10 mins",
            peakFrequency: "1200-2000Hrs Every 7 mins",
            extendedNonPeak: "2200-2300Hrs Every 15mins"
          },
          {
            direction: "From Wimco Nagar Depot",
            firstTrain: "05:03Hrs",
            lastTrain: "23:00Hrs",
            nonPeakFrequency: "0500-1200Hrs & 2000-2200 Every 10 mins",
            peakFrequency: "1200-2000Hrs Every 7 mins",
            extendedNonPeak: "2200-2300Hrs Every 15mins"
          }
        ]
      },
      interCorridor: {
        route: "CHENNAI CENTRAL ↔ AIRPORT (via EGMORE, CMBT, ALANDUR)",
        schedule: [
          {
            direction: "From Chennai Central",
            firstTrain: "05:01Hrs",
            lastTrain: "23:07Hrs",
            nonPeakFrequency: "0500-1200Hrs & 2000-2200 Every 20 mins",
            peakFrequency: "1200-2000Hrs Every 14 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          },
          {
            direction: "From Airport",
            firstTrain: "04:55Hrs",
            lastTrain: "23:08Hrs",
            nonPeakFrequency: "0500-1200Hrs & 2000-2200 Every 20 mins",
            peakFrequency: "1200-2000Hrs Every 14 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          }
        ]
      },
      greenLineCorridor2: {
        route: "CHENNAI CENTRAL ↔ ST. THOMAS MOUNT (via EGMORE, CMBT, ALANDUR)",
        schedule: [
          {
            direction: "From Chennai Central",
            firstTrain: "04:51Hrs",
            lastTrain: "23:17Hrs",
            nonPeakFrequency: "0500-1200Hrs & 2000-2200 Every 20 mins",
            peakFrequency: "1200-2000Hrs Every 14 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          },
          {
            direction: "From St. Thomas Mount",
            firstTrain: "04:51Hrs",
            lastTrain: "23:07Hrs",
            nonPeakFrequency: "0500-1200Hrs & 2000-2200 Every 20 mins",
            peakFrequency: "1200-2000Hrs Every 14 mins",
            extendedNonPeak: "2200-2300Hrs Every 30mins"
          }
        ]
      }
    }
  };

  const getCurrentSchedule = () => {
    const today = new Date().getDay();
    if (today === 0) return metroSchedule.sunday; // Sunday
    if (today === 6) return metroSchedule.saturday; // Saturday
    return metroSchedule.weekdays; // Monday to Friday
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

      {/* View Metro Schedule Button - Highlighted at Top */}
      <div className="metro-schedule-header">
        <button 
          onClick={() => setShowSchedule(!showSchedule)}
          className="btn-schedule-highlight"
          style={{
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '20px',
            boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
          }}
        >
          <span style={{ fontSize: '20px' }}>📅</span>
          {showSchedule ? 'Hide Metro Schedule' : 'View Metro Schedule'}
        </button>
      </div>

      {/* Metro Schedule Display */}
      {showSchedule && (
        <div className="metro-schedule-container" style={{
          ...getCardStyles(),
          border: '2px solid #007bff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 123, 255, 0.1)'
        }}>
          <div className="schedule-header" style={{
            textAlign: 'center',
            marginBottom: '24px',
            padding: '16px',
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            color: 'white',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
              Chennai Metro Timetable
            </h3>
            <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>
              {new Date().getDay() === 0 ? 'SUNDAY / HOLIDAYS' : 
               new Date().getDay() === 6 ? 'SATURDAY' : 
               'WEEKDAYS (MONDAY - FRIDAY)'} | 05:00hrs - 23:00hrs
            </p>
          </div>

          {Object.entries(getCurrentSchedule()).map(([corridorKey, corridor]) => (
            <div key={corridorKey} className="corridor-schedule" style={{
              marginBottom: '32px',
              border: `1px solid var(--border-color)`,
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--bg-secondary)'
            }}>
              <div className="corridor-header" style={{
                background: corridorKey.includes('blue') ? '#007bff' : 
                           corridorKey.includes('green') ? '#28a745' : '#17a2b8',
                color: 'white',
                padding: '16px',
                fontWeight: '600',
                fontSize: '16px',
                textAlign: 'center'
              }}>
                {corridorKey.includes('blue') ? 'CORRIDOR - 1 (BLUE LINE)' :
                 corridorKey.includes('green') ? 'CORRIDOR - 2 (GREEN LINE)' :
                 'INTER-CORRIDOR'}
              </div>
              <div className="route-title" style={{
                background: corridorKey.includes('blue') ? '#007bff' : 
                           corridorKey.includes('green') ? '#28a745' : '#17a2b8',
                color: 'white',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {corridor.route}
              </div>
              
              <div className="schedule-table">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                      <th style={{ padding: '12px', border: `1px solid var(--border-color)`, fontWeight: '600', fontSize: '14px', ...getTextStyles('primary') }}>
                        Departure Time of First train
                      </th>
                      <th style={{ padding: '12px', border: `1px solid var(--border-color)`, fontWeight: '600', fontSize: '14px', ...getTextStyles('primary') }}>
                        Departure Time of Last train
                      </th>
                      <th style={{ padding: '12px', border: `1px solid var(--border-color)`, fontWeight: '600', fontSize: '14px', ...getTextStyles('primary') }}>
                        Non peak hour Frequency
                      </th>
                      <th style={{ padding: '12px', border: `1px solid var(--border-color)`, fontWeight: '600', fontSize: '14px', ...getTextStyles('primary') }}>
                        Peak hour Frequency
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {corridor.schedule.map((schedule, index) => (
                      <tr key={index}>
                        <td style={{ padding: '12px', border: `1px solid var(--border-color)`, fontSize: '13px', ...getTextStyles('primary') }}>
                          <strong>{schedule.direction}:</strong> {schedule.firstTrain}
                        </td>
                        <td style={{ padding: '12px', border: `1px solid var(--border-color)`, fontSize: '13px', ...getTextStyles('primary') }}>
                          <strong>{schedule.direction}:</strong> {schedule.lastTrain}
                        </td>
                        <td style={{ padding: '12px', border: `1px solid var(--border-color)`, fontSize: '13px', ...getTextStyles('primary') }}>
                          {schedule.nonPeakFrequency}
                          {schedule.extendedNonPeak && (
                            <div style={{ color: '#dc3545', fontWeight: '600', marginTop: '4px' }}>
                              {schedule.extendedNonPeak}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px', border: `1px solid var(--border-color)`, fontSize: '13px', ...getTextStyles('primary') }}>
                          {schedule.peakFrequency}
                          {schedule.specialNote && (
                            <div style={{ color: '#28a745', fontSize: '12px', marginTop: '4px' }}>
                              {schedule.specialNote}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="schedule-notes" style={{
            background: 'var(--bg-tertiary)',
            border: `1px solid var(--border-color)`,
            borderRadius: '8px',
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.5',
            ...getTextStyles('primary')
          }}>
            <strong>NOTE:</strong>
            <br />
            1. Headway from Central ↔ Alandur (via CMBT) during peak hours, Non peak hours & <span style={{ color: '#dc3545', fontWeight: '600' }}>Extended Non peak hours</span> are maintained 6 mins, 7 mins and <span style={{ color: '#dc3545', fontWeight: '600' }}>15 mins</span> respectively.
            <br />
            2. No short loop service on {new Date().getDay() === 6 ? 'Saturdays' : new Date().getDay() === 0 ? 'Sundays' : 'Saturdays'}.
          </div>
        </div>
      )}

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
                <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Select Departure Station ({searchResults.from.length} stations)</span>
                  <button 
                    onClick={() => {
                      setShowDropdown(prev => ({ ...prev, from: false }));
                      setSearchResults(prev => ({ ...prev, from: [] }));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Close dropdown"
                  >
                    ✕
                  </button>
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
                <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Select Destination Station ({searchResults.to.length} stations)</span>
                  <button 
                    onClick={() => {
                      setShowDropdown(prev => ({ ...prev, to: false }));
                      setSearchResults(prev => ({ ...prev, to: [] }));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Close dropdown"
                  >
                    ✕
                  </button>
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
    </div>
  );
});

export default MetroNavigation;
