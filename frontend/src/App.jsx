import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import { AppShell } from './ui/layouts/AppShell';
import { Header } from './ui/layouts/Header';
import { Sidebar } from './ui/layouts/Sidebar';

// Pages
import Landing from './pages/Landing';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Attendance from './pages/Attendance';
import Voting from './pages/Voting';
import Feedback from './pages/Feedback';
import Certificates from './pages/Certificates';

function AppContent() {
  const location = useLocation();
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useWallet();

  // Landing page is full-width, no sidebar
  const isLandingPage = location.pathname === '/';

  // Determine user role based on path (simplified)
  const userRole = location.pathname.startsWith('/organizer') ? 'organizer' : 'student';

  if (isLandingPage) {
    return (
      <AppShell
        hasSidebar={false}
        header={
          <Header
            isConnected={isConnected}
            walletAddress={walletAddress}
            onConnectWallet={connectWallet}
            onDisconnect={disconnectWallet}
          />
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </AppShell>
    );
  }

  return (
    <AppShell
      hasSidebar={true}
      header={
        <Header
          isConnected={isConnected}
          walletAddress={walletAddress}
          onConnectWallet={connectWallet}
          onDisconnect={disconnectWallet}
        />
      }
      sidebar={<Sidebar userRole={userRole} />}
    >
      <Routes>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/attendance/:eventId" element={<Attendance />} />
        <Route path="/voting/:electionId" element={<Voting />} />
        <Route path="/feedback/:eventId" element={<Feedback />} />
        <Route path="/certificates" element={<Certificates />} />
      </Routes>
    </AppShell>
  );
}

function App() {
  return (
    <WalletProvider>
      <Router>
        <AppContent />
      </Router>
    </WalletProvider>
  );
}

export default App;
