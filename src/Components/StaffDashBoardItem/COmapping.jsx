import React, { useState, useEffect } from "react";
import supabase from "../../createClent";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function CoursePlanTable() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mappingData, setMappingData] = useState([]);

  useEffect(() => {
    const email = localStorage.getItem("email");
    setEmail(email);
  }, []);

  useEffect(() => {
    if (email) {
      fetchName();
    }
  }, [email]);

  useEffect(() => {
    if (name) {
      fetchSubjectsByStaff(name);
    }
  }, [name]);

  useEffect(() => {
    if (selectedSubject) {
      fetchMappingData(selectedSubject.id);
    }
  }, [selectedSubject]);

  const fetchName = async () => {
    try {
      const { data, error } = await supabase
        .from("stafflist")
        .select("name")
        .eq("email", email)
        .single();

      if (error) {
        throw error;
      }

      setName(data.name);
    } catch (error) {
      console.error("Fetch name error:", error.message);
    }
  };

  const fetchSubjectsByStaff = async (staffName) => {
    try {
      const { data: subjectData, error: subjectError } = await supabase
        .from("Subject")
        .select("*")
        .eq("staff", staffName);
      if (subjectError) {
        console.error(
          "Error fetching subjects by staff:",
          subjectError.message
        );
      } else {
        setSubjectOptions(subjectData);
      }
    } catch (error) {
      console.error("Error fetching subjects by staff:", error.message);
    }
  };

  const fetchMappingData = async (subjectId) => {
    try {
      const { data: mappingData, error: mappingError } = await supabase
        .from("MappingData")
        .select("*")
        .eq("subject_id", subjectId);

      if (mappingError) {
        console.error(
          "Error fetching mapping data:",
          mappingError.message
        );
      } else {
        setMappingData(mappingData);
      }
    } catch (error) {
      console.error("Error fetching mapping data:", error.message);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleValueChange = (newValue, rowIndex) => {
    const updatedMappingData = [...mappingData];
    updatedMappingData[rowIndex].value = newValue;
    setMappingData(updatedMappingData);
  };

  const handleJustificationChange = (newJustification, rowIndex) => {
    const updatedMappingData = [...mappingData];
    updatedMappingData[rowIndex].justification = newJustification;
    setMappingData(updatedMappingData);
  };

  const handleAddEntry = () => {
    // Check if a subject is selected
    if (selectedSubject) {
      // Add a new entry with the subject_id of the selected subject
      setMappingData([
        ...mappingData,
        { subject_id: selectedSubject.id, mapping: "", value: 0, justification: "" }
      ]);
    }
  };
  
  const saveMappingData = async () => {
    try {
      // Filter out rows without a subject_id (newly added rows)
      const mappingDataToSave = mappingData.filter(row => row.subject_id);
  
      console.log("Mapping data to save:", mappingDataToSave);
  
      // Construct an array of promises for each row to be saved
      const savePromises = mappingDataToSave.map(async row => {
        // Check if the data already exists in the database
        const { data: existingData, error } = await supabase
          .from("MappingData")
          .select("*")
          .eq('mapping', row.mapping) // Pass the column name as a string
          .eq('subject_id', row.subject_id) // Pass the column name as a string
          .single();
  
        if (error) {
          throw error;
        }
  
        // Handle both scenarios: update existing data or insert a new row
        if (!existingData) {
          // Insert a new row if no existing data is found
          return supabase.from("MappingData").insert(row);
        } else {
          // Update existing data
          return supabase.from("MappingData").update(row).eq("id", existingData.id);
        }
      });
  
      // Execute all save promises concurrently
      const results = await Promise.all(savePromises);
  
      console.log("Successfully saved mapping data:", results);
  
      // Refetch mapping data after saving
      if (selectedSubject) {
        fetchMappingData(selectedSubject.id);
      }
    } catch (error) {
      console.error("Error saving mapping data:", error.message);
    }
  };
  
  
  
  
  
  
  const generatePDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Define the header for the PDF
    const header = `Mapping for ${selectedSubject.name}`;

    // Define the data for the table
    const data = mappingData.map((row, index) => [
      row.mapping,
      row.value,
      row.justification
    ]);

    // Set the header and table data
    doc.text(header, 10, 10);
    doc.autoTable({
      startY: 20,
      head: [['Mapping', 'Value', 'Justification']],
      body: data
    });

    // Save the PDF
    doc.save('mapping.pdf');
  };

  return (
    <div className="bg-blue-100  h-screen w-screen overflow-auto mr-2">
      <h2 className="py-2 px-4 text-2xl font-bold bg-blue-100">
        Subjects Taught by {name}
      </h2>

      <div className="flex flex-wrap rounded-[50%] px-[60px]">
        {subjectOptions.length > 0 &&
          subjectOptions.map((subject, index) => (
            <div
              key={index}
              className="bg-blue-200 p-2 m-2 rounded cursor-pointer"
              onClick={() => handleSubjectClick(subject)}
            >
              <div className="md:w-[25rem] h-[5rem] bg-white rounded-md shadow-lg hover:bg-red-200">
                <div className="flex justify-between px-4 py-2">
                  <div className="flex flex-col my-3.5">
                    <div className="text-[grey] text-xl"></div>
                    <div className="text-blue-500 text-2xl">{subject.name}</div>
                  </div>
                  <div className="flex py-[10px]">
                    <div className="w-[2.5rem] md:w-[2.5rem] h-[2.5rem] bg-light-blue rounded-[25%] text-center py-[5%]">
                      -{`>`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {selectedSubject && (
        <div>
          <h2 className="text-center  text-xl py-4 px-2  bg-blue-100">
            Mapping for {selectedSubject.name}
          </h2>
          <button
            onClick={generatePDF}
            className="bg-blue-500 w-[160px] h-[40px] rounded-lg mt-1 text-center p-2 text-[20px] text-white font-normal"
          >
            Generate PDF
          </button>
          <button
            onClick={handleAddEntry}
            className="bg-blue-500 w-[160px] h-[40px] rounded-lg mt-1 text-center p-2 text-[20px] text-white font-normal ml-2"
          >
            Add
          </button>
          <button
            onClick={saveMappingData}
            className="bg-blue-500 w-[160px] h-[40px] rounded-lg mt-1 text-center p-2 text-[20px] text-white font-normal ml-2"
          >
            Save
          </button>
          <table className="pl-[10px] text-left table-auto bg-white border w-full rounded-[25px] shadow-lg">
            <thead className="rounded-lg">
              <tr className="rounded-lg">
                <th className="px-8 py-4 font-semibold">Mapping</th>
                <th className="px-8 py-4 font-semibold">Value</th>
                <th className="px-8 py-4 font-semibold">Justification</th>
              </tr>
            </thead>
            <tbody className="font-sans">
              {mappingData.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-text-hover-bg" : ""}
                >
                  <td className="px-8 py-4 font-light text-[20px]">
                    {row.mapping}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    <input
                      type="number"
                      value={row.value}
                      onChange={(e) => handleValueChange(e.target.value, index)}
                      className="border rounded-lg px-3 py-2 mb-2 w-full"
                    />
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    <input
                      type="text"
                      value={row.justification}
                      onChange={(e) => handleJustificationChange(e.target.value, index)}
                      className="border rounded-lg px-3 py-2 mb-2 w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CoursePlanTable;
