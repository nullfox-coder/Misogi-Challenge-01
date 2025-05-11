import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Input,
  Select,
  Spinner,
  Center,
  useColorModeValue,
  Image,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Heading,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  vote_count: number;
  location_address: string;
  createdAt: string;
  image_url?: string;
  has_voted?: boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PublicFeed = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
      };

      if (searchQuery) params.search = searchQuery;
      if (category) params.category = category;
      if (status) params.status = status;
      if (sortBy) params.sort = sortBy;

      const response = await axios.get<{ issues: Issue[], pagination: Pagination }>('http://localhost:3000/api/issues', {
        headers,
        params
      });

      setIssues(response.data.issues);
      setPagination(response.data.pagination);
      
      if (response.data.issues.length === 0) {
        toast({
          title: 'No matches found',
          description: 'Try adjusting your search criteria',
          status: 'info',
          duration: 3000,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error?: { name: string } }>;
      
      if (axiosError.response?.data?.error?.name === 'SequelizeDatabaseError') {
        toast({
          title: 'Search Error',
          description: 'Unable to perform search. Please try different search terms.',
          status: 'error',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Error fetching issues',
          description: axiosError.response?.data?.message || 'Please try again later',
          status: 'error',
          duration: 3000,
        });
      }
      
      setIssues([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [page, searchQuery, category, status, sortBy]);

  const handleVote = async (issueId: string) => {
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

      await axios.post(`http://localhost:3000/api/votes/issues/${issueId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Vote recorded',
        status: 'success',
        duration: 3000,
      });
      fetchIssues();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'IN_PROGRESS': return 'blue';
      case 'RESOLVED': return 'green';
      default: return 'gray';
    }
  };

  const formatDateString = (issue: Issue): string => {
    if (!issue) return 'N/A';
    
    if (issue.createdAt) {
      return issue.createdAt.split('T')[0];
    }
    
    return 'N/A';
  };

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <HStack spacing={4} wrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>

          <Select
            placeholder="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            maxW="200px"
          >
            <option value="">All Categories</option>
            <option value="ROAD">Road</option>
            <option value="WATER">Water</option>
            <option value="SANITATION">Sanitation</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="OTHER">Other</option>
          </Select>

          <Select
            placeholder="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            maxW="200px"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </Select>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Sort by: {sortBy === 'newest' ? 'Newest' : 'Most Voted'}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => {
                setSortBy('newest');
                setPage(1);
              }}>Newest</MenuItem>
              <MenuItem onClick={() => {
                setSortBy('votes');
                setPage(1);
              }}>Most Voted</MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : issues.length === 0 ? (
          <Center py={10}>
            <Text color="gray.500">No issues found matching your criteria</Text>
          </Center>
        ) : (
          <VStack spacing={4} align="stretch">
            {issues.map((issue) => (
              <Box
                key={issue.id}
                p={6}
                borderWidth={1}
                borderRadius="lg"
                boxShadow="sm"
                _hover={{ boxShadow: 'md' }}
                cursor="pointer"
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={2}>
                    <Heading size="md">{issue.title}</Heading>
                    <Text color={textColor} noOfLines={2}>{issue.description}</Text>
                    <HStack>
                      <Badge colorScheme={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                      <Badge colorScheme="purple">
                        {issue.category}
                      </Badge>
                      <Text fontSize="sm" color={secondaryTextColor}>
                        {formatDateString(issue)}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={secondaryTextColor}>
                      Location: {issue.location_address}
                    </Text>
                    <HStack>
                      <Text fontSize="sm" color="blue.500">
                        Votes: {issue.vote_count}
                      </Text>
                      <Button
                        size="sm"
                        colorScheme={issue.has_voted ? "gray" : "blue"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(issue.id);
                        }}
                        isDisabled={issue.has_voted}
                      >
                        {issue.has_voted ? 'Voted' : 'Vote'}
                      </Button>
                    </HStack>
                  </VStack>
                  {issue.image_url && (
                    <Image
                      src={issue.image_url}
                      alt={issue.title}
                      maxH="100px"
                      borderRadius="md"
                    />
                  )}
                </HStack>
              </Box>
            ))}

            {pagination && (
              <HStack justify="center" spacing={4} mt={4}>
                <Button
                  isDisabled={!pagination.hasPrevPage}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Text>
                  {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)}/
                  {pagination.total} · Page {pagination.page} of {pagination.totalPages}
                </Text>
                <Button
                  isDisabled={!pagination.hasNextPage}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </HStack>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default PublicFeed; 