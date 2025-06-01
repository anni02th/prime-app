import { NavigationContainer } from "@react-navigation/native"
import { Provider as PaperProvider } from "react-native-paper"
import { AuthProvider } from "./src/context/AuthContext"
import { ApiProvider } from "./src/context/ApiContext"
import RootNavigator from "./src/navigation/RootNavigator"
import { theme } from "./src/theme"

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <ApiProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ApiProvider>
    </PaperProvider>
  )
}

export default App
