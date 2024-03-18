import React, { useState, useEffect } from "react";
import supabase from "../../createClent";
import jsPDF from "jspdf";
import "jspdf-autotable"; 
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css"; 

function AttendanceSystem() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date()); // State variable to hold the selected date

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
      fetchDepartments();
      fetchBatches();
    }
  }, [name]);

  useEffect(() => {
    if (selectedSubject) {
      fetchAttendanceForSubject(selectedSubject.id, selectedDate); // Fetch attendance data for the selected subject and date
      fetchStudents(selectedSubject.staff, selectedDepartment, selectedBatch);
    }
  }, [selectedSubject, selectedDepartment, selectedBatch, selectedDate]);

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
        setSubjects(subjectData);
      }
    } catch (error) {
      console.error("Error fetching subjects by staff:", error.message);
    }
  };

  const fetchAttendanceForSubject = async (subjectId, date) => {
    try {
      setLoading(true);
      // Fetch attendance data for the subject and date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("subject_id", subjectId)
        .eq("date", date.toISOString().slice(0, 10)) // Convert date to ISO format and extract YYYY-MM-DD part
        .order("date", { ascending: false });
  
      if (attendanceError) {
        throw attendanceError;
      }
  
      // Extract student IDs from attendance data
      const studentIds = attendanceData.map(
        (attendance) => attendance.student_id
      );
  
      // Fetch students from the selected department
      const { data: departmentStudents, error: studentError } = await supabase
        .from("studentlist")
        .select("id, name")
        .eq("dept", selectedDepartment);
  
      if (studentError) {
        throw studentError;
      }
  
      // Combine attendance data with student names from the selected department
      const updatedAttendanceData = departmentStudents.map((student) => {
        const attendanceRecord = attendanceData.find(
          (attendance) => attendance.student_id === student.id
        );
        return {
          student_name: student.name,
          status: attendanceRecord ? attendanceRecord.status : "AB", // Set status as "AB" (absent) if no attendance record found
          date: attendanceRecord ? attendanceRecord.date : date.toISOString().slice(0, 10), // Use selected date if no attendance record found
        };
      });
  
      setAttendanceData(updatedAttendanceData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance for subject:", error.message);
      setLoading(false);
    }
  };
  
  

  const fetchStudents = async (staffName, department, batch) => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from("studentlist")
        .select("*")
        .eq("dept", department)
        .eq("batch", batch)
        .order("name", { ascending: true });
      if (studentsError) {
        console.error("Error fetching students:", studentsError.message);
      } else {
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching students:", error.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from("studentlist")
        .select("dept");

      if (studentsError) {
        console.error("Error fetching departments:", studentsError.message);
      } else {
        // Extract unique departments from the fetched data
        const uniqueDepartments = [
          ...new Set(studentsData.map((student) => student.dept)),
        ];
        setDepartments(uniqueDepartments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error.message);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from("studentlist")
        .select("batch");

      if (studentsError) {
        console.error("Error fetching batches:", studentsError.message);
      } else {
        // Extract unique batches from the fetched data
        const uniqueBatches = [
          ...new Set(studentsData.map((student) => student.batch)),
        ];
        setBatches(uniqueBatches);
      }
    } catch (error) {
      console.error("Error fetching batches:", error.message);
    }
  };

  const handleGeneratePDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Define the header for the PDF
    const header = `Attendance for ${selectedSubject.name} on ${selectedDate.toDateString()}`; // Include the selected date in the header

    // Define the data for the table
    const data = [];
    attendanceData.forEach((attendance, index) => {
      const rowData = [
        attendance.student_name,
        attendance.status,
        attendance.date,
      ];
      data.push(rowData);
    });

    // Set the header and table data
    doc.text(header, 10, 10);
    doc.autoTable({
      startY: 20,
      head: [["Student Name", "Status", "Date"]],
      body: data,
    });

    // Save the PDF
    doc.save("attendance.pdf");
  };

  const handleMarkAttendance = (studentId, checked) => {
    setAttendanceStatus((prevState) => ({
      ...prevState,
      [studentId]: checked,
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      setLoading(true);
      const formattedAttendanceData = Object.keys(attendanceStatus).map(
        (studentId) => ({
          subject_id: selectedSubject.id,
          student_id: studentId,
          status: attendanceStatus[studentId],
          date: selectedDate.toISOString().slice(0, 10), // Use selectedDate for the date field
        })
      );
  
      const { data, error } = await supabase
        .from("attendance")
        .upsert(formattedAttendanceData);
  
      if (error) {
        console.error("Error submitting attendance:", error.message);
      } else {
        console.log("Attendance submitted successfully:", data);
        // Reset attendance status
        setAttendanceStatus({});
        // Fetch attendance data again to update the UI with the latest data
        await fetchAttendanceForSubject(selectedSubject.id, selectedDate);
      }
    } catch (error) {
      console.error("Error submitting attendance:", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilter = () => {
    // Filter students based on selected department and batch
    let filteredStudents = students;

    if (selectedDepartment) {
      filteredStudents = filteredStudents.filter(student => student.dept === selectedDepartment);
    }

    if (selectedBatch) {
      filteredStudents = filteredStudents.filter(student => student.batch === selectedBatch);
    }

    setFilteredStudents(filteredStudents);
  };


  return (

       <div className="h-screen w-screen overflow-auto mr-2">

      <div>
        <label>Select Attendance Date:</label>
        <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} />
      </div>

      <div className="flex flex-wrap rounded-[50%] px-[60px]">
        {subjects.length > 0 &&
          subjects.map((subject, index) => (
            <div
              key={index}
              className="bg-blue-200 p-2 m-2 rounded cursor-pointer"
              onClick={() => setSelectedSubject(subject)}
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
          <button onClick={handleGeneratePDF}>Generate Attendance PDF</button>
          {/* {loading ? (
  <p>Loading attendance data...</p>
) : ( */} 
<div>
        <label>Filter by Department:</label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">Select Department</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Filter by Batch:</label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">Select Batch</option>
          {batches.map((batch, index) => (
            <option key={index} value={batch}>
              {batch}
            </option>
          ))}
        </select>
      </div>
<div>
            <h3>Mark Attendance:</h3>
            {filteredStudents.map((student, index) => (
              <div key={index} className="my-8 mx-4 py-4 px-2 flex bg-red-100 rounded-lg items-center justify-between">
              <div className="flex items-center">
                <label className="mr-4">{student.name}</label>

              </div>
              <input
                  type="checkbox"
                  className="transform scale-125"
                  checked={attendanceStatus[student.id] === "X"}
                  onChange={(e) =>
                    handleMarkAttendance(
                      student.id,
                      e.target.checked ? "X" : "AB"
                    )
                  }
                />
            </div>

            ))}

            <button className="py-2 px-1 bg-blue-200 rounded-lg" onClick={handleSubmitAttendance}>Submit Attendance</button> 
            {/* <button onClick={handleGeneratePDF}>Generate Attendance PDF</button> */}
          </div>
  <table className="pl-[10px] text-left table-auto bg-white border w-full rounded-[25px] shadow-lg">
    <thead className="rounded-lg">
      <tr className="rounded-lg">
        <th className="px-8 py-4 font-semibold">Student Name</th>
        <th className="px-8 py-4 font-semibold">Status</th>
        <th className="px-8 py-4 font-semibold">Date</th>
      </tr>
    </thead>
    <tbody className="font-sans">
      {attendanceData.map((attendance, index) => (
        <tr key={index} className={index % 2 === 0 ? 'bg-text-hover-bg' : ''}>
          <td className="px-8 py-4 font-light text-[20px]">{attendance.student_name}</td>
          <td className="px-8 py-4 font-light text-[20px]">{attendance.status}</td>
          <td className="px-8 py-4 font-light text-[20px]">{attendance.date}</td>
        </tr>
      ))}
    </tbody>
  </table>
{/* )} */}



        </div>
      )}


      <button onClick={handleFilter}>Apply Filters</button>

      {filteredStudents.length > 0 && (
        <div>
          <label>Select Student:</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Select Student</option>
            {filteredStudents.map((student, index) => (
              <option key={index} value={student.name}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default AttendanceSystem;