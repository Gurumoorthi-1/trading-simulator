import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Activity, Cpu, HardDrive, Clock } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { connectAdminSocket } from '../../utils/adminSocket';

const StatusBadge = ({ status }) => {
  const colors = {
    online: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    offline: 'bg-red-500/20 text-red-400'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.offline}`}>
      {status}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, color, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          {isLoading ? (
            <div className="h-8 w-20 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <div className="text-2xl font-bold text-light-text dark:text-white">{value}</div>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

const AdminSystemMonitoring = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/system-status');
      if (res.data.success) {
        setSystemStatus(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load system status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = connectAdminSocket();
    socket.on('statsUpdate', () => {
      fetchData();
    });

    return () => { if (socket) { socket.removeAllListeners('statsUpdate'); socket.removeAllListeners('user-login'); } };
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">System Monitoring</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Monitor system health and performance</p>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <StatCard
          title="API Status"
          value={<StatusBadge status={systemStatus?.apiStatus || 'offline'} />}
          icon={Server}
          color="bg-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Database Status"
          value={<StatusBadge status={systemStatus?.databaseStatus || 'offline'} />}
          icon={Database}
          color="bg-green-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Socket Connections"
          value={systemStatus?.socketConnections?.toLocaleString() || 0}
          icon={Activity}
          color="bg-purple-600"
          isLoading={isLoading}
        />
        <StatCard
          title="CPU Usage"
          value={systemStatus?.cpuUsage || '0%'}
          icon={Cpu}
          color="bg-orange-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Memory Usage"
          value={systemStatus?.memoryUsage || '0%'}
          icon={HardDrive}
          color="bg-pink-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Uptime"
          value={systemStatus?.uptime || '0d 0h 0m'}
          icon={Clock}
          color="bg-cyan-600"
          isLoading={isLoading}
        />
      </div>

      {/* Service Status Cards */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-light-text dark:text-white mb-6">Service Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
            ))
          ) : systemStatus?.services?.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-light-text dark:text-white">{service.name}</h3>
                <StatusBadge status={service.status} />
              </div>
              <div className="w-full h-2 bg-light-border dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${service.status === 'online' ? 'bg-green-500' :
                    service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: service.status === 'online' ? '100%' : service.status === 'warning' ? '50%' : '0%' }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemMonitoring;
