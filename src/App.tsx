import { useEffect, useState } from "react";

const SHEET_ID = "YOUR_SHEET_ID";
const TAB_NAME = "Super Croulants Gérants 2025-26";

export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const url = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB_NAME)}`;

    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(err));
  }, []);

  if (!data.length) return <p>Loading...</p>;

  const headers = Object.keys(data[0]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Super Croulants</h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {headers.map(h => (
                <td key={h} style={tdStyle}>{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#333",
  color: "white"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px"
};