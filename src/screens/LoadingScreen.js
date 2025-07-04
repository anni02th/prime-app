import { View, StyleSheet } from "react-native"
import { ActivityIndicator, Text } from "react-native-paper"

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
})

export default LoadingScreen
