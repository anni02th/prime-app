"use client"

import type React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useAuth } from "../context/AuthContext"

// Screens
import DashboardScreen from "../screens/dashboard/DashboardScreen"
import StudentDashboardScreen from "../screens/dashboard/StudentDashboardScreen"
import ApplicationsScreen from "../screens/applications/ApplicationsScreen"
import ApplicationFormScreen from "../screens/applications/ApplicationFormScreen"
import DocumentsScreen from "../screens/documents/DocumentsScreen"
import ChatListScreen from "../screens/chat/ChatListScreen"
import ChatDetailScreen from "../screens/chat/ChatDetailScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"
import StudentProfileScreen from "../screens/profile/StudentProfileScreen"
import SettingsScreen from "../screens/settings/SettingsScreen"
import AvatarGalleryScreen from "../screens/avatar/AvatarGalleryScreen"
import AvatarSearchScreen from "../screens/avatar/AvatarSearchScreen"
import AvatarUploadScreen from "../screens/avatar/AvatarUploadScreen"
import RegisterStudentScreen from "../screens/students/RegisterStudentScreen"

// Stack param lists
export type DashboardStackParamList = {
  DashboardMain: undefined
  StudentProfile: { studentId: string }
  RegisterStudent: undefined
}

export type ApplicationsStackParamList = {
  ApplicationsList: undefined
  ApplicationForm: { applicationId?: string }
}

export type DocumentsStackParamList = {
  DocumentsList: undefined
}

export type ChatStackParamList = {
  ChatList: undefined
  ChatDetail: { chatId: string }
}

export type ProfileStackParamList = {
  ProfileMain: undefined
  Settings: undefined
  AvatarGallery: undefined
  AvatarSearch: undefined
  AvatarUpload: undefined
}

// Create stack navigators
const DashboardStack = createStackNavigator<DashboardStackParamList>()
const ApplicationsStack = createStackNavigator<ApplicationsStackParamList>()
const DocumentsStack = createStackNavigator<DocumentsStackParamList>()
const ChatStack = createStackNavigator<ChatStackParamList>()
const ProfileStack = createStackNavigator<ProfileStackParamList>()

// Stack Navigators for each tab
const DashboardStackNavigator: React.FC = () => {
  const { isStudent } = useAuth()

  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen
        name="DashboardMain"
        component={isStudent() ? StudentDashboardScreen : DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <DashboardStack.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{ title: "Student Profile" }}
      />
      <DashboardStack.Screen
        name="RegisterStudent"
        component={RegisterStudentScreen}
        options={{ title: "Register Student" }}
      />
    </DashboardStack.Navigator>
  )
}

const ApplicationsStackNavigator: React.FC = () => (
  <ApplicationsStack.Navigator>
    <ApplicationsStack.Screen
      name="ApplicationsList"
      component={ApplicationsScreen}
      options={{ title: "Applications" }}
    />
    <ApplicationsStack.Screen
      name="ApplicationForm"
      component={ApplicationFormScreen}
      options={{ title: "Application Form" }}
    />
  </ApplicationsStack.Navigator>
)

const DocumentsStackNavigator: React.FC = () => (
  <DocumentsStack.Navigator>
    <DocumentsStack.Screen name="DocumentsList" component={DocumentsScreen} options={{ title: "Documents" }} />
  </DocumentsStack.Navigator>
)

const ChatStackNavigator: React.FC = () => (
  <ChatStack.Navigator>
    <ChatStack.Screen name="ChatList" component={ChatListScreen} options={{ title: "Chats" }} />
    <ChatStack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: "Chat" }} />
  </ChatStack.Navigator>
)

const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Profile" }} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    <ProfileStack.Screen name="AvatarGallery" component={AvatarGalleryScreen} options={{ title: "Avatar Gallery" }} />
    <ProfileStack.Screen name="AvatarSearch" component={AvatarSearchScreen} options={{ title: "Search Avatars" }} />
    <ProfileStack.Screen name="AvatarUpload" component={AvatarUploadScreen} options={{ title: "Upload Avatar" }} />
  </ProfileStack.Navigator>
)

// Tab navigator
export type MainTabParamList = {
  Dashboard: undefined
  Applications: undefined
  Documents: undefined
  Chat: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          if (route.name === "Dashboard") {
            iconName = "view-dashboard"
          } else if (route.name === "Applications") {
            iconName = "file-document"
          } else if (route.name === "Documents") {
            iconName = "folder"
          } else if (route.name === "Chat") {
            iconName = "chat"
          } else if (route.name === "Profile") {
            iconName = "account"
          } else {
            iconName = "help-circle"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Applications" component={ApplicationsStackNavigator} />
      <Tab.Screen name="Documents" component={DocumentsStackNavigator} />
      <Tab.Screen name="Chat" component={ChatStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  )
}

export default MainNavigator
