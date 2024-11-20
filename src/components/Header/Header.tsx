import React, { useEffect, useState } from 'react';
import { Box, Typography, TypographyProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from '../../assets/images/logo.png';

// Styled components
const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: theme.spacing(1, 2),
  gap: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', // Softer shadow
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  height: '65px', // Increased height
  padding: '4px 0', // Added padding to give some breathing room
});

const Logo = styled('img')({
  height: '100%',
  width: 'auto',
  objectFit: 'contain',
  display: 'block',
});

const GreetingText = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '1.1rem',
  lineHeight: 1.2,
  color: theme.palette.primary.contrastText,
  marginLeft: theme.spacing(1), // Added margin for better spacing
}));

const Header: React.FC = () => {
  const [greeting, setGreeting] = useState<string>('');
  const username = 'Admin'; // This will be replaced with actual user data later

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };

    setGreeting(getGreeting());

    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <HeaderContainer>
      <LogoContainer>
        <Logo 
          src={logo}
          alt="J5 Pharmacy Logo"
          loading="eager"
        />
      </LogoContainer>
      <GreetingText sx={{ flexGrow: 1 }}>
        {greeting},<br />{username}
      </GreetingText>
    </HeaderContainer>
  );
};

export default Header;
