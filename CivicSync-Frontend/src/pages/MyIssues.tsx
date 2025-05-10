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

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  vote_count: number;
  location_address: string;
  created_at: string;
  image_url?: string;
  image?: File;
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

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<{ issues: Issue[], pagination: Pagination }>('http://localhost:3000/api/issues/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Update to use response.data.issues instead of response.data
      setIssues(Array.isArray(response.data.issues) ? response.data.issues : []);
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
  }, []);

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
                        {new Date(issue.created_at).toLocaleDateString()}
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
                  {selectedIssue?.image_url && !selectedIssue.image && (
                    <Image
                      src={selectedIssue.image_url}
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
                    Created: {selectedIssueDetails?.created_at && new Date(selectedIssueDetails.created_at).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm" color="blue.500">
                    Votes: {selectedIssueDetails?.vote_count}
                  </Text>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Status: {selectedIssueDetails?.status}
                  </Text>
                </VStack>
              </Box>

              {selectedIssueDetails?.image_url && (
                <Box>
                  <Text fontWeight="medium" mb={2}>Image:</Text>
                  <Image
                    src={selectedIssueDetails.image_url}
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