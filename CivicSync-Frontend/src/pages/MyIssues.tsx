import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Spinner,
  Center,
  useColorModeValue,
  Image,
  ModalFooter,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

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
  location_address: string;
  location_lat?: number;
  location_lng?: number;
  createdAt: string;
  updatedAt?: string;
  user_id?: string;
  User?: User;
  Media?: Media[];
  image_url?: string; // For backward compatibility
  image?: File; // For file uploads
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

const MyIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedIssueDetails, setSelectedIssueDetails] = useState<Issue | null>(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<{ issues: Issue[], pagination: Pagination }>(
        'http://localhost:3000/api/issues/user', 
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            page: page,
            limit: 10
          }
        }
      );
      
      setIssues(Array.isArray(response.data.issues) ? response.data.issues : []);
      setPagination(response.data.pagination);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: 'Error fetching issues',
        description: axiosError.response?.data?.message || 'Please try again later',
        status: 'error',
        duration: 3000,
      });
      // Set empty array on error
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [page]);

  const handleDelete = async (issueId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`http://localhost:3000/api/issues/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast({
        title: 'Issue deleted successfully',
        status: 'success',
        duration: 3000,
      });
      fetchIssues();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: 'Error deleting issue',
        description: axiosError.response?.data?.message || 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First update the issue details
      await axios.put(`http://localhost:3000/api/issues/${selectedIssue.id}`, {
        title: selectedIssue.title,
        description: selectedIssue.description
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Then upload new image if selected
      if (selectedIssue.image) {
        const formData = new FormData();
        formData.append('file', selectedIssue.image);

        await axios.post(`http://localhost:3000/api/media/issues/${selectedIssue.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast({
        title: 'Issue updated successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
      fetchIssues();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: 'Error updating issue',
        description: axiosError.response?.data?.message || 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'yellow';
      case 'IN_PROGRESS':
        return 'blue';
      case 'RESOLVED':
        return 'green';
      default:
        return 'gray';
    }
  };

  const handleIssueClick = async (issueId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get<Issue>(`http://localhost:3000/api/issues/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedIssueDetails(response.data);
      onDetailsOpen();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: 'Error fetching issue details',
        description: axiosError.response?.data?.message || 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const formatDateString = (issue: Issue | null | undefined): string => {
    if (!issue) return 'N/A';
    
    if (issue.createdAt) {
      const date = new Date(issue.createdAt);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    return 'N/A';
  };

  // Function to get image URL from Media array
  const getImageUrl = (issue: Issue | null): string | null => {
    if (!issue) return null;
    
    // First check if Media array exists and has items
    if (issue.Media && issue.Media.length > 0) {
      return issue.Media[0].file_path;
    }
    
    // Fallback to the legacy image_url property
    if (issue.image_url) {
      return issue.image_url;
    }
    
    return null;
  };

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">My Issues</Heading>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/report-issue')}
          >
            Report New Issue
          </Button>
        </HStack>

        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : issues.length === 0 ? (
          <Center py={10}>
            <Text color="gray.500">No issues reported yet. Click "Report New Issue" to get started!</Text>
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
                onClick={() => handleIssueClick(issue.id)}
              >
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={2}>
                    <Heading size="md">{issue.title}</Heading>
                    <Text color={textColor}>{issue.description}</Text>
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
                    <Text fontSize="sm" color="blue.500">
                      Votes: {issue.vote_count}
                    </Text>
                  </VStack>

                  {issue.status === 'PENDING' && (
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<ChevronDownIcon />}
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList onClick={(e) => e.stopPropagation()}>
                        <MenuItem
                          icon={<EditIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIssue(issue);
                            onOpen();
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(issue.id);
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {issues.length > 0 && pagination && (
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

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Issue</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleEdit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={selectedIssue?.title}
                    onChange={(e) => setSelectedIssue(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={selectedIssue?.description}
                    onChange={(e) => setSelectedIssue(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedIssue(prev => prev ? { ...prev, image: file } : null);
                      }
                    }}
                  />
                  {getImageUrl(selectedIssue) && !selectedIssue?.image && (
                    <Image
                      src={getImageUrl(selectedIssue) || undefined}
                      alt="Current issue"
                      mt={2}
                      maxH="200px"
                      borderRadius="md"
                    />
                  )}
                </FormControl>
                <Button type="submit" colorScheme="blue" width="full">
                  Save Changes
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Issue Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Heading size="md">{selectedIssueDetails?.title}</Heading>
              <HStack>
                <Badge colorScheme={getStatusColor(selectedIssueDetails?.status || '')}>
                  {selectedIssueDetails?.status}
                </Badge>
                <Badge colorScheme="purple">
                  {selectedIssueDetails?.category}
                </Badge>
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text color={textColor} fontSize="md">{selectedIssueDetails?.description}</Text>
              
              <Box>
                <Text fontWeight="medium" mb={2}>Details:</Text>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Location: {selectedIssueDetails?.location_address}
                  </Text>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Created: {formatDateString(selectedIssueDetails)}
                  </Text>
                  <Text fontSize="sm" color="blue.500">
                    Votes: {selectedIssueDetails?.vote_count}
                  </Text>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Status: {selectedIssueDetails?.status}
                  </Text>
                </VStack>
              </Box>

              {getImageUrl(selectedIssueDetails) && (
                <Box>
                  <Text fontWeight="medium" mb={2}>Image:</Text>
                  <Image
                    src={getImageUrl(selectedIssueDetails) || undefined}
                    alt="Issue"
                    borderRadius="md"
                    maxH="400px"
                    w="100%"
                    objectFit="cover"
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Close
            </Button>
            {selectedIssueDetails?.status === 'PENDING' && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  setSelectedIssue(selectedIssueDetails);
                  onDetailsClose();
                  onOpen();
                }}
              >
                Edit Issue
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MyIssues; 