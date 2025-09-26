import React, { useEffect, useState } from "react";
import { fetchMemberShares } from "../../utils/api"; // adjust path if needed

const GroupShares: React.FC = () => {
  const [globalStats, setGlobalStats] = useState<any>(null);

  useEffect(() => {
    const getShares = async () => {
      try {
        const data = await fetchMemberShares();
        setGlobalStats(data);
      } catch (error) {
        console.error("Failed to fetch member shares", error);
      }
    };
    getShares();
  }, []);

  if (!globalStats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-extrabold mb-8 text-emerald-700 text-center drop-shadow">
        Global Shares & Interest
      </h2>
      <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Total Member Savings
            </p>
            <div className="text-2xl font-bold text-emerald-700">
              {/* {globalStats.totalSavings.toLocaleString()} */}
            </div>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Total Interest Distributed
            </p>
            <div className="text-2xl font-bold text-blue-700">
              {/* {globalStats.totalInterest.toLocaleString()} */}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="text-xl font-semibold mb-4 text-purple-700">
            Member Shares
          </h4>
          <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Group
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Shares
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Percent
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Interest
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Projected Interest
                  </th>
                </tr>
              </thead>
              <tbody>
                {globalStats.map((member: any, idx: number) => (
                  <tr
                    key={member.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">
                      {member.branch}
                    </td>
                    <td className="py-3 px-4">
                      {member.totalContribution.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{member.sharePercentage.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">
                      {member.interestEarned.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4 text-purple-700 font-bold">
                      {member.interestToBeEarned.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupShares;
