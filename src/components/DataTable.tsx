import React, { useState } from "react";
import type { RiskRecord } from "../types";

interface Props {
  data: RiskRecord[];
  columns: string[];
  updateData: (rowIndex: number, key: string, value: string | number) => void;
}

const DataTable: React.FC<Props> = ({ data, columns, updateData }) => {
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "low">("all");
const [rotationCount,setRotationCount]=useState(0);
  const filteredData = [...data]
    .filter((row) => {
      if (riskFilter === "high") return row["Risk Score"] > 80;
      if (riskFilter === "low") return row["Risk Score"] <= 80;
      return true;
    })
    .sort((a, b) => {
      if (riskFilter === "high") return b["Risk Score"] - a["Risk Score"];
      if (riskFilter === "low") return a["Risk Score"] - b["Risk Score"];
      return 0;
    });

  return (
    <div className="table-wrapper">
      <div className="dropdown-wrapper">
        <label htmlFor="riskFilter">Filter by Risk: </label>
        <div className="custom-select">
        <select style={{padding:'10px',borderRadius:'25px'}}
          id="riskFilter"
          value={riskFilter}
          onClick={()=>setRotationCount((prev)=>prev+1)}
          onChange={(e) => setRiskFilter(e.target.value as "all" | "high" | "low")}
        >
          <option value="all">All</option>
          <option value="high">High Risk Score</option>
          <option value="low">Low Risk Score</option>
        </select>
        <svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#003366"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="hourglass-icon"
  style={{ transform: `rotate(${rotationCount * 360}deg)`}}
>
  <path d="M6 2h12" />
  <path d="M6 22h12" />
  <path d="M6 2c0 6 6 6 6 10s-6 4-6 10" />
  <path d="M18 2c0 6-6 6-6 10s6 4 6 10" />
</svg>

</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  backgroundColor:
                    row["Risk Score"] > 80 ? "palevioletred" : "darkseagreen",
                }}
              >
                {columns.map((col) => (
                  <td key={col}>
                    <input
                      value={row[col]}
                      onChange={(e) =>
                        updateData(
                          rowIndex,
                          col,
                          col === "Risk Score"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      type={col === "Risk Score" ? "number" : "text"}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;