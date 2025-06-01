"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { Provider as PaperProvider } from "react-native-paper"
import { AuthProvider } from "./context/AuthContext"
import { ApiProvider } from "./context/ApiContext"
import AuthNavigator from "./navigation/AuthNavigator"
import MainNavigator from "./navigation/MainNavigator"
import { useAuth } from "./context/AuthContext"
import LoadingScreen from "./screens/LoadingScreen"

const Stack = createStackNavigator()

const AppContent = () => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return <NavigationContainer>{currentUser ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>
}

const App = () => {
  return (
    <PaperProvider>
      <ApiProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ApiProvider>
    </PaperProvider>
  )
}

export default App
