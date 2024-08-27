import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, TextField, List, ListItem, ListItemText, CircularProgress, AppBar, Toolbar } from '@mui/material';
import { AuthClient } from '@dfinity/auth-client';
import { backend } from 'declarations/backend';

interface Tweet {
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
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [newTweet, setNewTweet] = useState<string>('');
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
    fetchTweets();
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

  const fetchTweets = async () => {
    setLoading(true);
    try {
      const fetchedTweets = await backend.getTimeline();
      setTweets(fetchedTweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTweet = async () => {
    if (newTweet.trim() === '') return;
    setLoading(true);
    try {
      const result = await backend.createTweet(newTweet);
      if ('ok' in result) {
        setNewTweet('');
        fetchTweets();
      } else {
        console.error('Error creating tweet:', result.err);
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Twitter Clone
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
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                />
                <Button
                  onClick={handleCreateTweet}
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Tweet'}
                </Button>
              </Box>
            </>
          )}
          {loading ? (
            <CircularProgress />
          ) : (
            <List>
              {tweets.map((tweet) => (
                <ListItem key={tweet.id} divider>
                  <ListItemText
                    primary={tweet.content}
                    secondary={`${tweet.author} - ${new Date(Number(tweet.timestamp) / 1000000).toLocaleString()}`}
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
