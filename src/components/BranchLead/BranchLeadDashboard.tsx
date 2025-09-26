import React, { useState } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Edit,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getGroupTheme } from "../../utils/calculations";
import MemberDetails from "./MemberDetails";
import { approveOrReject, updateUser } from "../../utils/api";
import { Loan, User } from "../../types";

const BranchLeadDashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const { currentUser, users, loans } = state;
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
     const [actionType, setActionType] = useState<"approve" | "reject" | null>(
        null
      );
  
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== "branch_lead") return null;

  // Filter members in the same branch and same color
  const branchMembers = users.filter(
    (user) => user.role === "member" && user.branch === currentUser.branch
  );

  // Get loans for branch members
  const branchLoans = loans.filter((loan) =>
    branchMembers.some((member) => member.id === loan.memberId)
  );
  // console.log("this branch...",branchLoans)

  const pendingLoans = branchLoans.filter(
    (loan) => loan.status === "pending"
  ).length;
  const activeLoans = branchLoans.filter(
    (loan) => loan.status === "active"
  ).length;
  // Total branch savings should include all member savings plus all penalties
  const totalBranchSavings = branchMembers.reduce(
    (sum, member) =>
      sum +
      (typeof member.totalContributions === "number"
        ? member.totalContributions
        : 0) +
      (typeof member.penalties === "number" ? member.penalties : 0),
    0
  );
  // console.log("This is total saving branch", users);
  const stats = [
    {
      title: "Branch Members",
      value: branchMembers.length.toString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Branch Savings",
      value: `$${totalBranchSavings.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Active Loans",
      value: activeLoans.toString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Pending Approvals",
      value: pendingLoans.toString(),
      icon: AlertCircle,
      color: "text-emerald-700",
      bg: "bg-emerald-100",
    },
  ];

  // Branch lead can always edit
  const getMemberUpdateAccess = (_memberId: string) => true;

  const handleLoanAction = (loan: Loan, action: "approve" | "reject") => {
      setSelectedLoan(loan);
      setActionType(action);
        setTimeout(() => confirmAction(), 0); // ensure state is set before calling

    };

    const confirmAction = async () => {
        if (!selectedLoan || !actionType || !currentUser) return;
    
        try {
          const backendLoan = await approveOrReject(
            selectedLoan.id || (selectedLoan._id as string),
            actionType === "approve" ? "approved" : "rejected"
            // actionType === "reject" ? "Rejected by admin" : undefined
          );
          console.log(selectedLoan._id);
          dispatch({ type: "UPDATE_LOAN", payload: backendLoan });
    
          // If approved, update the member's active loan (optional, if needed)
          if (actionType === "approve" && backendLoan.member) {
            const updatedMember: User = {
              ...backendLoan.member,
              activeLoan: { ...backendLoan, status: "active" as const },
            };
            const backendUser = await updateUser(updatedMember);
            if (backendUser) {
              dispatch({ type: "UPDATE_USER", payload: backendUser });
            }
          }
        } catch (error) {
          console.error("Failed to update loan/user in backend", error);
        }
    
        setSelectedLoan(null);
        setActionType(null);
      };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Branch Lead Dashboard
        </h1>
        <p className="text-gray-600">
          Managing {currentUser.branch} - {branchMembers.length} members
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} rounded-lg p-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Access Notice */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Members */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Branch Members
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {branchMembers.map((member) => {
              const memberTheme = getGroupTheme("green-200");
              const memberLoan = member.activeLoan;
              // Only show edit button if branch lead's group matches member's group
              const canEdit = currentUser.branch === member.branch;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full ${memberTheme.primary} flex items-center justify-center bg-emerald-200`}
                    >
                      <Users className="w-4 h-4 text-emerald-700 " />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.firstName}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>
                          {" "}
                          $
                          {typeof member.totalContributions === "number"
                            ? member.totalContributions.toLocaleString()
                            : 0}
                        </span>
                        <span className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-1 ${memberTheme.primary}`}
                          />
                          {member.branch}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {memberLoan && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-emerald-700 rounded-full">
                        Has Loan
                      </span>
                    )}
                    {canEdit && (
                      <>
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                          Can Edit
                        </span>
                        <button
                          onClick={() => setSelectedMember(member.id)}
                          className="p-1 rounded text-emerald-600 hover:bg-blue-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Loan Requests
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {branchLoans
              .filter((loan) => loan.status === "pending")
              .map((loan) => {
                const member = branchMembers.find(
                  (m) => m.id === loan.memberId
                );
                if (!member) return null;

                const memberTheme = getGroupTheme(member.branch);

                return (
                  <div key={loan.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full ${memberTheme.primary} flex items-center justify-center bg-emerald-100`}
                        >
                          <DollarSign className="w-4 h-4 text-emerald-700 " />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.firstName}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${loan.amount.toLocaleString()} requested
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Repayment:</span>
                        <span className="ml-1 font-medium">
                          {/* ${loan.repaymentAmount.toLocaleString()} */}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Due:</span>
                        <span className="ml-1 font-medium">
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                          onClick={() => handleLoanAction(loan, "reject")}
                        className="flex-1 px-3 py-1 border border-red-300 text-red-700 rounded text-sm hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                          onClick={() => handleLoanAction(loan, "approve")}
                        className="flex-1 px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })}

            {branchLoans.filter((loan) => loan.status === "pending").length ===
              0 && (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No pending loan requests</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedMember && (
        <MemberDetails
          memberId={selectedMember}
          canEdit={getMemberUpdateAccess(selectedMember)}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default BranchLeadDashboard;
