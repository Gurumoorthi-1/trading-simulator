import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const DiversificationAnalysis = ({ sectors = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="card h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon size={20} className="text-primary-600 dark:text-primary-500" />
        <h3 className="text-lg font-bold text-light-text dark:text-white">Sector Diversification</h3>
      </div>

      {sectors.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          No sector data available
        </div>
      ) : (
        <>
          <div className="h-[200px] w-full relative mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectors}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sectors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px' 
                  }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
            {sectors.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="text-light-text dark:text-white font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DiversificationAnalysis;
