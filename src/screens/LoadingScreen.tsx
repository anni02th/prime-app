import type React from "react"
import { View, StyleSheet } from "react-native"
import { ActivityIndicator, Text } from "react-native-paper"

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
})

export default LoadingScreen
