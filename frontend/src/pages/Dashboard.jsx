import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [occupancy, setOccupancy] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [mostBooked, setMostBooked] = useState(null);
  const [frequentGuests, setFrequentGuests] = useState([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [
        occupancyRes,
        revenueRes,
        mostBookedRes,
        frequentGuestRes,
      ] = await Promise.all([
        api.get("/analytics/occupancy"),
        api.get("/analytics/Revenue"),
        api.get("/analytics/most_booked_room"),
        api.get("/analytics/freq_client"),
      ]);

      setOccupancy(occupancyRes.data);
      setRevenue(revenueRes.data);
      setMostBooked(mostBookedRes.data);
      setFrequentGuests(frequentGuestRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-3 gap-6 mt-8">

          {[1,2,3,4,5,6].map((item)=>(
            <div
              key={item}
              className="bg-white rounded-xl shadow-md h-32 animate-pulse"
            />
          ))}

        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back 👋 Here's today's hotel overview.
        </p>

      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-3 gap-6">

        <Card
          title="Total Rooms"
          value={occupancy.total_rooms}
        />

        <Card
          title="Available Rooms"
          value={occupancy.available_rooms}
        />

        <Card
          title="Occupied Rooms"
          value={occupancy.occupied_rooms}
        />

        <Card
          title="Guests Present"
          value={occupancy.guests_present}
        />

        <Card
          title="Today's Check-ins"
          value={occupancy.checkins_today}
        />

        <Card
          title="Today's Check-outs"
          value={occupancy.checkouts_today}
        />

      </div>

      {/* Occupancy */}

      <div className="bg-white rounded-xl shadow-md mt-10 p-6">

        <div className="flex justify-between">

          <h2 className="text-xl font-semibold">
            Hotel Occupancy
          </h2>

          <span className="text-blue-600 font-bold">

            {occupancy.occupancy_rate.toFixed(1)}%

          </span>

        </div>

        <div className="w-full h-4 rounded-full bg-gray-200 mt-5">

          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{
              width: `${occupancy.occupancy_rate}%`
            }}
          />

        </div>

      </div>
      {/* Revenue & Most Booked */}

      <div className="grid grid-cols-2 gap-6 mt-10">

        <div className="bg-white rounded-xl shadow-md p-6">

          <h2 className="text-xl font-semibold">
            Total Revenue
          </h2>

          <p className="text-4xl font-bold text-green-600 mt-5">

            ₹{revenue?.Revenue?.toLocaleString() || 0}

          </p>

          <p className="text-gray-500 mt-3">
            Revenue generated from all completed reservations.
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-md p-6">

          <h2 className="text-xl font-semibold">

            Most Booked Room

          </h2>

          <p className="text-5xl font-bold text-blue-600 mt-5">

            {mostBooked?.Room_Number || "--"}

          </p>

          <p className="text-gray-500 mt-3">

            {mostBooked?.Number_of_Reservation || 0} Reservations

          </p>

        </div>

      </div>

      {/* Frequent Guests */}

      <div className="mt-10 bg-white rounded-xl shadow-md p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-semibold">

            Frequent Guests

          </h2>

          <button
            onClick={fetchDashboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >

            Refresh

          </button>

        </div>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3">
                Guest
              </th>

              <th className="text-left py-3">
                Reservations
              </th>

            </tr>

          </thead>

          <tbody>

            {frequentGuests.length === 0 ? (

              <tr>

                <td
                  colSpan={2}
                  className="text-center py-8 text-gray-500"
                >

                  No reservation history found.

                </td>

              </tr>

            ) : (

              frequentGuests.map((guest, index) => (

                <tr
                  key={index}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="py-4">

                    {guest.Guest}

                  </td>

                  <td className="py-4">

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">

                      {guest.No_of_reservations}

                    </span>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
export default Dashboard;