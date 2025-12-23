import React, { useState, useEffect } from 'react';
import { Plus, Home, Calendar, DollarSign, User, Loader2, AlertCircle } from 'lucide-react';

const TreatmentProgressCard = ({ 
  patientId, 
  hospitalId = 'default-hospital', 
  apiBaseUrl = '/api',
  onNavigateToEncounters 
}) => {
  const [encountersData, setEncountersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch treatment encounters from API
  useEffect(() => {
    const fetchEncounters = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${apiBaseUrl}/treatment-encounters/${patientId}?hospitalId=${hospitalId}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch encounters: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setEncountersData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch encounters');
        }
      } catch (err) {
       // console.error('Error fetching encounters:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEncounters();
  }, [patientId, hospitalId, apiBaseUrl]);

  // Get recent encounters (last 2)
  const getRecentEncounters = () => {
    if (!encountersData?.encounters) return [];
    
    return encountersData.encounters
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      .slice(0, 2);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle add new encounter - navigate to treatment encounters page
  const handleAddEncounter = () => {
    if (onNavigateToEncounters) {
      onNavigateToEncounters(patientId);
    } else {
      // Fallback: use window.location if navigate function not provided
      window.location.href = `/treatmentencounters/${patientId}`;
    }
  };

  // Handle view all - navigate to treatment encounters page
  const handleViewAll = () => {
    if (onNavigateToEncounters) {
      onNavigateToEncounters(patientId);
    } else {
      // Fallback: use window.location if navigate function not provided
      window.location.href = `/treatmentencounters/${patientId}`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading treatment progress...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const recentEncounters = getRecentEncounters();
  const hasEncounters = recentEncounters.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-0">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900">Treatment Progress</h2>
          {encountersData?.totalEncounters > 0 && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {encountersData.totalEncounters} total
            </span>
          )}
        </div>
        <Plus 
          className="w-5 h-5 text-green-500 cursor-pointer hover:text-green-600 transition-colors" 
          onClick={handleAddEncounter}
          title="Add new encounter"
        />
      </div>

      {hasEncounters ? (
        <>
          {/* Treatment Items - Fixed Height Content Area */}
          <div className="h-48 overflow-y-auto p-5 pt-6">
            <div className="space-y-6">
              {recentEncounters.map((encounter, index) => (
                <div key={encounter._id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  {/* Treatment name and date */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-gray-500 text-sm truncate pr-4" title={encounter.treatment || 'General Treatment'}>
                      {encounter.treatment || 'General Treatment'}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(encounter.dateTime)}</span>
                    </div>
                  </div>
                  
                  {/* Treatment details */}
                  <div className="space-y-1">
                    {encounter.notes && (
                      <p className="text-gray-500 text-sm line-clamp-2 overflow-hidden" title={encounter.notes}>
                        {encounter.notes}
                      </p>
                    )}
                    
                    {/* Treatment info row */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {encounter.dentist && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Dr. {encounter.dentist}</span>
                        </div>
                      )}
                      
                      {encounter.amountPaid > 0 && (
                        <div className="flex items-center gap-1">
                         
                          <span>₹{encounter.amountPaid.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        encounter.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        encounter.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        encounter.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {encounter.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed View All Button */}
          <div className="p-5 pt-0 border-t border-gray-100">
            <button 
              onClick={handleViewAll}
              className="w-full bg-green-500 cursor-pointer hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              View All ({encountersData?.totalEncounters} encounters)
            </button>
          </div>
        </>
      ) : (
        /* No Treatment Info */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium mb-1">No Treatment Records</h3>
            <p className="text-gray-400 text-sm">Start by adding the first treatment encounter</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentProgressCard;