"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, StyleSheet, FlatList, Image, RefreshControl } from "react-native"
import { Text, Card, Title, Paragraph, ActivityIndicator, Searchbar, FAB } from "react-native-paper"
import { useApi } from "../../context/ApiContext"
import { useAuth } from "../../context/AuthContext"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ProfileStackParamList } from "../../navigation/MainNavigator"

type AvatarGalleryScreenNavigationProp = StackNavigationProp<ProfileStackParamList, "AvatarGallery">

type Props = {
  navigation: AvatarGalleryScreenNavigationProp
}

interface Avatar {
  _id: string
  path: string
  username: string
  userId: string
  createdAt: string
}

const AvatarGalleryScreen: React.FC<Props> = ({ navigation }) => {
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { api, API_URL } = useApi()
  const { isAdminOrAdvisor } = useAuth()

  useEffect(() => {
    fetchAvatars()
  }, [])

  const fetchAvatars = async () => {
    try {
      setError(null)
      const response = await api.get("/api/avatars")
      setAvatars(response.data)
    } catch (err) {
      console.error("Error fetching avatars:", err)
      setError("Failed to load avatars. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getImageUrl = (path: string): string => {
    if (path.startsWith("http")) return path
    if (path.startsWith("data:image")) return path
    const localPath = path.startsWith("/") ? path : `/${path}`
    return `${API_URL}${localPath}`
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchAvatars()
  }

  const filteredAvatars = avatars.filter((avatar) => avatar.username.toLowerCase().includes(searchQuery.toLowerCase()))

  const renderAvatarItem = ({ item }: { item: Avatar }) => (
    <Card style={styles.avatarCard}>
      <Card.Content>
        <View style={styles.avatarHeader}>
          <Image source={{ uri: getImageUrl(item.path) }} style={styles.avatarImage} resizeMode="cover" />
        </View>
        <Title style={styles.username}>{item.username}</Title>
        <Paragraph style={styles.date}>Uploaded: {new Date(item.createdAt).toLocaleDateString()}</Paragraph>
      </Card.Content>
    </Card>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading avatars...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by username..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      <FlatList
        data={filteredAvatars}
        renderItem={renderAvatarItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No avatars found</Text>
            </Card.Content>
          </Card>
        }
      />

      {isAdminOrAdvisor() && (
        <FAB style={styles.fab} icon="plus" onPress={() => navigation.navigate("AvatarUpload")} color="#ffffff" />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  listContent: {
    padding: 8,
  },
  avatarCard: {
    flex: 1,
    margin: 8,
    elevation: 2,
  },
  avatarHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  username: {
    fontSize: 16,
    textAlign: "center",
  },
  date: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  errorCard: {
    margin: 16,
    backgroundColor: "#fee2e2",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
  },
  emptyCard: {
    margin: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#2563eb",
  },
})

export default AvatarGalleryScreen
