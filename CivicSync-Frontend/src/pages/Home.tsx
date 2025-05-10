import { useEffect, useState, useRef } from 'react';
import { Box, Container, Heading, Text, Button, SimpleGrid, Icon, Stack, useColorModeValue } from '@chakra-ui/react';
import { FaMapMarkedAlt, FaVoteYea, FaChartLine } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { Link as RouterLink } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';

// Set your Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Issue {
  id: string;
  title: string;
  status: string;
  vote_count: number;
  location_lat: number;
  location_lng: number;
}

const Feature = ({ title, text, icon }: { title: string; text: string; icon: IconType }) => {
  return (
    <Stack spacing={4} align="center" textAlign="center">
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontWeight={600}>{title}</Text>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>{text}</Text>
    </Stack>
  );
};

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  // Initialize map for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.1025, 28.7041], // Default to Delhi, India
      zoom: 11
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Fetch issues when map moves
    const fetchIssues = async () => {
      if (!map.current) return;
      try {
        const bounds = map.current.getBounds();
        if (!bounds) return;
        const response = await axios.get<Issue[]>(`http://localhost:3000/api/map/issues`, {
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
        console.error('Error fetching issues:', error);
      }
    };

    map.current.on('load', fetchIssues);
    map.current.on('moveend', fetchIssues);

    return () => {
      map.current?.remove();
    };
  }, [isAuthenticated]);

  // Add markers for issues
  useEffect(() => {
    if (!map.current || !issues.length) return;

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

      new mapboxgl.Marker(el)
        .setLngLat([issue.location_lng, issue.location_lat])
        .addTo(map.current!);
    });
  }, [issues]);

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={20}>
        <Container maxW="container.xl">
          <Stack spacing={8} align="center" textAlign="center">
            <Heading
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="bold"
              lineHeight="1.2"
            >
              Empowering Communities Through
              <Text as="span" color="blue.500"> Civic Engagement</Text>
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color={useColorModeValue('gray.600', 'gray.400')} maxW="2xl">
              Report local issues, vote on community priorities, and track progress in real-time. Together, we can make our neighborhoods better.
            </Text>
            {!isAuthenticated ? (
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  colorScheme="blue"
                  px={8}
                >
                  Get Started
                </Button>
                <Button
                  as={RouterLink}
                  to="/login"
                  size="lg"
                  variant="outline"
                  px={8}
                >
                  Sign In
                </Button>
              </Stack>
            ) : (
              <Box w="100%" h="400px" borderRadius="lg" overflow="hidden" boxShadow="lg">
                <Box ref={mapContainer} h="100%" />
              </Box>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Feature
              icon={FaMapMarkedAlt}
              title="Report Issues"
              text="Easily report local issues with location tracking and photo uploads. Help identify problems in your community."
            />
            <Feature
              icon={FaVoteYea}
              title="Vote & Prioritize"
              text="Vote on reported issues to help prioritize what matters most to your community."
            />
            <Feature
              icon={FaChartLine}
              title="Track Progress"
              text="Monitor the status of reported issues and see real-time updates on community improvements."
            />
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

// Add this function to handle status colors
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

export default Home; 