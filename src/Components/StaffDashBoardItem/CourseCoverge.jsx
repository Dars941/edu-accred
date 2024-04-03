import React, { useState, useEffect } from "react";
import supabase from "../../createClent";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DatePicker from "react-datepicker"; // Import DatePicker component

function CoursePlanTable() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [coursePlans, setCoursePlans] = useState([]);
  const [newCoursePlan, setNewCoursePlan] = useState({
    date: new Date(), // Initialize date with current date
    hours: "",
    topics_to_cover: "",
  });
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editCoursePlanId, setEditCoursePlanId] = useState(null);
  const generatePDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
  
    // Define the header for the PDF
    const header = 'Course Coverage for ' + selectedSubject.name;
    
    // Define the data for the table
    const data = [];
    coursePlans.forEach((plan, index) => {
      const rowData = [
        index + 1,
        plan.date,
        plan.hours,
        plan.topics_to_cover
      ];
      data.push(rowData);
    });
  
    // Set the header and table data
    doc.text(header, 10, 10);
    doc.autoTable({
      startY: 20,
      head: [['No', 'Date', 'Hr taken by staff', 'Topics to be Covered']],
      body: data
    });
  
    // Save the PDF
    doc.save('course_coverage.pdf');
  };
  
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

  const fetchCoursePlansBySubject = async (subjectId) => {
    try {
      const { data: coursePlansData, error: coursePlansError } = await supabase
        .from("CourseCoverage")
        .select("*")
        .eq("subject_id", subjectId);

      if (coursePlansError) {
        console.error(
          "Error fetching course plans by subject:",
          coursePlansError.message
        );
      } else {
        setCoursePlans(coursePlansData);
      }
    } catch (error) {
      console.error("Error fetching course plans by subject:", error.message);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    fetchCoursePlansBySubject(subject.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoursePlan({ ...newCoursePlan, [name]: value });
  };

  const handleDateChange = (date) => {
    setNewCoursePlan({ ...newCoursePlan, date });
  };

  const addCoursePlan = async (event) => {
    event.preventDefault();
    try {
      const { data: newCoursePlanData, error: addError } = await supabase
        .from("CourseCoverage")
        .insert([
          {
            subject_id: selectedSubject.id,
            date: newCoursePlan.date,
            hours: newCoursePlan.hours,
            topics_to_cover: newCoursePlan.topics_to_cover,
          },
        ]);

      if (addError) {
        console.error("Error adding course plan:", addError.message);
      } else {
        console.log("Successfully added course plan:", newCoursePlanData);
        setCoursePlans([...coursePlans, newCoursePlanData[0]]);
        setNewCoursePlan({
          date: new Date(), // Reset date to current date
          hours: "",
          topics_to_cover: "",
        });
      }
    } catch (error) {
      console.error("Error adding course plan:", error.message);
    } finally {
      setShowAddEditModal(false);
    }
  };

  const handleEdit = (planId) => {
    const selectedPlan = coursePlans.find((plan) => plan.id === planId);
    setNewCoursePlan(selectedPlan);
    setEditCoursePlanId(planId);
    setShowAddEditModal(true);
  };

  const handleDelete = async (planId) => {
    try {
      await supabase.from("CourseCoverage").delete().eq("id", planId);
      setCoursePlans(coursePlans.filter((plan) => plan.id !== planId));
    } catch (error) {
      console.error("Error deleting course plan:", error.message);
    }
  };

  const editCoursePlan = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      const updatedPlan = {
        id: editCoursePlanId, // The ID of the course plan to be edited
        date: newCoursePlan.date,
        hours: newCoursePlan.hours,
        topics_to_cover: newCoursePlan.topics_to_cover,
      };

      console.log("Updated Plan:", updatedPlan);

      const { data: updatedCoursePlan, error: updateError } = await supabase
        .from("CourseCoverage")
        .update(updatedPlan)
        .eq("id", editCoursePlanId);

      console.log("Updated Course Plan:", updatedCoursePlan);

      if (updateError) {
        throw updateError;
      } else {
        const updatedPlans = coursePlans.map((plan) =>
          plan.id === editCoursePlanId ? { ...updatedCoursePlan[0] } : plan
        );
        setCoursePlans(updatedPlans);
      }
    } catch (error) {
      console.error("Error editing course plan:", error.message);
    } finally {
      setShowAddEditModal(false);
    }
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
            Course Plans for {selectedSubject.name}
          </h2>
          <button
            onClick={() => {
              // Initialize selectedBatch for adding
              setShowAddEditModal(true);
              setEditCoursePlanId(null); // Reset edit ID
              setNewCoursePlan({
                date: new Date(), // Reset date to current date
                hours: "",
                topics_to_cover: "",
              });
            }}
            className="bg-text-hover-color w-[60px] h-[40px] rounded-lg mt-1 text-center p-2 text-[20px] text-white font-normal"
          >
            Add
          </button>
          <button
            onClick={generatePDF}
            className="bg-blue-500 w-[160px] h-[40px] rounded-lg mt-1 text-center p-2 text-[20px] text-white font-normal"
          >
            Generate PDF
          </button>
          <table className="pl-[10px] text-left table-auto bg-white border w-full rounded-[25px] shadow-lg">
            <thead className="rounded-lg">
              <tr className="rounded-lg">
                <th className="px-8 py-4 font-semibold">No</th>
                <th className="px-8 py-4 font-semibold">Date</th>
                <th className="px-8 py-4 font-semibold">Hr taken by staff</th>
                <th className="px-8 py-4 font-semibold">
                  Topics to be covered
                </th>
                <th className="px-8 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-sans">
              {coursePlans.map((plan, index) => (
                <tr
                  key={plan.id}
                  className={index % 2 === 0 ? "bg-text-hover-bg" : ""}
                >
                  <td className="px-8 py-4 font-light text-[20px]">
                    {index + 1}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {plan.date}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {plan.hours}
                  </td>
                  <td className="px-8 py-4 font-light text-[20px]">
                    {plan.topics_to_cover}
                  </td>
                  <td className="px-8 py-4 flex gap-6">
                    <button
                      className="mr-2"
                      onClick={() => handleEdit(plan.id)}
                    >
                      <i className="fa-solid fa-pencil text-blue-500"></i>
                    </button>
                    <button onClick={() => handleDelete(plan.id)}>
                      <i className="fa-solid fa-trash text-red-500"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Course Plan Modal */}
      {showAddEditModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editCoursePlanId ? "Edit Course Plan" : "Add Course Plan"}
            </h2>
            {/* Form for adding/editing course plan */}
            <form onSubmit={editCoursePlanId ? editCoursePlan : addCoursePlan}>
              <div>
                <label>Date:</label>
                <DatePicker
                  selected={newCoursePlan.date}
                  onChange={handleDateChange}
                  className="border rounded-lg px-3 py-2 mb-2 w-full"
                />
              </div>
              <div>
                <label>Hours:</label>
                <input
                  type="text"
                  name="hours"
                  value={newCoursePlan.hours}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 mb-2 w-full"
                />
              </div>
              <div>
                <label>Topics to be covered:</label>
                <input
                  type="text"
                  name="topics_to_cover"
                  value={newCoursePlan.topics_to_cover}
                  onChange={handleInputChange}
                  className="border rounded-lg px-3 py-2 mb-2 w-full"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEditModal(false);
                    setEditCoursePlanId(null); // Reset edit ID
                    setNewCoursePlan({
                      date: new Date(), // Reset date to current date
                      hours: "",
                      topics_to_cover: "",
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
                  {editCoursePlanId ? "Edit" : "Add"} Course Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursePlanTable;
