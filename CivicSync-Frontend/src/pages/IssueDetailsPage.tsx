import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  Image,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Grid,
  GridItem,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { ArrowBackIcon, TimeIcon } from '@chakra-ui/icons';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

interface Media {
  id: string;
  file_path: string;
  file_type: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  vote_count: number;
  location_lat: number;
  location_lng: number;
  location_address: string;
  createdAt: string;
  updatedAt: string;
  user_id: string;
  User: User;
  Media: Media[];
  has_voted: boolean;
}

const IssueDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get<Issue>(`http://localhost:3000/api/issues/${id}`, {
          headers
        });

        setIssue(response.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast({
          title: 'Error fetching issue details',
          description: axiosError.response?.data?.message || 'Please try again later',
          status: 'error',
          duration: 3000,
        });
        navigate('/feed');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchIssueDetails();
    }
  }, [id, toast, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'IN_PROGRESS': return 'blue';
      case 'RESOLVED': return 'green';
      default: return 'gray';
    }
  };

  const formatDateString = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleVote = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please login to vote',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      await axios.post(`http://localhost:3000/api/votes/issues/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Vote recorded',
        status: 'success',
        duration: 3000,
      });
      
      // Refresh issue data
      const response = await axios.get<Issue>(`http://localhost:3000/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssue(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: 'Error voting',
        description: axiosError.response?.data?.message || 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getImageUrl = () => {
    if (!issue || !issue.Media || issue.Media.length === 0) return null;
    return issue.Media[0].file_path;
  };

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={10}>
        <Center py={10}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      </Container>
    );
  }

  if (!issue) {
    return (
      <Container maxW="container.lg" py={10}>
        <Center py={10}>
          <Text>Issue not found</Text>
        </Center>
      </Container>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <Container maxW="container.lg" py={8}>
      <Flex mb={6} align="center">
        <IconButton 
          aria-label="Back" 
          icon={<ArrowBackIcon />} 
          mr={3} 
          onClick={() => navigate(-1)} 
          variant="ghost"
        />
        <Heading size="lg">Issue Details</Heading>
      </Flex>
      
      <Grid 
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={8}
      >
        {/* Left column - Image and Voting */}
        <GridItem>
          <Card bg={bgColor} boxShadow="md" borderColor={borderColor} mb={6}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={issue.title}
                borderTopRadius="md"
                maxH="400px"
                w="100%"
                objectFit="cover"
              />
            ) : (
              <Box 
                height="200px" 
                bg="gray.100" 
                borderTopRadius="md" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Text color="gray.500">No image available</Text>
              </Box>
            )}
            <CardBody>
              <HStack justify="space-between" align="center" mt={2}>
                <Box>
                  <Text fontWeight="bold" color="blue.500">
                    Votes: {issue.vote_count}
                  </Text>
                </Box>
                <Button
                  colorScheme={issue.has_voted ? "gray" : "blue"}
                  onClick={handleVote}
                  isDisabled={issue.has_voted}
                  size="md"
                >
                  {issue.has_voted ? 'Voted' : 'Support this issue'}
                </Button>
              </HStack>
            </CardBody>
          </Card>
          
          <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
            <CardHeader pb={2}>
              <Text fontWeight="bold" fontSize="lg">Location Information</Text>
            </CardHeader>
            <Divider />
            <CardBody pt={4}>
              <Text fontSize="md" color={textColor} mb={3}>{issue.location_address}</Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                Coordinates: {issue.location_lat.toFixed(6)}, {issue.location_lng.toFixed(6)}
              </Text>
            </CardBody>
          </Card>
        </GridItem>
        
        {/* Right column - Issue details */}
        <GridItem>
          <Card bg={bgColor} boxShadow="md" borderColor={borderColor} mb={6}>
            <CardHeader pb={2}>
              <Heading size="md">{issue.title}</Heading>
              
              <HStack mt={2} spacing={3} wrap="wrap">
                <Badge colorScheme={getStatusColor(issue.status)} py={1} px={2}>
                  {issue.status}
                </Badge>
                <Badge colorScheme="purple" py={1} px={2}>
                  {issue.category}
                </Badge>
                <HStack color={secondaryTextColor}>
                  <TimeIcon />
                  <Text fontSize="sm">{formatDateString(issue.createdAt)}</Text>
                </HStack>
              </HStack>
            </CardHeader>
            <Divider />
            <CardBody pt={4}>
              <Text fontWeight="bold" mb={2}>Description</Text>
              <Text color={textColor} mb={4}>{issue.description}</Text>
            </CardBody>
          </Card>
          
          <Card bg={bgColor} boxShadow="md" borderColor={borderColor} mb={6}>
            <CardHeader pb={2}>
              <Text fontWeight="bold" fontSize="lg">Issue Information</Text>
            </CardHeader>
            <Divider />
            <CardBody pt={4}>
              <Grid templateColumns="1fr 2fr" gap={4}>
                <Text fontWeight="medium">ID:</Text>
                <Text fontSize="sm" isTruncated>
                  <Tooltip label={issue.id}>
                    {issue.id}
                  </Tooltip>
                </Text>
                
                <Text fontWeight="medium">Status:</Text>
                <Badge colorScheme={getStatusColor(issue.status)} width="fit-content">
                  {issue.status}
                </Badge>
                
                <Text fontWeight="medium">Category:</Text>
                <Badge colorScheme="purple" width="fit-content">
                  {issue.category}
                </Badge>
                
                <Text fontWeight="medium">Created:</Text>
                <Text>{formatDateString(issue.createdAt)}</Text>
                
                <Text fontWeight="medium">Updated:</Text>
                <Text>{formatDateString(issue.updatedAt)}</Text>
                
                <Text fontWeight="medium">Votes:</Text>
                <Text color="blue.500" fontWeight="bold">{issue.vote_count}</Text>
              </Grid>
            </CardBody>
          </Card>
          
          <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
            <CardHeader pb={2}>
              <Text fontWeight="bold" fontSize="lg">Reported By</Text>
            </CardHeader>
            <Divider />
            <CardBody pt={4}>
              <Text fontSize="md" fontWeight="medium">{issue.User.name}</Text>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default IssueDetailsPage; 