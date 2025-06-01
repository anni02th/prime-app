"use client"

import type React from "react"
import { useState } from "react"
import { View, StyleSheet, FlatList, Image } from "react-native"
import { Text, Card, Title, Paragraph, Button, ActivityIndicator, Searchbar } from "react-native-paper"
import { useApi } from "../../context/ApiContext"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ProfileStackParamList } from "../../navigation/MainNavigator"

type AvatarSearchScreenNavigationProp = StackNavigationProp<ProfileStackParamList, "AvatarSearch">

type Props = {
  navigation: AvatarSearchScreenNavigationProp
}

interface Avatar {
  _id: string
  path: string
  username: string
  userId: string
  createdAt: string
}

const AvatarSearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { api, API_URL } = useApi()

  const searchAvatars = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/api/avatars/search?username=${searchQuery}`)
      setAvatars(response.data)
      setSearched(true)
    } catch (err) {
      console.error("Error searching avatars:", err)
      setError("Failed to search avatars. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (path: string): string => {
    if (path.startsWith("http")) return path
    if (path.startsWith("data:image")) return path
    const localPath = path.startsWith("/") ? path : `/${path}`
    return `${API_URL}${localPath}`
  }

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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search avatars by username..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          onSubmitEditing={searchAvatars}
        />
        <Button
          mode="contained"
          onPress={searchAvatars}
          loading={loading}
          disabled={loading}
          style={styles.searchButton}
        >
          Search
        </Button>
      </View>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Searching avatars...</Text>
        </View>
      ) : (
        <FlatList
          data={avatars}
          renderItem={renderAvatarItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searched ? (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>No avatars found matching "{searchQuery}"</Text>
                </Card.Content>
              </Card>
            ) : null
          }
        />
      )}

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={() => navigation.navigate("AvatarGallery")} style={styles.viewAllButton}>
          View All Avatars
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: "#2563eb",
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
  buttonContainer: {
    padding: 16,
  },
  viewAllButton: {
    borderColor: "#2563eb",
  },
})

export default AvatarSearchScreen
