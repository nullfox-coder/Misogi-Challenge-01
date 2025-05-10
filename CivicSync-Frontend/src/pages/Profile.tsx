import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useToast,
  Spinner,
  Badge,
  Grid,
  GridItem,
  Divider,
  Avatar,
} from '@chakra-ui/react';
import axios from 'axios';
import type { AxiosError } from 'axios';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get<UserProfile>('http://localhost:3000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast({
          title: 'Error fetching profile',
          description: axiosError.response?.data?.message || 'Please try again later',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  if (isLoading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container centerContent py={10}>
        <Text>Failed to load profile</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <Box textAlign="center" mb={8}>
          <Heading size="xl" mb={2}>My Profile</Heading>
          <Text color="gray.500">View and manage your account information</Text>
        </Box>

        {/* Profile Card */}
        <Box p={8} borderWidth={1} borderRadius="xl" boxShadow="lg">
          <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={8}>
            {/* Left Column - Avatar and Role */}
            <GridItem>
              <VStack spacing={6}>
                <Avatar size="2xl" name={profile.name} />
                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
                  {profile.role}
                </Badge>
              </VStack>
            </GridItem>

            {/* Right Column - User Details */}
            <GridItem>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Full Name</Text>
                  <Text fontSize="lg" fontWeight="medium">{profile.name}</Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Email Address</Text>
                  <Text fontSize="lg" fontWeight="medium">{profile.email}</Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Member Since</Text>
                  <Text fontSize="lg" fontWeight="medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </Text>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </Box>

        {/* Quick Stats Section */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          <Box p={6} borderWidth={1} borderRadius="lg" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">0</Text>
            <Text color="gray.500">Issues Reported</Text>
          </Box>
          <Box p={6} borderWidth={1} borderRadius="lg" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.500">0</Text>
            <Text color="gray.500">Votes Cast</Text>
          </Box>
          <Box p={6} borderWidth={1} borderRadius="lg" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="purple.500">0</Text>
            <Text color="gray.500">Active Contributions</Text>
          </Box>
        </Grid>
      </VStack>
    </Container>
  );
};

export default Profile; 