import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import {fetchPenalties, updatePenalty } from "../../utils/api";

const Penalties: React.FC = () => {
  const { state, dispatch } = useApp();
  const {  paidPenalties = [] } = state;
  const [penalties, setPenalties] = useState<any[]>([]);

  useEffect(() => {
    fetchPenalties().then((data) => {
      setPenalties(data);
    });
  }, []);


  // Handle paying penalty: update penalty status in backend and deduct 25 from member
  const handlePayPenalty = async ( penaltyId: string) => {
  try {
    // 1. Update penalty status in backend (backend should also create a penalty contribution of -25)
    await updatePenalty(penaltyId, { status: "paid" });

    // 2. Refresh penalties from backend
    const updatedPenalties = await fetchPenalties();
    setPenalties(updatedPenalties);

    // 3. Optionally, refresh users from backend to update totalContributions everywhere
    // If you have a loadUsers() function in context, call it here:
    // await loadUsers();

    // 4. Optionally, update paidPenalties in your state
    dispatch({ type: "ADD_PAID_PENALTY", payload: penaltyId });
  } catch (error) {
    console.error("Failed to pay penalty", error);
  }
};
console.log(penalties)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-red-700">Penalties</h2>
      <table className="min-w-full bg-white rounded-lg shadow border">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Member</th>
            <th className="py-2 px-4 text-left">Contribution Date</th>
            <th className="py-2 px-4 text-left">Penalty</th>
            <th className="py-2 px-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {penalties.map((c) => {
            const isPenalty = c.createdAt ;
            const penaltyId = c.id || c._id;
            return (
              <tr key={penaltyId}>
                <td className="py-2 px-4">{c.member.firstName}</td>
                <td className="py-2 px-4">
                  {c.assignedDate
                    ? new Date(c.assignedDate).toLocaleDateString()
                    : "-"}
                </td>
                <td
                  className={`py-2 px-4 font-bold ${
                    isPenalty ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isPenalty ? "$25" : "No Penalty"}
                </td>
                <td className="py-2 px-4">
                  {isPenalty ? (
                    c.status === "paid" || paidPenalties.includes(penaltyId) ? (
                      <span className="text-green-600 font-semibold">
                        Repaid
                      </span>
                    ) : (
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                        onClick={() =>
                          handlePayPenalty(
                                                        penaltyId
                          )
                        }
                        disabled={
                          c.status === "paid" ||
                          paidPenalties.includes(penaltyId)
                        }
                      >
                        Pay Penalty
                      </button>
                    )
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Penalties;
