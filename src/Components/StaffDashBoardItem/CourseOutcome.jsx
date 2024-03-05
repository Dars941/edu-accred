import React, { useState, useEffect } from "react";
import supabase from "../../createClent";
import jsPDF from "jspdf";
import "jspdf-autotable";

function CourseOutcomeTable() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [newCourseOutcome, setNewCourseOutcome] = useState({
    name: "",
    CO1_PART_A_Q1: 0,
    CO1_PART_A_Q2: 0,
    CO1_PART_B_Q1: 0,
    CO1_PART_B_Q2: 0,
    CO2_PART_A_Q1: 0,
    CO2_PART_A_Q2: 0,
    CO2_PART_B_Q1: 0,
    CO2_PART_B_Q2: 0,
  });
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editCourseOutcomeId, setEditCourseOutcomeId] = useState(null);

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
  }, [selectedSubject, showAddEditModal]); // Include showAddEditModal in the dependency array if necessary

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
        console.error("Error adding course outcome:", addError.message);
      } else {
        console.log("Successfully added course outcome:", newCourseOutcomeData);
        setCourseOutcomes([...courseOutcomes, newCourseOutcomeData[0]]);
        setNewCourseOutcome({
          name: "",
          CO1_PART_A_Q1: 0,
          CO1_PART_A_Q2: 0,
          CO1_PART_B_Q1: 0,
          CO1_PART_B_Q2: 0,
          CO2_PART_A_Q1: 0,
          CO2_PART_A_Q2: 0,
          CO2_PART_B_Q1: 0,
          CO2_PART_B_Q2: 0,
        });
      }
    } catch (error) {
      console.error("Error adding course outcome:", error.message);
    } finally {
      setShowAddEditModal(false);
    }
  };

  const handleEdit = (outcomeId) => {
    const selectedOutcome = courseOutcomes.find(
      (outcome) => outcome.id === outcomeId
    );
    setNewCourseOutcome(selectedOutcome);
    setEditCourseOutcomeId(outcomeId);
    setShowAddEditModal(true);
  };

  const handleDelete = async (outcomeId) => {
    try {
      await supabase.from("course_outcomes_1").delete().eq("id", outcomeId);
      setCourseOutcomes(
        courseOutcomes.filter((outcome) => outcome.id !== outcomeId)
      );
    } catch (error) {
      console.error("Error deleting course outcome:", error.message);
    }
  };

  return (
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

      {selectedSubject && (
        <div>
          <h2 className="text-center text-xl py-4 px-2 bg-blue-100">
            Course Outcomes for {selectedSubject.name}
          </h2>
          <button
            onClick={() => {
              setShowAddEditModal(true);
              setEditCourseOutcomeId(null);
              setNewCourseOutcome({
                name: "",
                CO1_PART_A_Q1: 0,
                CO1_PART_A_Q2: 0,
                CO1_PART_B_Q1: 0,
                CO1_PART_B_Q2: 0,
                CO2_PART_A_Q1: 0,
                CO2_PART_A_Q2: 0,
                CO2_PART_B_Q1: 0,
                CO2_PART_B_Q2: 0,
              });
            }}
            className="bg-text-hover-color w-[60px] h-[40px] rounded-lg mt-1 text-center p-2 text-[20px] text-white font-normal"
          >
            Add
          </button>
          <table className="pl-[10px] text-left table-auto bg-white border w-full rounded-[25px] shadow-lg">
            <thead className="rounded-lg">
              <tr className="rounded-lg">
                <th className="px-8 py-4 font-semibold">No</th>
                <th className="px-8 py-4 font-semibold">Student Name</th>
                <th className="px-8 py-4 font-semibold">CO1_PART_A_Q1</th>
                <th className="px-8 py-4 font-semibold">CO1_PART_A_Q2</th>
                <th className="px-8 py-4 font-semibold">CO1_PART_B_Q1</th>
                <th className="px-8 py-4 font-semibold">CO1_PART_B_Q2</th>
                <th className="px-8 py-4 font-semibold">CO2_PART_A_Q1</th>
                <th className="px-8 py-4 font-semibold">CO2_PART_A_Q2</th>
                <th className="px-8 py-4 font-semibold">CO2_PART_B_Q1</th>
                <th className="px-8 py-4 font-semibold">CO2_PART_B_Q2</th>
                <th className="px-8 py-4 font-semibold">CO1_total</th>
                <th className="px-8 py-4 font-semibold">CO1_percentage</th>
                <th className="px-8 py-4 font-semibold">CO2_total</th>
                <th className="px-8 py-4 font-semibold">CO2_percentage</th>
                <th className="px-8 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-sans">
              {courseOutcomes.map((outcome, index) => (
                <tr
                  key={outcome.id}
                  className={index % 2 === 0 ? "bg-text-hover-bg" : ""}
                >
                  <td className="px-8 py-4 font-light text-[20px]">
                    {index + 1}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.name}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.CO1_PART_A_Q1}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.CO1_PART_A_Q2}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.CO1_PART_B_Q1}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.CO1_PART_B_Q2}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.CO2_PART_A_Q1}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.CO2_PART_A_Q2}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.CO2_PART_B_Q1}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {outcome.CO2_PART_B_Q2}
                  </td>
                  {/* Calculate CO1 and CO2 totals and percentages for each student */}
                  <td className="px-8 py-4 font-light text-[20px]">
                    {parseInt(outcome.CO1_PART_A_Q1) +
                      parseInt(outcome.CO1_PART_A_Q2) +
                      parseInt(outcome.CO1_PART_B_Q1) +
                      parseInt(outcome.CO1_PART_B_Q2)}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {Math.round(
                      ((parseInt(outcome.CO1_PART_A_Q1) +
                        parseInt(outcome.CO1_PART_A_Q2) +
                        parseInt(outcome.CO1_PART_B_Q1) +
                        parseInt(outcome.CO1_PART_B_Q2)) /
                        (3 * 4)) *
                        100
                    )}%
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {parseInt(outcome.CO2_PART_A_Q1) +
                      parseInt(outcome.CO2_PART_A_Q2) +
                      parseInt(outcome.CO2_PART_B_Q1) +
                      parseInt(outcome.CO2_PART_B_Q2)}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {Math.round(
                      ((parseInt(outcome.CO2_PART_A_Q1) +
                        parseInt(outcome.CO2_PART_A_Q2) +
                        parseInt(outcome.CO2_PART_B_Q1) +
                        parseInt(outcome.CO2_PART_B_Q2)) /
                        (14 * 4)) *
                        100
                    )}%
                  </td>
                  {/* Display actions */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        {/* Add/Edit Course Outcome Modal */}
        {showAddEditModal && (
        <div className="fixed top-0 left-0 w-full h-full flex  items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg ">
            <h2 className="text-lg font-semibold mb-4">
              {editCourseOutcomeId
                ? "Edit Course Outcome"
                : "Add Course Outcome"}
            </h2>
            {/* Form for adding/editing course outcome */}
            <form
              onSubmit={
                editCourseOutcomeId ? editCourseOutcomeId : addCourseOutcome
              }
              className=""
            >
              <div className="flex">
                <div>
                  <label>Student Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={newCourseOutcome.name}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
              </div>
              <div className="flex">
                <div>
                  <label>CO1_PART_A_Q1:</label>
                  <input
                    type="number"
                    name="CO1_PART_A_Q1"
                    value={newCourseOutcome.CO1_PART_A_Q1}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
                <div>
                  <label>CO1_PART_A_Q2:</label>
                  <input
                    type="number"
                    name="CO1_PART_A_Q2"
                    value={newCourseOutcome.CO1_PART_A_Q2}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
                <div>
                  <label>CO1_PART_B_Q1:</label>
                  <input
                    type="number"
                    name="CO1_PART_B_Q1"
                    value={newCourseOutcome.CO1_PART_B_Q1}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
              </div>
              <div className="flex">
                <div>
                  <label>CO1_PART_B_Q2:</label>
                  <input
                    type="number"
                    name="CO1_PART_B_Q2"
                    value={newCourseOutcome.CO1_PART_B_Q2}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
                <div>
                  <label>CO2_PART_A_Q1:</label>
                  <input
                    type="number"
                    name="CO2_PART_A_Q1"
                    value={newCourseOutcome.CO2_PART_A_Q1}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
                <div>
                  <label>CO2_PART_A_Q2:</label>
                  <input
                    type="number"
                    name="CO2_PART_A_Q2"
                    value={newCourseOutcome.CO2_PART_A_Q2}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
              </div>
              <div className="flex">
                <div>
                  <label>CO2_PART_B_Q1:</label>
                  <input
                    type="number"
                    name="CO2_PART_B_Q1"
                    value={newCourseOutcome.CO2_PART_B_Q1}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
                <div>
                  <label>CO2_PART_B_Q2:</label>
                  <input
                    type="number"
                    name="CO2_PART_B_Q2"
                    value={newCourseOutcome.CO2_PART_B_Q2}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 mb-2 w-full"
                  />
                </div>
              </div>

              {/* Repeat similar inputs for other CO parts */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEditModal(false);
                    setEditCourseOutcomeId(null);
                    setNewCourseOutcome({
                      name: "",
                      CO1_PART_A_Q1: 0,
                      CO1_PART_A_Q2: 0,
                      CO1_PART_B_Q1: 0,
                      CO1_PART_B_Q2: 0,
                      CO2_PART_A_Q1: 0,
                      CO2_PART_A_Q2: 0,
                      CO2_PART_B_Q1: 0,
                      CO2_PART_B_Q2: 0,
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  {editCourseOutcomeId ? "Edit" : "Add"} Course Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseOutcomeTable;