"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const RegisterStudent = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadType, setUploadType] = useState("file") // or "link"
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",

    // Personal Information
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",

    // Mailing Address
    address: "",

    // Passport Information
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportIssueCountry: "",
    cityOfBirth: "",
    countryOfBirth: "",

    // Nationality
    nationality: "",
    citizenship: "",
    multipleCitizenship: false,
    studyingInOtherCountry: false,

    // Background Info
    appliedForImmigration: false,
    medicalCondition: false,

    // Emergency Contact
    emergencyContact: {
      name: "",
      phone: "",
      email: "",
      relation: "",
    },

    // Additional Information
    isUSPermanentResident: false,
    isCanadianPermanentResident: false,

    // Academic Qualification
    educationSummary: {
      countryOfEducation: "",
      highestLevelOfEducation: "",
    },

    // Post Graduate
    postGraduate: {
      countryOfStudy: "",
      stateOfStudy: "",
      universityName: "",
      qualification: "",
      cityOfStudy: "",
      gradingSystem: "",
      percentage: "",
      primaryLanguage: "",
      startDate: "",
      endDate: "",
    },

    // Under Graduate
    degree: "",
    major: "",
    gpa: "",
    underGraduate: {
      countryOfStudy: "",
      stateOfStudy: "",
      universityName: "",
      qualification: "",
      cityOfStudy: "",
      gradingSystem: "",
      percentage: "",
      primaryLanguage: "",
      startDate: "",
      endDate: "",
    },

    // Grade 12th
    grade12: {
      countryOfStudy: "",
      stateOfStudy: "",
      schoolName: "",
      qualification: "",
      cityOfStudy: "",
      gradingSystem: "",
      percentage: "",
      primaryLanguage: "",
      startDate: "",
      endDate: "",
    },

    // Grade 10th
    grade10: {
      countryOfStudy: "",
      stateOfStudy: "",
      schoolName: "",
      qualification: "",
      cityOfStudy: "",
      gradingSystem: "",
      percentage: "",
      primaryLanguage: "",
      startDate: "",
      endDate: "",
    },

    // Work Experience
    workExperience: {
      organizationName: "",
      organizationAddress: "",
      position: "",
      jobProfile: "",
      salaryMode: "",
      workingFrom: "",
      workingUpto: "",
    },

    // Test Scores
    testScores: {
      gre: {
        overallScore: "",
        examDate: "",
        verbal: "",
        quantitative: "",
        analytical: "",
      },
      gmat: {
        overallScore: "",
        examDate: "",
        verbal: "",
        quantitative: "",
        analytical: "",
      },
      toefl: {
        overallScore: "",
        examDate: "",
        listening: "",
        reading: "",
        writing: "",
        speaking: "",
      },
      ielts: {
        overallScore: "",
        trfNumber: "",
        examDate: "",
        listening: "",
        reading: "",
        writing: "",
        speaking: "",
        yetToReceive: false,
        testResultDate: "",
        ieltsWaiver: false,
      },
      pte: {
        overallScore: "",
        examDate: "",
      },
      det: {
        overallScore: "",
        examDate: "",
      },
      sat: {
        overallScore: "",
        examDate: "",
      },
      act: {
        overallScore: "",
        examDate: "",
      },
      englishMarks12th: "",
      mediumOfInstruction: "",
    },

    // Contact Information
    contact: "",
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg"]
      if (!validTypes.includes(file.type)) {
        alert("Only PNG, JPEG, and JPG files are allowed.")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("File size should be less than 2MB.")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLinkChange = (e) => {
    const url = e.target.value
    setFormData((prev) => ({
      ...prev,
      avatar: url,
    }))
  }
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const goToStep = (step) => {
    // Only allow navigation if basic info is filled out
    if (step > 1 && (!formData.name || !formData.email || !formData.password || !formData.confirmPassword)) {
      setError("Please complete the basic information first")
      setCurrentStep(1)
      return
    }
    setCurrentStep(step)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      // First create a user account
      const userResponse = await api.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "student",
        avatar: formData.avatar,
      })

      // Then create the student profile with all the additional data
      const studentData = {
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        address: formData.address,
        passportNumber: formData.passportNumber,
        passportIssueDate: formData.passportIssueDate,
        passportExpiryDate: formData.passportExpiryDate,
        passportIssueCountry: formData.passportIssueCountry,
        cityOfBirth: formData.cityOfBirth,
        countryOfBirth: formData.countryOfBirth,
        nationality: formData.nationality,
        citizenship: formData.citizenship,
        multipleCitizenship: formData.multipleCitizenship,
        studyingInOtherCountry: formData.studyingInOtherCountry,
        appliedForImmigration: formData.appliedForImmigration,
        medicalCondition: formData.medicalCondition,
        emergencyContact: formData.emergencyContact,
        isUSPermanentResident: formData.isUSPermanentResident,
        isCanadianPermanentResident: formData.isCanadianPermanentResident,
        educationSummary: formData.educationSummary,
        postGraduate: formData.postGraduate,
        degree: formData.degree,
        major: formData.major,
        gpa: formData.gpa,
        underGraduate: formData.underGraduate,
        grade12: formData.grade12,
        grade10: formData.grade10,
        workExperience: formData.workExperience,
        testScores: formData.testScores,
        contact: formData.contact,
        avatar: formData.avatar,
        // Assign the advisor who is creating this student
        advisorId: currentUser && currentUser.role === "advisor" ? currentUser.id : undefined,
      }

      const response = await api.post("/api/students", studentData)
      setSuccess("Student registered successfully!")

      // Reset form
      setFormData({
        // Reset all fields to empty values
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        // ... reset all other fields
      })

      // Redirect to student profile after a short delay
      setTimeout(() => {
        navigate(`/student/${response.data._id}`)
      }, 2000)
    } catch (err) {
      console.error("Error registering student:", err)
      setError(err.response?.data?.message || "Failed to register student. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Add this helper function after the handleSubmit function (around line 380)
  const getImageUrl = (path) => {
    if (!path) return "/placeholder.png?height=120&width=120"

    // If it's already a full URL (S3)
    if (path.startsWith("http")) return path

    // If it's a base64 string
    if (path.startsWith("data:image")) return path

    // If it's a local path
    // Make sure it starts with a slash
    return path.startsWith("/") ? path : `/${path}`
  }

  // Render form steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (Optional)</label>

                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mb-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
                >
                  <option value="file">Upload File</option>
                  <option value="link">Provide Image Link</option>
                </select>

                {uploadType === "file" ? (
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Paste image URL"
                    onChange={handleLinkChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {formData.avatar && (
                  <div className="mt-2 h-12 w-12 overflow-hidden rounded-full">
                    <img
                      src={getImageUrl(formData.avatar) || "/placeholder.svg"}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </>
        )

      case 2:
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Mailing Address</h2>

            <div className="mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your complete address including country, state, city and pincode"
                ></textarea>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="emergencyContact.email"
                  value={formData.emergencyContact.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation with Applicant</label>
                <input
                  type="text"
                  name="emergencyContact.relation"
                  value={formData.emergencyContact.relation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )

      case 3:
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Passport Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  name="passportIssueDate"
                  value={formData.passportIssueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="passportExpiryDate"
                  value={formData.passportExpiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Country</label>
                <input
                  type="text"
                  name="passportIssueCountry"
                  value={formData.passportIssueCountry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City of Birth</label>
                <input
                  type="text"
                  name="cityOfBirth"
                  value={formData.cityOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Birth</label>
                <input
                  type="text"
                  name="countryOfBirth"
                  value={formData.countryOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Nationality</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label>
                <input
                  type="text"
                  name="citizenship"
                  value={formData.citizenship}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="multipleCitizenship"
                  name="multipleCitizenship"
                  checked={formData.multipleCitizenship}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="multipleCitizenship" className="ml-2 block text-sm text-gray-700">
                  Is the applicant a citizen of more than one country?
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="studyingInOtherCountry"
                  name="studyingInOtherCountry"
                  checked={formData.studyingInOtherCountry}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="studyingInOtherCountry" className="ml-2 block text-sm text-gray-700">
                  Is the applicant living and studying in any other country?
                </label>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Background Info</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="appliedForImmigration"
                  name="appliedForImmigration"
                  checked={formData.appliedForImmigration}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="appliedForImmigration" className="ml-2 block text-sm text-gray-700">
                  Has applicant applied for any type of immigration into any country?
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="medicalCondition"
                  name="medicalCondition"
                  checked={formData.medicalCondition}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="medicalCondition" className="ml-2 block text-sm text-gray-700">
                  Does applicant suffer from a serious medical condition?
                </label>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isUSPermanentResident"
                  name="isUSPermanentResident"
                  checked={formData.isUSPermanentResident}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isUSPermanentResident" className="ml-2 block text-sm text-gray-700">
                  Is the student a United States Permanent Resident or a Green Card holder?
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCanadianPermanentResident"
                  name="isCanadianPermanentResident"
                  checked={formData.isCanadianPermanentResident}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isCanadianPermanentResident" className="ml-2 block text-sm text-gray-700">
                  Is the student a Canadian Permanent Resident/Citizen?
                </label>
              </div>
            </div>
          </>
        )

      case 4:
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Academic Qualification</h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Education Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Education</label>
                  <input
                    type="text"
                    name="educationSummary.countryOfEducation"
                    value={formData.educationSummary.countryOfEducation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highest Level of Education</label>
                  <select
                    name="educationSummary.highestLevelOfEducation"
                    value={formData.educationSummary.highestLevelOfEducation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Highest Level</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Under Graduate">Under Graduate</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Grade 10">Grade 10</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Post Graduate (if applicable)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                  <input
                    type="text"
                    name="postGraduate.countryOfStudy"
                    value={formData.postGraduate.countryOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State of Study</label>
                  <input
                    type="text"
                    name="postGraduate.stateOfStudy"
                    value={formData.postGraduate.stateOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of University</label>
                  <input
                    type="text"
                    name="postGraduate.universityName"
                    value={formData.postGraduate.universityName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification Achieved/Degree Awarded
                  </label>
                  <input
                    type="text"
                    name="postGraduate.qualification"
                    value={formData.postGraduate.qualification}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City of Study</label>
                  <input
                    type="text"
                    name="postGraduate.cityOfStudy"
                    value={formData.postGraduate.cityOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                  <input
                    type="text"
                    name="postGraduate.gradingSystem"
                    value={formData.postGraduate.gradingSystem}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                  <input
                    type="text"
                    name="postGraduate.percentage"
                    value={formData.postGraduate.percentage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Language of Instruction
                  </label>
                  <input
                    type="text"
                    name="postGraduate.primaryLanguage"
                    value={formData.postGraduate.primaryLanguage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="postGraduate.startDate"
                    value={formData.postGraduate.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="postGraduate.endDate"
                    value={formData.postGraduate.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Under Graduation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Degree</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E">B.E</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="B.B.A">B.B.A</option>
                    <option value="B.A">B.A</option>
                    <option value="B.Com">B.Com</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  <input
                    type="text"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                  <input
                    type="text"
                    name="underGraduate.countryOfStudy"
                    value={formData.underGraduate.countryOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State of Study</label>
                  <input
                    type="text"
                    name="underGraduate.stateOfStudy"
                    value={formData.underGraduate.stateOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of University</label>
                  <input
                    type="text"
                    name="underGraduate.universityName"
                    value={formData.underGraduate.universityName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification Achieved</label>
                  <input
                    type="text"
                    name="underGraduate.qualification"
                    value={formData.underGraduate.qualification}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City of Study</label>
                  <input
                    type="text"
                    name="underGraduate.cityOfStudy"
                    value={formData.underGraduate.cityOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                  <input
                    type="text"
                    name="underGraduate.gradingSystem"
                    value={formData.underGraduate.gradingSystem}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                  <input
                    type="text"
                    name="underGraduate.percentage"
                    value={formData.underGraduate.percentage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Language of Instruction
                  </label>
                  <input
                    type="text"
                    name="underGraduate.primaryLanguage"
                    value={formData.underGraduate.primaryLanguage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="underGraduate.startDate"
                    value={formData.underGraduate.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="underGraduate.endDate"
                    value={formData.underGraduate.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </>
        )

      case 5:
        return (
          <>
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Grade 12th or equivalent education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                  <input
                    type="text"
                    name="grade12.countryOfStudy"
                    value={formData.grade12.countryOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State of Study</label>
                  <input
                    type="text"
                    name="grade12.stateOfStudy"
                    value={formData.grade12.stateOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of School</label>
                  <input
                    type="text"
                    name="grade12.schoolName"
                    value={formData.grade12.schoolName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification Achieved</label>
                  <input
                    type="text"
                    name="grade12.qualification"
                    value={formData.grade12.qualification}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City of Study</label>
                  <input
                    type="text"
                    name="grade12.cityOfStudy"
                    value={formData.grade12.cityOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                  <input
                    type="text"
                    name="grade12.gradingSystem"
                    value={formData.grade12.gradingSystem}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                  <input
                    type="text"
                    name="grade12.percentage"
                    value={formData.grade12.percentage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Language of Instruction
                  </label>
                  <input
                    type="text"
                    name="grade12.primaryLanguage"
                    value={formData.grade12.primaryLanguage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="grade12.startDate"
                    value={formData.grade12.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="grade12.endDate"
                    value={formData.grade12.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Grade 10th or equivalent</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                  <input
                    type="text"
                    name="grade10.countryOfStudy"
                    value={formData.grade10.countryOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State of Study</label>
                  <input
                    type="text"
                    name="grade10.stateOfStudy"
                    value={formData.grade10.stateOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of School</label>
                  <input
                    type="text"
                    name="grade10.schoolName"
                    value={formData.grade10.schoolName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification Achieved</label>
                  <input
                    type="text"
                    name="grade10.qualification"
                    value={formData.grade10.qualification}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City of Study</label>
                  <input
                    type="text"
                    name="grade10.cityOfStudy"
                    value={formData.grade10.cityOfStudy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                  <input
                    type="text"
                    name="grade10.gradingSystem"
                    value={formData.grade10.gradingSystem}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                  <input
                    type="text"
                    name="grade10.percentage"
                    value={formData.grade10.percentage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Language of Instruction
                  </label>
                  <input
                    type="text"
                    name="grade10.primaryLanguage"
                    value={formData.grade10.primaryLanguage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="grade10.startDate"
                    value={formData.grade10.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="grade10.endDate"
                    value={formData.grade10.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Work Experience (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of the Organization</label>
                  <input
                    type="text"
                    name="workExperience.organizationName"
                    value={formData.workExperience.organizationName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Address</label>
                  <input
                    type="text"
                    name="workExperience.organizationAddress"
                    value={formData.workExperience.organizationAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    name="workExperience.position"
                    value={formData.workExperience.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Profile</label>
                  <input
                    type="text"
                    name="workExperience.jobProfile"
                    value={formData.workExperience.jobProfile}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Salary</label>
                  <select
                    name="workExperience.salaryMode"
                    value={formData.workExperience.salaryMode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Mode</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working From</label>
                  <input
                    type="date"
                    name="workExperience.workingFrom"
                    value={formData.workExperience.workingFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Upto</label>
                  <input
                    type="date"
                    name="workExperience.workingUpto"
                    value={formData.workExperience.workingUpto}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </>
        )

      case 6:
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Test Scores</h2>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Add Test Score</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select
                    name="examType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const examType = e.target.value
                      if (examType) {
                        // Focus on the selected exam section
                        const section = document.getElementById(`${examType}-section`)
                        if (section) {
                          section.scrollIntoView({ behavior: "smooth" })
                        }

                        // Clear other exam scores and set only the selected one
                        const updatedTestScores = {
                          gre: { overallScore: "", examDate: "", verbal: "", quantitative: "", analytical: "" },
                          gmat: { overallScore: "", examDate: "", verbal: "", quantitative: "", analytical: "" },
                          toefl: {
                            overallScore: "",
                            examDate: "",
                            listening: "",
                            reading: "",
                            writing: "",
                            speaking: "",
                          },
                          ielts: {
                            overallScore: "",
                            trfNumber: "",
                            examDate: "",
                            listening: "",
                            reading: "",
                            writing: "",
                            speaking: "",
                            yetToReceive: false,
                            testResultDate: "",
                            ieltsWaiver: false,
                          },
                          pte: { overallScore: "", examDate: "" },
                          det: { overallScore: "", examDate: "" },
                          sat: { overallScore: "", examDate: "" },
                          act: { overallScore: "", examDate: "" },
                          englishMarks12th: formData.testScores.englishMarks12th,
                          mediumOfInstruction: formData.testScores.mediumOfInstruction,
                        }

                        setFormData((prev) => ({
                          ...prev,
                          testScores: updatedTestScores,
                        }))
                      }
                    }}
                  >
                    <option value="">Select Exam Type</option>
                    <option value="gre">GRE</option>
                    <option value="gmat">GMAT</option>
                    <option value="toefl">TOEFL</option>
                    <option value="ielts">IELTS</option>
                    <option value="pte">PTE</option>
                    <option value="det">DET</option>
                    <option value="sat">SAT</option>
                    <option value="act">ACT</option>
                  </select>
                </div>
              </div>
            </div>

            <div id="gre-section" className="mb-8">
              <h3 className="text-lg font-medium mb-3">GRE (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                  <input
                    type="text"
                    name="testScores.gre.overallScore"
                    value={formData.testScores.gre.overallScore}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    name="testScores.gre.examDate"
                    value={formData.testScores.gre.examDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verbal Score</label>
                  <input
                    type="text"
                    name="testScores.gre.verbal"
                    value={formData.testScores.gre.verbal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantitative Score</label>
                  <input
                    type="text"
                    name="testScores.gre.quantitative"
                    value={formData.testScores.gre.quantitative}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Analytical Writing</label>
                  <input
                    type="text"
                    name="testScores.gre.analytical"
                    value={formData.testScores.gre.analytical}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div id="gmat-section" className="mb-8">
              <h3 className="text-lg font-medium mb-3">GMAT (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                  <input
                    type="text"
                    name="testScores.gmat.overallScore"
                    value={formData.testScores.gmat.overallScore}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    name="testScores.gmat.examDate"
                    value={formData.testScores.gmat.examDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verbal Score</label>
                  <input
                    type="text"
                    name="testScores.gmat.verbal"
                    value={formData.testScores.gmat.verbal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700  mb-1">Quantitative Score</label>
                  <input
                    type="text"
                    name="testScores.gmat.quantitative"
                    value={formData.testScores.gmat.quantitative}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Analytical Writing</label>
                  <input
                    type="text"
                    name="testScores.gmat.analytical"
                    value={formData.testScores.gmat.analytical}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div id="toefl-section" className="mb-8">
              <h3 className="text-lg font-medium mb-3">TOEFL (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                  <input
                    type="text"
                    name="testScores.toefl.overallScore"
                    value={formData.testScores.toefl.overallScore}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    name="testScores.toefl.examDate"
                    value={formData.testScores.toefl.examDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listening</label>
                  <input
                    type="text"
                    name="testScores.toefl.listening"
                    value={formData.testScores.toefl.listening}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reading</label>
                  <input
                    type="text"
                    name="testScores.toefl.reading"
                    value={formData.testScores.toefl.reading}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Writing</label>
                  <input
                    type="text"
                    name="testScores.toefl.writing"
                    value={formData.testScores.toefl.writing}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speaking</label>
                  <input
                    type="text"
                    name="testScores.toefl.speaking"
                    value={formData.testScores.toefl.speaking}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div id="ielts-section" className="mb-8">
              <h3 className="text-lg font-medium mb-3">IELTS (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                  <input
                    type="text"
                    name="testScores.ielts.overallScore"
                    value={formData.testScores.ielts.overallScore}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TRF Number</label>
                  <input
                    type="text"
                    name="testScores.ielts.trfNumber"
                    value={formData.testScores.ielts.trfNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    name="testScores.ielts.examDate"
                    value={formData.testScores.ielts.examDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listening</label>
                  <input
                    type="text"
                    name="testScores.ielts.listening"
                    value={formData.testScores.ielts.listening}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reading</label>
                  <input
                    type="text"
                    name="testScores.ielts.reading"
                    value={formData.testScores.ielts.reading}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Writing</label>
                  <input
                    type="text"
                    name="testScores.ielts.writing"
                    value={formData.testScores.ielts.writing}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speaking</label>
                  <input
                    type="text"
                    name="testScores.ielts.speaking"
                    value={formData.testScores.ielts.speaking}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="yetToReceive"
                    name="testScores.ielts.yetToReceive"
                    checked={formData.testScores.ielts.yetToReceive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="yetToReceive" className="ml-2 block text-sm text-gray-700">
                    Yet to Receive?
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Result Date</label>
                  <input
                    type="date"
                    name="testScores.ielts.testResultDate"
                    value={formData.testScores.ielts.testResultDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ieltsWaiver"
                    name="testScores.ielts.ieltsWaiver"
                    checked={formData.testScores.ielts.ieltsWaiver}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ieltsWaiver" className="ml-2 block text-sm text-gray-700">
                    IELTS Waiver
                  </label>
                </div>
              </div>
            </div>

            <div id="pte-section" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium mb-3">PTE (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                    <input
                      type="text"
                      name="testScores.pte.overallScore"
                      value={formData.testScores.pte.overallScore}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                    <input
                      type="date"
                      name="testScores.pte.examDate"
                      value={formData.testScores.pte.examDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div id="det-section">
                <h3 className="text-lg font-medium mb-3">DET (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                    <input
                      type="text"
                      name="testScores.det.overallScore"
                      value={formData.testScores.det.overallScore}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                    <input
                      type="date"
                      name="testScores.det.examDate"
                      value={formData.testScores.det.examDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div id="sat-section">
                <h3 className="text-lg font-medium mb-3">SAT (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                    <input
                      type="text"
                      name="testScores.sat.overallScore"
                      value={formData.testScores.sat.overallScore}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                    <input
                      type="date"
                      name="testScores.sat.examDate"
                      value={formData.testScores.sat.examDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div id="act-section">
                <h3 className="text-lg font-medium mb-3">ACT (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                    <input
                      type="text"
                      name="testScores.act.overallScore"
                      value={formData.testScores.act.overallScore}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                    <input
                      type="date"
                      name="testScores.act.examDate"
                      value={formData.testScores.act.examDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">12th English Marks</label>
                <input
                  type="text"
                  name="testScores.englishMarks12th"
                  value={formData.testScores.englishMarks12th}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medium of Instruction (MOI)</label>
                <input
                  type="text"
                  name="testScores.mediumOfInstruction"
                  value={formData.testScores.mediumOfInstruction}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Register New Student</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex flex-col items-center cursor-pointer" onClick={() => goToStep(step)}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === step
                      ? "bg-blue-600 text-white"
                      : currentStep > step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                <span className="text-xs mt-1 text-center">
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Address"}
                  {step === 3 && "Passport"}
                  {step === 4 && "Education 1"}
                  {step === 5 && "Education 2"}
                  {step === 6 && "Tests"}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200"></div>
            <div
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>
            )}

            <div className="flex gap-4 ml-auto">
              {currentStep < 6 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}

              {/* Submit button on every page */}
              <button
                type="submit"
                disabled={
                  loading || !formData.name || !formData.email || !formData.password || !formData.confirmPassword
                }
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                title={
                  !formData.name || !formData.email || !formData.password || !formData.confirmPassword
                    ? "Basic information is required to submit"
                    : ""
                }
              >
                {loading ? "Registering..." : "Register Student"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterStudent
