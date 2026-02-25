// Chennai Metro Real-time Data Service
// Integrates data from Chennai Metro Rail and YoMetro

class MetroService {
  constructor() {
    this.baseURL = 'https://tickets.chennaimetrorail.org';
    this.mapURL = 'https://yometro.com/chennai-metro-17';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Getter to access static METRO_STATIONS from instance
  get METRO_STATIONS() {
    return MetroService.METRO_STATIONS;
  }

  // Getter to access static FARE_STRUCTURE from instance
  get FARE_STRUCTURE() {
    return MetroService.FARE_STRUCTURE;
  }

  // Chennai Metro Stations with real coordinates and zones
  static METRO_STATIONS = {
    // Blue Line (Line 1) - Wimco Nagar Depot to Chennai International Airport
    'Wimco Nagar Depot': { 
      code: 'WND', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1543, 
      lng: 80.3012,
      facilities: ['Parking'],
      connections: []
    },
    'Wimco Nagar': { 
      code: 'WN', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1487, 
      lng: 80.2987,
      facilities: ['Parking'],
      connections: []
    },
    'Thiruvottriyur': { 
      code: 'TVR', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1423, 
      lng: 80.2943,
      facilities: [],
      connections: []
    },
    'Thiruvottriyur Theradi': { 
      code: 'TVRT', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1376, 
      lng: 80.2898,
      facilities: [],
      connections: []
    },
    'Kaladipet': { 
      code: 'KLD', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1312, 
      lng: 80.2854,
      facilities: [],
      connections: []
    },
    'Tollgate': { 
      code: 'TG', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1254, 
      lng: 80.2812,
      facilities: [],
      connections: []
    },
    'New Washermanpet': { 
      code: 'NWP', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1198, 
      lng: 80.2776,
      facilities: [],
      connections: []
    },
    'Tondiarpet': { 
      code: 'TNP', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1143, 
      lng: 80.2734,
      facilities: [],
      connections: []
    },
    'Sir Theagaraya College': { 
      code: 'STC', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1087, 
      lng: 80.2689,
      facilities: [],
      connections: []
    },
    'Washermanpet': { 
      code: 'WMP', 
      line: 'Blue', 
      zone: 1,
      lat: 13.1043, 
      lng: 80.2767,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: []
    },
    'Mannadi': { 
      code: 'MAN', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0947, 
      lng: 80.2826,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'High Court': { 
      code: 'HC', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0884, 
      lng: 80.2854,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: []
    },
    'MGR Central (Chennai Central)': { 
      code: 'MS', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0827, 
      lng: 80.2707,
      facilities: ['Escalator', 'Lift', 'Parking', 'Food Court'],
      connections: ['Railway Station', 'Bus Terminal', 'Green Line Interchange']
    },
    'Government Estate': { 
      code: 'GE', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0732, 
      lng: 80.2609,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: []
    },
    'LIC': { 
      code: 'LIC', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0676, 
      lng: 80.2548,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Thousand Lights': { 
      code: 'TL', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0615, 
      lng: 80.2482,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: []
    },
    'AG DMS': { 
      code: 'AGDMS', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0565, 
      lng: 80.2425,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Teynampet': { 
      code: 'TNP', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0479, 
      lng: 80.2343,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: []
    },
    'Nandanam': { 
      code: 'NAN', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0398, 
      lng: 80.2275,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Saidapet': { 
      code: 'SAI', 
      line: 'Blue', 
      zone: 1,
      lat: 13.0321, 
      lng: 80.2234,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: ['Bus Terminal']
    },
    'Little Mount': { 
      code: 'LM', 
      line: 'Blue', 
      zone: 2,
      lat: 13.0187, 
      lng: 80.2165,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: []
    },
    'Guindy': { 
      code: 'GUI', 
      line: 'Blue', 
      zone: 2,
      lat: 13.0067, 
      lng: 80.2101,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: ['Railway Station']
    },
    'Arignar Anna Alandur': { 
      code: 'ALA', 
      line: 'Blue', 
      zone: 2,
      lat: 12.9954, 
      lng: 80.2067,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: ['Railway Station', 'Bus Terminal', 'Green Line Interchange']
    },
    'Nanganallur Road': { 
      code: 'NGL', 
      line: 'Blue', 
      zone: 2,
      lat: 12.9823, 
      lng: 80.1987,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Meenambakkam': { 
      code: 'MBM', 
      line: 'Blue', 
      zone: 2,
      lat: 12.9765, 
      lng: 80.1865,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: []
    },
    'Chennai International Airport': { 
      code: 'AIR', 
      line: 'Blue', 
      zone: 2,
      lat: 12.9941, 
      lng: 80.1709,
      facilities: ['Escalator', 'Lift', 'Parking', 'Airport Shuttle'],
      connections: ['Chennai Airport Terminal 1', 'Airport Terminal 3']
    },

    // Green Line (Line 2) - MGR Central to St. Thomas Mount
    'Egmore': { 
      code: 'EGM', 
      line: 'Green', 
      zone: 1,
      lat: 13.0732, 
      lng: 80.2609,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: ['Railway Station']
    },
    'Nehru Park': { 
      code: 'NP', 
      line: 'Green', 
      zone: 1,
      lat: 13.0789, 
      lng: 80.2487,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Kilpauk Medical College': { 
      code: 'KMC', 
      line: 'Green', 
      zone: 1,
      lat: 13.0834, 
      lng: 80.2398,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Pachaiyappa College': { 
      code: 'PC', 
      line: 'Green', 
      zone: 1,
      lat: 13.0876, 
      lng: 80.2312,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Shenoy Nagar': { 
      code: 'SN', 
      line: 'Green', 
      zone: 1,
      lat: 13.0732, 
      lng: 80.2234,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: []
    },
    'Anna Nagar East': { 
      code: 'ANE', 
      line: 'Green', 
      zone: 1,
      lat: 13.0876, 
      lng: 80.2145,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Anna Nagar Tower': { 
      code: 'ANT', 
      line: 'Green', 
      zone: 1,
      lat: 13.0934, 
      lng: 80.2087,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Thirumangalam': { 
      code: 'TM', 
      line: 'Green', 
      zone: 1,
      lat: 13.0987, 
      lng: 80.2023,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Koyambedu': { 
      code: 'KYB', 
      line: 'Green', 
      zone: 1,
      lat: 13.1043, 
      lng: 80.1954,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: ['Bus Terminal']
    },
    'CMBT': { 
      code: 'CMBT', 
      line: 'Green', 
      zone: 1,
      lat: 13.1098, 
      lng: 80.1887,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: ['Major Bus Terminal']
    },
    'Arumbakkam': { 
      code: 'ABK', 
      line: 'Green', 
      zone: 1,
      lat: 13.1154, 
      lng: 80.1823,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Vadapalani': { 
      code: 'VDP', 
      line: 'Green', 
      zone: 1,
      lat: 13.1023, 
      lng: 80.1765,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Ashok Nagar': { 
      code: 'ASN', 
      line: 'Green', 
      zone: 1,
      lat: 13.0967, 
      lng: 80.1698,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'Ekkattuthangal': { 
      code: 'EKT', 
      line: 'Green', 
      zone: 2,
      lat: 13.0021, 
      lng: 80.2054,
      facilities: ['Escalator', 'Lift'],
      connections: []
    },
    'St Thomas Mount': { 
      code: 'STM', 
      line: 'Green', 
      zone: 2,
      lat: 13.0021, 
      lng: 80.2054,
      facilities: ['Escalator', 'Lift', 'Parking'],
      connections: ['Railway Station']
    }
  };

  // Metro fare structure based on zones
  static FARE_STRUCTURE = {
    zone1_to_zone1: { 
      min: 20, 
      max: 30,
      token: 20,
      card: 18 
    },
    zone1_to_zone2: { 
      min: 30, 
      max: 50,
      token: 40,
      card: 36 
    },
    zone2_to_zone2: { 
      min: 20, 
      max: 30,
      token: 25,
      card: 22 
    }
  };

  // Get station information
  getStationInfo(stationName) {
    const station = MetroService.METRO_STATIONS[stationName];
    if (!station) {
      // Try fuzzy matching
      const normalizedInput = stationName.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [name, info] of Object.entries(MetroService.METRO_STATIONS)) {
        const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normalizedName.includes(normalizedInput) || normalizedInput.includes(normalizedName)) {
          return { name, ...info };
        }
      }
      return null;
    }
    return { name: stationName, ...station };
  }

  // Calculate metro fare between stations
  calculateFare(fromStation, toStation) {
    const from = this.getStationInfo(fromStation);
    const to = this.getStationInfo(toStation);
    
    if (!from || !to) {
      return {
        error: 'Station not found',
        fare: null
      };
    }

    const fromZone = from.zone;
    const toZone = to.zone;
    
    let fareType;
    if (fromZone === 1 && toZone === 1) {
      fareType = 'zone1_to_zone1';
    } else if ((fromZone === 1 && toZone === 2) || (fromZone === 2 && toZone === 1)) {
      fareType = 'zone1_to_zone2';
    } else {
      fareType = 'zone2_to_zone2';
    }

    const fareInfo = MetroService.FARE_STRUCTURE[fareType];
    
    return {
      from: from.name,
      to: to.name,
      distance: this.calculateDistance(from.lat, from.lng, to.lat, to.lng),
      fare: {
        token: fareInfo.token,
        card: fareInfo.card,
        currency: 'INR'
      },
      duration: this.estimateTravelTime(from, to),
      line: from.line === to.line ? from.line : 'Interchange',
      interchange: from.line !== to.line
    };
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 100) / 100; // Round to 2 decimal places
  }

