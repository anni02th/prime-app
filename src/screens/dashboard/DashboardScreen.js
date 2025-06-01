"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { Text, Card, Title, Paragraph, Button, Searchbar, Chip, Avatar, ActivityIndicator } from "react-native-paper"
import { useApi } from "../../context/ApiContext"
import { useAuth } from "../../context/AuthContext"

const DashboardScreen = ({ navigation }) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState(null)
  const { api, API_URL } = useApi()
  const { currentUser } = useAuth()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setError(null)
      const response = await api.get("/api/students")

      // Fetch applications for each student
      const studentsWithApplications = await Promise.all(
        response.data.map(async (student) => {
          try {
            const appResponse = await api.get(`/api/students/${student._id}/applications`)
            return {
              ...student,
              applications: appResponse.data,
              avatar: getImageUrl(student.avatar || (student.userId ? student.userId.avatar : null)),
            }
          } catch (err) {
            return {
              ...student,
              applications: [],
              avatar: getImageUrl(student.avatar || (student.userId ? student.userId.avatar : null)),
            }
          }
        }),
      )

      setStudents(studentsWithApplications)
    } catch (err) {
      console.error("Error fetching students:", err)
      setError("Failed to load students. Please try again.")
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
    fetchStudents()
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.major?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderStudentCard = (student) => (
    <Card key={student._id} style={styles.studentCard}>
      <TouchableOpacity onPress={() => navigation.navigate("StudentProfile", { studentId: student._id })}>
        <Card.Content>
          <View style={styles.studentHeader}>
            <Avatar.Image
              size={60}
              source={student.avatar ? { uri: student.avatar } : require("../../assets/placeholder-avatar.png")}
            />
            <View style={styles.studentInfo}>
              <Title style={styles.studentName}>{student.name}</Title>
              <Paragraph>
                {student.degree} in {student.major}
              </Paragraph>
              <Paragraph>GPA: {student.gpa}/10</Paragraph>
            </View>
          </View>

          {student.applications && student.applications.length > 0 && (
            <View style={styles.applicationsSection}>
              <Text style={styles.sectionTitle}>Applications</Text>
              {student.applications.slice(0, 2).map((app, index) => (
                <View key={index} style={styles.applicationItem}>
                  <Text>
                    {getCountryFlag(app.countryCode)} {app.university}
                  </Text>
                  <Chip mode="outlined" style={[styles.statusChip, { backgroundColor: app.statusColor || "#f3f4f6" }]}>
                    {app.status}
                  </Chip>
                </View>
              ))}
              {student.applications.length > 2 && (
                <Text style={styles.moreText}>+{student.applications.length - 2} more applications</Text>
              )}
            </View>
          )}
        </Card.Content>
      </TouchableOpacity>
    </Card>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Manage Students</Title>
        <Button mode="contained" onPress={() => navigation.navigate("RegisterStudent")} style={styles.addButton}>
          Register Student
        </Button>
      </View>

      <Searchbar
        placeholder="Search students..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

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

        {filteredStudents.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No students found</Text>
            </Card.Content>
          </Card>
        ) : (
          filteredStudents.map(renderStudentCard)
        )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#2563eb",
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  studentCard: {
    marginBottom: 16,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  studentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  applicationsSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  applicationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusChip: {
    height: 24,
  },
  moreText: {
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: "#fee2e2",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
})

export default DashboardScreen
