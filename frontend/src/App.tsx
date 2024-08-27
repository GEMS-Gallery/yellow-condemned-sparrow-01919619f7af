import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, TextField, List, ListItem, ListItemText, CircularProgress, AppBar, Toolbar } from '@mui/material';
import { AuthClient } from '@dfinity/auth-client';
import { backend } from 'declarations/backend';
import MessageIcon from '@mui/icons-material/Message';

interface Msg {
  id: string;
  author: string;
  content: string;
  timestamp: bigint;
}

interface UserProfile {
  username: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [newMsg, setNewMsg] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      if (isAuthenticated) {
        fetchUserProfile();
      }
    };
    initAuth();
    fetchMsgs();
  }, []);

  const login = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app',
        onSuccess: () => {
          setIsAuthenticated(true);
          fetchUserProfile();
        },
      });
    }
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
      setUserProfile(null);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const profile = await backend.getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMsgs = async () => {
    setLoading(true);
    try {
      const fetchedMsgs = await backend.getTimeline();
      setMsgs(fetchedMsgs);
    } catch (error) {
      console.error('Error fetching msgs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMsg = async () => {
    if (newMsg.trim() === '') return;
    setLoading(true);
    try {
      const result = await backend.createMsg(newMsg);
      if ('ok' in result) {
        setNewMsg('');
        fetchMsgs();
      } else {
        console.error('Error creating msg:', result.err);
      }
    } catch (error) {
      console.error('Error creating msg:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <MessageIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PostMsg
          </Typography>
          {isAuthenticated ? (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={login}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          {isAuthenticated && (
            <>
              {userProfile && (
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Welcome, {userProfile.username}!
                </Typography>
              )}
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="What's happening?"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <Button
                  onClick={handleCreateMsg}
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Post Msg'}
                </Button>
              </Box>
            </>
          )}
          {loading ? (
            <CircularProgress />
          ) : (
            <List>
              {msgs.map((msg) => (
                <ListItem key={msg.id} divider>
                  <ListItemText
                    primary={msg.content}
                    secondary={`${msg.author} - ${new Date(Number(msg.timestamp) / 1000000).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Container>
    </>
  );
};

export default App;
