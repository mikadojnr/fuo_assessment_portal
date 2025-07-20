"use client"

import { Link } from "react-router-dom"
import { FiArrowLeft, FiUser, FiLock, FiBell, FiSun, FiMoon } from "react-icons/fi"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import {
  fetchStudentProfile,
  updateStudentProfile,
  changeStudentPassword,
  fetchNotificationSettings,
  updateNotificationSettings,
} from "../services/assessmentService" // Import new service functions

// const StudentSettingsPage = () => {
//   const [darkMode, setDarkMode] = useState(false)
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [email, setEmail] = useState("")
//   const [oldPassword, setOldPassword] = useState("")
//   const [newPassword, setNewPassword] = useState("")
//   const [confirmNewPassword, setConfirmNewPassword] = useState("")
//   const [emailNotifications, setEmailNotifications] = useState(true)
//   const [inAppNotifications, setInAppNotifications] = useState(false)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     document.title = "Settings"
//     // Initialize dark mode state from local storage or system preference
//     const savedMode = localStorage.getItem("darkMode")
//     if (savedMode) {
//       setDarkMode(savedMode === "true")
//       if (savedMode === "true") {
//         document.documentElement.classList.add("dark")
//       } else {
//         document.documentElement.classList.remove("dark")
//       }
//     } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
//       setDarkMode(true)
//       document.documentElement.classList.add("dark")
//     }

//     const loadSettings = async () => {
//       try {
//         setLoading(true)
//         // Fetch profile data
//         const profile = await fetchStudentProfile()
//         setFirstName(profile.firstName)
//         setLastName(profile.lastName)
//         setEmail(profile.email)

//         // Fetch notification settings
//         const notifications = await fetchNotificationSettings()
//         setEmailNotifications(notifications.emailNotifications)
//         setInAppNotifications(notifications.inAppNotifications)
//       } catch (err) {
//         console.error("Error loading settings:", err)
//         setError("Failed to load settings. Please try again.")
//         toast.error("Failed to load settings.")
//       } finally {
//         setLoading(false)
//       }
//     }
//     loadSettings()
//   }, [])

//   const toggleDarkMode = () => {
//     const newMode = !darkMode
//     setDarkMode(newMode)
//     localStorage.setItem("darkMode", newMode)
//     if (newMode) {
//       document.documentElement.classList.add("dark")
//     } else {
//       document.documentElement.classList.remove("dark")
//     }
//   }

//   const handleSaveProfile = async () => {
//     try {
//       await updateStudentProfile({ firstName, lastName })
//       // toast.success("Profile settings saved!") // Handled by service
//     } catch (err) {
//       // Error handled by service
//     }
//   }

//   const handleChangePassword = async () => {
//     if (newPassword !== confirmNewPassword) {
//       toast.error("New password and confirm password do not match.")
//       return
//     }
//     if (!oldPassword || !newPassword) {
//       toast.error("Please fill in both old and new passwords.")
//       return
//     }

//     try {
//       await changeStudentPassword({ oldPassword, newPassword })
//       setOldPassword("")
//       setNewPassword("")
//       setConfirmNewPassword("")
//       // toast.info("Password change initiated. Check your email!") // Handled by service
//     } catch (err) {
//       // Error handled by service
//     }
//   }

//   const handleNotificationSettings = async () => {
//     try {
//       await updateNotificationSettings({ emailNotifications, inAppNotifications })
//       // toast.success("Notification settings updated!") // Handled by service
//     } catch (err) {
//       // Error handled by service
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <p className="text-gray-700 dark:text-gray-300">Loading settings...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center flex-col">
//         <p className="text-red-500 mb-4">{error}</p>
//         <Link
//           to="/student-dashboard"
//           className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#2A5C82] hover:bg-[#1e4460] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00BFA5]"
//         >
//           <FiArrowLeft className="mr-2" />
//           Back to Dashboard
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex items-center mb-6">
//           <Link to="/student-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-[#00BFA5] mr-3">
//             <FiArrowLeft className="h-6 w-6" />
//           </Link>
//           <h1 className="text-3xl font-bold">Settings</h1>
//         </div>

//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
//           <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">General Settings</h2>

