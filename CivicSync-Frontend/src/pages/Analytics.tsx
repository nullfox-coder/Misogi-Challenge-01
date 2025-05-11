import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  useToast,
  useColorModeValue,
  Select,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartDataLabels);

interface CategoryCount {
  category: string;
  count: number;
}

interface DailySubmission {
  date: string;
  count: number;
}

interface TopIssue {
  id: string;
  title: string;
  status: string;
  vote_count: number;
  created_at: string;
}

interface CategorySummary {
  total_votes: number;
  total_issues: number;
  average_votes: number;
}

// Define category colors with better contrast
const categoryColors = {
  'ROAD': '#FF6384',       // Bright red
  'WATER': '#36A2EB',      // Sky blue
  'SANITATION': '#FFCE56', // Golden yellow
  'ELECTRICITY': '#4BC0C0', // Teal
  'OTHER': '#9966FF'       // Purple
};

const Analytics = () => {
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [dailySubmissions, setDailySubmissions] = useState<DailySubmission[]>([]);
  const [topIssues, setTopIssues] = useState<Record<string, TopIssue[]>>({});
  const [categorySummary, setCategorySummary] = useState<Record<string, CategorySummary>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('ROAD');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch issues by category
        const categoryResponse = await axios.get<{ categories: CategoryCount[] }>(
          'http://localhost:3000/api/analytics/issues-by-category'
        );
        
        // Fetch daily submissions
        const submissionsResponse = await axios.get<DailySubmission[]>(
          'http://localhost:3000/api/analytics/daily-submissions'
        );
        
        // Fetch most voted issues by category
        const votedResponse = await axios.get<{ top_issues: Record<string, TopIssue[]>, summary: Record<string, CategorySummary> }>(
          'http://localhost:3000/api/analytics/most-voted-by-category'
        );
        
        setCategoryData(categoryResponse.data.categories);
        setDailySubmissions(submissionsResponse.data);
        setTopIssues(votedResponse.data.top_issues);
        setCategorySummary(votedResponse.data.summary);
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast({
          title: 'Error fetching analytics data',
          description: axiosError.response?.data?.message || 'Please try again later',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [toast]);

  // Prepare data for category donut chart
  const categoryChartData = {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        data: categoryData.map(item => item.count),
        backgroundColor: categoryData.map(item => categoryColors[item.category as keyof typeof categoryColors]),
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for daily submissions line chart
  const submissionsChartData = {
    labels: dailySubmissions.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Submissions',
        data: dailySubmissions.map(item => item.count),
        borderColor: '#4299E1',
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Prepare data for votes by category bar chart
  const votesByCategoryData = {
    labels: Object.keys(categorySummary),
    datasets: [
      {
        label: 'Total Votes',
        data: Object.values(categorySummary).map(item => item.total_votes),
        backgroundColor: Object.keys(categorySummary).map(category => 
          categoryColors[category as keyof typeof categoryColors]
        ),
        borderWidth: 1,
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'red';
      case 'IN_PROGRESS':
        return 'blue';
      case 'RESOLVED':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Analytics Dashboard</Heading>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
          <Spinner size="xl" color="blue.500" />
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {/* Issues by Category Chart */}
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
            <Heading size="md" mb={4}>Issues by Category</Heading>
            <Box height="300px">
              <Doughnut 
                data={categoryChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </Box>
          </Box>
          
          {/* Daily Submissions Chart */}
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
            <Heading size="md" mb={4}>Daily Submissions (Last 7 Days)</Heading>
            <Box height="300px">
              <Line 
                data={submissionsChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
          
          {/* Votes by Category Chart */}
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
            <Heading size="md" mb={4}>Votes by Category</Heading>
            <Box height="300px">
              <Bar 
                data={votesByCategoryData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          return `Votes: ${value}`;
                        },
                        afterLabel: function(context) {
                          const index = context.dataIndex;
                          const category = Object.keys(categorySummary)[index];
                          const stats = categorySummary[category];
                          return `Issues: ${stats.total_issues} (${stats.average_votes} votes/issue)`;
                        }
                      }
                    },
                    datalabels: {
                      anchor: 'end',
                      align: 'top',
                      formatter: (value: number) => value,
                      font: {
                        weight: 'bold'
                      },
                      color: '#333',
                      offset: 4
                    }
                  }
                }}
              />
            </Box>
          </Box>
          
          {/* Category Summary Stats */}
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} gridColumn={{ md: "span 3" }}>
            <Heading size="md" mb={4}>Category Summary</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={4}>
              {Object.entries(categorySummary).map(([category, stats]) => (
                <Box 
                  key={category} 
                  p={3} 
                  borderWidth="1px" 
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor={categoryColors[category as keyof typeof categoryColors]}
                >
                  <Stat>
                    <StatLabel>{category}</StatLabel>
                    <StatNumber>{stats.total_issues}</StatNumber>
                    <StatHelpText>
                      {stats.total_votes} votes (avg: {stats.average_votes})
                    </StatHelpText>
                  </Stat>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
          
          {/* Most Voted Issues Table */}
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} gridColumn={{ md: "span 3" }}>
            <Heading size="md" mb={4}>Most Voted Issues</Heading>
            <HStack mb={4}>
              <Text>Category:</Text>
              <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} maxW="200px">
                {Object.keys(topIssues).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </HStack>
            
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Status</Th>
                    <Th isNumeric>Votes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {topIssues[selectedCategory]?.map(issue => (
                    <Tr key={issue.id}>
                      <Td>{issue.title}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </Td>
                      <Td isNumeric>{issue.vote_count}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </SimpleGrid>
      )}
    </Container>
  );
};

export default Analytics; 