import { useEffect, useState } from "react";
import api from "../services/api";

function Analytics() {

  const [loading, setLoading] = useState(true);

  const [occupancy, setOccupancy] = useState({});
  const [revenue, setRevenue] = useState({});
  const [frequentClients, setFrequentClients] = useState([]);
  const [mostBookedRoom, setMostBookedRoom] = useState({});

  const fetchAnalytics = async () => {

    try {

      setLoading(true);

      const [
        occupancyRes,
        revenueRes,
        frequentClientRes,
        mostBookedRoomRes,
      ] = await Promise.all([

        api.get("/analytics/occupancy"),
        api.get("/analytics/Revenue"),
        api.get("/analytics/freq_client"),
        api.get("/analytics/most_booked_room"),

      ]);

      setOccupancy(occupancyRes.data);
      setRevenue(revenueRes.data);
      setFrequentClients(frequentClientRes.data);
      setMostBookedRoom(mostBookedRoomRes.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchAnalytics();

  }, []);

  if (loading) {

    return (

      <div className="p-8">

        <h1 className="text-4xl font-bold mb-8">

          Analytics

        </h1>

        <div className="grid grid-cols-4 gap-6">

          {[1,2,3,4].map((item)=>(

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

    <div className="space-y-8">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold">

            Analytics

          </h1>

          <p className="text-gray-500 mt-2">

            Hotel performance overview

          </p>

        </div>

        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >

          Refresh

        </button>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow-md p-6">

          <p className="text-gray-500">

            Occupancy Rate

          </p>

          <h2 className="text-4xl font-bold mt-3 text-blue-600">

            {occupancy.occupancy_rate?.toFixed(1)}%

          </h2>

        </div>

        <div className="bg-white rounded-xl shadow-md p-6">

          <p className="text-gray-500">

            Total Rooms

          </p>

          <h2 className="text-4xl font-bold mt-3">

            {occupancy.total_rooms}

          </h2>

        </div>

        <div className="bg-white rounded-xl shadow-md p-6">

          <p className="text-gray-500">

            Occupied Rooms

          </p>

          <h2 className="text-4xl font-bold mt-3 text-red-500">

            {occupancy.occupied_rooms}

          </h2>

        </div>

        <div className="bg-white rounded-xl shadow-md p-6">

          <p className="text-gray-500">

            Available Rooms

          </p>

          <h2 className="text-4xl font-bold mt-3 text-green-600">

            {occupancy.available_rooms}

          </h2>

        </div>

      </div>
      {/* Occupancy Progress */}

      <div className="bg-white rounded-xl shadow-md p-6">

        <div className="flex justify-between items-center">

          <h2 className="text-2xl font-semibold">

            Hotel Occupancy

          </h2>

          <span className="text-blue-600 font-bold text-xl">

            {occupancy.occupancy_rate?.toFixed(1)}%

          </span>

        </div>

        <div className="w-full bg-gray-200 rounded-full h-5 mt-6">

          <div
            className="bg-blue-600 h-5 rounded-full transition-all duration-700"
            style={{
              width: `${occupancy.occupancy_rate || 0}%`,
            }}
          />

        </div>

        <div className="grid grid-cols-3 gap-6 mt-8">

          <div className="bg-blue-50 rounded-lg p-4">

            <p className="text-gray-600">

              Guests Present

            </p>

            <h3 className="text-3xl font-bold mt-2">

              {occupancy.guests_present}

            </h3>

          </div>

          <div className="bg-green-50 rounded-lg p-4">

            <p className="text-gray-600">

              Today's Check-ins

            </p>

            <h3 className="text-3xl font-bold mt-2 text-green-600">

              {occupancy.checkins_today}

            </h3>

          </div>

          <div className="bg-red-50 rounded-lg p-4">

            <p className="text-gray-600">

              Today's Check-outs

            </p>

            <h3 className="text-3xl font-bold mt-2 text-red-600">

              {occupancy.checkouts_today}

            </h3>

          </div>

        </div>

      </div>

      {/* Revenue */}

      <div className="bg-white rounded-xl shadow-md p-6">

        <h2 className="text-2xl font-semibold">

          Revenue Overview

        </h2>

        <div className="mt-8 flex items-center justify-between">

          <div>

            <p className="text-gray-500">

              Total Revenue Generated

            </p>

            <h1 className="text-5xl font-bold text-green-600 mt-3">

              ₹{revenue.Revenue?.toLocaleString() || 0}

            </h1>

          </div>

          <div className="bg-green-100 rounded-full px-6 py-3">

            <span className="text-green-700 font-semibold">

              Hotel Earnings

            </span>

          </div>

        </div>

      </div>

      {/* Frequent Clients */}

      <div className="bg-white rounded-xl shadow-md p-6">

        <h2 className="text-2xl font-semibold mb-6">

          Frequent Clients

        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3">

                #

              </th>

              <th className="text-left py-3">

                Guest

              </th>

              <th className="text-left py-3">

                Reservations

              </th>

            </tr>

          </thead>

          <tbody>

            {frequentClients.length === 0 ? (

              <tr>

                <td
                  colSpan="3"
                  className="py-8 text-center text-gray-500"
                >

                  No Frequent Guests Found

                </td>

              </tr>

            ) : (

              frequentClients.map((guest, index) => (

                <tr
                  key={index}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="py-4">

                    {index + 1}

                  </td>

                  <td className="py-4 font-medium">

                    {guest.Guest}

                  </td>

                  <td className="py-4">

                    <span className="bg-blue-100 text-blue-700 rounded-full px-4 py-1">

                      {guest.No_of_reservations}

                    </span>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>
      {/* Most Booked Room */}

      <div className="bg-white rounded-xl shadow-md p-6">

        <h2 className="text-2xl font-semibold mb-6">

          Most Booked Room

        </h2>

        {mostBookedRoom ? (

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">

                Room Number

              </p>

              <h1 className="text-5xl font-bold text-blue-600 mt-3">

                {mostBookedRoom.Room_Number}

              </h1>

            </div>

            <div className="text-right">

              <p className="text-gray-500">

                Reservations

              </p>

              <h1 className="text-5xl font-bold text-green-600 mt-3">

                {mostBookedRoom.Number_of_Reservation}

              </h1>

            </div>

          </div>

        ) : (

          <div className="text-center py-12 text-gray-500">

            No booking data available.

          </div>

        )}

      </div>

      {/* Footer */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">

        <h2 className="text-3xl font-bold">

          Hotel Summary

        </h2>

        <p className="mt-4 text-blue-100 leading-7">

          This dashboard provides a real-time overview of hotel occupancy,
          revenue generation, reservation trends and customer statistics.
          Refresh the dashboard anytime to fetch the latest information from
          your backend.

        </p>

        <div className="grid grid-cols-4 gap-6 mt-8">

          <div>

            <p className="text-blue-200">

              Total Rooms

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {occupancy.total_rooms}

            </h2>

          </div>

          <div>

            <p className="text-blue-200">

              Guests Present

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {occupancy.guests_present}

            </h2>

          </div>

          <div>

            <p className="text-blue-200">

              Revenue

            </p>

            <h2 className="text-3xl font-bold mt-2">

              ₹{revenue.Revenue?.toLocaleString() || 0}

            </h2>

          </div>

          <div>

            <p className="text-blue-200">

              Occupancy

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {occupancy.occupancy_rate?.toFixed(1)}%

            </h2>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Analytics;