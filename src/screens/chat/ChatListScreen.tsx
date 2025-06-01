"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, TouchableOpacity } from "react-native"
import { Text, Card, Avatar, Badge } from "react-native-paper"
import { useApi } from "../../context/ApiContext"
import { useAuth } from "../../context/AuthContext"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ChatStackParamList } from "../../navigation/MainNavigator"

type ChatListScreenNavigationProp = StackNavigationProp<ChatStackParamList, "ChatList">

type Props = {
  navigation: ChatListScreenNavigationProp
}

interface Chat {
  _id: string
  title: string
  participants: {
    _id: string
    name: string
    avatar?: string
  }[]
  lastMessage?: {
    content: string
    sender: {
      _id: string
      name: string
    }
    createdAt: string
    read: boolean
  }
  unreadCount: number
  updatedAt: string
}

const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { api, API_URL } = useApi();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setError(null);
      const response = await api.get('/api/chats');
      setChats(response.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getImageUrl = (path?: string): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:image')) return path;
    const localPath = path.startsWith('/') ? path : `/${path}`;
    if (!localPath.includes('placeholder')) {
      return `${API_URL}${localPath}`;
    }
    return null;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getChatTitle = (chat: Chat): string => {
    if (chat.title) return chat.title;
    
    // For direct messages, show the other participant's name
    if (chat.participants.length === 2) {
      const otherParticipant = chat.participants.find(p => p._id !== currentUser?._id);
      return otherParticipant?.name || 'Chat';
    }
    
    // For group chats without a title, list participants
    return chat.participants.map(p => p.name).join(', ');
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const chatTitle = getChatTitle(item);
    const otherParticipant = item.participants.find(p => p._id !== currentUser?._id);
    const avatarUrl = getImageUrl(otherParticipant?.avatar);
    
    return (
      <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { chatId: item._id })}>
        <Card style={styles.chatCard}>
          <View style={styles.chatItem}>
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                size={50} 
                source={avatarUrl ? { uri: avatarUrl } : require('../../assets/placeholder-avatar.png')} 
              />
              {item.unreadCount > 0 && (
                <Badge style={styles.badge}>{item.unreadCount}</Badge>
              )}
            </View>
            
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatTitle, item.unreadCount > 0 && styles.unreadTitle]}>
                  {chatTitle}
                </Text>
                <Text style={styles.timestamp}>
                  {item.lastMessage ? formatTime(item.lastMessage.createdAt) : formatTime(item.updatedAt)}
                </Text>
              </View>
              
              {item.lastMessage && (
                <Text 
                  numberOfLines={1} 
                \
