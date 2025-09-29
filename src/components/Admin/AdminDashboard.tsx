import React, { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

import UserManagement from "./UserManagement";
import LoanApproval from "./LoanApproval";
import GroupShares from "./GroupShares";
import Penalties from "./Penalties";
import { fetchNetContributions } from "../../utils/api";
import RegistrationApproval from "./RegistrationApproval";

const AdminDashboard: React.FC = () => {
  const { state } = useApp();
  const { users, loans } = state;
  const [activeTab, setActiveTab] = useState("overview");

  const pendingLoans = loans.filter((loan) => loan.status === "pending").length;
  const totalMembers = users.filter((user) => user.role === "member" && user.status === "approved").length;
  const pendingRegistrations = users.filter((user) => user.status === "pending").length;
  console.log("those are the users ", users);

  const [netContributions, setNetContributions] = useState<any>(0);

  useEffect(() => {
    const fetchNet = async () => {
      try {
        const net = await fetchNetContributions();
        setNetContributions(net);
        console.log("Net contributions:", net);
      } catch (error) {
        console.error("Failed to fetch net contributions", error);
      }
    };
    fetchNet();
  }, [loans, users]);
  console.log("this is the netcontributions", netContributions);

  const stats = [
    {
      title: "Total Members",
      value: totalMembers.toString(),
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-blue-100",
    },
    {
      title: "Available Balance",
      value: netContributions
        ? `$${netContributions.netAvailable.toLocaleString()}`
        : "-",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Future Balance",
      value: netContributions
        ? `$${netContributions.bestFutureBalance.toLocaleString()}`
        : "-",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Pending Loans",
      value: pendingLoans.toString(),
      icon: AlertCircle,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Penalties Collected",
      value: netContributions
        ? `$${netContributions.totalPaidPenalties.toLocaleString()}`
        : "-",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "registrations", label: "Registration Approval", icon: UserCheck },
    { id: "users", label: "User Management", icon: Users },
    { id: "loans", label: "Loan Approval", icon: CheckCircle },
    { id: "groupshares", label: "Group Shares & Interest", icon: DollarSign },
    { id: "penalties", label: "Penalties", icon: AlertCircle },
  ];
  
  console.log("this is ", loans);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage the financial system</p>
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

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-700 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
              {tab.id === "registrations" && pendingRegistrations > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRegistrations}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Loans */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Loan Requests
              </h3>
              <div className="space-y-4">
                {loans.slice(0, 5).map((loan) => {
                  const member = users.find((u) => u._id === loan.member?._id);
                  return (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {member?.firstName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${loan.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {loan.status === "pending" ? (
                          <Clock className="w-4 h-4 text-blue-500 mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            loan.status === "pending"
                              ? "bg-blue-100 text-blue-800"
                              : loan.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Branch Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Branch Distribution
              </h3>
              <div className="space-y-4">
                {["blue", "yellow", "red", "purple"].map((branch) => {
                  const groupMembers = users.filter(
                    (u) => u.branch === branch && u.role === "member"
                  );
                  const totalSavings = groupMembers.reduce(
                    (sum, u) => sum + u.totalContributions,
                    0
                  );

                  return (
                    <div
                      key={branch}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full mr-3 ${
                            branch === "blue"
                              ? "bg-blue-500"
                              : branch === "yellow"
                              ? "bg-yellow-500"
                              : branch === "red"
                              ? "bg-red-500"
                              : "bg-purple-500"
                          }`}
                        />
                        <span className="font-medium text-gray-900 capitalize">
                          {branch} Branch
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {groupMembers.length} members
                        </p>
                        <p className="text-sm text-gray-500">
                          ${totalSavings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "registrations" && <RegistrationApproval />}
      {activeTab === "users" && <UserManagement />}
      {activeTab === "loans" && <LoanApproval />}
      {activeTab === "groupshares" && <GroupShares />}
      {activeTab === "penalties" && <Penalties />}
    </div>
  );
};

export default AdminDashboard;