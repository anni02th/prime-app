"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import TabNavigation from "../components/TabNavigation"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

const StudentProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdminOrAdvisor } = useAuth()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [formSuccess, setFormSuccess] = useState(null)
  const [applications, setApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(true)

  // State for advisor notes
  const [advisorNotes, setAdvisorNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSuccess, setNotesSuccess] = useState(null)

  // Edit states for each section
  const [editingBasicInfo, setEditingBasicInfo] = useState(false)
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false)
  const [editingEducation, setEditingEducation] = useState(false)
  const [editingTestScores, setEditingTestScores] = useState(false)

  // Saving states for each section
  const [savingBasicInfo, setSavingBasicInfo] = useState(false)
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false)
  const [savingEducation, setSavingEducation] = useState(false)
  const [savingTestScores, setSavingTestScores] = useState(false)

  // Success/error states for each section
  const [basicInfoSuccess, setBasicInfoSuccess] = useState(null)
  const [basicInfoError, setBasicInfoError] = useState(null)
  const [personalInfoSuccess, setPersonalInfoSuccess] = useState(null)
  const [personalInfoError, setPersonalInfoError] = useState(null)
  const [educationSuccess, setEducationSuccess] = useState(null)
  const [educationError, setEducationError] = useState(null)
  const [testScoresSuccess, setTestScoresSuccess] = useState(null)
  const [testScoresError, setTestScoresError] = useState(null)

  // Form data for each section
  const [basicInfoForm, setBasicInfoForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
  })

  const [personalInfoForm, setPersonalInfoForm] = useState({
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportIssueCountry: "",
    cityOfBirth: "",
    countryOfBirth: "",
    maritalStatus: "",
    address1: {
      country: "",
      state: "",
      city: "",
      pincode: "",
    },
    address2: {
      country: "",
      state: "",
      city: "",
      pincode: "",
    },
    emergencyContact: {
      name: "",
      phone: "",
      email: "",
      relation: "",
    },
    citizenship: "",
    multipleCitizenship: false,
    studyingInOtherCountry: false,
    appliedForImmigration: false,
    medicalCondition: false,
    isUSPermanentResident: false,
    isCanadianPermanentResident: false,
  })

  const [educationForm, setEducationForm] = useState({
    degree: "",
    major: "",
    gpa: "",
    educationSummary: {
      countryOfEducation: "",
      highestLevelOfEducation: "",
    },
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
    workExperience: {
      organizationName: "",
      organizationAddress: "",
      position: "",
      jobProfile: "",
      salaryMode: "",
      workingFrom: "",
      workingUpto: "",
    },
  })

  const [testScoresForm, setTestScoresForm] = useState({
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
  })

  const canStudentEdit = () => {
    return !student?.hasEditedProfile || isAdminOrAdvisor()
  }

  // Function to handle saving advisor notes
  const handleSaveAdvisorNotes = async () => {
    if (!isAdminOrAdvisor()) return

    setSavingNotes(true)
    setNotesSuccess(null)

    try {
      await api.patch(`/api/students/${id}/advisor-notes`, { notes: advisorNotes })
      setNotesSuccess("Advisor notes saved successfully!")

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setNotesSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Error saving advisor notes:", err)
      alert("Failed to save advisor notes. Please try again.")
    } finally {
      setSavingNotes(false)
    }
  }

  // Function to handle editing basic information
  const handleEditBasicInfo = () => {
    setBasicInfoForm({
      name: student?.name || "",
      email: student?.email || "",
      phone: student?.contact || "",
      dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "",
      gender: student?.gender || "",
      nationality: student?.nationality || "",
    })
    setEditingBasicInfo(true)
  }

  // Function to handle editing personal information
  const handleEditPersonalInfo = () => {
    setPersonalInfoForm({
      passportNumber: student?.passportNumber || "",
      passportIssueDate: student?.passportIssueDate
        ? new Date(student.passportIssueDate).toISOString().split("T")[0]
        : "",
      passportExpiryDate: student?.passportExpiryDate
        ? new Date(student.passportExpiryDate).toISOString().split("T")[0]
        : "",
      passportIssueCountry: student?.passportIssueCountry || "",
      cityOfBirth: student?.cityOfBirth || "",
      countryOfBirth: student?.countryOfBirth || "",
      maritalStatus: student?.maritalStatus || "",
      address1: student?.address1 || { country: "", state: "", city: "", pincode: "" },
      address2: student?.address2 || { country: "", state: "", city: "", pincode: "" },
      emergencyContact: student?.emergencyContact || { name: "", phone: "", email: "", relation: "" },
      citizenship: student?.citizenship || "",
      multipleCitizenship: student?.multipleCitizenship || false,
      studyingInOtherCountry: student?.studyingInOtherCountry || false,
      appliedForImmigration: student?.appliedForImmigration || false,
      medicalCondition: student?.medicalCondition || false,
      isUSPermanentResident: student?.isUSPermanentResident || false,
      isCanadianPermanentResident: student?.isCanadianPermanentResident || false,
    })
    setEditingPersonalInfo(true)
  }

  // Function to handle editing education information
  const handleEditEducation = () => {
    setEducationForm({
      degree: student?.degree || "",
      major: student?.major || "",
      gpa: student?.gpa || "",
      educationSummary: student?.educationSummary || { countryOfEducation: "", highestLevelOfEducation: "" },
      postGraduate: student?.postGraduate || {
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
      underGraduate: student?.underGraduate || {
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
      grade12: student?.grade12 || {
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
      grade10: student?.grade10 || {
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
      workExperience: student?.workExperience || {
        organizationName: "",
        organizationAddress: "",
        position: "",
        jobProfile: "",
        salaryMode: "",
        workingFrom: "",
        workingUpto: "",
      },
    })
    setEditingEducation(true)
  }

  // Function to handle editing test scores
  const handleEditTestScores = () => {
    setTestScoresForm({
      testScores: student?.testScores || {
        gre: { overallScore: "", examDate: "", verbal: "", quantitative: "", analytical: "" },
        gmat: { overallScore: "", examDate: "", verbal: "", quantitative: "", analytical: "" },
        toefl: { overallScore: "", examDate: "", listening: "", reading: "", writing: "", speaking: "" },
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
        englishMarks12th: "",
        mediumOfInstruction: "",
      },
    })
    setEditingTestScores(true)
  }

  // Function to handle saving basic information
  const handleSaveBasicInfo = async () => {
    if (!canStudentEdit()) return

    setSavingBasicInfo(true)
    setBasicInfoSuccess(null)
    setBasicInfoError(null)

    try {
      const response = await api.put(`/api/students/${id}`, {
        name: basicInfoForm.name,
        email: basicInfoForm.email,
        contact: basicInfoForm.phone,
        dateOfBirth: basicInfoForm.dateOfBirth,
        gender: basicInfoForm.gender,
        nationality: basicInfoForm.nationality,
      })

      setStudent({
        ...student,
        name: basicInfoForm.name,
        email: basicInfoForm.email,
        contact: basicInfoForm.phone,
        dateOfBirth: basicInfoForm.dateOfBirth,
        gender: basicInfoForm.gender,
        nationality: basicInfoForm.nationality,
      })

      setBasicInfoSuccess("Basic information updated successfully!")
      setEditingBasicInfo(false)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setBasicInfoSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Error updating basic information:", err)
      setBasicInfoError("Failed to update basic information. Please try again.")
    } finally {
      setSavingBasicInfo(false)
    }
  }

  // Function to handle saving personal information
  const handleSavePersonalInfo = async () => {
    if (!canStudentEdit()) return

    setSavingPersonalInfo(true)
    setPersonalInfoSuccess(null)
    setPersonalInfoError(null)

    try {
      const response = await api.put(`/api/students/${id}`, personalInfoForm)

      setStudent({
        ...student,
        ...personalInfoForm,
      })

      setPersonalInfoSuccess("Personal information updated successfully!")
      setEditingPersonalInfo(false)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setPersonalInfoSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Error updating personal information:", err)
      setPersonalInfoError("Failed to update personal information. Please try again.")
    } finally {
      setSavingPersonalInfo(false)
    }
  }

  // Function to handle saving education information
  const handleSaveEducation = async () => {
    if (!canStudentEdit()) return

    setSavingEducation(true)
    setEducationSuccess(null)
    setEducationError(null)

    try {
      const response = await api.put(`/api/students/${id}`, educationForm)

      setStudent({
        ...student,
        ...educationForm,
      })

      setEducationSuccess("Education information updated successfully!")
      setEditingEducation(false)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setEducationSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Error updating education information:", err)
      setEducationError("Failed to update education information. Please try again.")
    } finally {
      setSavingEducation(false)
    }
  }

  // Function to handle saving test scores
  const handleSaveTestScores = async () => {
    if (!canStudentEdit()) return

    setSavingTestScores(true)
    setTestScoresSuccess(null)
    setTestScoresError(null)

    try {
      const response = await api.put(`/api/students/${id}`, testScoresForm)

      setStudent({
        ...student,
        ...testScoresForm,
      })

      setTestScoresSuccess("Test scores updated successfully!")
      setEditingTestScores(false)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setTestScoresSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Error updating test scores:", err)
      setTestScoresError("Failed to update test scores. Please try again.")
    } finally {
      setSavingTestScores(false)
    }
  }

  // Function to handle canceling edit
  const handleCancelEdit = (section) => {
    switch (section) {
      case "basic":
        setEditingBasicInfo(false)
        setBasicInfoError(null)
        break
      case "personal":
        setEditingPersonalInfo(false)
        setPersonalInfoError(null)
        break
      case "education":
        setEditingEducation(false)
        setEducationError(null)
        break
      case "tests":
        setEditingTestScores(false)
        setTestScoresError(null)
        break
      default:
        break
    }
  }

  // Function to handle input change for basic info form
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target
    setBasicInfoForm({
      ...basicInfoForm,
      [name]: value,
    })
  }

  const handleDeleteStudent = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this student? This will permanently remove all their data, applications, and documents from the system.",
      )
    ) {
      return
    }

    try {
      setLoading(true)
      await api.delete(`/api/students/${id}`)
      navigate("/dashboard", { state: { message: "Student deleted successfully" } })
    } catch (err) {
      console.error("Error deleting student:", err)
      setError("Failed to delete student. Please try again later.")
      setLoading(false)
    }
  }

  // Function to handle input change for personal info form
  const handlePersonalInfoChange = (e) => {
    const { name, value, type, checked } = e.target

    // Handle nested objects like address1, address2, emergencyContact
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setPersonalInfoForm({
        ...personalInfoForm,
        [parent]: {
          ...personalInfoForm[parent],
          [child]: value,
        },
      })
    } else {
      // Handle boolean values from checkboxes
      setPersonalInfoForm({
        ...personalInfoForm,
        [name]: type === "checkbox" ? checked : value,
      })
    }
  }

  // Function to handle input change for education form
  const handleEducationChange = (e) => {
    const { name, value } = e.target

    // Handle nested objects
    if (name.includes(".")) {
      const parts = name.split(".")
      if (parts.length === 2) {
        const [parent, child] = parts
        setEducationForm({
          ...educationForm,
          [parent]: {
            ...educationForm[parent],
            [child]: value,
          },
        })
      } else if (parts.length === 3) {
        const [parent, middle, child] = parts
        setEducationForm({
          ...educationForm,
          [parent]: {
            ...educationForm[parent],
            [middle]: {
              ...educationForm[parent][middle],
              [child]: value,
            },
          },
        })
      }
    } else {
      setEducationForm({
        ...educationForm,
        [name]: value,
      })
    }
  }

  // Function to handle input change for test scores form
  const handleTestScoresChange = (e) => {
    const { name, value, type, checked } = e.target

    // Handle nested objects
    if (name.includes(".")) {
      const parts = name.split(".")
      if (parts.length === 3) {
        const [parent, test, field] = parts
        setTestScoresForm({
          ...testScoresForm,
          [parent]: {
            ...testScoresForm[parent],
            [test]: {
              ...testScoresForm[parent][test],
              [field]: type === "checkbox" ? checked : value,
            },
          },
        })
      } else if (parts.length === 2) {
        const [parent, field] = parts
        setTestScoresForm({
          ...testScoresForm,
          [parent]: {
            ...testScoresForm[parent],
            [field]: value,
          },
        })
      }
    } else {
      setTestScoresForm({
        ...testScoresForm,
        [name]: value,
      })
    }
  }

  // Update the useEffect that fetches student data
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await api.get(`/api/students/${id}`)
        setStudent(response.data)

        // Set advisor notes
        if (isAdminOrAdvisor()) {
          setAdvisorNotes(response.data.advisorNotes || "")
        }

        // Fetch applications for this student
        try {
          const appResponse = await api.get(`/api/students/${id}/applications`)
          setApplications(appResponse.data)
        } catch (appErr) {
          console.error("Error fetching applications:", appErr)
          setApplications([])
        } finally {
          setLoadingApplications(false)
        }
      } catch (err) {
        console.error("Error fetching student profile:", err)
        setError("Failed to load student profile. Please try again later.")
        // Use mock data for demonstration
        setStudent(mockStudent)
        setApplications(mockStudent.applications || [])
        setLoadingApplications(false)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStudentProfile()
    } else {
      setError("Invalid student ID")
      setLoading(false)
    }
  }, [id, isAdminOrAdvisor])

  // Add this helper function to the StudentProfile component
  const getImageUrl = (path) => {
    if (!path) return "/placeholder.png?height=120&width=120"

    // If it's already a full URL (S3)
    if (path.startsWith("http")) return path

    // If it's a base64 string
    if (path.startsWith("data:image")) return path

    // If it's a local path
    // Make sure it starts with a slash
    const localPath = path.startsWith("/") ? path : `/${path}`

    // For local paths, prepend the API base URL if it's not a placeholder
    if (!localPath.includes("placeholder")) {
      return `${api.defaults.baseURL}${localPath}`
    }

    return localPath
  }

  const tabs = [
    {
      label: "Student Profile",
      path: `/student/${id}`,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          ></path>
        </svg>
      ),
    },
    {
      label: "Application",
      path: `/applications?student=${id}`,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      ),
    },
    {
      label: "Documents",
      path: `/documents?student=${id}`,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          ></path>
        </svg>
      ),
    },
  ]

  const profileTabs = [
    { id: "basic", label: "Basic Info" },
    { id: "personal", label: "Personal Details" },
    { id: "education", label: "Education" },
    { id: "tests", label: "Test Scores" },
  ]

  // Mock data for demonstration
  const mockStudent = {
    _id: "1",
    name: "",
    email: "",
    phone: "",
    degree: "",
    major: "",
    gpa: "",
    avatar: "/placeholder.png?height=120&width=120",
    dob: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    education: [
      {
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        gpa: "",
      },
    ],
    testScores: {
      toefl: {
        score: 0,
        date: "",
      },
      ielts: {
        score: 0,
        date: "",
      },
      gre: {
        verbal: 5,
        quantitative: 8,
        analytical: 0,
        date: "",
      },
    },
    applications: [{ id: 101, university: "Default Template", countryCode: "NL", status: "NA" }],
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-8 w-8 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Student Profile</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleDeleteStudent}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center ml-2"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            Delete Student
          </button>
        </div>
      </div>

      <TabNavigation tabs={tabs} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center">
              {/* Update the image src to handle both S3 and local paths */}
              <img
                src={getImageUrl(student.avatar || (student.userId && student.userId.avatar))}
                alt={student?.name}
                className="w-32 h-32 rounded-full object-cover mb-4"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/placeholder.png?height=100&width=100"
                }}
              />
              <h2 className="text-xl font-bold">{student?.name}</h2>
              <p className="text-gray-600">
                {student?.degree} in {student?.major}
              </p>
              <p className="text-gray-500">GPA: {student?.gpa}/10</p>

              <div className="mt-4 w-full">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{student?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{student?.contact}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Nationality</span>
                  <span className="font-medium">{student?.nationality}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Passport</span>
                  <span className="font-medium">{student?.passportNumber}</span>
                </div>
              </div>
              {student.advisors && student.advisors.length > 0 && (
                <div className="mt-4 w-full">
                  <h4 className="font-medium mb-2">Advisors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.advisors.map((advisor) => (
                      <div key={advisor._id} className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                        <img
                          src={getImageUrl(advisor.avatar) || "/placeholder.svg"}
                          alt={advisor.name}
                          className="w-5 h-5 rounded-full mr-1 object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/placeholder.png?height=20&width=20"
                          }}
                        />
                        <span className="text-xs">{advisor.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advisor Notes Section - Only visible to admin/advisor */}
          {isAdminOrAdvisor() && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Advisor Notes</h3>
              <div className="mb-2 text-sm text-gray-500">
                These notes are only visible to advisors and administrators.
              </div>
              <textarea
                value={advisorNotes}
                onChange={(e) => setAdvisorNotes(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add private notes about this student here..."
              ></textarea>
              <div className="flex justify-between items-center mt-2">
                {notesSuccess && <span className="text-green-600 text-sm">{notesSuccess}</span>}
                <button
                  onClick={handleSaveAdvisorNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 ml-auto"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b mb-4">
              <div className="flex overflow-x-auto">
                {profileTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "basic" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  {canStudentEdit() && !editingBasicInfo && (
                    <button
                      onClick={handleEditBasicInfo}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        ></path>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                {basicInfoSuccess && (
                  <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">{basicInfoSuccess}</div>
                )}

                {basicInfoError && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">{basicInfoError}</div>}

                {editingBasicInfo && canStudentEdit() ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={basicInfoForm.name}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={basicInfoForm.email}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={basicInfoForm.phone}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={basicInfoForm.dateOfBirth}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={basicInfoForm.gender}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                        <input
                          type="text"
                          name="nationality"
                          value={basicInfoForm.nationality}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleCancelEdit("basic")}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveBasicInfo}
                        disabled={savingBasicInfo}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {savingBasicInfo ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="bg-gray-100 p-2 rounded-md">{student?.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="bg-gray-100 p-2 rounded-md">{student?.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="bg-gray-100 p-2 rounded-md">{student?.contact}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <div className="bg-gray-100 p-2 rounded-md">
                        {student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "Not provided"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <div className="bg-gray-100 p-2 rounded-md">{student?.gender || "Not provided"}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                      <div className="bg-gray-100 p-2 rounded-md">{student?.nationality || "Not provided"}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "personal" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Personal Details</h3>
                  {canStudentEdit() && !editingPersonalInfo && (
                    <button
                      onClick={handleEditPersonalInfo}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        ></path>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                {personalInfoSuccess && (
                  <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">{personalInfoSuccess}</div>
                )}

                {personalInfoError && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">{personalInfoError}</div>
                )}

                {editingPersonalInfo && canStudentEdit() ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium mb-2">Passport Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                          <input
                            type="text"
                            name="passportNumber"
                            value={personalInfoForm.passportNumber}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                          <input
                            type="date"
                            name="passportIssueDate"
                            value={personalInfoForm.passportIssueDate}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <input
                            type="date"
                            name="passportExpiryDate"
                            value={personalInfoForm.passportExpiryDate}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Country</label>
                          <input
                            type="text"
                            name="passportIssueCountry"
                            value={personalInfoForm.passportIssueCountry}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Birth Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City of Birth</label>
                          <input
                            type="text"
                            name="cityOfBirth"
                            value={personalInfoForm.cityOfBirth}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Birth</label>
                          <input
                            type="text"
                            name="countryOfBirth"
                            value={personalInfoForm.countryOfBirth}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                          <select
                            name="maritalStatus"
                            value={personalInfoForm.maritalStatus}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label>
                          <input
                            type="text"
                            name="citizenship"
                            value={personalInfoForm.citizenship}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Address 1</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            name="address1.country"
                            value={personalInfoForm.address1.country}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                          <input
                            type="text"
                            name="address1.state"
                            value={personalInfoForm.address1.state}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="address1.city"
                            value={personalInfoForm.address1.city}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <input
                            type="text"
                            name="address1.pincode"
                            value={personalInfoForm.address1.pincode}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            name="emergencyContact.name"
                            value={personalInfoForm.emergencyContact.name}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="text"
                            name="emergencyContact.phone"
                            value={personalInfoForm.emergencyContact.phone}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            name="emergencyContact.email"
                            value={personalInfoForm.emergencyContact.email}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                          <input
                            type="text"
                            name="emergencyContact.relation"
                            value={personalInfoForm.emergencyContact.relation}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Additional Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="multipleCitizenship"
                            name="multipleCitizenship"
                            checked={personalInfoForm.multipleCitizenship}
                            onChange={handlePersonalInfoChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="multipleCitizenship" className="ml-2 block text-sm text-gray-700">
                            Multiple Citizenship
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="studyingInOtherCountry"
                            name="studyingInOtherCountry"
                            checked={personalInfoForm.studyingInOtherCountry}
                            onChange={handlePersonalInfoChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="studyingInOtherCountry" className="ml-2 block text-sm text-gray-700">
                            Currently Studying in Another Country
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="appliedForImmigration"
                            name="appliedForImmigration"
                            checked={personalInfoForm.appliedForImmigration}
                            onChange={handlePersonalInfoChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="appliedForImmigration" className="ml-2 block text-sm text-gray-700">
                            Applied for Immigration
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="medicalCondition"
                            name="medicalCondition"
                            checked={personalInfoForm.medicalCondition}
                            onChange={handlePersonalInfoChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="medicalCondition" className="ml-2 block text-sm text-gray-700">
                            Has Medical Condition
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isUSPermanentResident"
                            name="isUSPermanentResident"
                            checked={personalInfoForm.isUSPermanentResident}
                            onChange={handlePersonalInfoChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isUSPermanentResident" className="ml-2 block text-sm text-gray-700">
                            US Permanent Resident
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isCanadianPermanentResident"
                            name="isCanadianPermanentResident"
                            checked={personalInfoForm.isCanadianPermanentResident}
                            onChange={handlePersonalInfoChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isCanadianPermanentResident" className="ml-2 block text-sm text-gray-700">
                            Canadian Permanent Resident
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleCancelEdit("personal")}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePersonalInfo}
                        disabled={savingPersonalInfo}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {savingPersonalInfo ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium mb-2">Passport Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.passportNumber || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.passportIssueDate
                              ? new Date(student.passportIssueDate).toLocaleDateString()
                              : "Not provided"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.passportExpiryDate
                              ? new Date(student.passportExpiryDate).toLocaleDateString()
                              : "Not provided"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Country</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.passportIssueCountry || "Not provided"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Birth Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City of Birth</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.cityOfBirth || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Birth</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.countryOfBirth || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.maritalStatus || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.citizenship || "Not provided"}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.address1?.country || "Not provided"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.address1?.state || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.address1?.city || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.address1?.pincode || "Not provided"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.emergencyContact?.name || "Not provided"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.emergencyContact?.phone || "Not provided"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.emergencyContact?.email || "Not provided"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.emergencyContact?.relation || "Not provided"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Additional Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Multiple Citizenship</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.multipleCitizenship ? "Yes" : "No"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Studying in Other Country
                          </label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.studyingInOtherCountry ? "Yes" : "No"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Applied for Immigration
                          </label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.appliedForImmigration ? "Yes" : "No"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medical Condition</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.medicalCondition ? "Yes" : "No"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">US Permanent Resident</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.isUSPermanentResident ? "Yes" : "No"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Canadian Permanent Resident
                          </label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.isCanadianPermanentResident ? "Yes" : "No"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "education" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Education History</h3>
                  {canStudentEdit() && !editingEducation && (
                    <button
                      onClick={handleEditEducation}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        ></path>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                {educationSuccess && (
                  <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">{educationSuccess}</div>
                )}

                {educationError && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">{educationError}</div>}

                {editingEducation && canStudentEdit() ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium mb-2">General Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input
                            type="text"
                            name="degree"
                            value={educationForm.degree}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                          <input
                            type="text"
                            name="major"
                            value={educationForm.major}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                          <input
                            type="text"
                            name="gpa"
                            value={educationForm.gpa}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Education</label>
                          <input
                            type="text"
                            name="educationSummary.countryOfEducation"
                            value={educationForm.educationSummary.countryOfEducation}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Highest Level of Education
                          </label>
                          <input
                            type="text"
                            name="educationSummary.highestLevelOfEducation"
                            value={educationForm.educationSummary.highestLevelOfEducation}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Post Graduate</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                          <input
                            type="text"
                            name="postGraduate.universityName"
                            value={educationForm.postGraduate.universityName}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                          <input
                            type="text"
                            name="postGraduate.countryOfStudy"
                            value={educationForm.postGraduate.countryOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                          <input
                            type="text"
                            name="postGraduate.stateOfStudy"
                            value={educationForm.postGraduate.stateOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="postGraduate.cityOfStudy"
                            value={educationForm.postGraduate.cityOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                          <input
                            type="text"
                            name="postGraduate.qualification"
                            value={educationForm.postGraduate.qualification}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                          <input
                            type="text"
                            name="postGraduate.gradingSystem"
                            value={educationForm.postGraduate.gradingSystem}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/GPA</label>
                          <input
                            type="text"
                            name="postGraduate.percentage"
                            value={educationForm.postGraduate.percentage}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Language</label>
                          <input
                            type="text"
                            name="postGraduate.primaryLanguage"
                            value={educationForm.postGraduate.primaryLanguage}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            name="postGraduate.startDate"
                            value={
                              educationForm.postGraduate.startDate
                                ? new Date(educationForm.postGraduate.startDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            name="postGraduate.endDate"
                            value={
                              educationForm.postGraduate.endDate
                                ? new Date(educationForm.postGraduate.endDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Under Graduate</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                          <input
                            type="text"
                            name="underGraduate.universityName"
                            value={educationForm.underGraduate.universityName}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                          <input
                            type="text"
                            name="underGraduate.countryOfStudy"
                            value={educationForm.underGraduate.countryOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                          <input
                            type="text"
                            name="underGraduate.stateOfStudy"
                            value={educationForm.underGraduate.stateOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="underGraduate.cityOfStudy"
                            value={educationForm.underGraduate.cityOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                          <input
                            type="text"
                            name="underGraduate.qualification"
                            value={educationForm.underGraduate.qualification}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                          <input
                            type="text"
                            name="underGraduate.gradingSystem"
                            value={educationForm.underGraduate.gradingSystem}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/GPA</label>
                          <input
                            type="text"
                            name="underGraduate.percentage"
                            value={educationForm.underGraduate.percentage}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Language</label>
                          <input
                            type="text"
                            name="underGraduate.primaryLanguage"
                            value={educationForm.underGraduate.primaryLanguage}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            name="underGraduate.startDate"
                            value={
                              educationForm.underGraduate.startDate
                                ? new Date(educationForm.underGraduate.startDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            name="underGraduate.endDate"
                            value={
                              educationForm.underGraduate.endDate
                                ? new Date(educationForm.underGraduate.endDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Grade 12</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                          <input
                            type="text"
                            name="grade12.schoolName"
                            value={educationForm.grade12.schoolName}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                          <input
                            type="text"
                            name="grade12.countryOfStudy"
                            value={educationForm.grade12.countryOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                          <input
                            type="text"
                            name="grade12.stateOfStudy"
                            value={educationForm.grade12.stateOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="grade12.cityOfStudy"
                            value={educationForm.grade12.cityOfStudy}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                          <input
                            type="text"
                            name="grade12.qualification"
                            value={educationForm.grade12.qualification}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                          <input
                            type="text"
                            name="grade12.gradingSystem"
                            value={educationForm.grade12.gradingSystem}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/GPA</label>
                          <input
                            type="text"
                            name="grade12.percentage"
                            value={educationForm.grade12.percentage}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Language</label>
                          <input
                            type="text"
                            name="grade12.primaryLanguage"
                            value={educationForm.grade12.primaryLanguage}
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            name="grade12.startDate"
                            value={
                              educationForm.grade12.startDate
                                ? new Date(educationForm.grade12.startDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            name="grade12.endDate"
                            value={
                              educationForm.grade12.endDate
                                ? new Date(educationForm.grade12.endDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleEducationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleCancelEdit("education")}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEducation}
                        disabled={savingEducation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {savingEducation ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium mb-2">General Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.degree || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.major || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                          <div className="bg-gray-100 p-2 rounded-md">{student?.gpa || "Not provided"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Education</label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.educationSummary?.countryOfEducation || "Not provided"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Highest Level of Education
                          </label>
                          <div className="bg-gray-100 p-2 rounded-md">
                            {student?.educationSummary?.highestLevelOfEducation || "Not provided"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {student?.postGraduate?.universityName && (
                      <div>
                        <h4 className="text-md font-medium mb-2">Post Graduate</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.postGraduate.universityName}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.postGraduate.countryOfStudy}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.postGraduate.qualification}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/GPA</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.postGraduate.percentage}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <div className="bg-gray-100 p-2 rounded-md">
                              {student.postGraduate.startDate
                                ? `${new Date(student.postGraduate.startDate).toLocaleDateString()} - ${
                                    student.postGraduate.endDate
                                      ? new Date(student.postGraduate.endDate).toLocaleDateString()
                                      : "Present"
                                  }`
                                : "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {student?.underGraduate?.universityName && (
                      <div>
                        <h4 className="text-md font-medium mb-2">Under Graduate</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.underGraduate.universityName}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.underGraduate.countryOfStudy}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.underGraduate.qualification}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/GPA</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.underGraduate.percentage}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <div className="bg-gray-100 p-2 rounded-md">
                              {student.underGraduate.startDate
                                ? `${new Date(student.underGraduate.startDate).toLocaleDateString()} - ${
                                    student.underGraduate.endDate
                                      ? new Date(student.underGraduate.endDate).toLocaleDateString()
                                      : "Present"
                                  }`
                                : "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {student?.grade12?.schoolName && (
                      <div>
                        <h4 className="text-md font-medium mb-2">Grade 12</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.grade12.schoolName}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.grade12.countryOfStudy}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.grade12.qualification}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/GPA</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.grade12.percentage}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <div className="bg-gray-100 p-2 rounded-md">
                              {student.grade12.startDate
                                ? `${new Date(student.grade12.startDate).toLocaleDateString()} - ${
                                    student.grade12.endDate
                                      ? new Date(student.grade12.endDate).toLocaleDateString()
                                      : "Present"
                                  }`
                                : "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {student?.grade10?.schoolName && (
                      <div>
                        <h4 className="text-md font-medium mb-2">Grade 10</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.grade10.schoolName}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country of Study</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.grade10.countryOfStudy}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.grade10.qualification}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/GPA</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.grade10.percentage}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <div className="bg-gray-100 p-2 rounded-md">
                              {student.grade10.startDate
                                ? `${new Date(student.grade10.startDate).toLocaleDateString()} - ${
                                    student.grade10.endDate
                                      ? new Date(student.grade10.endDate).toLocaleDateString()
                                      : "Present"
                                  }`
                                : "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {student?.workExperience?.organizationName && (
                      <div>
                        <h4 className="text-md font-medium mb-2">Work Experience</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.workExperience.organizationName}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.workExperience.position}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Profile</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.workExperience.jobProfile}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <div className="bg-gray-100 p-2 rounded-md">
                              {student.workExperience.workingFrom
                                ? `${new Date(student.workExperience.workingFrom).toLocaleDateString()} - ${
                                    student.workExperience.workingUpto
                                      ? new Date(student.workExperience.workingUpto).toLocaleDateString()
                                      : "Present"
                                  }`
                                : "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tests" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Test Scores</h3>
                  {canStudentEdit() && !editingTestScores && (
                    <button
                      onClick={handleEditTestScores}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        ></path>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                {testScoresSuccess && (
                  <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">{testScoresSuccess}</div>
                )}

                {testScoresError && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">{testScoresError}</div>
                )}

                {editingTestScores && canStudentEdit() ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium mb-2">GRE</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                          <input
                            type="text"
                            name="testScores.gre.overallScore"
                            value={testScoresForm.testScores.gre.overallScore}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                          <input
                            type="date"
                            name="testScores.gre.examDate"
                            value={
                              testScoresForm.testScores.gre.examDate
                                ? new Date(testScoresForm.testScores.gre.examDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Verbal</label>
                          <input
                            type="text"
                            name="testScores.gre.verbal"
                            value={testScoresForm.testScores.gre.verbal}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantitative</label>
                          <input
                            type="text"
                            name="testScores.gre.quantitative"
                            value={testScoresForm.testScores.gre.quantitative}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Analytical</label>
                          <input
                            type="text"
                            name="testScores.gre.analytical"
                            value={testScoresForm.testScores.gre.analytical}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">TOEFL</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                          <input
                            type="text"
                            name="testScores.toefl.overallScore"
                            value={testScoresForm.testScores.toefl.overallScore}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                          <input
                            type="date"
                            name="testScores.toefl.examDate"
                            value={
                              testScoresForm.testScores.toefl.examDate
                                ? new Date(testScoresForm.testScores.toefl.examDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Listening</label>
                          <input
                            type="text"
                            name="testScores.toefl.listening"
                            value={testScoresForm.testScores.toefl.listening}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reading</label>
                          <input
                            type="text"
                            name="testScores.toefl.reading"
                            value={testScoresForm.testScores.toefl.reading}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Writing</label>
                          <input
                            type="text"
                            name="testScores.toefl.writing"
                            value={testScoresForm.testScores.toefl.writing}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Speaking</label>
                          <input
                            type="text"
                            name="testScores.toefl.speaking"
                            value={testScoresForm.testScores.toefl.speaking}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">IELTS</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                          <input
                            type="text"
                            name="testScores.ielts.overallScore"
                            value={testScoresForm.testScores.ielts.overallScore}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">TRF Number</label>
                          <input
                            type="text"
                            name="testScores.ielts.trfNumber"
                            value={testScoresForm.testScores.ielts.trfNumber}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                          <input
                            type="date"
                            name="testScores.ielts.examDate"
                            value={
                              testScoresForm.testScores.ielts.examDate
                                ? new Date(testScoresForm.testScores.ielts.examDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Listening</label>
                          <input
                            type="text"
                            name="testScores.ielts.listening"
                            value={testScoresForm.testScores.ielts.listening}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reading</label>
                          <input
                            type="text"
                            name="testScores.ielts.reading"
                            value={testScoresForm.testScores.ielts.reading}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Writing</label>
                          <input
                            type="text"
                            name="testScores.ielts.writing"
                            value={testScoresForm.testScores.ielts.writing}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Speaking</label>
                          <input
                            type="text"
                            name="testScores.ielts.speaking"
                            value={testScoresForm.testScores.ielts.speaking}
                            onChange={handleTestScoresChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="ieltsWaiver"
                            name="testScores.ielts.ieltsWaiver"
                            checked={testScoresForm.testScores.ielts.ieltsWaiver}
                            onChange={handleTestScoresChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="ieltsWaiver" className="ml-2 block text-sm text-gray-700">
                            IELTS Waiver
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleCancelEdit("tests")}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTestScores}
                        disabled={savingTestScores}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {savingTestScores ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {student?.testScores?.gre?.overallScore && (
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium text-lg mb-2">GRE</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.gre.overallScore}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verbal</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.gre.verbal}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantitative</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.gre.quantitative}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Analytical Writing</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.gre.analytical}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                            <div className="bg-gray-100 p-2 rounded-md">
                              {student.testScores.gre.examDate
                                ? new Date(student.testScores.gre.examDate).toLocaleDateString()
                                : "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {student?.testScores?.toefl?.overallScore && (
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium text-lg mb-2">TOEFL</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Score</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.toefl.overallScore}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Listening</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.toefl.listening}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reading</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.toefl.reading}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Writing</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.toefl.writing}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Speaking</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.toefl.speaking}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                            <div className="bg-gray-100 p-2 rounded-md">
                              {student.testScores.toefl.examDate
                                ? new Date(student.testScores.toefl.examDate).toLocaleDateString()
                                : "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {student?.testScores?.ielts?.overallScore && (
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium text-lg mb-2">IELTS</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Band Score</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.ielts.overallScore}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Listening</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.ielts.listening}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reading</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.ielts.reading}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Writing</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.ielts.writing}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Speaking</label>
                            <div className="bg-gray-100 p-2 rounded-md">{student.testScores.ielts.speaking}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                            <div className="bg-gray-100 p-2 rounded-md">
                              {student.testScores.ielts.examDate
                                ? new Date(student.testScores.ielts.examDate).toLocaleDateString()
                                : "Not provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!student?.testScores?.toefl?.overallScore &&
                      !student?.testScores?.ielts?.overallScore &&
                      !student?.testScores?.gre?.overallScore && (
                        <div className="col-span-2 text-center py-6 text-gray-500">No test scores provided</div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Applications</h3>
              <button
                onClick={() => navigate(`/applications?student=${id}`)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View All
              </button>
            </div>

            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id || app._id}
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{app.countryCode ? getCountryFlag(app.countryCode) : "🌍"}</span>
                      <div>
                        <h4 className="font-medium">{app.university || app.name}</h4>
                        <p className="text-sm text-gray-500">{app.program || "Graduate Program"}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: app.statusColor || "#f3f4f6",
                        color: getContrastColor(app.statusColor || "#f3f4f6"),
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No applications yet</p>
                <button
                  onClick={() => navigate(`/applications/new?student=${id}`)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Create Application
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get country flag emoji
const getCountryFlag = (countryCode) => {
  if (!countryCode) return ""

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

// Update the getContrastColor function to match the one in Applications.jsx
const getContrastColor = (hexColor) => {
  // If no color or invalid format, return dark text
  if (!hexColor || !hexColor.startsWith("#")) return "#1f2937"

  // Convert hex to RGB
  const r = Number.parseInt(hexColor.substr(1, 2), 16)
  const g = Number.parseInt(hexColor.substr(3, 2), 16)
  const b = Number.parseInt(hexColor.substr(5, 2), 16)

  // Calculate luminance using the relative luminance formula
  // This gives better results than the simple average
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return white for dark backgrounds, dark gray for light backgrounds
  return luminance > 0.5 ? "#1f2937" : "#ffffff"
}

export default StudentProfile
