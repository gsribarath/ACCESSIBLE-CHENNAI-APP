import React, { useState, useRef, useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import LocationService from '../services/LocationService';

const LocationDropdown = ({ 
  selectedLocation,
  onLocationSelect,
  placeholder = "Select location",
  showCurrentLocation = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const dropdownRef = useRef(null);
  
  const { getTextStyles, getCardStyles } = usePreferences();

  // Chennai locations database
  const chennaiLocations = [
    // Metro Stations
    { name: 'Chennai Central Metro', category: 'Metro Station', lat: 13.0836, lng: 80.2765 },
    { name: 'Government Estate Metro', category: 'Metro Station', lat: 13.0697, lng: 80.2598 },
    { name: 'LIC Metro', category: 'Metro Station', lat: 13.0653, lng: 80.2548 },
    { name: 'Thousand Lights Metro', category: 'Metro Station', lat: 13.0607, lng: 80.2498 },
    { name: 'Anna Nagar East Metro', category: 'Metro Station', lat: 13.0850, lng: 80.2101 },
    { name: 'Shenoy Nagar Metro', category: 'Metro Station', lat: 13.0789, lng: 80.2289 },
    { name: 'Vadapalani Metro', category: 'Metro Station', lat: 13.0501, lng: 80.2125 },
    { name: 'Ashok Nagar Metro', category: 'Metro Station', lat: 13.0356, lng: 80.2089 },

    // Shopping Areas
    { name: 'T. Nagar', category: 'Shopping Area', lat: 13.0418, lng: 80.2341 },
    { name: 'Express Avenue Mall', category: 'Shopping Area', lat: 13.0673, lng: 80.2564 },
    { name: 'Phoenix MarketCity', category: 'Shopping Area', lat: 13.0843, lng: 80.2101 },
    { name: 'Spencer Plaza', category: 'Shopping Area', lat: 13.0673, lng: 80.2564 },
    { name: 'Forum Vijaya Mall', category: 'Shopping Area', lat: 13.0501, lng: 80.2125 },
    { name: 'Chennai Citi Centre', category: 'Shopping Area', lat: 13.0298, lng: 80.1789 },
    { name: 'VR Chennai', category: 'Shopping Area', lat: 13.0067, lng: 80.2069 },

    // Hospitals
    { name: 'Apollo Hospital Greams Road', category: 'Hospital', lat: 13.0607, lng: 80.2498 },
    { name: 'Apollo Hospital Vanagaram', category: 'Hospital', lat: 13.1298, lng: 80.1547 },
    { name: 'Fortis Malar Hospital', category: 'Hospital', lat: 13.0607, lng: 80.2465 },
    { name: 'Global Hospitals', category: 'Hospital', lat: 13.0298, lng: 80.2198 },
    { name: 'MIOT International', category: 'Hospital', lat: 12.9141, lng: 80.1547 },
    { name: 'Sankara Nethralaya', category: 'Hospital', lat: 13.0673, lng: 80.2698 },

    // Educational Institutions
    { name: 'IIT Madras', category: 'Educational Institution', lat: 12.9916, lng: 80.2336 },
    { name: 'Anna University', category: 'Educational Institution', lat: 13.0110, lng: 80.2335 },
    { name: 'University of Madras', category: 'Educational Institution', lat: 13.0878, lng: 80.2785 },
    { name: 'Loyola College', category: 'Educational Institution', lat: 13.0067, lng: 80.2498 },
    { name: 'Presidency College', category: 'Educational Institution', lat: 13.0836, lng: 80.2765 },
    { name: 'Madras Christian College', category: 'Educational Institution', lat: 12.9141, lng: 80.1898 },

    // IT Parks & Business Districts
    { name: 'Tidel Park', category: 'IT Park', lat: 13.0140, lng: 80.2336 },
    { name: 'DLF IT Park', category: 'IT Park', lat: 13.0140, lng: 80.1547 },
    { name: 'Olympia Tech Park', category: 'IT Park', lat: 13.0298, lng: 80.1789 },
    { name: 'ELCOT IT Park', category: 'IT Park', lat: 13.0298, lng: 80.1547 },
    { name: 'Shriram Gateway', category: 'IT Park', lat: 12.8956, lng: 80.2267 },

    // Tourist Spots
    { name: 'Marina Beach', category: 'Tourist Spot', lat: 13.0487, lng: 80.2824 },
    { name: 'Kapaleeshwarar Temple', category: 'Tourist Spot', lat: 13.0336, lng: 80.2698 },
    { name: 'San Thome Cathedral', category: 'Tourist Spot', lat: 13.0336, lng: 80.2769 },
    { name: 'Government Museum', category: 'Tourist Spot', lat: 13.0673, lng: 80.2598 },
    { name: 'Mahabalipuram', category: 'Tourist Spot', lat: 12.6208, lng: 80.1982 },
    { name: 'Fort St. George', category: 'Tourist Spot', lat: 13.0836, lng: 80.2889 },
    { name: 'Guindy National Park', category: 'Tourist Spot', lat: 13.0067, lng: 80.2336 },
    { name: 'Dakshina Chitra', category: 'Tourist Spot', lat: 12.8956, lng: 80.2498 },

    // Transport Hubs
    { name: 'Chennai Central Railway Station', category: 'Transport Hub', lat: 13.0836, lng: 80.2765 },
    { name: 'Chennai Egmore Railway Station', category: 'Transport Hub', lat: 13.0789, lng: 80.2598 },
    { name: 'Chennai International Airport', category: 'Transport Hub', lat: 12.9941, lng: 80.1709 },
    { name: 'Koyambedu Bus Terminus', category: 'Transport Hub', lat: 13.0789, lng: 80.1956 },
    { name: 'Tambaram Railway Station', category: 'Transport Hub', lat: 12.9141, lng: 80.1264 },

    // Popular Areas
    { name: 'Adyar', category: 'Popular Area', lat: 13.0067, lng: 80.2565 },
    { name: 'Besant Nagar', category: 'Popular Area', lat: 13.0001, lng: 80.2669 },
    { name: 'Anna Nagar', category: 'Popular Area', lat: 13.0850, lng: 80.2101 },
    { name: 'Velachery', category: 'Popular Area', lat: 12.9756, lng: 80.2198 },
    { name: 'OMR (Old Mahabalipuram Road)', category: 'Popular Area', lat: 12.9141, lng: 80.2267 },
    { name: 'Nungambakkam', category: 'Popular Area', lat: 13.0607, lng: 80.2398 },
    { name: 'Mylapore', category: 'Popular Area', lat: 13.0336, lng: 80.2698 },
    { name: 'Thiruvanmiyur', category: 'Popular Area', lat: 12.9825, lng: 80.2598 },

    // Beaches
    { name: 'Elliot\'s Beach', category: 'Beach', lat: 13.0067, lng: 80.2669 }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = chennaiLocations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered.slice(0, 8)); // Show max 8 results
    } else {
      setFilteredLocations(chennaiLocations.slice(0, 8));
    }
  }, [searchTerm]);

  const handleCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      const address = await LocationService.reverseGeocode(location.lat, location.lng);
      onLocationSelect({ ...location, name: address });
      setIsOpen(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get current location: ' + error.message);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleLocationClick = (location) => {
    onLocationSelect(location);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Metro Station': '🚇',
      'Shopping Area': '🛍️',
      'Hospital': '🏥',
      'Educational Institution': '🎓',
      'IT Park': '🏢',
      'Tourist Spot': '🏛️',
      'Transport Hub': '🚂',
      'Popular Area': '🏘️',
      'Beach': '🏖️'
    };
    return icons[category] || '📍';
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 16px',
          border: '2px solid var(--border-color)',
          borderRadius: 12,
          fontSize: 16,
          transition: 'all 0.2s',
          cursor: 'pointer',
          background: 'var(--card-bg)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderColor: isOpen ? 'var(--accent-color)' : 'var(--border-color)'
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {selectedLocation ? selectedLocation.name : placeholder}
        </span>
        <span style={{
          marginLeft: 8,
          fontSize: 12,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {/* GPS Button */}
      {showCurrentLocation && (
        <button
          onClick={handleCurrentLocation}
          disabled={gpsLoading}
          style={{
            position: 'absolute',
            right: 40,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '6px 8px',
            fontSize: 12,
            cursor: gpsLoading ? 'not-allowed' : 'pointer',
            opacity: gpsLoading ? 0.6 : 1,
            zIndex: 10
          }}
          title="Use current location"
        >
          {gpsLoading ? '...' : '📍'}
        </button>
      )}

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          marginTop: 4,
          ...getCardStyles(),
          border: '2px solid var(--accent-color)',
          borderRadius: 12,
          maxHeight: 320,
          overflowY: 'auto'
        }}>
          {/* Search Input */}
          <div style={{ padding: 12, borderBottom: '1px solid var(--border-color)' }}>
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)'
              }}
              autoFocus
            />
          </div>

          {/* Current Location Option */}
          {showCurrentLocation && (
            <div
              onClick={handleCurrentLocation}
              style={{
                padding: '12px 16px',
                cursor: gpsLoading ? 'not-allowed' : 'pointer',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: gpsLoading ? 'var(--hover-bg)' : 'transparent',
                opacity: gpsLoading ? 0.6 : 1,
                ':hover': {
                  background: 'var(--hover-bg)'
                }
              }}
            >
              <span style={{ fontSize: 16 }}>📍</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, ...getTextStyles('primary') }}>
                  {gpsLoading ? 'Getting location...' : 'Use Current Location'}
                </div>
                <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>
                  GPS Location
                </div>
              </div>
            </div>
          )}

          {/* Location Options */}
          {filteredLocations.map((location, index) => (
            <div
              key={index}
              onClick={() => handleLocationClick(location)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < filteredLocations.length - 1 ? '1px solid var(--border-color)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--hover-bg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 16 }}>
                {getCategoryIcon(location.category)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, ...getTextStyles('primary') }}>
                  {location.name}
                </div>
                <div style={{ fontSize: 12, ...getTextStyles('secondary') }}>
                  {location.category}
                </div>
              </div>
            </div>
          ))}

          {filteredLocations.length === 0 && searchTerm && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              ...getTextStyles('secondary')
            }}>
              No locations found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
