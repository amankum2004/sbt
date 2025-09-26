// import React, { useEffect, useState } from "react";
// import { api } from "../utils/api";
// import moment from "moment";

// export const TimeSlotManager = ({ shopId }) => {
//   const [slots, setSlots] = useState([]);

//   useEffect(() => {
//     const fetchSlots = async () => {
//       const { data } = await api.get(`time/timeslots/${shopId}`);
//       setSlots(data);
//     };
//     fetchSlots();
//   }, [shopId]);

//   const toggleBooked = async (slotId, showtimeId) => {
//     await api.patch(`time/timeslots/${slotId}/toggle/${showtimeId}`);
//     const updated = slots.map(slot => {
//       if (slot._id === slotId) {
//         slot.showtimes = slot.showtimes.map(s =>
//           s._id === showtimeId ? { ...s, is_booked: !s.is_booked } : s
//         );
//       }
//       return slot;
//     });
//     setSlots(updated);
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold mb-4">Manage Time Slots</h2>
//       {slots.map(slot => (
//         <div key={slot._id} className="mb-4 border p-4 rounded bg-white">
//           <h3 className="font-bold">{moment(slot.date).format("YYYY-MM-DD")}</h3>
//           <div className="grid grid-cols-3 gap-2 mt-2">
//             {slot.showtimes.map(st => (
//               <button
//                 key={st._id}
//                 onClick={() => toggleBooked(slot._id, st._id)}
//                 className={`px-2 py-1 rounded text-sm ${
//                   st.is_booked ? "bg-red-500 text-white" : "bg-green-100"
//                 }`}
//               >
//                 {moment(st.date).format("hh:mm A")}
//               </button>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };






// // import React, { useEffect, useState } from "react";
// // import { api } from "../utils/api";
// // import moment from "moment";

// // export const TimeSlotManager = ({ shopOwnerId }) => {
// //     const [slots, setSlots] = useState([]);

// //     const loadSlots = async () => {
// //         const res = await api.get(`/timeslots/manage/${shopOwnerId}`);
// //         setSlots(res.data);
// //     };

// //     useEffect(() => {
// //         loadSlots();
// //     }, []);

// //     const toggleDisable = async (id) => {
// //         await api.put(`/timeslots/update/${id}`, { toggleDisable: true });
// //         loadSlots();
// //     };

// //     return (
// //         <div className="max-w-3xl mx-auto p-4">
// //             <h2 className="text-xl font-bold mb-4">Manage Time Slots</h2>
// //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                 {slots.map((slot) => (
// //                     <div
// //                         key={slot._id}
// //                         className={`p-3 border rounded shadow flex justify-between items-center ${slot.isDisabled ? "bg-red-100" : "bg-green-100"
// //                             }`}
// //                     >
// //                         <div>
// //                             <strong>{moment(slot.date).format("MMM DD, ddd")}</strong>
// //                             <p>{slot.time}</p>
// //                         </div>
// //                         <button
// //                             onClick={() => toggleDisable(slot._id)}
// //                             className="text-sm bg-gray-800 text-white px-2 py-1 rounded"
// //                         >
// //                             {slot.isDisabled ? "Enable" : "Disable"}
// //                         </button>
// //                     </div>
// //                 ))}
// //             </div>
// //         </div>
// //     );
// // };
