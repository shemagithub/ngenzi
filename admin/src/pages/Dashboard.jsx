import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Home,
  Activity,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  AlertCircle,
  Loader,
  Clock,
  BarChart3,
  PieChart,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  MessageSquare,
  FileText,
  Briefcase,
  Shield,
  UserCheck,
} from "lucide-react";
import { backendurl } from "../config/constants";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Bar chart options
const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 12,
          family: "'DM Sans', sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      cornerRadius: 8,
      padding: 12,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
        color: '#6B7280',
        font: {
          size: 11
        }
      },
      grid: {
        color: 'rgba(107, 114, 128, 0.1)',
        drawBorder: false,
      },
      border: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 11
        }
      },
      border: {
        display: false
      }
    }
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    totalUsers: 0,
    totalAdmins: 0,
    regularUsers: 0,
    totalPlots: 0,
    activePlots: 0,
    totalTestimonials: 0,
    activeTestimonials: 0,
    featuredTestimonials: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    totalServices: 0,
    activeServices: 0,
    totalTeams: 0,
    activeTeams: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    totalAppointments: 0,
    recentActivity: [],
    viewsData: {},
    propertyTypeData: {},
    monthlyStats: {},
    loading: true,
    error: null,
  });

  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced chart options with modern styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'DM Sans', sans-serif"
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: '#fff'
      }
    }
  };

  // Property type distribution chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 12,
      }
    },
    cutout: '60%',
  };

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${backendurl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setStats((prev) => ({
          ...prev,
          ...response.data.stats,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch stats");
      }
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch dashboard data",
      }));
      console.error("Error fetching stats:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Total Properties",
      value: stats.totalProperties || 0,
      icon: Home,
      color: "from-haven-700 to-haven-900",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Total properties listed",
      link: "/list"
    },
    {
      title: "Total Plots",
      value: stats.totalPlots || 0,
      icon: MapPin,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      description: "Total plots listed",
      link: "/list-plots"
    },
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: `${stats.regularUsers || 0} regular, ${stats.totalAdmins || 0} admins`,
      link: "/users"
    },
    {
      title: "Testimonials",
      value: stats.totalTestimonials || 0,
      icon: MessageSquare,
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      description: `${stats.activeTestimonials || 0} active, ${stats.featuredTestimonials || 0} featured`,
      link: "/testimonials"
    },
    {
      title: "Blogs",
      value: stats.totalBlogs || 0,
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      description: `${stats.publishedBlogs || 0} published`,
      link: "/blogs"
    },
    {
      title: "Services",
      value: stats.totalServices || 0,
      icon: Briefcase,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      description: `${stats.activeServices || 0} active`,
      link: "/services"
    },
    {
      title: "Team Members",
      value: stats.totalTeams || 0,
      icon: UserCheck,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
      description: `${stats.activeTeams || 0} active`,
      link: "/team"
    },
    {
      title: "Appointments",
      value: stats.totalAppointments || 0,
      icon: Calendar,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: `${stats.pendingAppointments || 0} pending, ${stats.confirmedAppointments || 0} confirmed`,
      link: "/appointments"
    },
  ];

  if (stats.loading) {
    return (
      <div className="admin-page flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 1, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center admin-card p-8"
        >
          <div className="relative">
            <Loader className="w-12 h-12 text-haven-700 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-haven-100 rounded-full mx-auto"></div>
          </div>
          <h3 className="text-lg font-semibold text-haven-900 mb-2">Loading Dashboard</h3>
          <p className="text-haven-700/70">Fetching your latest data...</p>
        </motion.div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="admin-page flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center admin-card p-8 max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-haven-900 mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-haven-700/70 mb-6">{stats.error}</p>
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="admin-btn mx-auto"
          >
            {refreshing ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            {refreshing ? 'Retrying...' : 'Try Again'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-page"
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-haven-900 mb-2">
              Dashboard
            </h1>
            <p className="text-base text-haven-700/70 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Live overview of listings, content, and appointments
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white rounded-xl shadow-soft border border-cream-400 p-1">
              {['7', '30', '90'].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    timeRange === days
                      ? 'bg-haven-800 text-white shadow-sm'
                      : 'text-haven-700/70 hover:text-haven-900 hover:bg-cream-100'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>

            <button
              onClick={fetchStats}
              disabled={refreshing}
              className="admin-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link
              key={stat.title}
              to={stat.link}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative admin-card p-6 hover:shadow-panel 
                  transition-all duration-300 hover:border-haven-300
                  overflow-hidden cursor-pointer"
              >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 
                group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent 
                  opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full 
                  group-hover:translate-x-full transition-all duration-700"></div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Property Views Chart - Larger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Property Views Analytics
                </h2>
                <p className="text-sm text-gray-600 mt-1">Track your property engagement over time</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Views
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              {stats.viewsData && Object.keys(stats.viewsData).length > 0 ? (
                <Line data={stats.viewsData} options={chartOptions} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No view data available</p>
                  <p className="text-sm text-gray-400">Data will appear once you have property views</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Property Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Property Types
                </h2>
                <p className="text-sm text-gray-600 mt-1">Distribution overview</p>
              </div>
            </div>
            <div className="h-[350px]">
              {stats.propertyTypeData && Object.keys(stats.propertyTypeData).length > 0 ? (
                <Doughnut data={stats.propertyTypeData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <PieChart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No property data</p>
                  <p className="text-sm text-gray-400 text-center">Add properties to see distribution</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* System Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                System Overview
              </h2>
              <p className="text-sm text-gray-600 mt-1">Complete system statistics</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-haven-100">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-600">Properties</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProperties || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeListings || 0} active</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-gray-600">Plots</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlots || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activePlots || 0} active</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-gray-600">Users</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.totalAdmins || 0} admins</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-medium text-gray-600">Testimonials</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTestimonials || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeTestimonials || 0} active</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-gray-600">Blogs</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBlogs || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.publishedBlogs || 0} published</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-medium text-gray-600">Services</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalServices || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeServices || 0} active</p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-medium text-gray-600">Team</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeams || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeTeams || 0} active</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Recent Activity
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto">
              {stats.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl 
                      transition-colors duration-200 border border-transparent hover:border-gray-100"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br rounded-lg 
                      flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'property' ? 'from-haven-700 to-haven-900' :
                        activity.type === 'plot' ? 'from-amber-500 to-orange-600' :
                        activity.type === 'testimonial' ? 'from-pink-500 to-rose-600' :
                        activity.type === 'user' ? 'from-purple-500 to-purple-600' :
                        'from-green-500 to-green-600'
                      }`}>
                      {activity.type === 'property' ? <Home className="w-5 h-5 text-white" /> :
                       activity.type === 'plot' ? <MapPin className="w-5 h-5 text-white" /> :
                       activity.type === 'testimonial' ? <MessageSquare className="w-5 h-5 text-white" /> :
                       activity.type === 'user' ? <Users className="w-5 h-5 text-white" /> :
                       <Calendar className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No recent activity</p>
                  <p className="text-sm text-gray-400">Activity will appear here as users interact with your properties</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Performance Insights
              </h2>
            </div>
            <div className="space-y-4">
              {/* System Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-cream-100 to-cream-300 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Active Listings</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalProperties > 0 ? Math.round((stats.activeListings / stats.totalProperties) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.activeListings} of {stats.totalProperties}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Active Plots</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalPlots > 0 ? Math.round((stats.activePlots / stats.totalPlots) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.activePlots} of {stats.totalPlots}</p>
                </div>
              </div>

              {/* User Stats */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">User Breakdown</p>
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.regularUsers || 0}</p>
                    <p className="text-xs text-gray-500">Regular Users</p>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins || 0}</p>
                    <p className="text-xs text-gray-500">Admins</p>
                  </div>
                </div>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Testimonials</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeTestimonials || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.featuredTestimonials || 0} featured</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Published Blogs</p>
                  <p className="text-xl font-bold text-gray-900">{stats.publishedBlogs || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">of {stats.totalBlogs || 0} total</p>
                </div>
              </div>

              {/* Appointments */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Appointments</p>
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.confirmedAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Confirmed</p>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;