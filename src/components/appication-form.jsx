const ApplicationForm = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Apply now to <span className="text-black">TOP</span> universities worldwide!
        </h2>

        {/* Personal Information */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <input type="date" placeholder="Date of Birth" className="p-3 border rounded-md w-full" />
            <select className="p-3 border rounded-md w-full">
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <select className="p-3 border rounded-md w-full">
              <option>Select Marital Status</option>
              <option>Single</option>
              <option>Married</option>
            </select>
          </div>
        </div>

        {/* Mailing Address */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">Mailing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input type="text" placeholder="Address 1" className="p-3 border rounded-md w-full" />
            <input type="text" placeholder="Address 2" className="p-3 border rounded-md w-full" />
            <select className="p-3 border rounded-md w-full">
              <option>Select Country</option>
            </select>
            <select className="p-3 border rounded-md w-full">
              <option>Select State</option>
            </select>
            <input type="text" placeholder="City" className="p-3 border rounded-md w-full" />
            <input type="text" placeholder="Pincode/Postcode" className="p-3 border rounded-md w-full" />
          </div>
        </div>

        {/* Passport Information */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">Passport Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input type="text" placeholder="Passport Number" className="p-3 border rounded-md w-full" />
            <input type="date" placeholder="Issue Date" className="p-3 border rounded-md w-full" />
            <input type="date" placeholder="Expiry Date" className="p-3 border rounded-md w-full" />
            <input type="text" placeholder="Issue Country" className="p-3 border rounded-md w-full" />
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">Emergency Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input type="text" placeholder="Name" className="p-3 border rounded-md w-full" />
            <input type="text" placeholder="Phone" className="p-3 border rounded-md w-full" />
            <input type="email" placeholder="Email" className="p-3 border rounded-md w-full" />
            <input type="text" placeholder="Relation with Applicant" className="p-3 border rounded-md w-full" />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600">
            Submit Application
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationForm
