import React, { useEffect, useState } from "react";
import { fetchUsers, updateUser } from "../../utils/api";
import { User } from "../../types";

const RegistrationApproval: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers: User[] = await fetchUsers();
      setPendingUsers(allUsers.filter(u => u.status === "pending" && u._id));
      setApprovedUsers(allUsers.filter(u => u.status === "approved" && u._id));
      setRejectedUsers(allUsers.filter(u => u.status === "rejected" && u._id));
    } catch (err: any) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await updateUser({ id: userId, status: "approved" });
      loadUsers();
    } catch (err) {
      setError("Failed to approve user.");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await updateUser({ id: userId, status: "rejected" });
      loadUsers();
    } catch (err) {
      setError("Failed to reject user.");
    }
  };

  let usersToShow: User[] = [];
  let tabTitle = "";
  if (activeTab === "pending") {
    usersToShow = pendingUsers;
    tabTitle = "Pending User Registrations";
  } else if (activeTab === "approved") {
    usersToShow = approvedUsers;
    tabTitle = "Approved Users";
  } else {
    usersToShow = rejectedUsers;
    tabTitle = "Rejected Users";
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {tabTitle}
        </h3>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${activeTab === "pending" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button
            className={`px-3 py-1 rounded ${activeTab === "approved" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved
          </button>
          <button
            className={`px-3 py-1 rounded ${activeTab === "rejected" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
        </div>
      </div>
      {error && (
        <div className="text-red-600 mb-2">{error}</div>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : usersToShow.length === 0 ? (
        <p className="text-gray-500">
          {activeTab === "pending"
            ? "No users pending approval."
            : activeTab === "approved"
            ? "No approved users."
            : "No rejected users."}
        </p>
      ) : (
        <div className="space-y-4">
          {usersToShow.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              {activeTab === "pending" && (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    onClick={() => handleApprove(user._id!)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleReject(user._id!)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegistrationApproval;
