"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { TextInput, Button, Text, Card, Title, Paragraph, Snackbar } from "react-native-paper"
import { useApi } from "../../context/ApiContext"

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(1) // 1: Email, 2: Code, 3: New Password
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { api } = useApi()

  const handleEmailSubmit = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await api.post("/api/auth/forgot-password", { email })
      setSuccess("If an account with that email exists, we've sent a password reset code.")
      setStep(2)
    } catch (err) {
      setError("Failed to send reset code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async () => {
    if (!resetCode) {
      setError("Please enter the reset code")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await api.post("/api/auth/verify-reset-code", { email, code: resetCode })
      setSuccess("Code verified successfully. Please set a new password.")
      setStep(3)
    } catch (err) {
      setError("Invalid or expired code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await api.post("/api/auth/reset-password", {
        email,
        code: resetCode,
        password: newPassword,
      })
      setSuccess("Password reset successfully! You can now login with your new password.")
      setTimeout(() => navigation.navigate("Login"), 2000)
    } catch (err) {
      setError("Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleEmailSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Send Reset Code
            </Button>
          </>
        )
      case 2:
        return (
          <>
            <TextInput
              label="Reset Code"
              value={resetCode}
              onChangeText={setResetCode}
              mode="outlined"
              style={styles.input}
              placeholder="Enter the code sent to your email"
            />
            <Button
              mode="contained"
              onPress={handleCodeSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Verify Code
            </Button>
            <Button mode="text" onPress={() => setStep(1)} style={styles.backButton}>
              Back to Email
            </Button>
          </>
        )
      case 3:
        return (
          <>
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handlePasswordSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Reset Password
            </Button>
            <Button mode="text" onPress={() => setStep(2)} style={styles.backButton}>
              Back to Code Verification
            </Button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>PRIME Study Abroad</Title>
            <Paragraph style={styles.subtitle}>Reset your password</Paragraph>

            {renderStep()}

            <View style={styles.linkContainer}>
              <Text>Remember your password? </Text>
              <Button mode="text" onPress={() => navigation.navigate("Login")}>
                Sign In
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar visible={!!error} onDismiss={() => setError("")} duration={4000}>
        {error}
      </Snackbar>

      <Snackbar visible={!!success} onDismiss={() => setSuccess("")} duration={4000}>
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
})

export default ForgotPasswordScreen
