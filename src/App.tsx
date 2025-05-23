import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { RiskRecord } from "./types";
import DataTable from "./components/DataTable";
import "./App.css";

const App: React.FC = () => {
  const [data, setData] = useState<RiskRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isUploading,setIsUploading]=useState(false);
  const [isDownloading,setIsDownloading]=useState(false);
  const [showSuccessModal,setShowSuccessModal]=useState(false);
//Handles the upload and parsing of CSV/Excel files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
     setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const binaryStr = evt.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const rawData = XLSX.utils.sheet_to_json<RiskRecord>(worksheet, { defval: "" });
//Generate current IST timestamp
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const date = istTime.toISOString().split("T")[0];
      const formatted = `${date}`;
//Update compliance status and timestamp for each record
      const processedData = rawData.map((row) => {
        const score = Number(row["Risk Score"]);
        return {
          ...row,
          "Compliance Status": score > 80 ? "Non-Compliant" : "Compliant",
          "Last Updated": formatted,
        };
      });

      setData(processedData);
      setColumns(Object.keys(processedData[0]));
      setTimeout(()=>{
        setIsUploading(false);
      },2000);
    };
    reader.readAsBinaryString(file);
  };
//Updates the data cell values and related fields dynamically
  const updateData = (rowIndex: number, key: string, value: string | number) => {
  const newData = [...data];
    // Prevent numbers from being entered in text fields
    if (typeof value === 'string' && key !== "Risk Score" && key !== "Last Updated") {
      // Remove any numbers or special characters (keep only letters and spaces)
    value = value.replace(/[^a-zA-Z\s]/g, '');
    }
  newData[rowIndex][key] = key === "Risk Score" ? Number(value) : value;
  //Auto-update compliance status if risk score changes
  if(key==="Risk Score"){
    const score=Number(value);
    newData[rowIndex]["Compliance Status"]=score>80?"Non-Compliant":"Compliant";
  }
//Update timestamp for any change
  if (key !== "Last Updated") {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const date=istTime.toISOString().split("T")[0]; //YYYY-MM-DD
    const formatted = `${date}`;
    newData[rowIndex]["Last Updated"] = formatted;
  }

  setData(newData);
};
//Converts the modified data back to an Excel file and triggers download
  const handleDownload = () => {
    setIsDownloading(true);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UpdatedData");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    saveAs(blob, "updated_risk_data.xlsx");
//Show loader for 2 seconds then success modal
setTimeout(()=>{
  setIsDownloading(false);
  setShowSuccessModal(true);
},2000)
};
const closeSuccessModal=()=>{
  setShowSuccessModal(false);
}
  return (
    <div className="app-container">
      {(isUploading||isDownloading)&&(
        <div className="loader-overlay">
          <div className="loader">
            </div>
          </div>
      )}
      {showSuccessModal&&(
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>File Downloaded Successfully!</h3>
            <button onClick={closeSuccessModal}>Close</button>

            </div>
          </div>
      )}
      <h1 className="title">Risk Data Management Portal</h1>
      <div className="file-upload"> 
          <label htmlFor="fileUpload" className="upload-btn" style={{ opacity: isUploading ? 0.7 : 1, pointerEvents: isUploading ? 'none' : 'auto' }}>
            {isUploading?'Uploading...':'Upload File'}
          </label>
      <input id="fileUpload" type="file" accept=".csv,.xlsx" onChange={handleFileUpload}
      disabled={isUploading} />
      </div>
      {data.length > 0 && (
      <>
          <DataTable data={data} columns={columns} updateData={updateData} />
          <div className="download-wrapper">
          <button className="download-btn" onClick={handleDownload}
          disabled={isDownloading}
              style={{ opacity: isDownloading ? 0.7 : 1 }}
            >
              {isDownloading ? 'Downloading...' : 'Download Updated File'}
          </button>
          </div>
      </>
      )}
    </div>
  );
};

export default App;