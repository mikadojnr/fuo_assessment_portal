"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { FiUser, FiMail, FiBook, FiEdit2, FiArrowLeft } from "react-icons/fi"
import { Link } from "react-router-dom"

const Profile = () => {
  const { currentUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A5C82]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
          <Link
            to={currentUser.role === "lecturer" ? "/lecturer-dashboard" : "/student-dashboard"}
            className="text-gray-600 dark:text-gray-400 hover:text-[#00BFA5] mr-3"
          >
            <FiArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-[#2A5C82] text-white rounded-md hover:bg-[#1e4460] transition flex items-center"
          >
            <FiEdit2 className="mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] px-6 py-16">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-[#2A5C82] text-5xl font-bold border-4 border-white">
                {currentUser.firstName.charAt(0)}
                {currentUser.lastName.charAt(0)}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <div className="mt-1 flex items-center">
                    <FiUser className="text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={`${currentUser.firstName} ${currentUser.lastName}`}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BFA5] focus:border-[#00BFA5]"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Email Address</label>
                  <div className="mt-1 flex items-center">
                    <FiMail className="text-gray-400 mr-2" />
                    <p className="text-gray-800">{currentUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">University ID</label>
                  <div className="mt-1 flex items-center">
                    <FiUser className="text-gray-400 mr-2" />
                    <p className="text-gray-800">{currentUser.universityId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Role</label>
                  <div className="mt-1 flex items-center">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        currentUser.role === "student" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {currentUser.role === "student" ? "Student" : "Lecturer"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Department</label>
                  <div className="mt-1 flex items-center">
                    <FiBook className="text-gray-400 mr-2" />
                    <p className="text-gray-800">{currentUser.department?.name || "Not specified"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Member Since</label>
                  <div className="mt-1">
                    <p className="text-gray-800">
                      {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] text-white rounded-md hover:shadow-md transition">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
