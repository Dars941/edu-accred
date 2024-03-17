import React, { useState, useEffect } from "react";
import supabase from "../../createClent";
import jsPDF from "jspdf";
import "jspdf-autotable";

function CourseOutcomeTable() {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [students, setStudents] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [courseOutcomes, setCourseOutcomes] = useState([]); 
  
  const [departments, setDepartments] = useState([]); // Add this line to define 'departments'
  const [newCourseOutcome, setNewCourseOutcome] = useState({
    name: "",
    CO1_PART_A_Q1: 0,
    CO1_PART_A_Q2: 0,
    CO1_PART_A_Q3: 0,
    CO1_PART_B_Q1: 0,
    CO1_PART_B_Q2: 0,
    CO2_PART_A_Q1: 0,
    CO2_PART_A_Q2: 0,
    CO2_PART_A_Q3: 0,
    CO2_PART_B_Q1: 0,
    CO2_PART_B_Q2: 0,
  });
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editCourseOutcomeId, setEditCourseOutcomeId] = useState(null);
  const [batches, setBatches] = useState([]);

  const fetchStudents = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from("studentlist")
        .select("*")
        .eq("dept", selectedDepartment)
        .eq("batch", selectedBatch)
        .order("name", { ascending: true });
      if (studentsError) {
        console.error("Error fetching students:", studentsError.message);
      } else {
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching students:", error.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data: departmentsData, error: departmentsError } = await supabase
        .from("studentlist")
        .select("dept")
        .distinct("dept");

      if (departmentsError) {
        console.error("Error fetching departments:", departmentsError.message);
      } else {
        setDepartments(departmentsData);
      }
    } catch (error) {
      console.error("Error fetching departments:", error.message);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data: batchesData, error: batchesError } = await supabase
        .from("studentlist")
        .select("batch")
        .distinct("batch");

      if (batchesError) {
        console.error("Error fetching batches:", batchesError.message);
      } else {
        setBatches(batchesData);
      }
    } catch (error) {
      console.error("Error fetching batches:", error.message);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedDepartment && selectedBatch) {
      fetchStudents();
    }
  }, [selectedDepartment, selectedBatch]);

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
      fetchCourseOutcomesBySubject(selectedSubject.id);
    }
  }, [selectedSubject, showAddEditModal]);

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

  const fetchCourseOutcomesBySubject = async (subjectId) => {
    try {
      const { data: courseOutcomesData, error: courseOutcomesError } =
        await supabase
          .from("course_outcomes_1")
          .select("*")
          .eq("subject_id", subjectId);

      if (courseOutcomesError) {
        console.error(
          "Error fetching course outcomes by subject:",
          courseOutcomesError.message
        );
      } else {
        setCourseOutcomes(courseOutcomesData);
      }
    } catch (error) {
      console.error(
        "Error fetching course outcomes by subject:",
        error.message
      );
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    fetchCourseOutcomesBySubject(subject.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourseOutcome({ ...newCourseOutcome, [name]: value });

    // Recalculate CO totals and percentages
    const co1Total =
      parseInt(newCourseOutcome.CO1_PART_A_Q1) +
      parseInt(newCourseOutcome.CO1_PART_A_Q2) + 
      parseInt(newCourseOutcome.CO1_PART_A_Q3) +
      parseInt(newCourseOutcome.CO1_PART_B_Q1) +
      parseInt(newCourseOutcome.CO1_PART_B_Q2);
    const co2Total =
      parseInt(newCourseOutcome.CO2_PART_A_Q1) +
      parseInt(newCourseOutcome.CO2_PART_A_Q2) +
      parseInt(newCourseOutcome.CO2_PART_A_Q3) +
      parseInt(newCourseOutcome.CO2_PART_B_Q1) +
      parseInt(newCourseOutcome.CO2_PART_B_Q2);

    const co1Percentage = Math.round((co1Total / 25) * 100);
    const co2Percentage = Math.round((co2Total / 25) * 100);

    // Update the CO totals and percentages in the state
    setNewCourseOutcome((prevOutcome) => ({
      ...prevOutcome,
      CO1_total: co1Total,
      CO1_percentage: co1Percentage,
      CO2_total: co2Total,
      CO2_percentage: co2Percentage,
    }));
  };

  const addCourseOutcome = async (event) => {
    event.preventDefault();
    try {
      const { data: newCourseOutcomeData, error: addError } = await supabase
        .from("course_outcomes_1")
        .insert([
          {
            subject_id: selectedSubject.id,
            ...newCourseOutcome,
          },
        ]);

      if (addError) {
        throw addError;
      }

      console.log("New course outcome added:", newCourseOutcomeData);
      setNewCourseOutcome({
        name: "",
        CO1_PART_A_Q1: 0,
        CO1_PART_A_Q2: 0,
        CO1_PART_A_Q3: 0,
        CO1_PART_B_Q1: 0,
        CO1_PART_B_Q2: 0,
        CO2_PART_A_Q1: 0,
        CO2_PART_A_Q2: 0,
        CO2_PART_A_Q3: 0,
        CO2_PART_B_Q1: 0,
        CO2_PART_B_Q2: 0,
      });
      fetchCourseOutcomesBySubject(selectedSubject.id);
      setShowAddEditModal(false);
    } catch (error) {
      console.error("Error adding course outcome:", error.message);
    }
  };

  const handleEditClick = (id) => {
    const courseOutcomeToEdit = courseOutcomes.find(
      (courseOutcome) => courseOutcome.id === id
    );
    setNewCourseOutcome(courseOutcomeToEdit);
    setEditCourseOutcomeId(id);
    setShowAddEditModal(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data: updatedCourseOutcomeData, error: updateError } =
        await supabase
          .from("course_outcomes_1")
          .update(newCourseOutcome)
          .eq("id", editCourseOutcomeId);

      if (updateError) {
        throw updateError;
      }

      console.log("Course outcome updated:", updatedCourseOutcomeData);
      setNewCourseOutcome({
        name: "",
        CO1_PART_A_Q1: 0,
        CO1_PART_A_Q2: 0,
        CO1_PART_A_Q3: 0,
        CO1_PART_B_Q1: 0,
        CO1_PART_B_Q2: 0,
        CO2_PART_A_Q1: 0,
        CO2_PART_A_Q2: 0,
        CO2_PART_A_Q3: 0,
        CO2_PART_B_Q1: 0,
        CO2_PART_B_Q2: 0,
      });
      fetchCourseOutcomesBySubject(selectedSubject.id);
      setShowAddEditModal(false);
    } catch (error) {
      console.error("Error updating course outcome:", error.message);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      const { data: deleteData, error: deleteError } = await supabase
        .from("course_outcomes_1")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      console.log("Course outcome deleted:", deleteData);
      fetchCourseOutcomesBySubject(selectedSubject.id);
    } catch (error) {
      console.error("Error deleting course outcome:", error.message);
    }
  };

  const handlePDFExport = () => {
    const doc = new jsPDF();

    doc.autoTable({
      head: [["ID", "Name", "CO1 Part A Q1", "CO1 Part A Q2", "CO1 Part A Q3", "CO1 Part B Q1", "CO1 Part B Q2", "CO2 Part A Q1", "CO2 Part A Q2", "CO2 Part A Q3", "CO2 Part B Q1", "CO2 Part B Q2",]],
      body: courseOutcomes.map((courseOutcome) => [
        courseOutcome.id,
        courseOutcome.name,
        courseOutcome.CO1_PART_A_Q1,
        courseOutcome.CO1_PART_A_Q2,
        courseOutcome.CO1_PART_A_Q3,
        courseOutcome.CO1_PART_B_Q1,
        courseOutcome.CO1_PART_B_Q2,
        courseOutcome.CO2_PART_A_Q1,
        courseOutcome.CO2_PART_A_Q2,
        courseOutcome.CO2_PART_A_Q3,
        courseOutcome.CO2_PART_B_Q1,
        courseOutcome.CO2_PART_B_Q2,
      ]),
    });

    doc.save("Course_Outcomes.pdf");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Course Outcome Management</h1>
      <div className="flex mb-4">
        <div>
          <label>Department:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border rounded-lg px-3 py-2 mb-2 w-full"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Batch:</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="border rounded-lg px-3 py-2 mb-2 w-full"
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Student Name:</label>
          <select
            value={newCourseOutcome.name}
            onChange={(e) => setNewCourseOutcome({ ...newCourseOutcome, name: e.target.value })}
            className="border rounded-lg px-3 py-2 mb-2 w-full"
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.name}>{student.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex mb-4">
        <div className="mr-4">
          <label>Subject:</label>
          <div className="border rounded-lg px-3 py-2 mb-2 w-full">
            {subjectOptions.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className={`cursor-pointer ${
                  selectedSubject && selectedSubject.id === subject.id
                    ? "bg-gray-200"
                    : ""
                }`}
              >
                {subject.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          <button
            onClick={() => setShowAddEditModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Add New Course Outcome
          </button>
          <button
            onClick={handlePDFExport}
            className="bg-green-500 text-white px-4 py-2 ml-4 rounded-lg"
          >
            Export as PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">CO1 Part A Q1</th>
              <th className="border border-gray-300 px-4 py-2">CO1 Part A Q2</th>
              <th className="border border-gray-300 px-4 py-2">CO1 Part A Q3</th>
              <th className="border border-gray-300 px-4 py-2">CO1 Part B Q1</th>
              <th className="border border-gray-300 px-4 py-2">CO1 Part B Q2</th>
              <th className="border border-gray-300 px-4 py-2">CO2 Part A Q1</th>
              <th className="border border-gray-300 px-4 py-2">CO2 Part A Q2</th>
              <th className="border border-gray-300 px-4 py-2">CO2 Part A Q3</th>
              <th className="border border-gray-300 px-4 py-2">CO2 Part B Q1</th>
              <th className="border border-gray-300 px-4 py-2">CO2 Part B Q2</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courseOutcomes.map((courseOutcome) => (
              <tr key={courseOutcome.id}>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.id}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.name}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO1_PART_A_Q1}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO1_PART_A_Q2}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO1_PART_A_Q3}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO1_PART_B_Q1}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO1_PART_B_Q2}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO2_PART_A_Q1}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO2_PART_A_Q2}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO2_PART_A_Q3}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO2_PART_B_Q1}</td>
                <td className="border border-gray-300 px-4 py-2">{courseOutcome.CO2_PART_B_Q2}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEditClick(courseOutcome.id)}
                    className="bg-yellow-500 text-white px-4 py-1 rounded-lg mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(courseOutcome.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAddEditModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Add/Edit Course Outcome</h2>
            <form onSubmit={editCourseOutcomeId ? handleEditSubmit : addCourseOutcome}>
              <div className="mb-4">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newCourseOutcome.name}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO1 Part A Q1:</label>
                <input
                  type="number"
                  name="CO1_PART_A_Q1"
                  value={newCourseOutcome.CO1_PART_A_Q1}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO1 Part A Q2:</label>
                <input
                  type="number"
                  name="CO1_PART_A_Q2"
                  value={newCourseOutcome.CO1_PART_A_Q2}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO1 Part A Q3:</label>
                <input
                  type="number"
                  name="CO1_PART_A_Q3"
                  value={newCourseOutcome.CO1_PART_A_Q3}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO1 Part B Q1:</label>
                <input
                  type="number"
                  name="CO1_PART_B_Q1"
                  value={newCourseOutcome.CO1_PART_B_Q1}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO1 Part B Q2:</label>
                <input
                  type="number"
                  name="CO1_PART_B_Q2"
                  value={newCourseOutcome.CO1_PART_B_Q2}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO2 Part A Q1:</label>
                <input
                  type="number"
                  name="CO2_PART_A_Q1"
                  value={newCourseOutcome.CO2_PART_A_Q1}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO2 Part A Q2:</label>
                <input
                  type="number"
                  name="CO2_PART_A_Q2"
                  value={newCourseOutcome.CO2_PART_A_Q2}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO2 Part A Q3:</label>
                <input
                  type="number"
                  name="CO2_PART_A_Q3"
                  value={newCourseOutcome.CO2_PART_A_Q3}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO2 Part B Q1:</label>
                <input
                  type="number"
                  name="CO2_PART_B_Q1"
                  value={newCourseOutcome.CO2_PART_B_Q1}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label>CO2 Part B Q2:</label>
                <input
                  type="number"
                  name="CO2_PART_B_Q2"
                  value={newCourseOutcome.CO2_PART_B_Q2}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                {editCourseOutcomeId ? "Update" : "Add"}
              </button>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg ml-2"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseOutcomeTable;