  // Estimate travel time
  estimateTravelTime(from, to) {
    const distance = this.calculateDistance(from.lat, from.lng, to.lat, to.lng);
    // Metro average speed ~40 km/h + 2 minutes per station
    const stationCount = this.getStationCount(from, to);
    const travelTime = (distance / 40) * 60; // Convert to minutes
    const stationTime = stationCount * 2; // 2 minutes per station
    const interchangeTime = from.line !== to.line ? 5 : 0; // 5 minutes for interchange
    
    return Math.round(travelTime + stationTime + interchangeTime);
  }

  // Get station count between two stations (simplified)
  getStationCount(from, to) {
    // This is a simplified calculation
    // In a real implementation, you'd calculate the exact route
    const stations = Object.values(MetroService.METRO_STATIONS);
    const fromIndex = stations.findIndex(s => s.code === from.code);
    const toIndex = stations.findIndex(s => s.code === to.code);
    return Math.abs(toIndex - fromIndex);
  }

  // Cached all stations list for performance
  static _cachedAllStations = null;

  // Get all metro stations for autocomplete - optimized with caching
  getAllStations() {
    if (MetroService._cachedAllStations) {
      return MetroService._cachedAllStations;
    }
    
    MetroService._cachedAllStations = Object.keys(MetroService.METRO_STATIONS).map(name => ({
      name,
      ...MetroService.METRO_STATIONS[name]
    })).sort((a, b) => {
      // Sort by line first (Blue, then Green), then by name
      if (a.line !== b.line) {
        return a.line === 'Blue' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    return MetroService._cachedAllStations;
  }

  // Station search cache for performance
  static _searchCache = new Map();
  static _searchCacheMaxSize = 50;

  // Search stations by name - optimized with caching
  searchStations(query) {
    if (!query || query.length === 0) {
      // Return all stations if no query
      return this.getAllStations();
    }
    
    if (query.length < 2) {
      return [];
    }
    
    const normalized = query.toLowerCase();
    
    // Check cache
    if (MetroService._searchCache.has(normalized)) {
      return MetroService._searchCache.get(normalized);
    }
    
    // Clean cache if too large
    if (MetroService._searchCache.size > MetroService._searchCacheMaxSize) {
      const oldestKey = MetroService._searchCache.keys().next().value;
      MetroService._searchCache.delete(oldestKey);
    }
    
    const results = Object.keys(MetroService.METRO_STATIONS)
      .filter(name => 
        name.toLowerCase().includes(normalized) ||
        MetroService.METRO_STATIONS[name].code.toLowerCase().includes(normalized)
      )
      .map(name => ({
        name,
        ...MetroService.METRO_STATIONS[name]
      }))
      .sort((a, b) => {
        // Sort by line first (Blue, then Green), then by name
        if (a.line !== b.line) {
          return a.line === 'Blue' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    
    // Cache results
    MetroService._searchCache.set(normalized, results);
    return results;
  }

  // Get real-time metro status (simulated - in real app, this would fetch from API)
  async getMetroStatus() {
    // Cache check
    const cacheKey = 'metro_status';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Simulate API call to Chennai Metro
    const status = {
      timestamp: new Date().toISOString(),
      operational: true,
      lines: {
        Blue: {
          status: 'Normal',
          delay: 0,
          nextMaintenance: '2025-08-25',
          frequency: '4-6 minutes'
        },
        Green: {
          status: 'Normal', 
          delay: 0,
          nextMaintenance: '2025-08-23',
          frequency: '5-7 minutes'
        }
      },
      announcements: [
        'Metro services running normally',
        'Please maintain social distancing',
        'Masks mandatory in metro premises'
      ]
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: status,
      timestamp: Date.now()
    });

    return status;
  }

  // Get metro route between two stations
  async getMetroRoute(fromStation, toStation) {
    const from = this.getStationInfo(fromStation);
    const to = this.getStationInfo(toStation);
    
    if (!from || !to) {
      throw new Error('Station not found');
    }

    const fareInfo = this.calculateFare(fromStation, toStation);
    const status = await this.getMetroStatus();
    
    return {
      route: {
        from: from.name,
        to: to.name,
        line: fareInfo.line,
        interchange: fareInfo.interchange,
        duration: fareInfo.duration,
        distance: fareInfo.distance,
        fare: fareInfo.fare,
        steps: this.generateMetroSteps(from, to),
        accessibility: this.getAccessibilityInfo(from, to),
        realtime: {
          status: status.lines[from.line]?.status || 'Unknown',
          frequency: status.lines[from.line]?.frequency || 'Unknown',
          delay: status.lines[from.line]?.delay || 0
        }
      }
    };
  }

  // Generate step-by-step metro directions
  generateMetroSteps(from, to) {
    const steps = [];
    
    steps.push(`Board ${from.line} Line metro at ${from.name} station`);
    
    if (from.line !== to.line) {
      steps.push(`Travel to interchange station`);
      steps.push(`Change to ${to.line} Line`);
    }
    
    steps.push(`Travel towards ${to.name}`);
    steps.push(`Alight at ${to.name} station`);
    
    return steps;
  }

  // Get accessibility information
  getAccessibilityInfo(from, to) {
    const fromFacilities = from.facilities || [];
    const toFacilities = to.facilities || [];
    
    return {
      wheelchairAccessible: fromFacilities.includes('Lift') && toFacilities.includes('Lift'),
      escalators: fromFacilities.includes('Escalator') && toFacilities.includes('Escalator'),
      parking: fromFacilities.includes('Parking') || toFacilities.includes('Parking'),
      facilities: {
        from: fromFacilities,
        to: toFacilities
      }
    };
  }

  // Format price for display
  formatPrice(price) {
    return `₹${price}`;
  }

  // Get live train timings (simulated)
  async getLiveTimings(stationName) {
    const station = this.getStationInfo(stationName);
    if (!station) return null;

    // Simulate live timings
    const currentTime = new Date();
    const timings = [];
    
    for (let i = 0; i < 3; i++) {
      const arrivalTime = new Date(currentTime.getTime() + (i * 5 + 2) * 60000);
      timings.push({
        line: station.line,
        direction: i % 2 === 0 ? 'Northbound' : 'Southbound',
        arrival: arrivalTime.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        minutesAway: i * 5 + 2,
        platform: i % 2 === 0 ? 'Platform 1' : 'Platform 2'
      });
    }

    return {
      station: station.name,
      lastUpdated: currentTime.toLocaleTimeString('en-IN'),
      timings
    };
  }
}

export default new MetroService();
