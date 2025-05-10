import { Box, Flex, Button, useColorModeValue, Stack, useColorMode, IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isAuthenticated, logout } = useAuth();

  return (
    <Box bg={bg} px={4} borderBottom="1px" borderColor={borderColor} position="relative" zIndex={1000}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <RouterLink to="/">
          <Box fontWeight="bold" fontSize="xl">CivicSync</Box>
        </RouterLink>

        <Flex alignItems={'center'}>
          <Stack direction={'row'} spacing={7}>
            <Button
              as={RouterLink}
              to="/map"
              variant="ghost"
              fontWeight="normal"
            >
              Map View
            </Button>
            <Button
              as={RouterLink}
              to="/feed"
              variant="ghost"
              fontWeight="normal"
            >
              Feed
            </Button>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            />
            {isAuthenticated ? (
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">
                  Profile
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">My Profile</MenuItem>
                  <MenuItem as={RouterLink} to="/my-issues">My Issues</MenuItem>
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  fontWeight="normal"
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme="blue"
                  fontWeight="normal"
                >
                  Register
                </Button>
              </>
            )}
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 