import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Box,
  Container,
  Text,
  VStack,
  Badge,
  useColorModeValue,
  Spinner,
  useToast,
  HStack,
  Button,
} from '@chakra-ui/react';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Set your Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Issue {
  id: string;
  title: string;
  status: string;
  vote_count: number;
  location_lat: number;
  location_lng: number;
  category: string;
}

interface IssueDetails extends Issue {
  description: string;
  created_at: string;
  location_address: string;
}

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<IssueDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const popupBg = useColorModeValue('white', 'gray.800');
  const popupTextColor = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.1025, 28.7041], // Default to Delhi, India
      zoom: 11
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, []);

  // Fetch issues when map moves - but only if authenticated
  useEffect(() => {
    if (!map.current || !isAuthenticated) return;

    const fetchIssues = async () => {
      if (!map.current) return;
      try {
        setIsLoading(true);
        const bounds = map.current.getBounds();
        if (!bounds) return;
        
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get<Issue[]>(`http://localhost:3000/api/map/issues`, {
          headers,
          params: {
            bounds: JSON.stringify([
              bounds.getSouth(),
              bounds.getWest(),
              bounds.getNorth(),
              bounds.getEast()
            ])
          }
        });
        setIssues(response.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast({
          title: 'Error fetching issues',
          description: axiosError.response?.data?.message || 'Please try again later',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch issues on map load and move
    map.current.on('load', fetchIssues);
    map.current.on('moveend', fetchIssues);

    return () => {
      map.current?.off('load', fetchIssues);
      map.current?.off('moveend', fetchIssues);
    };
  }, [toast, isAuthenticated]);

  // Add markers for issues
  useEffect(() => {
    if (!map.current || !issues.length || !isAuthenticated) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('issue-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    issues.forEach(issue => {
      const el = document.createElement('div');
      el.className = 'issue-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getStatusColor(issue.status);
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      new mapboxgl.Marker(el)
        .setLngLat([issue.location_lng, issue.location_lat])
        .addTo(map.current!)
        .getElement()
        .addEventListener('click', async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get<IssueDetails>(`http://localhost:3000/api/map/issues/${issue.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedIssue(response.data);
          } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            toast({
              title: 'Error fetching issue details',
              description: axiosError.response?.data?.message || 'Please try again later',
              status: 'error',
              duration: 3000,
            });
          }
        });
    });
  }, [issues, toast, isAuthenticated]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return '#E53E3E'; // red
      case 'IN_PROGRESS':
        return '#3182CE'; // blue
      case 'RESOLVED':
        return '#38A169'; // green
      default:
        return '#718096'; // gray
    }
  };

  return (
    <Container maxW="container.xl" py={4}>
      <Box position="relative" h="calc(100vh - 100px)" borderRadius="lg" overflow="hidden">
        <Box ref={mapContainer} h="100%" />
        
        {isLoading && isAuthenticated && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg={popupBg}
            p={4}
            borderRadius="md"
            boxShadow="lg"
          >
            <Spinner size="xl" color="blue.500" />
          </Box>
        )}
        
        {/* Login prompt for unauthenticated users */}
        {!isAuthenticated && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg={popupBg}
            p={6}
            borderRadius="md"
            boxShadow="lg"
            textAlign="center"
          >
            <VStack spacing={4}>
              <Text fontSize="lg">Please log in to view issues on the map</Text>
              <Button colorScheme="blue" onClick={() => navigate('/login')}>
                Login
              </Button>
            </VStack>
          </Box>
        )}
        
        {selectedIssue && (
          <Box
            position="absolute"
            top={4}
            right={4}
            bg={popupBg}
            p={4}
            borderRadius="md"
            boxShadow="lg"
            maxW="300px"
            zIndex={1}
          >
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" fontSize="lg">{selectedIssue.title}</Text>
              <HStack>
                <Badge colorScheme={selectedIssue.status === 'PENDING' ? 'red' : 
                                  selectedIssue.status === 'IN_PROGRESS' ? 'blue' : 'green'}>
                  {selectedIssue.status}
                </Badge>
                <Badge colorScheme="purple">{selectedIssue.category}</Badge>
              </HStack>
              <Text>Votes: {selectedIssue.vote_count}</Text>
              <Text fontSize="sm" color={popupTextColor}>
                {selectedIssue.description}
              </Text>
              <Text fontSize="sm" color={popupTextColor}>
                Location: {selectedIssue.location_address}
              </Text>
            </VStack>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MapView; 