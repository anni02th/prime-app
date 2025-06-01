"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from "react-native"
import { Text, Card, Title, Button, TextInput, Snackbar, ActivityIndicator } from "react-native-paper"
import { useApi } from "../../context/ApiContext"
import { launchImageLibrary, launchCamera, type ImagePickerResponse } from "react-native-image-picker"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ProfileStackParamList } from "../../navigation/MainNavigator"

type AvatarUploadScreenNavigationProp = StackNavigationProp<ProfileStackParamList, "AvatarUpload">

type Props = {
  navigation: AvatarUploadScreenNavigationProp
}

interface User {
  _id: string
  name: string
  email: string
}

const AvatarUploadScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { api } = useApi()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/users")
      setUsers(response.data)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: true,
        maxHeight: 500,
        maxWidth: 500,
        quality: 0.7,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log("User cancelled image picker")
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage)
          setError("Error selecting image: " + response.errorMessage)
        } else if (response.assets && response.assets[0].uri) {
          setSelectedImage(response.assets[0].uri)
        }
      },
    )
  }

  const takePhoto = () => {
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: true,
        maxHeight: 500,
        maxWidth: 500,
        quality: 0.7,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log("User cancelled camera")
        } else if (response.errorCode) {
          console.log("Camera Error: ", response.errorMessage)
          setError("Error taking photo: " + response.errorMessage)
        } else if (response.assets && response.assets[0].uri) {
          setSelectedImage(response.assets[0].uri)
        }
      },
    )
  }

  const uploadAvatar = async () => {
    if (!selectedImage) {
      setError("Please select an image first")
      return
    }

    if (!selectedUser) {
      setError("Please select a user")
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Create form data
      const formData = new FormData()
      formData.append("userId", selectedUser)

      // Add image to form data
      const filename = selectedImage.split("/").pop() || "avatar.jpg"
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : "image/jpeg"

      formData.append("avatar", {
        uri: Platform.OS === "android" ? selectedImage : selectedImage.replace("file://", ""),
        name: filename,
        type,
      } as any)

      // Upload avatar
      const response = await api.post("/api/avatars/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess("Avatar uploaded successfully!")
      setSelectedImage(null)
      setSelectedUser("")

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.navigate("AvatarGallery")
      }, 2000)
    } catch (err: any) {
      console.error("Error uploading avatar:", err)
      setError(err.response?.data?.message || "Failed to upload avatar. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Upload Avatar</Title>

          <View style={styles.imageSection}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}

            <View style={styles.imageButtons}>
              <Button mode="contained" onPress={selectImage} style={styles.button}>
                Select Image
              </Button>
              <Button mode="outlined" onPress={takePhoto} style={styles.button}>
                Take Photo
              </Button>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" style={styles.loader} />
          ) : (
            <TextInput
              label="Select User"
              value={selectedUser}
              onChangeText={setSelectedUser}
              mode="outlined"
              style={styles.input}
              disabled={uploading}
              render={({ value, onChangeText, ...props }) => (
                <View>
                  <TextInput {...props} value={users.find((user) => user._id === value)?.name || ""} disabled />
                  <ScrollView style={styles.userList}>
                    {users.map((user) => (
                      <TouchableOpacity key={user._id} style={styles.userItem} onPress={() => onChangeText(user._id)}>
                        <Text style={[styles.userName, user._id === value ? styles.selectedUser : null]}>
                          {user.name} ({user.email})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            />
          )}

          <Button
            mode="contained"
            onPress={uploadAvatar}
            loading={uploading}
            disabled={uploading || !selectedImage || !selectedUser}
            style={styles.uploadButton}
          >
            Upload Avatar
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={4000}
        action={{
          label: "Dismiss",
          onPress: () => setError(null),
        }}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess(null)}
        duration={4000}
        action={{
          label: "OK",
          onPress: () => setSuccess(null),
        }}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "bold",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderText: {
    color: "#6b7280",
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    marginHorizontal: 8,
  },
  input: {
    marginBottom: 16,
  },
  userList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    marginTop: 8,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  userName: {
    fontSize: 14,
  },
  selectedUser: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  uploadButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
  },
  loader: {
    marginVertical: 16,
  },
  errorSnackbar: {
    backgroundColor: "#fee2e2",
  },
  successSnackbar: {
    backgroundColor: "#dcfce7",
  },
})

export default AvatarUploadScreen
