import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  useToast,
  Image,
  IconButton,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import type { AxiosError } from 'axios';

// Set your Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface LocationSuggestion {
  place_name: string;
  center: [number, number];
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  location_lat?: string;
  location_lng?: string;
}

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    location_lat: 0,
    location_lng: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Colors for dark/light mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [78.9629, 20.5937], // Center of India
      zoom: 4
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Add click handler for map
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      
      try {
        // Reverse geocode the clicked location
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
          {
            params: {
              access_token: mapboxgl.accessToken,
              types: 'place,address',
              country: 'in'
            }
          }
        );

        if (response.data.features.length > 0) {
          const place = response.data.features[0];
          setFormData(prev => ({
            ...prev,
            location: place.place_name,
            location_lat: lat,
            location_lng: lng
          }));

          // Update marker
          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          } else {
            marker.current = new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .addTo(map.current!);
          }
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        toast({
          title: 'Error getting location details',
          status: 'error',
          duration: 3000,
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [toast]);

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: value }));

    if (value.length > 2) {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json`,
          {
            params: {
              access_token: mapboxgl.accessToken,
              types: 'place,address',
              limit: 5,
              country: 'in', // Limit to India
              bbox: '68.1766451354,7.96553477623,97.4025614766,35.4940095078' // India's bounding box
            }
          }
        );
        setLocationSuggestions(response.data.features);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      }
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion.place_name,
      location_lat: suggestion.center[1],
      location_lng: suggestion.center[0]
    }));
    setShowSuggestions(false);

    // Update map
    if (map.current) {
      map.current.flyTo({
        center: suggestion.center,
        zoom: 14
      });

      // Update or create marker
      if (marker.current) {
        marker.current.setLngLat(suggestion.center);
      } else {
        marker.current = new mapboxgl.Marker()
          .setLngLat(suggestion.center)
          .addTo(map.current);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Category validation
    if (!formData.category || !['ROAD', 'WATER', 'SANITATION', 'ELECTRICITY', 'OTHER'].includes(formData.category)) {
      newErrors.category = 'Please select a valid category';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Coordinates validation
    if (!formData.location_lat || !formData.location_lng) {
      newErrors.location = 'Please select a location on the map';
    } else {
      if (isNaN(formData.location_lat) || formData.location_lat < -90 || formData.location_lat > 90) {
        newErrors.location_lat = 'Invalid latitude';
      }
      if (isNaN(formData.location_lng) || formData.location_lng < -180 || formData.location_lng > 180) {
        newErrors.location_lng = 'Invalid longitude';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please check all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create issue
      const response = await axios.post('http://localhost:3000/api/issues', {
        ...formData,
        location_address: formData.location // Using the location as address
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Upload image if exists
      if (imagePreview) {
        const imageBlob = await fetch(imagePreview).then(r => r.blob());
        const formData = new FormData();
        formData.append('file', imageBlob);

        await axios.post(`http://localhost:3000/api/media/issues/${response.data.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast({
        title: 'Issue reported successfully',
        status: 'success',
        duration: 3000,
      });
      navigate('/my-issues');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: 'Error reporting issue',
        description: axiosError.response?.data?.message || 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading>Report an Issue</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl isRequired isInvalid={!!errors.title}>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
              />
              {errors.title && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.title}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: undefined });
                  }
                }}
              />
              {errors.description && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.description}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.category}>
              <FormLabel>Category</FormLabel>
              <Select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) {
                    setErrors({ ...errors, category: undefined });
                  }
                }}
              >
                <option value="">Select a category</option>
                <option value="ROAD">Road</option>
                <option value="WATER">Water</option>
                <option value="SANITATION">Sanitation</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="OTHER">Other</option>
              </Select>
              {errors.category && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.category}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.location}>
              <FormLabel>Location</FormLabel>
              <InputGroup>
                <Input
                  value={formData.location}
                  onChange={(e) => {
                    handleLocationChange(e);
                    if (errors.location) {
                      setErrors({ ...errors, location: undefined });
                    }
                  }}
                  placeholder="Type to search location in India or click on the map..."
                />
                {formData.location && (
                  <InputRightElement>
                    <IconButton
                      aria-label="Clear location"
                      icon={<CloseIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, location: '', location_lat: 0, location_lng: 0 }));
                        marker.current?.remove();
                        marker.current = null;
                        setErrors({ ...errors, location: undefined });
                      }}
                    />
                  </InputRightElement>
                )}
              </InputGroup>
              {errors.location && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.location}
                </Text>
              )}
              {showSuggestions && locationSuggestions.length > 0 && (
                <List
                  position="absolute"
                  zIndex={1000}
                  bg={bgColor}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  width="100%"
                  maxH="200px"
                  overflowY="auto"
                  boxShadow="lg"
                >
                  {locationSuggestions.map((suggestion, index) => (
                    <ListItem
                      key={index}
                      p={2}
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      onClick={() => handleLocationSelect(suggestion)}
                    >
                      {suggestion.place_name}
                    </ListItem>
                  ))}
                </List>
              )}
            </FormControl>

            <Box w="100%" h="300px" borderRadius="lg" overflow="hidden" position="relative">
              <Box ref={mapContainer} h="100%" />
              <Text
                position="absolute"
                bottom={2}
                left={2}
                bg={bgColor}
                p={2}
                borderRadius="md"
                fontSize="sm"
                boxShadow="md"
              >
                Click on the map to select a location
              </Text>
            </Box>

            <FormControl>
              <FormLabel>Image (Optional)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <Box mt={2} position="relative" display="inline-block">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    maxH="200px"
                    borderRadius="md"
                  />
                  <IconButton
                    aria-label="Remove image"
                    icon={<CloseIcon />}
                    size="sm"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={() => setImagePreview(null)}
                  />
                </Box>
              )}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isLoading}
            >
              Report Issue
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
};

export default ReportIssue; 