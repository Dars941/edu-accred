import React, { useState, useEffect } from "react";
import supabase from "../../createClent";

const TimeTable = () => {
  const [department, setDepartment] = useState("");
  const [name, setName] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [email, setEmail] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [refreshTable, setRefreshTable] = useState(false);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const email = localStorage.getItem("email");
        const { data: staffData, error: staffError } = await supabase
          .from("stafflist")
          .select("dept, name")
          .eq("email", email)
          .single();

        if (staffError) {
          throw staffError;
        }

        if (staffData) {
          setDepartment(staffData.dept);
          setName(staffData.name);
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
          .eq("department", department);

        if (error) {
          throw error;
        }

        setClassrooms(data || []);
      } catch (error) {
        console.error("Error fetching classrooms:", error.message);
      }
    };

    if (department) {
      fetchClassrooms();
    }
  }, [department]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from("Subject")
          .select("*")
          .eq("staff", name);

        if (error) {
          throw error;
        }
        setSubjectOptions(data.map((subject) => subject.name));
      } catch (error) {
        console.error("Error fetching subjects:", error.message);
      }
    };

    fetchSubjects();
  }, [name]);

  const [timetables, setTimetables] = useState({});

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const { data, error } = await supabase.from("timetable").select("*");

        if (error) {
          throw error;
        }

        // Initialize a new timetable object
        const newTimetables = {};

        // Iterate through each timetable entry
        data.forEach((entry) => {
          const { classroom_id, day, period, subject } = entry;

          // Ensure that the classroom_id is valid
          if (!newTimetables[classroom_id]) {
            newTimetables[classroom_id] = {};
          }

          // Ensure that the day is valid
          if (!newTimetables[classroom_id][day]) {
            newTimetables[classroom_id][day] = {};
          }

          // Ensure that the period is valid
          if (!newTimetables[classroom_id][day][period]) {
            newTimetables[classroom_id][day][period] = subject;
          } else {
            console.warn(
              `Duplicate entry found for ${classroom_id}, ${day}, ${period}. Skipping.`
            );
          }
        });

        // Set the new timetables state
        setTimetables(newTimetables);
      } catch (error) {
        console.error("Error fetching timetables:", error.message);
      }
    };

    // Fetch timetables data when the component mounts
    fetchTimetables();
  }, []);

  const handleInputChange = (event, classroomId, day, period) => {
    // Copy the current timetables state
    const newTimetables = { ...timetables };

    // Ensure that the nested objects are initialized before updating
    newTimetables[classroomId] = newTimetables[classroomId] || {};
    newTimetables[classroomId][day] = newTimetables[classroomId][day] || {};

    // Update the subject for the specified day and period
    newTimetables[classroomId][day][period] = event.target.value;

    // Set the updated timetables state
    setTimetables(newTimetables);
  };

  const saveTimetable = async () => {
    try {
      let timetableEntries = [];

      // Iterate over each classroom's timetable
      for (const classroomId in timetables) {
        // Iterate over each day
        for (const day in timetables[classroomId]) {
          // Iterate over each period
          for (const period in timetables[classroomId][day]) {
            // Get the subject for the current day and period
            const subject = timetables[classroomId][day][period];
            // Check if the subject is not empty or null
            if (subject) {
              // Push the timetable entry
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
  };

  return (
    <div className="p-7 text-2xl text-black bg-blue-100 w-full font-semibold">
      <h2>Time Table for {name}</h2>
      <div className="flex flex-wrap gap-4 mt-4">
        {classrooms.map((classroom) => (
          <div
            key={classroom.id}
            onClick={() => handleClick(classroom)}
            className="cursor-pointer bg-white p-4 rounded-lg shadow-md"
          >
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
                  {Array.from({ length: 7 }).map((_, index)                    => (
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
    key={`${day}-${index}`}
    className="border border-gray-800 px-2 py-1"
  >
    <input
      type="text"
      value={
        (timetables[selectedClassroom.id] &&
          timetables[selectedClassroom.id][day] &&
          timetables[selectedClassroom.id][day][index]) ||
        ''
      }
      onChange={(event) =>
        handleInputChange(
          event,
          selectedClassroom.id,
          day,
          index
        )
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