//           {/* Profile Settings */}
//           <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
//             <div className="flex items-center mb-4">
//               <FiUser className="h-6 w-6 text-[#00BFA5] mr-3" />
//               <h3 className="text-xl font-medium text-gray-800 dark:text-white">Profile Information</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   id="firstName"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   id="lastName"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   value={email}
//                   disabled
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={handleSaveProfile}
//               className="px-4 py-2 bg-[#2A5C82] hover:bg-[#1e4460] text-white rounded-md transition-colors"
//             >
//               Save Profile
//             </button>
//           </div>

//           {/* Security Settings */}
//           <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
//             <div className="flex items-center mb-4">
//               <FiLock className="h-6 w-6 text-[#00BFA5] mr-3" />
//               <h3 className="text-xl font-medium text-gray-800 dark:text-white">Security</h3>
//             </div>
//             <p className="text-gray-600 dark:text-gray-300 mb-4">Manage your password and account security.</p>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label
//                   htmlFor="oldPassword"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   Old Password
//                 </label>
//                 <input
//                   type="password"
//                   id="oldPassword"
//                   value={oldPassword}
//                   onChange={(e) => setOldPassword(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="newPassword"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   New Password
//                 </label>
//                 <input
//                   type="password"
//                   id="newPassword"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label
//                   htmlFor="confirmNewPassword"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   Confirm New Password
//                 </label>
//                 <input
//                   type="password"
//                   id="confirmNewPassword"
//                   value={confirmNewPassword}
//                   onChange={(e) => setConfirmNewPassword(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={handleChangePassword}
//               className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
//             >
//               Change Password
//             </button>
//           </div>

//           {/* Notification Settings */}
//           <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
//             <div className="flex items-center mb-4">
//               <FiBell className="h-6 w-6 text-[#00BFA5] mr-3" />
//               <h3 className="text-xl font-medium text-gray-800 dark:text-white">Notifications</h3>
//             </div>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <label htmlFor="emailNotifications" className="text-gray-700 dark:text-gray-300">
//                   Email Notifications
//                 </label>
//                 <input
//                   type="checkbox"
//                   id="emailNotifications"
//                   checked={emailNotifications}
//                   onChange={(e) => setEmailNotifications(e.target.checked)}
//                   className="form-checkbox h-5 w-5 text-[#00BFA5] rounded focus:ring-[#00BFA5] dark:bg-gray-700 dark:border-gray-600"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label htmlFor="pushNotifications" className="text-gray-700 dark:text-gray-300">
//                   In-App Notifications
//                 </label>
//                 <input
//                   type="checkbox"
//                   id="pushNotifications"
//                   checked={inAppNotifications}
//                   onChange={(e) => setInAppNotifications(e.target.checked)}
//                   className="form-checkbox h-5 w-5 text-[#00BFA5] rounded focus:ring-[#00BFA5] dark:bg-gray-700 dark:border-gray-600"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={handleNotificationSettings}
//               className="mt-6 px-4 py-2 bg-[#2A5C82] hover:bg-[#1e4460] text-white rounded-md transition-colors"
//             >
//               Save Notification Settings
//             </button>
//           </div>

//           {/* Appearance Settings */}
//           <div>
//             <div className="flex items-center mb-4">
//               {darkMode ? (
//                 <FiSun className="h-6 w-6 text-[#00BFA5] mr-3" />
//               ) : (
//                 <FiMoon className="h-6 w-6 text-[#00BFA5] mr-3" />
//               )}
//               <h3 className="text-xl font-medium text-gray-800 dark:text-white">Appearance</h3>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
//               <button
//                 onClick={toggleDarkMode}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00BFA5] ${
//                   darkMode ? "bg-[#00BFA5]" : "bg-gray-200 dark:bg-gray-600"
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                     darkMode ? "translate-x-6" : "translate-x-1"
//                   }`}
//                 />
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 text-center">
//           <Link
//             to="/student-dashboard"
//             className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//           >
//             <FiArrowLeft className="mr-2" />
//             Back to Dashboard
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }

const StudentSettingsPage = () => {
  return (
    
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/student-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-[#00BFA5] mr-3">
              <FiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
            
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Settings Not Available</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Features not yet implemented in MVP, coming soon in our next update.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/student-dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudentSettingsPage
