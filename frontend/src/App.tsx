import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, TextField, List, ListItem, ListItemText, CircularProgress, AppBar, Toolbar, IconButton, Grid, Drawer, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { AuthClient } from '@dfinity/auth-client';
import { backend } from 'declarations/backend';
import MessageIcon from '@mui/icons-material/Message';
import ReplyIcon from '@mui/icons-material/Reply';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

type Category = 'All' | 'News' | 'Crypto' | 'Sports' | 'Other';

interface Msg {
  id: string;
  author: string;
  content: string;
  category: Category;
  timestamp: bigint;
  replies: string[];
  likes: number;
  shares: number;
}

interface UserProfile {
  username: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [newMsg, setNewMsg] = useState<string>('');
  const [newMsgCategory, setNewMsgCategory] = useState<Category>('All');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

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
      const fetchedMsgs = await backend.getMsgsByCategory(selectedCategory);
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
      const result = await backend.createMsg(newMsg, newMsgCategory);
      if ('ok' in result) {
        setNewMsg('');
        setNewMsgCategory('All');
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

  const handleLikeMsg = async (msgId: string) => {
    try {
      await backend.likeMsg(msgId);
      fetchMsgs();
    } catch (error) {
      console.error('Error liking msg:', error);
    }
  };

  const handleShareMsg = async (msgId: string) => {
    try {
      await backend.shareMsg(msgId);
      fetchMsgs();
    } catch (error) {
      console.error('Error sharing msg:', error);
    }
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    fetchMsgs();
  };

  const categoryIcons = {
    All: <MessageIcon />,
    News: <NewspaperIcon />,
    Crypto: <CurrencyBitcoinIcon />,
    Sports: <SportsBaseballIcon />,
    Other: <MoreHorizIcon />,
  };

  return (
    <>
      <AppBar position="static" color="transparent">
        <Toolbar>
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
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <List>
              {Object.entries(categoryIcons).map(([category, icon]) => (
                <ListItem
                  button
                  key={category}
                  onClick={() => handleCategoryChange(category as Category)}
                  selected={selectedCategory === category}
                >
                  <IconButton>{icon}</IconButton>
                  <ListItemText primary={category} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={9}>
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
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={newMsgCategory}
                        onChange={(e) => setNewMsgCategory(e.target.value as Category)}
                      >
                        {Object.keys(categoryIcons).map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      onClick={handleCreateMsg}
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{ mt: 2 }}
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
                    <ListItem key={msg.id} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={msg.content}
                        secondary={`${msg.author} - ${new Date(Number(msg.timestamp) / 1000000).toLocaleString()} - ${msg.category}`}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1 }}>
                        <IconButton onClick={() => {}} size="small">
                          <ReplyIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 1 }}>{msg.replies.length}</Typography>
                        </IconButton>
                        <IconButton onClick={() => handleLikeMsg(msg.id)} size="small">
                          <ThumbUpIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 1 }}>{msg.likes}</Typography>
                        </IconButton>
                        <IconButton onClick={() => handleShareMsg(msg.id)} size="small">
                          <ShareIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 1 }}>{msg.shares}</Typography>
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default App;
