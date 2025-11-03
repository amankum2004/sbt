import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

export const AdminViewDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/donation/received-donations");
        // console.log("Donations data:", res.data);
        setDonations(res.data);
      } catch (error) {
        console.error("Failed to fetch donations", error);
        setError("Failed to load donations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading donations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Donations</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">🌍 Donation Records</h2>
        <p className="text-center text-gray-600 mb-6">Total Donations: {donations.length}</p>

        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-gray-400">💝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Donations Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are no donation records in the database at the moment. 
              Donations will appear here once supporters start contributing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border text-left">Email</th>
                  <th className="p-3 border text-left">Amount (₹)</th>
                  <th className="p-3 border text-left">Message</th>
                  <th className="p-3 border text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation, index) => (
                  <tr 
                    key={donation._id || index} 
                    className="border-t hover:bg-gray-50 transition duration-150"
                  >
                    <td className="p-3 border">{donation.name}</td>
                    <td className="p-3 border text-blue-600">{donation.email}</td>
                    <td className="p-3 border font-semibold text-green-700">₹{donation.amount}</td>
                    <td className="p-3 border max-w-xs">
                      {donation.message ? (
                        <div className="break-words">{donation.message}</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 border text-gray-600">
                      {new Date(donation.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Summary */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-semibold">
                Total Amount Received: ₹{donations.reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};







// import React, { useEffect, useState } from 'react';
// import { api } from '../utils/api';

// const AdminViewDonations = () => {
//   const [donations, setDonations] = useState([]);

//   useEffect(() => {
//     const fetchDonations = async () => {
//       try {
//         const res = await api.get("donation/received-donations");
//         setDonations(res.data);
//       } catch (error) {
//         console.error("Failed to fetch donations", error);
//       }
//     };

//     fetchDonations();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100 px-4 py-10">
//       <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
//         <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">🌍 Donation Records</h2>

//         {donations.length === 0 ? (
//           <p className="text-center text-gray-500">No donations yet.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full table-auto border-collapse">
//               <thead>
//                 <tr className="bg-green-600 text-white">
//                   <th className="p-3 border">Name</th>
//                   <th className="p-3 border">Email</th>
//                   <th className="p-3 border">Amount (₹)</th>
//                   <th className="p-3 border">Message</th>
//                   <th className="p-3 border">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {donations.map((donation, index) => (
//                   <tr key={index} className="text-center border-t">
//                     <td className="p-2 border">{donation.name}</td>
//                     <td className="p-2 border">{donation.email}</td>
//                     <td className="p-2 border">{donation.amount}</td>
//                     <td className="p-2 border text-left">{donation.message || "-"}</td>
//                     <td className="p-2 border">
//                       {new Date(donation.createdAt).toLocaleString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminViewDonations;
