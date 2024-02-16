import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import supabase  from '../../createClent';
import { Document, Page } from 'react-pdf';  
import { pdfjs } from 'react-pdf'; 
import './pdf.worker'
import PDFViewer from "../FileUpload/PdfViewer";
// import PdfViewer from '../PDfViewer/PdfViewer';

function AcedemicCalender() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdfURL, setSelectedPdfURL] = useState(null);

  useEffect(() => {
    fetchPDFFiles();
  }, []);

  const fetchPDFFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("storage")
        .list("pdfs/");
      if (error) {
        console.error("Error fetching PDF files:", error.message);
      } else {
        setPdfFiles(data);
      }
    } catch (error) {
      console.error("Error fetching PDF files:", error.message);
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleUpload = async () => {
    for (const file of selectedFiles) {
      await uploadPDF(file);
    }
    setSelectedFiles([]);
    fetchPDFFiles();
  };

  const uploadPDF = async (file) => {
    try {
      const { data, error } = await supabase.storage
        .from("storage")
        .upload(`pdfs/${file.name}`, file);
      if (error) {
        console.error("Error uploading file:", error.message);
      } else {
        console.log("File uploaded successfully:", data.Key);
      }
    } catch (error) {
      console.error("Error uploading file:", error.message);
    }
  };

  const handlePdfClick = (pdfFileName) => {
    const supabaseBaseUrl = 'https://jubfonzpooabcktpgfip.supabase.co/storage/v1/object/public/storage/pdfs/';
    const pdfURL = `${supabaseBaseUrl}${pdfFileName}`;
    setSelectedPdfURL(pdfURL);
  };

  return (
    <div className="w-max px-[2.5rem] bg-gray-100 rounded-lg shadow-lg">
      <input
        type="file"
        accept=".pdf"
        multiple
        className="mb-4"
        onChange={handleFileChange}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleUpload}
      >
        Upload PDF(s)
      </button>
      {pdfFiles.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Uploaded PDF Files:</h2>
          <ul className="flex flex-col ">
            {pdfFiles.map((file, index) => (
              <li 
                key={index}
                className=" mt-2 flex bg-blue-300 w-[1000px] h-[50px] justify-between p-2"
              >
                <a
                  className="text-center py-2"
                  // href={`https://jubfonzpooabcktpgfip.supabase.co/storage/v1/object/public/storage/pdfs/${file.name}?t=${file.last_modified}`}
                  target="_top"
                  rel="noopener noreferrer"
                  onClick={() => handlePdfClick(file.name)}
                >
                  {file.name}
                </a> 
                <a
                  href={`https://jubfonzpooabcktpgfip.supabase.co/storage/v1/object/public/storage/pdfs/${file.name}?t=${file.last_modified}`}
                  download
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-lg flex items-center"
                >
                  <i className="mr-1 fas fa-download"></i>
                  Download
                </a>
              </li>
            ))}
          </ul>  
          {selectedPdfURL && <PDFViewer pdfURL={selectedPdfURL} />}
        </div>
      )}
    </div>
  );
}

export default AcedemicCalender;
