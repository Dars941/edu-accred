import React, { useState, useEffect } from "react";
import supabase from "../../createClent";

const TimeTable = () => {
  const [department, setDepartment] = useState("");
  const [advisorBatch, setAdvisorBatch] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [timetable, setTimetable] = useState({});
  const [subjectOptions, setSubjectOptions] = useState([]);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const email = localStorage.getItem("email");
        const { data: staffData, error: staffError } = await supabase
          .from("stafflist")
          .select("dept, advisor_batch")
          .eq("email", email)
          .single();

        if (staffError) {
          throw staffError;
        }

        if (staffData) {
          setDepartment(staffData.dept);
          setAdvisorBatch(staffData.advisor_batch);
        }
      } catch (error) {
        console.error("Error fetching staff data:", error.message);
      }
    };

    fetchStaffData();
  }, []);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const { data, error } = await supabase
          .from("classrooms")
          .select("*")
          .eq("department", department)
          .eq("batch", advisorBatch);

        if (error) {
          throw error;
        }

        setClassrooms(data || []);
      } catch (error) {
        console.error("Error fetching classrooms:", error.message);
      }
    };

    if (department && advisorBatch) {
      fetchClassrooms();
    }
  }, [department, advisorBatch]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase.from("Subject").select("name");
        if (error) {
          throw error;
        }
        setSubjectOptions(data.map((subject) => subject.name));
      } catch (error) {
        console.error("Error fetching subjects:", error.message);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const { data, error } = await supabase.from("timetable").select("*");
        if (error) {
          throw error;
        }
        
        // Initialize a new timetable object
        const newTimetable = {};
        
        // Iterate through each timetable entry
        data.forEach((entry) => {
          const { classroom_id, day, period, subject } = entry;
          
          // Ensure that the classroom_id is valid
          if (!newTimetable[classroom_id]) {
            newTimetable[classroom_id] = {};
          }
          
          // Ensure that the day is valid
          if (!newTimetable[classroom_id][day]) {
            newTimetable[classroom_id][day] = {};
          }
  
          // Ensure that the period is valid
          if (!newTimetable[classroom_id][day][period]) {
            newTimetable[classroom_id][day][period] = subject;
          } else {
            console.warn(`Duplicate entry found for ${classroom_id}, ${day}, ${period}. Skipping.`);
          }
        });
        
        // Set the new timetable state
        setTimetable(newTimetable);
      } catch (error) {
        console.error("Error fetching timetable:", error.message);
      }
    };
  
    // Fetch timetable data when the component mounts
    fetchTimetable();
  }, []);
   

  const handleInputChange = (event, day, period) => {
    if (!selectedClassroom) return;
  
    const { id } = selectedClassroom;
  
    // Copy the current timetable state
    const newTimetable = { ...timetable };
  
    // Ensure that the nested objects are initialized before updating
    newTimetable[id] = newTimetable[id] || {};
    newTimetable[id][day] = newTimetable[id][day] || {};
  
    // Update the subject for the specified day and period
    newTimetable[id][day] = {
      ...newTimetable[id][day],
      [period]: event.target.value
    };
  
    // Set the updated timetable state
    setTimetable((prevTimetable) => ({
      ...prevTimetable,
      [id]: {
        ...prevTimetable[id],
        [day]: {
          ...prevTimetable[id]?.[day],
          [period]: event.target.value
        }
      }
    }));
  };
  
  
  
  
  
  
  
  

  const saveTimetable = async () => {
    try {
      let timetableEntries = [];
  
      // Iterate over each classroom
      for (const classroomId in timetable) {
        // Iterate over each day
        for (const day in timetable[classroomId]) {
          // Iterate over each period
          for (const period in timetable[classroomId][day]) {
            // Get the subject for the current day and period
            const subject = timetable[classroomId][day][period];
            // Check if the subject is not empty or null
            if (subject) {
              // Check if the entry already exists
              const existingEntry = timetableEntries.find(entry => entry.classroom_id === classroomId && entry.day === day && entry.period === period);
              if (!existingEntry) {
                // Push the timetable entry if it doesn't exist already
                timetableEntries.push({
                  classroom_id: classroomId,
                  day,
                  period,
                  subject,
                });
              }
            }
          }
        }
      }
  
      // Log the timetable entries for debugging
      console.log("Timetable Entries:", timetableEntries);
  
      // Save the timetable entries to the backend
      await supabase.from("timetable").upsert(timetableEntries);
  
      // Show a success message to the user
      alert("Timetable saved successfully!");
    } catch (error) {
      // Handle any errors that occur during the save operation
      console.error("Error saving timetable:", error.message);
    }
  };
  

  const handleClick = async (classroom) => {
    setSelectedClassroom(classroom);
    try {
      const { data, error } = await supabase
        .from("timetable")
        .select("*")
        .eq("classroom_id", classroom.id);
      if (error) {
        throw error;
      }
  
      const newTimetable = { ...timetable }; // Create a copy of the existing state
  
      data.forEach((entry) => {
        const { day, period, subject } = entry;
        // Update the specific day and period within the selected classroom
        if (!newTimetable[classroom.id]) {
          newTimetable[classroom.id] = {};
        }
        newTimetable[classroom.id][day] = {
          ...newTimetable[classroom.id][day] || {}, // Merge existing data if present
          [period]: subject,
        };
      });
  
      setTimetable(newTimetable);
    } catch (error) {
      console.error("Error fetching timetable:", error.message);
    }
  };
  

  return (
    <div className="p-7 text-2xl text-black bg-blue-100 w-full font-semibold">
      <h2>Time Table</h2>
      <div className="flex flex-wrap gap-4 mt-4">
        {classrooms.map((classroom) => (
          <div
            key={classroom.id}
            onClick={() => handleClick(classroom)}
            className="cursor-pointer bg-white p-4 rounded-lg shadow-md"          >
            <p className="font-semibold">{classroom.name}</p>
          </div>
        ))}
      </div>
      {selectedClassroom && (
        <div className="mt-8">
          <h3>Time Table for {selectedClassroom.name}</h3>
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-800 mt-4 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-800 px-2 py-1">Day</th>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <th
                      key={index}
                      className="border border-gray-800 px-2 py-1"
                    >
                      Period {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <td className="border border-gray-800 px-2 py-1">{day}</td>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <td
                        key={index}
                        className="border border-gray-800 px-2 py-1"
                      >
                        <input
                          type="text"
                          value={timetable[selectedClassroom.id] && timetable[selectedClassroom.id][day] && timetable[selectedClassroom.id][day][index]}
                          onChange={(event) =>
                            handleInputChange(event, day, index)
                          }
                          className="w-full h-full"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={saveTimetable}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeTable;

