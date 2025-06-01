"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"

// Screens
import DashboardScreen from "../screens/dashboard/DashboardScreen"
import StudentDashboardScreen from "../screens/dashboard/StudentDashboardScreen"
import ApplicationsScreen from "../screens/applications/ApplicationsScreen"
import ApplicationFormScreen from "../screens/applications/ApplicationFormScreen"
import DocumentsScreen from "../screens/documents/DocumentsScreen"
import ChatScreen from "../screens/chat/ChatScreen"
import ChatDetailScreen from "../screens/chat/ChatDetailScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"
import StudentProfileScreen from "../screens/profile/StudentProfileScreen"
import SettingsScreen from "../screens/settings/SettingsScreen"
import AvatarGalleryScreen from "../screens/avatar/AvatarGalleryScreen"
import AvatarSearchScreen from "../screens/avatar/AvatarSearchScreen"
import AvatarUploadScreen from "../screens/avatar/AvatarUploadScreen"
import RegisterStudentScreen from "../screens/students/RegisterStudentScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Stack Navigators for each tab
const DashboardStack = () => {
  const { isStudent } = useAuth()

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardMain"
        component={isStudent() ? StudentDashboardScreen : DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: "Student Profile" }} />
      <Stack.Screen name="RegisterStudent" component={RegisterStudentScreen} options={{ title: "Register Student" }} />
    </Stack.Navigator>
  )
}

const ApplicationsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ApplicationsList" component={ApplicationsScreen} options={{ title: "Applications" }} />
    <Stack.Screen name="ApplicationForm" component={ApplicationFormScreen} options={{ title: "Application Form" }} />
  </Stack.Navigator>
)

const DocumentsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="DocumentsList" component={DocumentsScreen} options={{ title: "Documents" }} />
  </Stack.Navigator>
)

const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ChatList" component={ChatScreen} options={{ title: "Chats" }} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: "Chat" }} />
  </Stack.Navigator>
)

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Profile" }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    <Stack.Screen name="AvatarGallery" component={AvatarGalleryScreen} options={{ title: "Avatar Gallery" }} />
    <Stack.Screen name="AvatarSearch" component={AvatarSearchScreen} options={{ title: "Search Avatars" }} />
    <Stack.Screen name="AvatarUpload" component={AvatarUploadScreen} options={{ title: "Upload Avatar" }} />
  </Stack.Navigator>
)

const MainNavigator = () => {
  const { isStudent } = useAuth()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Dashboard") {
            iconName = "dashboard"
          } else if (route.name === "Applications") {
            iconName = "description"
          } else if (route.name === "Documents") {
            iconName = "folder"
          } else if (route.name === "Chat") {
            iconName = "chat"
          } else if (route.name === "Profile") {
            iconName = "person"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Applications" component={ApplicationsStack} />
      <Tab.Screen name="Documents" component={DocumentsStack} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  )
}

export default MainNavigator
