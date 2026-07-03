function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300">
      <p className="text-gray-500 text-sm font-medium">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-3">
        {value}
      </h2>
    </div>
  );
}

<div className="mt-10">

    <h2 className="text-2xl font-semibold mb-4">
        Recent Reservations
    </h2>

    <div className="bg-white rounded-xl shadow-md p-6">

        <table className="w-full">

            <thead>

                <tr className="text-left border-b">

                    <th className="py-2">Room</th>
                    <th>Guest</th>
                    <th>Check In</th>
                    <th>Check Out</th>

                </tr>

            </thead>

            <tbody>

                <tr>

                    <td className="py-4">101</td>
                    <td>John Doe</td>
                    <td>Today</td>
                    <td>Tomorrow</td>

                </tr>

                <tr>

                    <td className="py-4">203</td>
                    <td>Alice</td>
                    <td>Today</td>
                    <td>Friday</td>

                </tr>

            </tbody>

        </table>

    </div>

</div>

export default Card;