import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import HotTable from 'react-handsontable';
import supabase from '../../createClent';

const Spreadsheet = () => {
  const [data, setData] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [copopsoMapping, setCopoPsoMapping] = useState([]);

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      try {
        const { data: spreadsheetData, error } = await supabase
          .from('Co_Po_Pso_mapping')
          .select();

        if (error) {
          throw error;
        }

        setData(spreadsheetData || []);
      } catch (error) {
        console.error('Error fetching spreadsheet data:', error.message);
      }
    };

    fetchSpreadsheetData();
  }, []);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      const email = localStorage.getItem("email");
      setEmail(email);

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

    fetchStaffDetails();
  }, []);

  useEffect(() => {
    if (name) {
      fetchSubjectsByStaff(name);
    }
  }, [name]);

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

  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    try {
      const { data: mappingData, error: mappingError } = await supabase
        .from('Co_Po_Pso_mapping')
        .select()
        .eq('subject_code', subject.code);

      if (mappingError) {
        throw mappingError;
      }

      setCopoPsoMapping(mappingData || []);
    } catch (error) {
      console.error('Error fetching CO-PO-SO mapping:', error.message);
    }
  };

  const saveDataToSupabase = async () => {
    try {
      const { error } = await supabase.from('Co_Po_Pso_mapping').upsert(data);

      if (error) {
        throw error;
      }

      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data to Supabase:', error.message);
    }
  };

  return (
    <div>
      <div className="bg-blue-100 h-screen w-screen overflow-auto mr-2">
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

        {/* CO-PO-SO Mapping Table */}
        {selectedSubject && (
          <div>
            <h2 className="text-center  text-xl py-4 px-2  bg-blue-100">
              CO-PO-SO Mapping for {selectedSubject.name}
            </h2>
            <div className="pl-[10px] text-left table-auto bg-white border w-full rounded-[25px] shadow-lg">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-8 py-4 font-semibold">ID</th>
                    <th className="px-8 py-4 font-semibold">PO_1</th>
                    <th className="px-8 py-4 font-semibold">PO_2</th>
                    <th className="px-8 py-4 font-semibold">PO_3</th>
                    <th className="px-8 py-4 font-semibold">PO_4</th>
                    <th className="px-8 py-4 font-semibold">PO_5</th>
                    <th className="px-8 py-4 font-semibold">PO_6</th>
                    <th className="px-8 py-4 font-semibold">PO_7</th>
                    <th className="px-8 py-4 font-semibold">PO_8</th>
                    <th className="px-8 py-4 font-semibold">PO_9</th>
                    <th className="px-8 py-4 font-semibold">PO_10</th>
                    <th className="px-8 py-4 font-semibold">PSO_1</th>
                    <th className="px-8 py-4 font-semibold">PSO_2</th>
                    <th className="px-8 py-4 font-semibold">Subject Code</th>
                  </tr>
                </thead>
                <tbody>
                  {copopsoMapping.map((row, index) => (
                    <tr key={index}>
                      <td className="px-8 py-4">{row.id}</td>
                      <td className="px-8 py-4">{row.PO_1}</td>
                      <td className="px-8 py-4">{row.PO_2}</td>
                      <td className="px-8 py-4">{row.PO_3}</td>
                      <td className="px-8 py-4">{row.PO_4}</td>
                      <td className="px-8 py-4">{row.PO_5}</td>
                      <td className="px-8 py-4">{row.PO_6}</td>
                      <td className="px-8 py-4">{row.PO_7}</td>
                      <td className="px-8 py-4">{row.PO_8}</td>
                      <td className="px-8 py-4">{row.PO_9}</td>
                      <td className="px-8 py-4">{row.PO_10}</td>
                      <td className="px-8 py-4">{row.PSO_1}</td>
                      <td className="px-8 py-4">{row.PSO_2}</td>
                      <td className="px-8 py-4">{row.subject_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Spreadsheet;
