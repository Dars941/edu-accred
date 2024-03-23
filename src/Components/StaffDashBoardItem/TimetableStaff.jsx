import React, { useState, useEffect } from "react";
import supabase from "../../createClent";

const TimeTable = () => {
  const [department, setDepartment] = useState("");
  const [advisorBatch, setAdvisorBatch] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [timetable, setTimetable] = useState({});
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null); // New state to store selected subject
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const email = localStorage.getItem("email"); // Get staff email from localStorage

  useEffect(() => {
    const fetchStaffData = async () => {
        
      try {
        const email = localStorage.getItem("email");
        const { data: staffData, error: staffError } = await supabase
          .from("stafflist")
          .select("dept")
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
  }, [email]); // Trigger effect when email changes

  useEffect(() => {
    const fetchSubjectsByStaff = async (staffName) => {
      try {
        const { data: subjectData, error: subjectError } = await supabase
          .from("Subject")
          .select("name")
          .eq("staff", staffName);
        if (subjectError) {
          console.error("Error fetching subjects by staff:", subjectError.message);
        } else {
          setSubjectOptions(subjectData);
        }
      } catch (error) {
        console.error("Error fetching subjects by staff:", error.message);
      }
    };

    if (department && advisorBatch) {
      fetchSubjectsByStaff(email);
    }
  }, [department, advisorBatch, email]);

  // Function to fetch timetable for selected subject
  useEffect(() => {
    const fetchTimetable = async () => {
      if (selectedSubject) {
        try {
          const { data, error } = await supabase.from("timetable")
            .select("*")
            .eq("subject", selectedSubject.name);

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
      }
    };

    fetchTimetable();
  }, [selectedSubject]);

  // Function to handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  return (
    <div className="p-7 text-2xl text-black bg-blue-100 w-full font-semibold">
      <h2>Time Table</h2>
      <div className="flex flex-wrap gap-4 mt-4">
        {/* Display subject options */}
        {subjectOptions.map((subject) => (
          <div
            key={subject.name}
            onClick={() => handleSubjectSelect(subject)}
            className="cursor-pointer bg-white p-4 rounded-lg shadow-md"
          >
            <p className="font-semibold">{subject.name}</p>
          </div>
        ))}
      </div>
      {/* Display timetable for selected subject */}
      {selectedSubject && (
        <div className="mt-8">
          <h3>Time Table for {selectedSubject.name}</h3>
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
                          readOnly // Set input as readOnly since staff member cannot edit timetable
                          className="w-full h-full"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTable;
