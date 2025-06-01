"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { Text, Card, Title, Paragraph, Button, Avatar, ActivityIndicator, Chip } from "react-native-paper"
import { useApi } from "../../context/ApiContext"
import { useAuth } from "../../context/AuthContext"

const StudentDashboardScreen = ({ navigation }) => {
  const [student, setStudent] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const { api, API_URL } = useApi()
  const { currentUser } = useAuth()

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      setError(null)

      // Get student profile
      const studentResponse = await api.get("/api/students/profile")
      setStudent(studentResponse.data)

      // Get student applications
      const applicationsResponse = await api.get(`/api/students/${studentResponse.data._id}/applications`)
      setApplications(applicationsResponse.data)
    } catch (err) {
      console.error("Error fetching student data:", err)
      setError("Failed to load your profile. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    if (path.startsWith("data:image")) return path
    const localPath = path.startsWith("/") ? path : `/${path}`
    if (!localPath.includes("placeholder")) {
      return `${API_URL}${localPath}`
    }
    return null
  }

  const getCountryFlag = (countryCode) => {
    if (!countryCode) return ""
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchStudentData()
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Profile Card */}
        {student && (
          <Card style={styles.profileCard}>
            <Card.Content>
              <View style={styles.profileHeader}>
                <Avatar.Image
                  size={80}
                  source={
                    getImageUrl(student.avatar || (student.userId && student.userId.avatar))
                      ? { uri: getImageUrl(student.avatar || (student.userId && student.userId.avatar)) }
                      : require("../../assets/placeholder-avatar.png")
                  }
                />
                <View style={styles.profileInfo}>
                  <Title style={styles.profileName}>{student.name}</Title>
                  <Paragraph>
                    {student.degree} in {student.major}
                  </Paragraph>
                  <Paragraph>GPA: {student.gpa}/10</Paragraph>
                </View>
              </View>

              <Button mode="outlined" onPress={() => navigation.navigate("Profile")} style={styles.editProfileButton}>
                Edit Profile
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Applications")}>
                <Text style={styles.actionIcon}>📝</Text>
                <Text style={styles.actionText}>My Applications</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Documents")}>
                <Text style={styles.actionIcon}>📁</Text>
                <Text style={styles.actionText}>Documents</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Chat")}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionText}>Messages</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Settings")}>
                <Text style={styles.actionIcon}>⚙️</Text>
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Applications Overview */}
        <Card style={styles.applicationsCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>My Applications ({applications.length}/5)</Title>
              <Button mode="text" onPress={() => navigation.navigate("Applications")}>
                View All
              </Button>
            </View>

            {applications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No applications yet</Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("ApplicationForm")}
                  style={styles.createButton}
                >
                  Create Application
                </Button>
              </View>
            ) : (
              <View>
                {applications.slice(0, 3).map((app, index) => (
                  <View key={index} style={styles.applicationItem}>
                    <View style={styles.applicationHeader}>
                      <Text style={styles.applicationTitle}>
                        {getCountryFlag(app.countryCode)} {app.university}
                      </Text>
                      <Chip
                        mode="outlined"
                        style={[styles.statusChip, { backgroundColor: app.statusColor || "#f3f4f6" }]}
                      >
                        {app.status}
                      </Chip>
                    </View>
                    <Text style={styles.applicationProgram}>{app.program}</Text>
                    <Text style={styles.applicationIntake}>
                      {app.intake} {app.year}
                    </Text>
                  </View>
                ))}

                {applications.length > 3 && (
                  <Text style={styles.moreText}>+{applications.length - 3} more applications</Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: "#fee2e2",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  editProfileButton: {
    marginTop: 8,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  applicationsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: "#2563eb",
  },
  applicationItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 12,
  },
  applicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  applicationProgram: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  applicationIntake: {
    fontSize: 12,
    color: "#999",
  },
  moreText: {
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
})

export default StudentDashboardScreen
