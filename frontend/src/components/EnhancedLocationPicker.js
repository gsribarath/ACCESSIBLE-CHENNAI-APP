import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faMapMarkerAlt,
  faTimes,
  faTrain,
  faHospital,
  faShoppingBag,
  faUniversity,
  faLandmark,
  faBus,
  faPlane,
  faUmbrellaBeach,
  faBuilding,
  faRoad,
  faHome,
  faLocationArrow
} from '@fortawesome/free-solid-svg-icons';
import { usePreferences } from '../context/PreferencesContext';
import LocationService from '../services/LocationService';

// Comprehensive list of Chennai locations organized by category
const CHENNAI_LOCATIONS = [
  // Metro Stations - Blue Line
  { name: 'AG-DMS Metro Station', category: 'Metro Station' },
  { name: 'Airport Metro Station', category: 'Metro Station' },
  { name: 'Alandur Metro Station', category: 'Metro Station' },
  { name: 'Anna Nagar East Metro Station', category: 'Metro Station' },
  { name: 'Anna Nagar Tower Metro Station', category: 'Metro Station' },
  { name: 'Arumbakkam Metro Station', category: 'Metro Station' },
  { name: 'Ashok Nagar Metro Station', category: 'Metro Station' },
  { name: 'Chennai Central Metro Station', category: 'Metro Station' },
  { name: 'CMBT Metro Station', category: 'Metro Station' },
  { name: 'Egmore Metro Station', category: 'Metro Station' },
  { name: 'Ekkattuthangal Metro Station', category: 'Metro Station' },
  { name: 'Government Estate Metro Station', category: 'Metro Station' },
  { name: 'Guindy Metro Station', category: 'Metro Station' },
  { name: 'High Court Metro Station', category: 'Metro Station' },
  { name: 'Kilpauk Metro Station', category: 'Metro Station' },
  { name: 'Koyambedu Metro Station', category: 'Metro Station' },
  { name: 'LIC Metro Station', category: 'Metro Station' },
  { name: 'Little Mount Metro Station', category: 'Metro Station' },
  { name: 'Mannady Metro Station', category: 'Metro Station' },
  { name: 'Meenambakkam Metro Station', category: 'Metro Station' },
  { name: 'Nandanam Metro Station', category: 'Metro Station' },
  { name: 'Nanganallur Metro Station', category: 'Metro Station' },
  { name: 'Nehru Park Metro Station', category: 'Metro Station' },
  { name: 'Pachaiyappas College Metro Station', category: 'Metro Station' },
  { name: 'Park Town Metro Station', category: 'Metro Station' },
  { name: 'Saidapet Metro Station', category: 'Metro Station' },
  { name: 'Shenoy Nagar Metro Station', category: 'Metro Station' },
  { name: 'St. Thomas Mount Metro Station', category: 'Metro Station' },
  { name: 'Teynampet Metro Station', category: 'Metro Station' },
  { name: 'Thirumangalam Metro Station', category: 'Metro Station' },
  { name: 'Thousand Lights Metro Station', category: 'Metro Station' },
  { name: 'Vadapalani Metro Station', category: 'Metro Station' },
  
  // Railway Stations
  { name: 'Chennai Beach Railway Station', category: 'Railway Station' },
  { name: 'Chennai Central Railway Station', category: 'Railway Station' },
  { name: 'Chennai Egmore Railway Station', category: 'Railway Station' },
  { name: 'Chepauk Railway Station', category: 'Railway Station' },
  { name: 'Chetpet Railway Station', category: 'Railway Station' },
  { name: 'Chintadripet Railway Station', category: 'Railway Station' },
  { name: 'Chromepet Railway Station', category: 'Railway Station' },
  { name: 'Fort Railway Station', category: 'Railway Station' },
  { name: 'Guindy Railway Station', category: 'Railway Station' },
  { name: 'Indira Nagar Railway Station', category: 'Railway Station' },
  { name: 'Kasturba Nagar Railway Station', category: 'Railway Station' },
  { name: 'Kodambakkam Railway Station', category: 'Railway Station' },
  { name: 'Kotturpuram Railway Station', category: 'Railway Station' },
  { name: 'Light House Railway Station', category: 'Railway Station' },
  { name: 'Mambalam Railway Station', category: 'Railway Station' },
  { name: 'Nungambakkam Railway Station', category: 'Railway Station' },
  { name: 'Pallavaram Railway Station', category: 'Railway Station' },
  { name: 'Park Town Railway Station', category: 'Railway Station' },
  { name: 'Perambur Railway Station', category: 'Railway Station' },
  { name: 'Tambaram Railway Station', category: 'Railway Station' },
  { name: 'Thiruvallikeni Railway Station', category: 'Railway Station' },
  { name: 'Tirusulam Railway Station', category: 'Railway Station' },
  { name: 'Velachery Railway Station', category: 'Railway Station' },
  { name: 'Villivakkam Railway Station', category: 'Railway Station' },
  
  // Hospitals
  { name: 'Apollo Hospital Greams Road', category: 'Hospital' },
  { name: 'Apollo Hospital Vanagaram', category: 'Hospital' },
  { name: 'Apollo Spectra Hospital OMR', category: 'Hospital' },
  { name: 'Billroth Hospital', category: 'Hospital' },
  { name: 'Cancer Institute Adyar', category: 'Hospital' },
  { name: 'Fortis Malar Hospital Adyar', category: 'Hospital' },
  { name: 'Gleneagles Global Health City', category: 'Hospital' },
  { name: 'Global Health City', category: 'Hospital' },
  { name: 'Government General Hospital', category: 'Hospital' },
  { name: 'Government KMC Hospital', category: 'Hospital' },
  { name: 'Government Royapettah Hospital', category: 'Hospital' },
  { name: 'Institute of Mental Health', category: 'Hospital' },
  { name: 'Kauvery Hospital', category: 'Hospital' },
  { name: 'Kilpauk Medical College', category: 'Hospital' },
  { name: 'Madras Medical College', category: 'Hospital' },
  { name: 'Mehta Hospital', category: 'Hospital' },
  { name: 'MIOT International Hospital', category: 'Hospital' },
  { name: 'Rajiv Gandhi Government General Hospital', category: 'Hospital' },
  { name: 'Sankara Nethralaya', category: 'Hospital' },
  { name: 'Sri Ramachandra Medical Centre', category: 'Hospital' },
  { name: 'Stanley Medical College', category: 'Hospital' },
  { name: 'Voluntary Health Services Hospital', category: 'Hospital' },
  
  // Shopping Malls
  { name: 'Ampa Skywalk Mall', category: 'Shopping' },
  { name: 'Broadway', category: 'Shopping' },
  { name: 'Burma Bazaar', category: 'Shopping' },
  { name: 'Chennai Citi Centre', category: 'Shopping' },
  { name: 'EA Mall OMR', category: 'Shopping' },
  { name: 'Express Avenue Mall', category: 'Shopping' },
  { name: 'Forum Vijaya Mall Vadapalani', category: 'Shopping' },
  { name: 'George Town', category: 'Shopping' },
  { name: 'Grand Square Mall', category: 'Shopping' },
  { name: 'Marina Mall', category: 'Shopping' },
  { name: 'Parrys Corner', category: 'Shopping' },
  { name: 'Phoenix MarketCity Velachery', category: 'Shopping' },
  { name: 'Pondy Bazaar', category: 'Shopping' },
  { name: 'Ritchie Street', category: 'Shopping' },
  { name: 'Sowcarpet', category: 'Shopping' },
  { name: 'Spencer Plaza Mount Road', category: 'Shopping' },
  { name: 'T. Nagar Shopping Area', category: 'Shopping' },
  { name: 'The Forum Mall OMR', category: 'Shopping' },
  { name: 'VR Chennai Mall Anna Nagar', category: 'Shopping' },
  
  // Educational Institutions
  { name: 'Anna University', category: 'Education' },
  { name: 'CEG Campus Anna University', category: 'Education' },
  { name: 'Ethiraj College', category: 'Education' },
  { name: 'Government College of Fine Arts', category: 'Education' },
  { name: 'Hindustan University', category: 'Education' },
  { name: 'IIT Madras', category: 'Education' },
  { name: 'Indian Maritime University', category: 'Education' },
  { name: 'Indian Statistical Institute', category: 'Education' },
  { name: 'Institute of Mathematical Sciences', category: 'Education' },
  { name: 'Loyola College', category: 'Education' },
  { name: 'Madras Christian College', category: 'Education' },
  { name: 'Meenakshi University', category: 'Education' },
  { name: 'MIT Campus Anna University', category: 'Education' },
  { name: 'MOP Vaishnav College', category: 'Education' },
  { name: 'New College', category: 'Education' },
  { name: 'NIFT Chennai', category: 'Education' },
  { name: 'Pachaiyappas College', category: 'Education' },
  { name: 'Panimalar Engineering College', category: 'Education' },
  { name: 'Presidency College', category: 'Education' },
  { name: 'Queen Marys College', category: 'Education' },
  { name: 'RMK Engineering College', category: 'Education' },
  { name: 'Sathyabama University', category: 'Education' },
  { name: 'Saveetha University', category: 'Education' },
  { name: 'SRM University', category: 'Education' },
  { name: 'SSN College of Engineering', category: 'Education' },
  { name: 'Stella Maris College', category: 'Education' },
  { name: 'University of Madras', category: 'Education' },
  { name: 'Velammal Engineering College', category: 'Education' },
  { name: 'VIT Chennai', category: 'Education' },
  { name: 'Women Christian College', category: 'Education' },
  
  // Tourist Places & Landmarks
  { name: 'Anna Centenary Library', category: 'Landmark' },
  { name: 'Anna Memorial', category: 'Landmark' },
  { name: 'Arignar Anna Zoological Park', category: 'Landmark' },
  { name: 'Birla Planetarium', category: 'Landmark' },
  { name: 'Chennai Corporation', category: 'Landmark' },
  { name: 'Chennai Rail Museum', category: 'Landmark' },
  { name: 'Chennai Trade Centre', category: 'Landmark' },
  { name: 'Connemara Library', category: 'Landmark' },
  { name: 'Crocodile Bank', category: 'Landmark' },
  { name: 'Dakshinachitra', category: 'Landmark' },
  { name: 'Fort St. George', category: 'Landmark' },
  { name: 'Government Museum Egmore', category: 'Landmark' },
  { name: 'Guindy National Park', category: 'Landmark' },
  { name: 'High Court Chennai', category: 'Landmark' },
  { name: 'Iskcon Temple', category: 'Landmark' },
  { name: 'Kalakshetra', category: 'Landmark' },
  { name: 'Kapaleeshwarar Temple Mylapore', category: 'Landmark' },
  { name: 'Light House Marina', category: 'Landmark' },
  { name: 'Mahabalipuram Shore Temple', category: 'Landmark' },
  { name: 'MGR Memorial', category: 'Landmark' },
  { name: 'Parthasarathy Temple Triplicane', category: 'Landmark' },
  { name: 'Raj Bhavan Chennai', category: 'Landmark' },
  { name: 'Ripon Building', category: 'Landmark' },
  { name: 'San Thome Cathedral', category: 'Landmark' },
  { name: 'Secretariat Chennai', category: 'Landmark' },
  { name: 'Snake Park', category: 'Landmark' },
  { name: 'Theosophical Society Adyar', category: 'Landmark' },
  { name: 'Vadapalani Murugan Temple', category: 'Landmark' },
  { name: 'Valluvar Kottam', category: 'Landmark' },
  { name: 'Vandalur Zoo', category: 'Landmark' },
  { name: 'Victory War Memorial', category: 'Landmark' },
  { name: 'Vivekananda House', category: 'Landmark' },
  
  // Transport Hubs
  { name: 'Adyar Bus Depot', category: 'Bus Stop' },
  { name: 'Anna Bus Terminus', category: 'Bus Stop' },
  { name: 'Avadi Bus Stand', category: 'Bus Stop' },
  { name: 'Broadway Bus Terminus', category: 'Bus Stop' },
  { name: 'Chennai International Airport', category: 'Airport' },
  { name: 'Chennai Mofussil Bus Terminus (CMBT)', category: 'Bus Stop' },
  { name: 'Chromepet Bus Stand', category: 'Bus Stop' },
  { name: 'Koyambedu Bus Stand', category: 'Bus Stop' },
  { name: 'Poonamallee Bus Stand', category: 'Bus Stop' },
  { name: 'Redhills Bus Stand', category: 'Bus Stop' },
  { name: 'T Nagar Bus Stand', category: 'Bus Stop' },
  { name: 'Tambaram Bus Stand', category: 'Bus Stop' },
  { name: 'Thiruvottiyur Bus Stand', category: 'Bus Stop' },
  { name: 'Velachery Bus Depot', category: 'Bus Stop' },
  
  // IT Parks
  { name: 'Ascendas IT Park', category: 'IT Park' },
  { name: 'Chennai One IT SEZ', category: 'IT Park' },
  { name: 'Cognizant Campus', category: 'IT Park' },
  { name: 'DLF IT Park', category: 'IT Park' },
  { name: 'ELCOT IT Park', category: 'IT Park' },
  { name: 'Global Infocity', category: 'IT Park' },
  { name: 'HCL Campus', category: 'IT Park' },
  { name: 'IBM Campus', category: 'IT Park' },
  { name: 'Infosys Campus', category: 'IT Park' },
  { name: 'Mahindra World City', category: 'IT Park' },
  { name: 'Microsoft Campus', category: 'IT Park' },
  { name: 'Navalur IT SEZ', category: 'IT Park' },
  { name: 'Olympia Tech Park', category: 'IT Park' },
  { name: 'OMR IT Corridor', category: 'IT Park' },
  { name: 'Perungudi IT Park', category: 'IT Park' },
  { name: 'Ramanujan IT City', category: 'IT Park' },
  { name: 'RMZ Millenia', category: 'IT Park' },
  { name: 'Shriram Gateway', category: 'IT Park' },
  { name: 'SIPCOT IT Park', category: 'IT Park' },
  { name: 'Siruseri IT Park', category: 'IT Park' },
  { name: 'SP Infocity', category: 'IT Park' },
  { name: 'Taramani IT Corridor', category: 'IT Park' },
  { name: 'TCS Campus', category: 'IT Park' },
  { name: 'Tech Mahindra Campus', category: 'IT Park' },
  { name: 'Thoraipakkam IT Zone', category: 'IT Park' },
  { name: 'Tidel Park', category: 'IT Park' },
  { name: 'Wipro Campus', category: 'IT Park' },
  
  // Beaches
  { name: 'Besant Nagar Beach', category: 'Beach' },
  { name: 'Elliot Beach', category: 'Beach' },
  { name: 'Injambakkam Beach', category: 'Beach' },
  { name: 'Kovalam Beach', category: 'Beach' },
  { name: 'Mahabalipuram Beach', category: 'Beach' },
  { name: 'Marina Beach', category: 'Beach' },
  { name: 'Muttukadu Beach', category: 'Beach' },
  { name: 'Palavakkam Beach', category: 'Beach' },
  { name: 'Thiruvanmiyur Beach', category: 'Beach' },
  
  // Major Areas & Localities (A-Z)
  { name: 'Adyar', category: 'Area' },
  { name: 'Alandur', category: 'Area' },
  { name: 'Alwarpet', category: 'Area' },
  { name: 'Ambattur', category: 'Area' },
  { name: 'Anakaputhur', category: 'Area' },
  { name: 'Anna Nagar East', category: 'Area' },
  { name: 'Anna Nagar West', category: 'Area' },
  { name: 'Ashok Nagar', category: 'Area' },
  { name: 'Avadi', category: 'Area' },
  { name: 'Basin Bridge', category: 'Area' },
  { name: 'Besant Nagar', category: 'Area' },
  { name: 'Chepauk', category: 'Area' },
  { name: 'Chetpet', category: 'Area' },
  { name: 'Chintadripet', category: 'Area' },
  { name: 'Chitlapakkam', category: 'Area' },
  { name: 'Chromepet', category: 'Area' },
  { name: 'Egmore', category: 'Area' },
  { name: 'Ennore', category: 'Area' },
  { name: 'George Town', category: 'Area' },
  { name: 'Gopalapuram', category: 'Area' },
  { name: 'Guduvancheri', category: 'Area' },
  { name: 'Guindy', category: 'Area' },
  { name: 'Injambakkam', category: 'Area' },
  { name: 'Irungattukottai', category: 'Area' },
  { name: 'Kalpakkam', category: 'Area' },
  { name: 'Kanchipuram', category: 'Area' },
  { name: 'Keelkattalai', category: 'Area' },
  { name: 'Kelambakkam', category: 'Area' },
  { name: 'Kilpauk', category: 'Area' },
  { name: 'Kodambakkam', category: 'Area' },
  { name: 'Korukkupet', category: 'Area' },
  { name: 'Kovalam', category: 'Area' },
  { name: 'Kundrathur', category: 'Area' },
  { name: 'Little Mount', category: 'Area' },
  { name: 'Madhavaram', category: 'Area' },
  { name: 'Madipakkam', category: 'Area' },
  { name: 'Madurantakam', category: 'Area' },
  { name: 'Mamallapuram', category: 'Area' },
  { name: 'Manali', category: 'Area' },
  { name: 'Medavakkam', category: 'Area' },
  { name: 'Meenambakkam', category: 'Area' },
  { name: 'Mint', category: 'Area' },
  { name: 'Muttukadu', category: 'Area' },
  { name: 'Mylapore', category: 'Area' },
  { name: 'Nanganallur', category: 'Area' },
  { name: 'Nungambakkam', category: 'Area' },
  { name: 'Oragadam', category: 'Area' },
  { name: 'Palavakkam', category: 'Area' },
  { name: 'Pallavaram', category: 'Area' },
  { name: 'Pallikaranai', category: 'Area' },
  { name: 'Pammal', category: 'Area' },
  { name: 'Park Town', category: 'Area' },
  { name: 'Perambur', category: 'Area' },
  { name: 'Periamet', category: 'Area' },
  { name: 'Perumbakkam', category: 'Area' },
  { name: 'Perungalathur', category: 'Area' },
  { name: 'Perungudi', category: 'Area' },
  { name: 'Poonamallee', category: 'Area' },
  { name: 'Porur', category: 'Area' },
  { name: 'Purasawalkam', category: 'Area' },
  { name: 'Rajakilpakkam', category: 'Area' },
  { name: 'Redhills', category: 'Area' },
  { name: 'Royapettah', category: 'Area' },
  { name: 'Royapuram', category: 'Area' },
  { name: 'Saidapet', category: 'Area' },
  { name: 'Selaiyur', category: 'Area' },
  { name: 'Sembakkam', category: 'Area' },
  { name: 'Sholinganallur', category: 'Area' },
  { name: 'Sithalapakkam', category: 'Area' },
  { name: 'Sowcarpet', category: 'Area' },
  { name: 'Sriperumbudur', category: 'Area' },
  { name: 'St. Thomas Mount', category: 'Area' },
  { name: 'T. Nagar (Thyagaraya Nagar)', category: 'Area' },
  { name: 'Tambaram East', category: 'Area' },
  { name: 'Tambaram West', category: 'Area' },
  { name: 'Teynampet', category: 'Area' },
  { name: 'Thiruvanmiyur', category: 'Area' },
  { name: 'Thiruvidandhai', category: 'Area' },
  { name: 'Thiruvallur', category: 'Area' },
  { name: 'Thiruvottiyur', category: 'Area' },
  { name: 'Thoraipakkam', category: 'Area' },
  { name: 'Thousand Lights', category: 'Area' },
  { name: 'Tirusulam', category: 'Area' },
  { name: 'Tondiarpet', category: 'Area' },
  { name: 'Triplicane', category: 'Area' },
  { name: 'Vadapalani', category: 'Area' },
  { name: 'Vandalur', category: 'Area' },
  { name: 'Velachery', category: 'Area' },
  { name: 'Vepery', category: 'Area' },
  { name: 'Vyasarpadi', category: 'Area' },
  { name: 'Washermanpet', category: 'Area' },
  
  // Major Roads
  { name: '100 Feet Road Vadapalani', category: 'Road' },
  { name: 'Anna Salai', category: 'Road' },
  { name: 'Arcot Road', category: 'Road' },
  { name: 'Cathedral Road', category: 'Road' },
  { name: 'Cenotaph Road', category: 'Road' },
  { name: 'Chamiers Road', category: 'Road' },
  { name: 'Dr Radhakrishnan Salai', category: 'Road' },
  { name: 'East Coast Road (ECR)', category: 'Road' },
  { name: 'EVR Periyar Salai', category: 'Road' },
  { name: 'Grand Southern Trunk Road (GST)', category: 'Road' },
  { name: 'Harrington Road', category: 'Road' },
  { name: 'Inner Ring Road', category: 'Road' },
  { name: 'Jawaharlal Nehru Road', category: 'Road' },
  { name: 'Kamaraj Salai', category: 'Road' },
  { name: 'Khader Nawaz Khan Road', category: 'Road' },
  { name: 'Kodambakkam High Road', category: 'Road' },
  { name: 'Lloyds Road', category: 'Road' },
  { name: 'Marina Beach Road', category: 'Road' },
  { name: 'Mount Road', category: 'Road' },
  { name: 'Nelson Manickam Road', category: 'Road' },
  { name: 'Old Mahabalipuram Road (OMR)', category: 'Road' },
  { name: 'Outer Ring Road', category: 'Road' },
  { name: 'Pantheon Road', category: 'Road' },
  { name: 'Poonamallee High Road', category: 'Road' },
  { name: 'Rajiv Gandhi Salai', category: 'Road' },
  { name: 'Sardar Patel Road', category: 'Road' },
  { name: 'Sterling Road', category: 'Road' },
  { name: 'TTK Road', category: 'Road' },
];

