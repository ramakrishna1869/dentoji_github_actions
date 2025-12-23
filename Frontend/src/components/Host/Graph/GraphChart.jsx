import { Eclipse } from 'lucide-react';
import React, { useState, useEffect } from 'react';
//import { Circle } from 'lucide-react';

const GraphChart = () => {
  const [activeTab, setActiveTab] = useState('Monthly');
  const [chartData, setChartData] = useState([]);
  const [peakData, setPeakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, [activeTab]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      // Note: Replace with your actual token retrieval method
      const token = localStorage.getItem('host_auth_token'); // TODO: Get from your auth context/state
      const timeframe = activeTab.toLowerCase();

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/graph/subscription-trends-detailed?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const result = await response.json();

      if (result.success) {
        setChartData(result.data);
        setPeakData(result.peak);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
     // console.error('Error fetching chart data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateChartPath = () => {
    if (chartData.length === 0) return { area: '', line: '', points: [] };

    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    const width = 100;
    const height = 100;
    const padding = 5;
    const segmentWidth = width / (chartData.length - 1 || 1);

    // Calculate points - normalize to percentage of max
    const points = chartData.map((item, index) => {
      const x = index * segmentWidth;
      const normalizedValue = maxValue > 0 ? item.value / maxValue : 0;
      const y = height - padding - (normalizedValue * (height - padding * 2));
      return { x, y, value: item.value };
    });

    // Create smooth curve
    let pathCommands = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;

      pathCommands += ` Q ${current.x},${current.y} ${midX},${midY}`;
      if (i === points.length - 2) {
        pathCommands += ` Q ${next.x},${next.y} ${next.x},${next.y}`;
      }
    }

    const linePath = pathCommands;
    const areaPath = `${pathCommands} L ${width},${height} L 0,${height} Z`;

    return { area: areaPath, line: linePath, points };
  };

  const { area, line, points } = generateChartPath();
  
  const maxValue = chartData.length > 0 
    ? Math.max(...chartData.map(d => d.value), 1) 
    : 1;

  const findActualPeakPoint = () => {
    if (!points || points.length === 0 || !peakData) return null;
    
    const peakIndex = peakData.index;
    if (peakIndex < 0 || peakIndex >= points.length) return null;
    
    return points[peakIndex];
  };

  const peakPoint = findActualPeakPoint();

  // Generate Y-axis labels based on actual max value
  const generateYAxisLabels = () => {
    if (maxValue === 0) return ['0'];
    
    // Create nice round numbers for labels
    const intervals = 6;
    let step;
    
    if (maxValue <= 10) {
      step = Math.ceil(maxValue / intervals);
    } else if (maxValue <= 100) {
      step = Math.ceil(maxValue / intervals / 5) * 5;
    } else {
      step = Math.ceil(maxValue / intervals / 10) * 10;
    }
    
    const labels = [];
    for (let i = intervals; i >= 0; i--) {
      const value = Math.min(step * i, maxValue);
      labels.push(value.toString());
    }
    
    return labels;
  };

  const yAxisLabels = generateYAxisLabels();

  const getTotalSubscriptions = () => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  };

  const getPeakPeriod = () => {
    if (!peakData || peakData.value === 0) return '-';
    return peakData.label;
  };

  const getAverageSubscriptions = () => {
    if (chartData.length === 0) return 0;
    const total = getTotalSubscriptions();
    const nonZeroCount = chartData.filter(d => d.value > 0).length || 1;
    return (total / nonZeroCount).toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6" style={{ border: '1px solid rgba(0, 0, 0, 0.14)', borderRadius: '15px', width: '100%' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Subscriptions Trends</h2>
        </div>
        <div className="flex items-center justify-center h-80">
          <div className="animate-pulse text-gray-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6" style={{ border: '1px solid rgba(0, 0, 0, 0.14)', borderRadius: '15px', width: '100%' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Subscriptions Trends</h2>
        </div>
        <div className="flex items-center justify-center h-80">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg p-6"
      style={{
        border: '1px solid rgba(0, 0, 0, 0.14)',
        borderRadius: '15px',
        width: '100%'
      }}
    >
      {/* Header with title and tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Subscriptions Trends</h2>

        <div className="flex items-center space-x-2">
          {['Weekly', 'Monthly', 'Yearly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeTab === tab ? { backgroundColor: '#4264D0' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute mb-16 h-80 flex flex-col justify-between text-xs font-medium" style={{ color: '#4264D0', left: '-8px' }}>
          {yAxisLabels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="ml-12">
          <div className="relative h-80">
            {/* Background grid */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <pattern id="grid" width="100" height="16.67" patternUnits="userSpaceOnUse">
                  <line
                    x1="0"
                    y1="0"
                    x2="100"
                    y2="0"
                    stroke="rgba(0, 0, 0, 0.30)"
                    strokeWidth="0.5"
                    strokeDasharray="0.4,0.4"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>

            {/* Chart SVG */}
            {chartData.length > 0 && (
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#4264D0', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>

                <path d={area} fill="url(#areaGradient)" />
                <path
                  d={line}
                  fill="none"
                  stroke="#4264D0"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Peak point */}
                {peakPoint && peakData && peakData.value > 0 && (
                  <circle
                    cx={peakPoint.x}
                    cy={peakPoint.y}
                    r="2"
                    fill="white"
                    stroke="#4264D0"
                    strokeWidth="0.5"
                    //vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>
            )}

            {/* Tooltip */}
            {peakPoint && peakData && peakData.value > 0 && (
              <div
                className="absolute rounded-lg shadow-lg px-3 py-2 z-20"
                style={{
                  top: `${peakPoint.y}%`,
                  left: `${peakPoint.x}%`,
                  transform: 'translate(-50%, -120%)',
                  backgroundColor: '#E8EFFC',
                  border: '1px solid #4264D0'
                }}
              >
                <div className="text-xs whitespace-nowrap" style={{ color: '#4264D0' }}>
                  New Subscriptions
                </div>
                <div className="text-base font-semibold" style={{ color: '#4264D0' }}>
                  {peakData.value}
                </div>
              </div>
            )}

            {/* No data message */}
            {chartData.every(d => d.value === 0) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No subscription data available</p>
              </div>
            )}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-sm font-medium mt-4" style={{ color: '#4264D0' }}>
            {chartData.map((item, index) => (
              <span key={index} className="text-center" style={{ flex: 1 }}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && !error && chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center group hover:bg-blue-50 p-3 rounded-lg transition-all duration-300">
            <p className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
              {getTotalSubscriptions()}
            </p>
            <p className="text-sm text-gray-500">
              Total ({activeTab})
            </p>
          </div>

          <div className="text-center group hover:bg-green-50 p-3 rounded-lg transition-all duration-300">
            <p className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
              {peakData?.value || 0}
            </p>
            <p className="text-sm text-gray-500">
              Peak: {getPeakPeriod()}
            </p>
          </div>

          <div className="text-center group hover:bg-orange-50 p-3 rounded-lg transition-all duration-300">
            <p className="text-2xl font-bold text-orange-600 group-hover:scale-110 transition-transform duration-300">
              {getAverageSubscriptions()}
            </p>
            <p className="text-sm text-gray-500">
              Average
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphChart;