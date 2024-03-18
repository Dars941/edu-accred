import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import HotTable from 'react-handsontable';
import supabase from '../../createClent';
import Subject from '../StudentDashBoardItem/Subject';

const Spreadsheet = () => {
  const [data, setData] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

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
      fetchCoursePlansBySubject(selectedSubject.id);
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

  const fetchCoursePlansBySubject = async (subjectId) => {
    try {
      const { data: coursePlansData, error: coursePlansError } = await supabase
        .from("Co_Po_Pso_mapping")
        .select("*")
        .eq("subject_id", subjectId);

      if (coursePlansError) {
        console.error(
          "Error fetching course plans by subject:",
          coursePlansError.message
        );
      } else {
        setData(coursePlansData);
      }
    } catch (error) {
      console.error("Error fetching course plans by subject:", error.message);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    fetchCoursePlansBySubject(subject.id);
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
      <div className='py-4 px-2 text-3xl'>CO PO PSO mapping table </div>
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
      
      <button onClick={saveDataToSupabase}>Save Data</button> 
      <HotTable
        data={data}
        colHeaders={[
          'id',
          'PO_1',
          'PO_2',
          'PO_3',
          'PO_4',
          'PO_5',
          'PO_6',
          'PO_7',
          'PO_8',
          'PO_9',
          'PO_10',
          'PSO_1',
          'PSO_2',
          'subject_id'
        ]}
        rowHeaders={true}
        stretchH="all"
        afterChange={(changes, source) => {
          if (source === 'edit') {
            const newData = data.map((row, rowIndex) => {
              return row.map((cell, colIndex) => {
                const change = changes.find(([r, c]) => r === rowIndex && c === colIndex);
                return change ? change[3] : cell;
              });
            });
            setData(newData);
          }
        }}
      />
    </div>
  );
};

export default Spreadsheet;
