// Location service for GPS and geocoding functionality
class LocationService {
  static getLocationSuggestions(query) {
    // Comprehensive Chennai locations database for suggestions
    const locations = [
      // Metro Stations - Blue Line
      'Chennai Central Metro Station',
      'Government Estate Metro Station',
      'LIC Metro Station',
      'Thousand Lights Metro Station',
      'AG-DMS Metro Station',
      'Teynampet Metro Station',
      'Nandanam Metro Station',
      'Saidapet Metro Station',
      'Little Mount Metro Station',
      'Guindy Metro Station',
      'Alandur Metro Station',
      'Nanganallur Metro Station',
      'Meenambakkam Metro Station',
      'Airport Metro Station',
      
      // Metro Stations - Green Line
      'Chennai Central Metro Station',
      'High Court Metro Station',
      'Mannady Metro Station',
      'Park Town Metro Station',
      'Egmore Metro Station',
      'Nehru Park Metro Station',
      'Kilpauk Metro Station',
      'Pachaiyappas College Metro Station',
      'Shenoy Nagar Metro Station',
      'Anna Nagar East Metro Station',
      'Anna Nagar Tower Metro Station',
      'Thirumangalam Metro Station',
      'Koyambedu Metro Station',
      'CMBT Metro Station',
      'Arumbakkam Metro Station',
      'Vadapalani Metro Station',
      'Ashok Nagar Metro Station',
      'Ekkattuthangal Metro Station',
      'St. Thomas Mount Metro Station',
      
      // Railway Stations
      'Chennai Central Railway Station',
      'Chennai Egmore Railway Station',
      'Chennai Beach Railway Station',
      'Fort Railway Station',
      'Park Town Railway Station',
      'Chintadripet Railway Station',
      'Chepauk Railway Station',
      'Thiruvallikeni Railway Station',
      'Light House Railway Station',
      'Mundakakanni Railway Station',
      'Kotturpuram Railway Station',
      'Kasturba Nagar Railway Station',
      'Indira Nagar Railway Station',
      'Velachery Railway Station',
      'Tambaram Railway Station',
      'Sanatorium Railway Station',
      'Perungalathur Railway Station',
      'Vandalur Railway Station',
      'Guduvancheri Railway Station',
      'Chromepet Railway Station',
      'Pallavaram Railway Station',
      'Tirusulam Railway Station',
      'Mambalam Railway Station',
      'Kodambakkam Railway Station',
      'Nungambakkam Railway Station',
      'Chetpet Railway Station',
      'Villivakkam Railway Station',
      'Perambur Railway Station',
      'Korukkupet Railway Station',
      'Vyasarpadi Railway Station',
      'Basin Bridge Railway Station',
      'Tiruvottiyur Railway Station',
      
      // Hospitals & Medical Centers
      'Apollo Hospital Greams Road',
      'Apollo Hospital Vanagaram',
      'Apollo Spectra Hospital OMR',
      'Fortis Malar Hospital Adyar',
      'MIOT International Hospital',
      'Government General Hospital',
      'Rajiv Gandhi Government General Hospital',
      'Stanley Medical College',
      'Kilpauk Medical College',
      'Madras Medical College',
      'Voluntary Health Services Hospital',
      'Sri Ramachandra Medical Centre',
      'Global Health City',
      'Kauvery Hospital',
      'Gleneagles Global Health City',
      'Mehta Hospital',
      'Dr Kamakshi Memorial Hospital',
      'Billroth Hospital',
      'Sankara Nethralaya',
      'Cancer Institute Adyar',
      'Institute of Mental Health',
      'TB Sanatorium Tambaram',
      'Government Royapettah Hospital',
      'Government KMC Hospital',
      'Barnard Institute of Radiology',
      
      // Shopping Malls & Commercial Centers
      'Express Avenue Mall',
      'Phoenix MarketCity Velachery',
      'Forum Vijaya Mall Vadapalani',
      'Chennai Citi Centre',
      'Ampa Skywalk Mall',
      'VR Chennai Mall Anna Nagar',
      'EA Mall OMR',
      'Spencer Plaza Mount Road',
      'The Forum Mall OMR',
      'Express Heartness Mall',
      'City Centre Mall',
      'Grand Square Mall',
      'Marina Mall',
      'Nucleus Mall',
      'Doshi Square',
      'Pondy Bazaar',
      'Burma Bazaar',
      'Ritchie Street',
      'Commercial Street',
      'Mount Road Shopping',
      'Anna Salai Shopping',
      'Sowcarpet',
      'George Town',
      'Parrys Corner',
      'Broadway',
      
      // Tourist Places & Landmarks
      'Marina Beach',
      'Kapaleeshwarar Temple Mylapore',
      'San Thome Cathedral',
      'Fort St. George',
      'Government Museum Egmore',
      'Valluvar Kottam',
      'Elliot Beach Besant Nagar',
      'Mahabalipuram Shore Temple',
      'Dakshinachitra',
      'Crocodile Bank',
      'Parthasarathy Temple Triplicane',
      'Vadapalani Murugan Temple',
      'Ashtalakshmi Temple Besant Nagar',
      'Kamakshi Amman Temple',
      'Iskcon Temple',
      'Light House Marina',
      'Anna Memorial',
      'MGR Memorial',
      'Vivekananda House',
      'Theosophical Society Adyar',
      'Guindy National Park',
      'Arignar Anna Zoological Park',
      'Birla Planetarium',
      'Chennai Trade Centre',
      'Kalakshetra',
      'DGS Dinakaran Memorial',
      'Connemara Library',
      'Anna Centenary Library',
      'Chennai Rail Museum',
      'Victory War Memorial',
      'Ripon Building',
      'Chennai Corporation',
      'High Court Chennai',
      'Secretariat Chennai',
      'Raj Bhavan Chennai',
      
      // Major Areas & Localities
      'T. Nagar (Thyagaraya Nagar)',
      'Anna Nagar East',
      'Anna Nagar West',
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
      'Palavakkam',
      'Injambakkam',
      'Sholinganallur',
      'Perungudi',
      'Thoraipakkam',
      'Pallikaranai',
      'Medavakkam',
      'Tambaram East',
      'Tambaram West',
      'Chromepet',
      'Pallavaram',
      'Pammal',
      'Anakaputhur',
      'Selaiyur',
      'Chitlapakkam',
      'Madipakkam',
      'Keelkattalai',
      'Alandur',
      'St. Thomas Mount',
      'Meenambakkam',
      'Tirusulam',
      'Kundrathur',
      'Poonamallee',
      'Avadi',
      'Ambattur',
      'Redhills',
      'Thiruvallur',
      'Gummidipoondi',
      'Ennore',
      'Manali',
      'Madhavaram',
      'Perambur',
      'Vyasarpadi',
      'Tondiarpet',
      'Royapuram',
      'Washermanpet',
      'Kilpauk',
      'Egmore',
      'Purasawalkam',
      'Chetpet',
      'Vepery',
      'Periamet',
      'Park Town',
      'George Town',
      'Sowcarpet',
      'Mint',
      'Broadway',
      'Chintadripet',
      'Chepauk',
      'Thousand Lights',
      'Teynampet',
      'Royapettah',
      'Gopalapuram',
      'Saidapet',
      'Little Mount',
      'Nanganallur',
      'Madambakkam',
      'Rajakilpakkam',
      'Sembakkam',
      'Perumbakkam',
      'Sithalapakkam',
      'Kelambakkam',
      'Mamallapuram',
      'Kovalam',
      'Muttukadu',
      'Thiruvidandhai',
      'Manamai',
      'Kalpakkam',
      'Chengalpattu',
      'Madurantakam',
      'Kanchipuram',
      'Sriperumbudur',
      'Oragadam',
      'Irungattukottai',
      
      // Roads & Highways
      'OMR (Old Mahabalipuram Road)',
      'ECR (East Coast Road)',
      'GST Road (Grand Southern Trunk Road)',
      'Mount Road',
      'Anna Salai',
      'Poonamallee High Road',
      'Grand Southern Trunk Road',
      'Rajiv Gandhi Salai',
      'East Coast Road',
      'Inner Ring Road',
      'Outer Ring Road',
      '100 Feet Road Vadapalani',
      'Cathedral Road',
      'TTK Road',
      'Khader Nawaz Khan Road',
      'Dr Radhakrishnan Salai',
      'Nelson Manickam Road',
      'Lloyds Road',
      'Harrington Road',
      'Sterling Road',
      'Chamiers Road',
      'Cenotaph Road',
      'Pantheon Road',
      'Kodambakkam High Road',
      'Arcot Road',
      'Porur - Kundrathur Road',
      'Sardar Patel Road',
      'EVR Periyar Salai',
      'Jawaharlal Nehru Road',
      'Kamaraj Salai',
      'Marina Beach Road',
      
      // IT Parks & Tech Hubs
      'Tidel Park',
      'DLF IT Park',
      'ELCOT IT Park',
      'Olympia Tech Park',
      'RMZ Millenia',
      'Brigade Magnum',
      'Prestige Palladium Bayan',
      'ASV Suntech Park',
      'Ascendas IT Park',
      'Mahindra World City',
      'SIPCOT IT Park',
      'Shriram Gateway',
      'UB City Tower',
      'Ramanujan IT City',
      'Cyber Towers',
      'Taramani IT Corridor',
      'OMR IT Corridor',
      'Sholinganallur IT Hub',
      'Perungudi IT Park',
      'Thoraipakkam IT Zone',
      'Navalur IT SEZ',
      'Siruseri IT Park',
      'SIPCOT Industrial Park',
      'Chennai One IT SEZ',
      'SP Infocity',
      'Global Infocity',
      'Tech Mahindra Campus',
      'Cognizant Campus',
      'TCS Campus',
      'Infosys Campus',
      'Wipro Campus',
      'HCL Campus',
      'Accenture Campus',
      'IBM Campus',
      'Microsoft Campus',
      
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
      'CEG Campus Anna University',
      'MIT Campus Anna University',
      'SAP Campus Anna University',
      'Madras Medical College',
      'Stanley Medical College',
      'Kilpauk Medical College',
      'Tamil Nadu Dr MGR Medical University',
      'Indian Maritime University',
      'Hindustan University',
      'Sathyabama University',
      'Sri Chandrasekharendra Saraswathi Viswa Mahavidyalaya',
      'B.S. Abdur Rahman University',
      'Meenakshi University',
      'Saveetha University',
      'Vel Tech University',
      'Panimalar Engineering College',
      'Sri Venkateswara College of Engineering',
      'SSN College of Engineering',
      'RMK Engineering College',
      'Velammal Engineering College',
      'St. Peters University',
      'NIFT Chennai',
      'Government College of Fine Arts',
      'Queen Marys College',
      'MOP Vaishnav College',
      'Pachaiyappas College',
      'New College',
      'Madras School of Economics',
      'Indian Statistical Institute',
      'Institute of Mathematical Sciences',
      'National Institute of Ocean Technology',
      'Central Leather Research Institute',
      'Indian Institute of Technology Madras',
      
      // Airports & Transport Hubs
      'Chennai International Airport',
      'Chennai Airport Terminal 1',
      'Chennai Airport Terminal 2',
      'Chennai Airport Terminal 3',
      'Chennai Airport Domestic Terminal',
      'Chennai Airport International Terminal',
      'Kamaraj Domestic Terminal',
      'Anna International Terminal',
      'Chennai Mofussil Bus Terminus (CMBT)',
      'Koyambedu Bus Stand',
      'Broadway Bus Terminus',
      'T Nagar Bus Stand',
      'Adyar Bus Depot',
      'Velachery Bus Depot',
      'Tambaram Bus Stand',
      'Chromepet Bus Stand',
      'Poonamallee Bus Stand',
      'Avadi Bus Stand',
      'Redhills Bus Stand',
      'Ennore Bus Stand',
      'Thiruvottiyur Bus Stand',
      'Anna Bus Terminus',
      
      // Beaches & Recreational Areas
      'Marina Beach',
      'Elliot Beach',
      'Besant Nagar Beach',
      'Thiruvanmiyur Beach',
      'Palavakkam Beach',
      'Injambakkam Beach',
      'Kovalam Beach',
      'Mahabalipuram Beach',
      'Muttukadu Beach',
      'Pulicat Lake',
      'Chembarambakkam Lake',
      'Sholavaram Lake',
      'Red Hills Lake',
      'Puzhal Lake',
      'Adyar River',
      'Cooum River',
      'Buckingham Canal',
      'Tholkappia Poonga',
      'Semmozhi Poonga',
      'Guindy National Park',
      'Arignar Anna Zoological Park',
      'Vandalur Zoo',
      'Snake Park',
      'Deer Park',
      'Nandanam Arts Village',
      'Valluvar Kottam',
      'Phoenix Marina',
      'VGP Universal Kingdom',
      'VGP Golden Beach',
      'MGM Dizzee World',
      'Kishkinta Theme Park',
      'Dash N Splash Water Park'
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
    // Comprehensive Chennai locations with coordinates
    const mockLocations = {
      // Central Chennai
      'chennai central': { lat: 13.0836, lng: 80.2750, name: 'Chennai Central Railway Station' },
      'egmore': { lat: 13.0732, lng: 80.2609, name: 'Chennai Egmore Railway Station' },
      'anna salai': { lat: 13.0524, lng: 80.2510, name: 'Anna Salai' },
      'mount road': { lat: 13.0524, lng: 80.2510, name: 'Mount Road' },
      'thousand lights': { lat: 13.0609, lng: 80.2454, name: 'Thousand Lights' },
      'teynampet': { lat: 13.0404, lng: 80.2426, name: 'Teynampet' },
      'nungambakkam': { lat: 13.0732, lng: 80.2385, name: 'Nungambakkam' },
      'chetpet': { lat: 13.0732, lng: 80.2385, name: 'Chetpet' },
      
      // North Chennai
      'anna nagar': { lat: 13.0878, lng: 80.2088, name: 'Anna Nagar' },
      'kilpauk': { lat: 13.0825, lng: 80.2376, name: 'Kilpauk' },
      'purasawalkam': { lat: 13.0825, lng: 80.2555, name: 'Purasawalkam' },
      'vadapalani': { lat: 13.0525, lng: 80.2126, name: 'Vadapalani' },
      'ashok nagar': { lat: 13.0347, lng: 80.2098, name: 'Ashok Nagar' },
      'kodambakkam': { lat: 13.0513, lng: 80.2265, name: 'Kodambakkam' },
      'koyambedu': { lat: 13.0732, lng: 80.1948, name: 'Koyambedu' },
      'arumbakkam': { lat: 13.0732, lng: 80.1948, name: 'Arumbakkam' },
      'poonamallee': { lat: 13.0474, lng: 80.0915, name: 'Poonamallee' },
      'avadi': { lat: 13.1143, lng: 80.1018, name: 'Avadi' },
      'ambattur': { lat: 13.1143, lng: 80.1540, name: 'Ambattur' },
      'redhills': { lat: 13.1923, lng: 80.1540, name: 'Redhills' },
      'thiruvallur': { lat: 13.1330, lng: 79.9092, name: 'Thiruvallur' },
      
      // South Chennai
      't nagar': { lat: 13.0418, lng: 80.2341, name: 'T. Nagar' },
      'mylapore': { lat: 13.0339, lng: 80.2619, name: 'Mylapore' },
      'triplicane': { lat: 13.0544, lng: 80.2710, name: 'Triplicane' },
      'alwarpet': { lat: 13.0333, lng: 80.2478, name: 'Alwarpet' },
      'adyar': { lat: 13.0067, lng: 80.2206, name: 'Adyar' },
      'besant nagar': { lat: 12.9986, lng: 80.2669, name: 'Besant Nagar' },
      'thiruvanmiyur': { lat: 12.9825, lng: 80.2594, name: 'Thiruvanmiyur' },
      'guindy': { lat: 12.9965, lng: 80.2209, name: 'Guindy' },
      'saidapet': { lat: 13.0209, lng: 80.2231, name: 'Saidapet' },
      'little mount': { lat: 13.0078, lng: 80.2231, name: 'Little Mount' },
      'alandur': { lat: 12.9951, lng: 80.2067, name: 'Alandur' },
      'st thomas mount': { lat: 12.9951, lng: 80.1691, name: 'St. Thomas Mount' },
      'meenambakkam': { lat: 12.9851, lng: 80.1691, name: 'Meenambakkam' },
      
      // Airport Area
      'airport': { lat: 13.0900, lng: 80.1694, name: 'Chennai International Airport' },
      'tirusulam': { lat: 12.9690, lng: 80.1434, name: 'Tirusulam' },
      
      // Beaches
      'marina beach': { lat: 13.0487, lng: 80.2824, name: 'Marina Beach' },
      'elliot beach': { lat: 12.9986, lng: 80.2669, name: 'Elliot Beach' },
      'kovalam beach': { lat: 12.7874, lng: 80.2545, name: 'Kovalam Beach' },
      'mahabalipuram': { lat: 12.6208, lng: 80.1982, name: 'Mahabalipuram' },
      
      // South Suburbs
      'velachery': { lat: 12.9759, lng: 80.2197, name: 'Velachery' },
      'tambaram': { lat: 12.9249, lng: 80.1000, name: 'Tambaram' },
      'chromepet': { lat: 12.9516, lng: 80.1462, name: 'Chromepet' },
      'pallavaram': { lat: 12.9675, lng: 80.1491, name: 'Pallavaram' },
      'pammal': { lat: 12.9249, lng: 80.1000, name: 'Pammal' },
      'anakaputhur': { lat: 12.9249, lng: 80.1000, name: 'Anakaputhur' },
      'selaiyur': { lat: 12.9157, lng: 80.1462, name: 'Selaiyur' },
      'chitlapakkam': { lat: 12.9157, lng: 80.1462, name: 'Chitlapakkam' },
      'madipakkam': { lat: 12.9628, lng: 80.1982, name: 'Madipakkam' },
      'keelkattalai': { lat: 12.9628, lng: 80.1982, name: 'Keelkattalai' },
      
      // OMR Corridor
      'sholinganallur': { lat: 12.9013, lng: 80.2278, name: 'Sholinganallur' },
      'perungudi': { lat: 12.9628, lng: 80.2434, name: 'Perungudi' },
      'thoraipakkam': { lat: 12.9391, lng: 80.2343, name: 'Thoraipakkam' },
      'pallikaranai': { lat: 12.9391, lng: 80.2343, name: 'Pallikaranai' },
      'medavakkam': { lat: 12.9202, lng: 80.1918, name: 'Medavakkam' },
      'navalur': { lat: 12.8449, lng: 80.2278, name: 'Navalur' },
      'siruseri': { lat: 12.8228, lng: 80.2278, name: 'Siruseri' },
      'kelambakkam': { lat: 12.7874, lng: 80.2434, name: 'Kelambakkam' },
      
      // ECR Corridor
      'palavakkam': { lat: 12.9391, lng: 80.2512, name: 'Palavakkam' },
      'injambakkam': { lat: 12.9013, lng: 80.2512, name: 'Injambakkam' },
      'akkarai': { lat: 12.8832, lng: 80.2512, name: 'Akkarai' },
      'uthandi': { lat: 12.8449, lng: 80.2512, name: 'Uthandi' },
      'kovalam': { lat: 12.7874, lng: 80.2545, name: 'Kovalam' },
      'muttukadu': { lat: 12.7599, lng: 80.2434, name: 'Muttukadu' },
      'thiruvidandhai': { lat: 12.7220, lng: 80.2343, name: 'Thiruvidandhai' },
      'kalpakkam': { lat: 12.5553, lng: 80.1732, name: 'Kalpakkam' },
      'chengalpattu': { lat: 12.6923, lng: 79.9769, name: 'Chengalpattu' },
      
      // GST Road Corridor
      'vandalur': { lat: 12.8925, lng: 80.0803, name: 'Vandalur' },
      'guduvancheri': { lat: 12.8474, lng: 80.0622, name: 'Guduvancheri' },
      'urapakkam': { lat: 12.8925, lng: 80.0803, name: 'Urapakkam' },
      'maraimalai nagar': { lat: 12.7874, lng: 80.0269, name: 'Maraimalai Nagar' },
      'sriperumbudur': { lat: 12.9651, lng: 79.9428, name: 'Sriperumbudur' },
      'oragadam': { lat: 12.9651, lng: 79.9428, name: 'Oragadam' },
      'irungattukottai': { lat: 12.9651, lng: 79.9428, name: 'Irungattukottai' },
      
      // IT Corridors
      'tidel park': { lat: 13.0067, lng: 80.2434, name: 'Tidel Park' },
      'taramani': { lat: 12.9951, lng: 80.2434, name: 'Taramani' },
      'iit madras': { lat: 12.9915, lng: 80.2336, name: 'IIT Madras' },
      'omr': { lat: 12.9013, lng: 80.2278, name: 'OMR IT Corridor' },
      'ecr': { lat: 12.8832, lng: 80.2512, name: 'ECR Corridor' },
      
      // Outer Areas
      'ennore': { lat: 13.2167, lng: 80.3166, name: 'Ennore' },
      'manali': { lat: 13.1667, lng: 80.2667, name: 'Manali' },
      'madhavaram': { lat: 13.1456, lng: 80.2308, name: 'Madhavaram' },
      'perambur': { lat: 13.1143, lng: 80.2335, name: 'Perambur' },
      'vyasarpadi': { lat: 13.1143, lng: 80.2543, name: 'Vyasarpadi' },
      'tondiarpet': { lat: 13.1143, lng: 80.2876, name: 'Tondiarpet' },
      'royapuram': { lat: 13.1017, lng: 80.2917, name: 'Royapuram' },
      'washermanpet': { lat: 13.0966, lng: 80.2917, name: 'Washermanpet' },
      'kanchipuram': { lat: 12.8342, lng: 79.7036, name: 'Kanchipuram' }
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
    // Comprehensive Chennai area boundaries for reverse geocoding
    const areas = [
      // Central Chennai
      { bounds: [13.08, 13.09, 80.27, 80.28], name: 'Chennai Central' },
      { bounds: [13.07, 13.08, 80.26, 80.27], name: 'Egmore' },
      { bounds: [13.05, 13.07, 80.24, 80.26], name: 'Anna Salai / Mount Road' },
      { bounds: [13.06, 13.07, 80.24, 80.25], name: 'Thousand Lights' },
      { bounds: [13.04, 13.05, 80.24, 80.25], name: 'Teynampet' },
      { bounds: [13.07, 13.08, 80.23, 80.24], name: 'Nungambakkam' },
      { bounds: [13.07, 13.08, 80.23, 80.24], name: 'Chetpet' },
      
      // North Chennai
      { bounds: [13.08, 13.10, 80.20, 80.22], name: 'Anna Nagar' },
      { bounds: [13.08, 13.09, 80.23, 80.24], name: 'Kilpauk' },
      { bounds: [13.08, 13.09, 80.25, 80.26], name: 'Purasawalkam' },
      { bounds: [13.05, 13.06, 80.21, 80.22], name: 'Vadapalani' },
      { bounds: [13.03, 13.04, 80.20, 80.21], name: 'Ashok Nagar' },
      { bounds: [13.05, 13.06, 80.22, 80.23], name: 'Kodambakkam' },
      { bounds: [13.07, 13.08, 80.19, 80.20], name: 'Koyambedu' },
      { bounds: [13.04, 13.05, 80.09, 80.10], name: 'Poonamallee' },
      { bounds: [13.11, 13.12, 80.10, 80.11], name: 'Avadi' },
      { bounds: [13.11, 13.12, 80.15, 80.16], name: 'Ambattur' },
      { bounds: [13.19, 13.20, 80.15, 80.16], name: 'Redhills' },
      { bounds: [13.13, 13.14, 79.90, 79.92], name: 'Thiruvallur' },
      
      // South Chennai
      { bounds: [13.04, 13.05, 80.23, 80.24], name: 'T. Nagar' },
      { bounds: [13.03, 13.04, 80.26, 80.27], name: 'Mylapore' },
      { bounds: [13.05, 13.06, 80.27, 80.28], name: 'Triplicane' },
      { bounds: [13.03, 13.04, 80.24, 80.25], name: 'Alwarpet' },
      { bounds: [13.00, 13.01, 80.22, 80.23], name: 'Adyar' },
      { bounds: [12.99, 13.00, 80.26, 80.27], name: 'Besant Nagar' },
      { bounds: [12.98, 12.99, 80.25, 80.26], name: 'Thiruvanmiyur' },
      { bounds: [12.99, 13.01, 80.21, 80.23], name: 'Guindy' },
      { bounds: [13.02, 13.03, 80.22, 80.23], name: 'Saidapet' },
      { bounds: [13.00, 13.01, 80.22, 80.23], name: 'Little Mount' },
      { bounds: [12.99, 13.00, 80.20, 80.21], name: 'Alandur' },
      { bounds: [12.99, 13.00, 80.16, 80.17], name: 'St. Thomas Mount' },
      { bounds: [12.98, 12.99, 80.16, 80.17], name: 'Meenambakkam' },
      
      // Airport Area
      { bounds: [13.08, 13.10, 80.16, 80.18], name: 'Airport Area' },
      { bounds: [12.96, 12.97, 80.14, 80.15], name: 'Tirusulam' },
      
      // Beaches
      { bounds: [13.04, 13.06, 80.28, 80.29], name: 'Marina Beach' },
      { bounds: [12.99, 13.00, 80.26, 80.27], name: 'Elliot Beach' },
      { bounds: [12.78, 12.79, 80.25, 80.26], name: 'Kovalam Beach' },
      { bounds: [12.61, 12.63, 80.19, 80.21], name: 'Mahabalipuram' },
      
      // South Suburbs
      { bounds: [12.97, 12.98, 80.21, 80.22], name: 'Velachery' },
      { bounds: [12.92, 12.93, 80.09, 80.11], name: 'Tambaram' },
      { bounds: [12.95, 12.96, 80.14, 80.15], name: 'Chromepet' },
      { bounds: [12.96, 12.97, 80.14, 80.15], name: 'Pallavaram' },
      { bounds: [12.91, 12.93, 80.09, 80.11], name: 'Pammal' },
      { bounds: [12.91, 12.92, 80.14, 80.15], name: 'Selaiyur' },
      { bounds: [12.96, 12.97, 80.19, 80.20], name: 'Madipakkam' },
      
      // OMR Corridor
      { bounds: [12.90, 12.91, 80.22, 80.23], name: 'Sholinganallur' },
      { bounds: [12.96, 12.97, 80.24, 80.25], name: 'Perungudi' },
      { bounds: [12.93, 12.94, 80.23, 80.24], name: 'Thoraipakkam' },
      { bounds: [12.93, 12.94, 80.23, 80.24], name: 'Pallikaranai' },
      { bounds: [12.91, 12.93, 80.19, 80.20], name: 'Medavakkam' },
      { bounds: [12.84, 12.85, 80.22, 80.23], name: 'Navalur' },
      { bounds: [12.82, 12.83, 80.22, 80.23], name: 'Siruseri' },
      { bounds: [12.78, 12.79, 80.24, 80.25], name: 'Kelambakkam' },
      
      // ECR Corridor
      { bounds: [12.93, 12.94, 80.25, 80.26], name: 'Palavakkam' },
      { bounds: [12.90, 12.91, 80.25, 80.26], name: 'Injambakkam' },
      { bounds: [12.88, 12.89, 80.25, 80.26], name: 'Akkarai' },
      { bounds: [12.84, 12.85, 80.25, 80.26], name: 'Uthandi' },
      { bounds: [12.78, 12.79, 80.25, 80.26], name: 'Kovalam' },
      { bounds: [12.75, 12.76, 80.24, 80.25], name: 'Muttukadu' },
      { bounds: [12.55, 12.56, 80.17, 80.18], name: 'Kalpakkam' },
      { bounds: [12.69, 12.70, 79.97, 79.98], name: 'Chengalpattu' },
      
      // GST Road Corridor
      { bounds: [12.89, 12.90, 80.08, 80.09], name: 'Vandalur' },
      { bounds: [12.84, 12.85, 80.06, 80.07], name: 'Guduvancheri' },
      { bounds: [12.78, 12.79, 80.02, 80.03], name: 'Maraimalai Nagar' },
      { bounds: [12.96, 12.97, 79.94, 79.95], name: 'Sriperumbudur' },
      { bounds: [12.96, 12.97, 79.94, 79.95], name: 'Oragadam' },
      
      // IT Corridors
      { bounds: [13.00, 13.01, 80.24, 80.25], name: 'Tidel Park' },
      { bounds: [12.99, 13.00, 80.24, 80.25], name: 'Taramani' },
      { bounds: [12.99, 13.00, 80.23, 80.24], name: 'IIT Madras' },
      { bounds: [12.90, 12.91, 80.22, 80.23], name: 'OMR IT Corridor' },
      { bounds: [12.88, 12.89, 80.25, 80.26], name: 'ECR Corridor' },
      
      // Outer Areas
      { bounds: [13.21, 13.22, 80.31, 80.32], name: 'Ennore' },
      { bounds: [13.16, 13.17, 80.26, 80.27], name: 'Manali' },
      { bounds: [13.14, 13.15, 80.23, 80.24], name: 'Madhavaram' },
      { bounds: [13.11, 13.12, 80.23, 80.24], name: 'Perambur' },
      { bounds: [13.11, 13.12, 80.25, 80.26], name: 'Vyasarpadi' },
      { bounds: [13.11, 13.12, 80.28, 80.29], name: 'Tondiarpet' },
      { bounds: [13.10, 13.11, 80.29, 80.30], name: 'Royapuram' },
      { bounds: [13.09, 13.10, 80.29, 80.30], name: 'Washermanpet' },
      { bounds: [12.83, 12.84, 79.70, 79.71], name: 'Kanchipuram' }
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
