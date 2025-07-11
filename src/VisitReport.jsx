import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Login from './Login';

function parseDMYDate(dateStr) {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(', ');
  if (!datePart || !timePart) return null;
  const [day, month, year] = datePart.split('/').map(Number);
  const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${timePart}`;
  return new Date(isoString);
}

const VisitReport = () => {
  const [visits, setVisits] = useState(null);
  const [originFilter, setOriginFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const resetFilters = () => {
    setOriginFilter('');
    setCountryFilter('');
    setRegionFilter('');
    setCityFilter('');
    setCurrentPage(1);
  };

  const filteredVisits = useMemo(() => {
    return (visits || [])
      .filter(visit => {
        return (
          (!originFilter || visit.origin.includes(originFilter)) &&
          (!countryFilter || visit.country.includes(countryFilter)) &&
          (!regionFilter || visit.region.includes(regionFilter)) &&
          (!cityFilter || visit.city.includes(cityFilter))
        );
      })
      .sort((a, b) => {
        const dateA = parseDMYDate(a.lastVisitDate);
        const dateB = parseDMYDate(b.lastVisitDate);
        return dateB - dateA; // recent first
      });
  }, [visits, originFilter, countryFilter, regionFilter, cityFilter]);

  const paginatedVisits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVisits.slice(start, start + itemsPerPage);
  }, [filteredVisits, currentPage]);

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);


  const exportCSV = () => {
    if (!filteredVisits.length) return;
    const headers = ['Origin', 'Country', 'Region', 'City', 'Count', 'Last Visit'];
    const rows = filteredVisits.map(v => [v.origin, v.country, v.region, v.city, v.count, v.lastVisitDate].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'visits_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    setUsername('');
    setPassword('');
    setVisits(null);
    resetFilters();
  };

  const chartData = useMemo(() => {
    const map = {};
    filteredVisits.forEach(v => {
      map[v.city] = (map[v.city] || 0) + v.count;
    });
    return Object.entries(map).map(([city, count]) => ({ city, count }));
  }, [filteredVisits]);

  // Get unique values for dropdowns, cascading
  const originOptions = useMemo(() => Array.from(new Set((visits || []).map(v => v.origin))), [visits]);
  const countryOptions = useMemo(() => Array.from(new Set((visits || []).map(v => v.country))), [visits]);
  const regionOptions = useMemo(() => {
    return Array.from(new Set((visits || [])
      .filter(v => !countryFilter || v.country === countryFilter)
      .map(v => v.region)));
  }, [visits, countryFilter]);
  const cityOptions = useMemo(() => {
    return Array.from(new Set((visits || [])
      .filter(v => (!countryFilter || v.country === countryFilter) && (!regionFilter || v.region === regionFilter))
      .map(v => v.city)));
  }, [visits, countryFilter, regionFilter]);

  // Reset region and city filter if parent changes
  React.useEffect(() => {
    setRegionFilter('');
    setCityFilter('');
  }, [countryFilter]);
  React.useEffect(() => {
    setCityFilter('');
  }, [regionFilter]);


  if (!visits) {
    return <Login setVisits={setVisits} />
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8 px-4 sm:px-4 gap-8">
      <div className="flex justify-center items-center mb-6 w-full max-w-6xl mt-5">
        <h2 className="text-2xl font-bold text-center">Visits Analysis</h2>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6 w-full max-w-6xl">
        <select
          value={originFilter}
          onChange={e => setOriginFilter(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400 bg-white"
        >
          <option value="">All Origins</option>
          {originOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400 bg-white"
        >
          <option value="">All Countries</option>
          {countryOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400 bg-white"
        >
          <option value="">All Regions</option>
          {regionOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400 bg-white"
        >
          <option value="">All Cities</option>
          {cityOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-6 w-full max-w-6xl gap-4">
        <button
          onClick={resetFilters}
          className="w-full sm:w-[140px] h-[40px] px-4 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-all duration-200 shadow-md flex items-center justify-center"
        >
          Reset Filters
        </button>

        <button
          onClick={exportCSV}
          className="w-full sm:w-[140px] h-[40px] px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-all duration-200 shadow-md flex items-center justify-center"
        >
          Export as CSV
        </button>
      </div>


      <div className="overflow-x-auto w-full max-w-6xl">
        <table className="min-w-full bg-white shadow-md rounded overflow-hidden">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="py-2 px-4">Origin</th>
              <th className="py-2 px-4">Country</th>
              <th className="py-2 px-4">Region</th>
              <th className="py-2 px-4">City</th>
              <th className="py-2 px-4">Count</th>
              <th className="py-2 px-4">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVisits.map((v, i) => (
              <tr key={i} className="border-t hover:bg-gray-100">
                <td className="py-2 px-4">{v.origin}</td>
                <td className="py-2 px-4">{v.country}</td>
                <td className="py-2 px-4">{v.region}</td>
                <td className="py-2 px-4">{v.city}</td>
                <td className="py-2 px-4">{v.count}</td>
                <td className="py-2 px-4">{(() => {
                  const d = parseDMYDate(v.lastVisitDate);
                  return d && !isNaN(d) ? d.toLocaleString() : 'Invalid Date';
                })()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center w-full max-w-6xl">
        <div className="inline-flex gap-[10px] rounded-lg bg-white p-2 shadow-md">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-[20px] h-[20px] text-[10px] font-semibold flex items-center justify-center rounded-full transition-colors duration-200
          ${currentPage === i + 1
                  ? 'bg-blue-600 text-white shadow-inner ring-2 ring-blue-400'
                  : 'bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-600'
                }`}
              aria-current={currentPage === i + 1 ? 'page' : undefined}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-15 w-full max-w-6xl">
        <h3 className="text-lg font-semibold mb-2">Visit Count by City</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisitReport;
