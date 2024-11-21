import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, IconButton, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import format from 'date-fns/format';
import logo from '../../assets/images/logo.png';

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: '80px',
  position: 'fixed',
  top: 0,
  right: 0,
  left: '280px', // Match drawer width
  zIndex: theme.zIndex.appBar,
  backdropFilter: 'blur(8px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
}));

const LogoSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  '& img': {
    height: '50px',
    marginRight: '16px',
  },
});

const InfoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(0.5),
}));

const GreetingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& .MuiTypography-root': {
    fontWeight: 500,
    fontSize: '1.1rem',
  },
}));

const TimeRow = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
}));

const AdminHeader: React.FC = () => {
  const theme = useTheme();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'Good Morning';
      if (hour >= 12 && hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    };

    setGreeting(getGreeting());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setGreeting(getGreeting());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return <WbSunnyIcon sx={{ color: theme.palette.warning.main }} />;
    if (hour >= 12 && hour < 17) return <WbSunnyIcon sx={{ color: theme.palette.warning.main }} />;
    return <Brightness2Icon sx={{ color: theme.palette.primary.main }} />;
  };

  return (
    <HeaderContainer>
      <LogoSection>
        <img src={logo} alt="J5 Pharmacy Logo" />
      </LogoSection>
      <InfoSection>
        <GreetingRow>
          <Typography>{greeting}</Typography>
          <IconButton size="small" sx={{ p: 0 }}>
            {getTimeIcon()}
          </IconButton>
        </GreetingRow>
        <TimeRow>
          {format(currentTime, 'EEEE, MMMM d, yyyy h:mm:ss aa')}
        </TimeRow>
      </InfoSection>
    </HeaderContainer>
  );
};

export default AdminHeader;
