import React, { useState, useEffect } from "react";
import supabase from "../../createClent";

const ClassroomList = () => {
  const [fetchError, setFetchError] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [addEditClassroom, setAddEditClassroom] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState({
    id: null,
    name: "",
    batch: "",
    department: ""
  });
  const [rerenderFlag, setRerenderFlag] = useState(false);
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const { data: classroomData, error: classroomError } = await supabase
          .from("classrooms")
          .select();
        if (classroomError) {
          throw classroomError;
        }
        setClassrooms(classroomData || []);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching classrooms:", error.message);
        setFetchError("Could not fetch data");
        setClassrooms([]);
      }
    };

    const fetchBatchesAndDepartments = async () => {
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from("studentlist")
          .select("batch");

        if (studentsError) {
          console.error("Error fetching batches and departments:", studentsError.message);
        } else {
          const uniqueBatches = [...new Set(studentsData.map((student) => student.batch))];
          setBatches(uniqueBatches);

        //   const uniqueDepartments = [...new Set(studentsData.map((student) => student.dept))];
        //   setDepartments(uniqueDepartments);
         }
      } catch (error) {
        console.error("Error fetching batches and departments:", error.message);
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
    
    fetchDepartments(); 
    fetchClassrooms();
    fetchBatchesAndDepartments();
  }, [rerenderFlag]);

  const handleEdit = (classroom) => {
    setSelectedClassroom(classroom);
    setAddEditClassroom("edit");
  };

  const handleDelete = async (classroom) => {
    try {
      await supabase.from("classrooms").delete().eq("id", classroom.id);
      setClassrooms(classrooms.filter((cls) => cls.id !== classroom.id));
    } catch (error) {
      console.error("Error deleting classroom:", error.message);
    }
  };

  const handleAddEditClose = () => {
    setAddEditClassroom(null);
    setSelectedClassroom({ id: null, name: "", batch: "", department: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addEditClassroom === "add") {
        // Omit the "id" column when adding a new classroom
        const { data, error } = await supabase
          .from("classrooms")
          .insert([{ name: selectedClassroom.name, batch: selectedClassroom.batch, department: selectedClassroom.department }]);
        if (error) {
          throw error;
        }
        if (data && data.length > 0) {
          setClassrooms((prevClassrooms) => [...prevClassrooms, data[0]]);
        }
        handleAddEditClose(); // Close the popup after successful addition
      } else if (addEditClassroom === "edit") {
        const { data, error } = await supabase
          .from("classrooms")
          .update(selectedClassroom)
          .eq("id", selectedClassroom.id);
        if (error) {
          throw error;
        }
        setClassrooms((prevClassrooms) =>
          prevClassrooms.map((classroom) =>
            classroom.id === selectedClassroom.id ? selectedClassroom : classroom
          )
        );
        handleAddEditClose(); // Close the popup after successful edit
      }
      setRerenderFlag((prevFlag) => !prevFlag); // Toggle rerenderFlag to force re-render
    } catch (error) {
      console.error("Error adding/editing classroom:", error.message);
    }
  };
  

  return (
    <div className="p-7 text-2xl text-black bg-blue-100 w-full font-semibold">
      <h2>Classroom List</h2>
      <button
        onClick={() => setAddEditClassroom("add")}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
      >
        Add Classroom
      </button>

      {fetchError && <p>{fetchError}</p>}

      <table className="pl-[10px] text-left table-auto bg-white border w-full rounded-[25px] shadow-lg mt-4">
        <thead className="rounded-lg">
          <tr>
            <th className="px-8 py-4 font-semibold">Name</th>
            <th className="px-8 py-4 font-semibold">Batch</th>
            <th className="px-8 py-4 font-semibold">Department</th>
            <th className="px-8 py-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="font-sans">
          {classrooms.map((classroom, index) => (

  <tr key={classroom.id} className={index % 2 === 0 ? "bg-text-hover-bg" : ""}>
    <td className="px-8 py-4 font-light text-[20px]">{classroom.name}</td>
    <td className="px-8 py-4 font-light text-[20px]">{classroom.batch}</td>
    <td className="px-8 py-4 font-light text-[20px]">{classroom.department}</td>
    <td className="px-8 py-4 flex gap-6">
      <button
        onClick={() => handleDelete(classroom)}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Delete
      </button>
      <button
        onClick={() => handleEdit(classroom)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Edit
      </button>
    </td>
  </tr>
))}
</tbody>
</table>

{/* Add/Edit Classroom Popup */}
{addEditClassroom && (
<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
<div className="bg-white p-6 rounded-lg">
  <h2 className="text-lg font-semibold mb-4">
    {addEditClassroom === "add" ? "Add Classroom" : "Edit Classroom"}
  </h2>
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      placeholder="Name"
      className="border rounded-lg px-3 py-2 mb-2 w-full"
      value={selectedClassroom.name}
      onChange={(e) =>
        setSelectedClassroom({ ...selectedClassroom, name: e.target.value })
      }
      required
    />
    <select
      value={selectedClassroom.batch}
      onChange={(e) =>
        setSelectedClassroom({ ...selectedClassroom, batch: e.target.value })
      }
      className="border rounded-lg px-3 py-2 mb-2 w-full"
      required
    >
      <option value="">Select Batch</option>
      {batches.map((batch) => (
        <option key={batch} value={batch}>
          {batch}
        </option>
      ))}
    </select>
    <select
  value={selectedClassroom.department}
  onChange={(e) =>
    setSelectedClassroom({ ...selectedClassroom, department: e.target.value })
  }
  className="border rounded-lg px-3 py-2 mb-2 w-full"
>
  <option value="">Select Department</option>
  {departments.map((department) => (
    <option key={department} value={department}>
      {department}
    </option>
  ))}
</select>

    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleAddEditClose}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        {addEditClassroom === "add" ? "Add" : "Save"}
      </button>
    </div>
  </form>
</div>
</div>
)}
</div>
);
};

export default ClassroomList;