// Category icons mapping
const getCategoryIcon = (category) => {
  const icons = {
    'Metro Station': faTrain,
    'Railway Station': faTrain,
    'Hospital': faHospital,
    'Shopping': faShoppingBag,
    'Education': faUniversity,
    'Landmark': faLandmark,
    'Bus Stop': faBus,
    'Airport': faPlane,
    'IT Park': faBuilding,
    'Beach': faUmbrellaBeach,
    'Area': faHome,
    'Road': faRoad,
  };
  return icons[category] || faMapMarkerAlt;
};

// Category colors
const getCategoryColor = (category) => {
  const colors = {
    'Metro Station': '#4CAF50',
    'Railway Station': '#2196F3',
    'Hospital': '#F44336',
    'Shopping': '#E91E63',
    'Education': '#9C27B0',
    'Landmark': '#FF9800',
    'Bus Stop': '#00BCD4',
    'Airport': '#607D8B',
    'IT Park': '#3F51B5',
    'Beach': '#03A9F4',
    'Area': '#8BC34A',
    'Road': '#795548',
  };
  return colors[category] || '#666666';
};

const EnhancedLocationPicker = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  placeholder = "Search locations...",
  currentValue = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [gpsLoading, setGpsLoading] = useState(false);
  const searchInputRef = useRef(null);
  const listContainerRef = useRef(null);
  const { getCardStyles, getTextStyles, preferences } = usePreferences();

  // Categories for filtering
  const categories = ['All', 'Metro Station', 'Railway Station', 'Hospital', 'Shopping', 'Education', 'Landmark', 'Bus Stop', 'Airport', 'IT Park', 'Beach', 'Area', 'Road'];

  // Alphabet for quick navigation
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Filter and sort locations
  const filteredLocations = useMemo(() => {
    let filtered = CHENNAI_LOCATIONS;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(loc => loc.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(search) ||
        loc.category.toLowerCase().includes(search)
      );
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, selectedCategory]);

  // Group locations by first letter
  const groupedLocations = useMemo(() => {
    const groups = {};
    filteredLocations.forEach(loc => {
      const firstLetter = loc.name[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(loc);
    });
    return groups;
  }, [filteredLocations]);

  // Available letters (that have locations)
  const availableLetters = useMemo(() => {
    return alphabet.filter(letter => groupedLocations[letter]?.length > 0);
  }, [groupedLocations]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  // Scroll to letter
  const scrollToLetter = (letter) => {
    const element = document.getElementById(`location-group-${letter}`);
    if (element && listContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle current location
  const handleCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      const address = await LocationService.reverseGeocode(location.lat, location.lng);
      onSelect(address || 'Current Location');
      onClose();
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get current location: ' + error.message);
    } finally {
      setGpsLoading(false);
    }
  };

  // Handle location selection
  const handleSelect = (location) => {
    onSelect(location.name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Select Location
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon 
              icon={faSearch} 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(0, 0, 0, 0.4)',
                fontSize: '14px'
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                backgroundColor: 'white',
                color: '#333',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Current Location Button */}
        <button
          onClick={handleCurrentLocation}
          disabled={gpsLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            border: 'none',
            borderBottom: '1px solid var(--border-color)',
            background: gpsLoading ? 'var(--bg-secondary)' : 'var(--card-bg)',
            cursor: gpsLoading ? 'not-allowed' : 'pointer',
            width: '100%',
            textAlign: 'left',
            color: 'var(--accent-color)',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background 0.2s'
          }}
        >
          <FontAwesomeIcon 
            icon={faLocationArrow} 
            style={{ fontSize: '16px' }}
          />
          {gpsLoading ? 'Getting location...' : 'Use Current Location'}
        </button>

        {/* Category Filter */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {categories.slice(0, 6).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: selectedCategory === category 
                  ? 'var(--accent-color)' 
                  : 'var(--card-bg)',
                color: selectedCategory === category 
                  ? 'white' 
                  : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Main Content with Alphabet Navigator */}
        <div style={{ 
          display: 'flex', 
          flex: 1, 
          overflow: 'hidden',
          minHeight: 0
        }}>
          {/* Locations List */}
          <div 
            ref={listContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 0'
            }}
          >
            {filteredLocations.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No locations found for "{searchTerm}"</p>
              </div>
            ) : (
              Object.keys(groupedLocations).sort().map(letter => (
                <div key={letter} id={`location-group-${letter}`}>
                  {/* Letter Header */}
                  <div style={{
                    padding: '8px 20px',
                    backgroundColor: 'var(--bg-secondary)',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--accent-color)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    {letter}
                  </div>
                  
                  {/* Locations under this letter */}
                  {groupedLocations[letter].map((location, index) => (
                    <div
                      key={`${location.name}-${index}`}
                      onClick={() => handleSelect(location)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: getCategoryColor(location.category) + '20',
                        color: getCategoryColor(location.category),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        <FontAwesomeIcon icon={getCategoryIcon(location.category)} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {location.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)'
                        }}>
                          {location.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Alphabet Navigator */}
          {!searchTerm && filteredLocations.length > 10 && (
            <div style={{
              width: '28px',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '4px 0',
              borderLeft: '1px solid var(--border-color)',
              overflowY: 'auto'
            }}>
              {alphabet.map(letter => {
                const isAvailable = availableLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => isAvailable && scrollToLetter(letter)}
                    disabled={!isAvailable}
                    style={{
                      width: '22px',
                      height: '22px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: isAvailable ? 'var(--accent-color)' : 'var(--text-disabled)',
                      cursor: isAvailable ? 'pointer' : 'default',
                      opacity: isAvailable ? 1 : 0.3,
                      borderRadius: '4px',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (isAvailable) e.currentTarget.style.background = 'var(--accent-color)';
                      if (isAvailable) e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isAvailable ? 'var(--accent-color)' : 'var(--text-disabled)';
                    }}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)' 
          }}>
            {filteredLocations.length} locations
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '8px',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLocationPicker;
