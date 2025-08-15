// Location service for GPS and geocoding functionality
class LocationService {
  static getLocationSuggestions(query) {
    // Chennai locations database for suggestions
    const locations = [
      // Metro Stations
      'Chennai Central Metro Station',
      'Airport Metro Station', 
      'Guindy Metro Station',
      'Anna Nagar Metro Station',
      'Thirumangalam Metro Station',
      'Koyambedu Metro Station',
      'Vadapalani Metro Station',
      'Ashok Nagar Metro Station',
      'Ekkattuthangal Metro Station',
      'Alandur Metro Station',
      'St. Thomas Mount Metro Station',
      'Meenambakkam Metro Station',
      
      // Railway Stations
      'Chennai Central Railway Station',
      'Chennai Egmore Railway Station',
      'Tambaram Railway Station',
      'Chromepet Railway Station',
      'Pallavaram Railway Station',
      'Mambalam Railway Station',
      'Kodambakkam Railway Station',
      'Nungambakkam Railway Station',
      'Chetpet Railway Station',
      'Villivakkam Railway Station',
      
      // Hospitals
      'Apollo Hospital Greams Road',
      'Apollo Hospital Vanagaram',
      'Fortis Malar Hospital',
      'MIOT International Hospital',
      'Government General Hospital',
      'Stanley Medical College',
      'Voluntary Health Services Hospital',
      'Sri Ramachandra Medical Centre',
      'Global Health City',
      'Kauvery Hospital',
      
      // Shopping Malls
      'Express Avenue Mall',
      'Phoenix MarketCity',
      'Forum Vijaya Mall',
      'Chennai Citi Centre',
      'Ampa Skywalk Mall',
      'VR Chennai Mall',
      'EA Mall',
      'Spencer Plaza',
      'The Forum Mall',
      
      // Tourist Places
      'Marina Beach',
      'Kapaleeshwarar Temple',
      'San Thome Cathedral',
      'Fort St. George',
      'Government Museum',
      'Valluvar Kottam',
      'Elliot Beach',
      'Mahabalipuram',
      'Dakshinachitra',
      'Crocodile Bank',
      
      // Areas/Localities
      'T. Nagar',
      'Anna Nagar',
      'Adyar',
      'Velachery',
      'Guindy',
      'Mylapore',
      'Triplicane',
      'Nungambakkam',
      'Alwarpet',
      'Kodambakkam',
      'Vadapalani',
      'Ashok Nagar',
      'Besant Nagar',
      'Thiruvanmiyur',
      'OMR',
      'ECR',
      'GST Road',
      'Mount Road',
      'Anna Salai',
      'Poonamallee High Road',
      'Grand Southern Trunk Road',
      'Rajiv Gandhi Salai',
      'East Coast Road',
      
      // IT Parks
      'Tidel Park',
      'DLF IT Park',
      'ELCOT IT Park',
      'Olympia Tech Park',
      'RMZ Millenia',
      'Brigade Magnum',
      'Prestige Palladium Bayan',
      'ASV Suntech Park',
      
      // Educational Institutions
      'IIT Madras',
      'Anna University',
      'University of Madras',
      'Loyola College',
      'Stella Maris College',
      'Presidency College',
      'Ethiraj College',
      'Women Christian College',
      'Madras Christian College',
      'SRM University',
      'VIT Chennai',
      
      // Airports
      'Chennai International Airport',
      'Chennai Airport Terminal 1',
      'Chennai Airport Terminal 2',
      'Chennai Airport Terminal 3',
      'Chennai Airport Domestic',
      'Chennai Airport International'
    ];

    // If no query, return popular locations (first 8)
    if (!query || query.trim() === '') {
      return locations.slice(0, 8);
    }

    const searchQuery = query.toLowerCase().trim();
    return locations
      .filter(location => 
        location.toLowerCase().includes(searchQuery) ||
        searchQuery.split(' ').some(word => 
          location.toLowerCase().includes(word) && word.length > 2
        )
      )
      .slice(0, 8) // Limit to 8 suggestions
      .sort((a, b) => {
        // Prioritize exact matches and shorter names
        const aExact = a.toLowerCase().startsWith(searchQuery);
        const bExact = b.toLowerCase().startsWith(searchQuery);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.length - b.length;
      });
  }

  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Unable to retrieve location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        options
      );
    });
  }

  static async geocodeAddress(address) {
    // This would normally use Google Geocoding API
    // For now, return mock data
    const mockLocations = {
      'chennai central': { lat: 13.0836, lng: 80.2750, name: 'Chennai Central Railway Station' },
      'airport': { lat: 13.0900, lng: 80.1694, name: 'Chennai International Airport' },
      'marina beach': { lat: 13.0487, lng: 80.2824, name: 'Marina Beach' },
      'anna nagar': { lat: 13.0878, lng: 80.2088, name: 'Anna Nagar' },
      'guindy': { lat: 12.9965, lng: 80.2209, name: 'Guindy' },
      't nagar': { lat: 13.0418, lng: 80.2341, name: 'T. Nagar' },
      'velachery': { lat: 12.9759, lng: 80.2197, name: 'Velachery' },
      'adyar': { lat: 13.0067, lng: 80.2206, name: 'Adyar' }
    };

    const searchKey = address.toLowerCase();
    for (const [key, location] of Object.entries(mockLocations)) {
      if (searchKey.includes(key) || key.includes(searchKey)) {
        return location;
      }
    }

    // Default to Chennai center if not found
    return { lat: 13.0827, lng: 80.2707, name: address };
  }

  static async reverseGeocode(lat, lng) {
    // Mock reverse geocoding
    const areas = [
      { bounds: [13.08, 13.09, 80.27, 80.28], name: 'Chennai Central' },
      { bounds: [13.08, 13.10, 80.16, 80.18], name: 'Airport Area' },
      { bounds: [13.04, 13.06, 80.28, 80.29], name: 'Marina Beach' },
      { bounds: [13.08, 13.10, 80.20, 80.22], name: 'Anna Nagar' },
      { bounds: [12.99, 13.01, 80.21, 80.23], name: 'Guindy' }
    ];

    for (const area of areas) {
      const [latMin, latMax, lngMin, lngMax] = area.bounds;
      if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
        return area.name;
      }
    }

    return 'Chennai';
  }

  static getAccessibilityMarkers() {
    // Mock accessibility data for Chennai
    return [
      {
        position: { lat: 13.0836, lng: 80.2750 },
        type: 'wheelchair',
        title: 'Chennai Central - Wheelchair Access',
        description: 'Ramps and lifts available. Accessible restrooms on platform 1.'
      },
      {
        position: { lat: 13.0847, lng: 80.2745 },
        type: 'elevator',
        title: 'Chennai Central - Elevator',
        description: 'Main elevator connecting all platforms. Operating 24/7.'
      },
      {
        position: { lat: 13.0900, lng: 80.1694 },
        type: 'wheelchair',
        title: 'Airport Metro - Accessible',
        description: 'Full wheelchair accessibility with tactile paths.'
      },
      {
        position: { lat: 13.0495, lng: 80.2820 },
        type: 'audio',
        title: 'Marina Beach - Audio Signals',
        description: 'Audio crossing signals for visually impaired.'
      },
      {
        position: { lat: 13.0418, lng: 80.2341 },
        type: 'braille',
        title: 'T. Nagar - Braille Signage',
        description: 'Braille maps and tactile indicators available.'
      },
      {
        position: { lat: 12.9965, lng: 80.2209 },
        type: 'hazard',
        title: 'Guindy - Construction',
        description: 'Temporary accessibility barriers due to metro construction.'
      }
    ];
  }

  static calculateAccessibilityScore(route, filters) {
    let score = 100;
    
    // Reduce score based on missing accessibility features
    if (filters.wheelchair && !route.wheelchairAccessible) score -= 30;
    if (filters.elevator && !route.elevatorAvailable) score -= 20;
    if (filters.audio && !route.audioAnnouncements) score -= 15;
    if (filters.braille && !route.brailleSignage) score -= 15;

    // Add points for additional accessibility features
    if (route.lowFloorVehicles) score += 10;
    if (route.tactilePaving) score += 10;
    if (route.assistanceAvailable) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  static async generateRouteOptions(from, to, filters = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock route options with accessibility data
    const baseRoutes = [
      {
        id: 1,
        duration: '35 mins',
        distance: '12.5 km',
        cost: '₹25',
        mode: 'Metro + Walk',
        steps: [
          'Walk 3 mins to nearest metro station',
          'Blue Line to Central (18 mins)',
          'Transfer to Green Line (2 mins)',
          'Green Line to destination (10 mins)',
          'Walk 2 mins to final destination'
        ],
        wheelchairAccessible: true,
        elevatorAvailable: true,
        audioAnnouncements: true,
        brailleSignage: false,
        lowFloorVehicles: true,
        tactilePaving: true,
        assistanceAvailable: true,
        carbonFootprint: 'Low',
        crowdLevel: 'Medium'
      },
      {
        id: 2,
        duration: '42 mins',
        distance: '8.2 km',
        cost: '₹15',
        mode: 'Bus Only',
        steps: [
          'Walk 2 mins to bus stop',
          'Route 21G to T.Nagar (25 mins)',
          'Transfer to Route 5B (3 mins wait)',
          'Route 5B to destination (12 mins)'
        ],
        wheelchairAccessible: false,
        elevatorAvailable: false,
        audioAnnouncements: true,
        brailleSignage: false,
        lowFloorVehicles: true,
        tactilePaving: false,
        assistanceAvailable: false,
        carbonFootprint: 'Medium',
        crowdLevel: 'High'
      },
      {
        id: 3,
        duration: '28 mins',
        distance: '11.8 km',
        cost: '₹45',
        mode: 'Auto + Metro',
        steps: [
          'Auto to Central Metro (12 mins)',
          'Blue Line to destination area (14 mins)',
          'Walk 2 mins to final destination'
        ],
        wheelchairAccessible: false,
        elevatorAvailable: true,
        audioAnnouncements: true,
        brailleSignage: true,
        lowFloorVehicles: false,
        tactilePaving: true,
        assistanceAvailable: true,
        carbonFootprint: 'High',
        crowdLevel: 'Low'
      }
    ];

    // Calculate accessibility scores and sort
    const routesWithScores = baseRoutes.map(route => ({
      ...route,
      accessibilityScore: this.calculateAccessibilityScore(route, filters),
      accessibilityFeatures: this.getAccessibilityFeatures(route)
    }));

    // Sort by accessibility score if filters are applied
    const hasFilters = Object.values(filters).some(f => f);
    if (hasFilters) {
      routesWithScores.sort((a, b) => b.accessibilityScore - a.accessibilityScore);
    }

    return routesWithScores;
  }

  static getAccessibilityFeatures(route) {
    const features = [];
    
    if (route.wheelchairAccessible) features.push('Wheelchair accessible');
    if (route.elevatorAvailable) features.push('Elevator available');
    if (route.audioAnnouncements) features.push('Audio announcements');
    if (route.brailleSignage) features.push('Braille signage');
    if (route.lowFloorVehicles) features.push('Low-floor vehicles');
    if (route.tactilePaving) features.push('Tactile paving');
    if (route.assistanceAvailable) features.push('Staff assistance');

    return features;
  }

  static async saveFrequentDestination(userId, location) {
    // Mock save to backend
    const destinations = JSON.parse(localStorage.getItem('frequent_destinations') || '[]');
    const newDestination = {
      id: Date.now(),
      userId,
      name: location.name,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      visitCount: 1,
      lastVisited: new Date().toISOString()
    };

    // Check if already exists
    const existingIndex = destinations.findIndex(d => 
      d.userId === userId && 
      Math.abs(d.lat - location.lat) < 0.001 && 
      Math.abs(d.lng - location.lng) < 0.001
    );

    if (existingIndex >= 0) {
      destinations[existingIndex].visitCount++;
      destinations[existingIndex].lastVisited = new Date().toISOString();
    } else {
      destinations.push(newDestination);
    }

    localStorage.setItem('frequent_destinations', JSON.stringify(destinations));
    return newDestination;
  }

  static getFrequentDestinations(userId) {
    const destinations = JSON.parse(localStorage.getItem('frequent_destinations') || '[]');
    return destinations
      .filter(d => d.userId === userId)
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 5); // Return top 5
  }
}

export default LocationService;
