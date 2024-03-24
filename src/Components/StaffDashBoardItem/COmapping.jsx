import React, { useState, useEffect } from 'react';
import supabase from "../../createClent";

const StaffDashboard = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [courseOutcomes, setCourseOutcomes] = useState([]);

  useEffect(() => {
    const getEmail = localStorage.getItem("email");
    setEmail(getEmail);
  }, []);

  useEffect(() => {
    fetchName();
  }, [email]);

  useEffect(() => {
    if (name) {
      fetchSubjectsByStaff(name);
    }
  }, [name]);

  useEffect(() => {
    if (selectedSubject) {
      fetchCourseOutcomes(selectedSubject);
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
        .select("name")
        .eq("staff", staffName);

      if (subjectError) {
        console.error("Error fetching subjects by staff:", subjectError.message);
      } else {
        setSubjects(subjectData);
      }
    } catch (error) {
      console.error("Error fetching subjects by staff:", error.message);
    }
  };

  const fetchCourseOutcomes = async (subject) => {
    try {
      const { data: coData, error: coError } = await supabase
        .from("course_outcomes")
        .select('*')
        .eq("subject", subject);

      if (coError) {
        console.error("Error fetching course outcomes:", coError.message);
      } else {
        setCourseOutcomes(coData);
      }
    } catch (error) {
      console.error("Error fetching course outcomes:", error.message);
    }
  };

  const handleValueChange = async (courseCode, poNumber, newValue) => {
    try {
      setCourseOutcomes(prevCourseOutcomes => {
        return prevCourseOutcomes.map(course => {
          if (course.courseCode === courseCode) {
            return {
              ...course,
              [poNumber]: newValue
            };
          }
          return course;
        });
      });

      await supabase
        .from("course_outcomes")
        .update({ [poNumber]: newValue })
        .eq("subject", selectedSubject)
        .eq("courseCode", courseCode);
    } catch (error) {
      console.error("Error updating course outcome value:", error.message);
    }
  };

  const handleJustificationChange = async (courseCode, poNumber, newJustification) => {
    try {
      await supabase
        .from("course_outcomes")
        .update({ [`${poNumber}_justification`]: newJustification })
        .eq("subject", selectedSubject)
        .eq("courseCode", courseCode);
    } catch (error) {
      console.error("Error updating course outcome justification:", error.message);
    }
  };

  return (
    <div>
      <h1>Welcome, {name}</h1>
      <h2>Your Subjects:</h2>
      <ul>
        {subjects.map((subject, index) => (
          <li key={index} onClick={() => setSelectedSubject(subject.name)}>
            {subject.name}
          </li>
        ))}
      </ul>
      {selectedSubject && (
        <>
          <h2>Course Outcomes for {selectedSubject}:</h2>
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>PO1</th>
                <th>PO2</th>
                <th>PO3</th>
                <th>PO4</th>
                <th>PO5</th>
                <th>PO6</th>
                <th>PO7</th>
                <th>PO8</th>
                <th>PO9</th>
                <th>PO10</th>
                <th>PO11</th>
                <th>PO12</th>
                <th>PSO1</th>
                <th>PSO2</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courseOutcomes.map((course) => (
                <tr key={course.id}>
                  <td>{course.courseCode}</td>
                  <td>
                    <input
                      type="text"
                      value={course.PO1}
                      onChange={(e) => handleValueChange(course.courseCode, 'PO1', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={course.PO2}
                      onChange={(e) => handleValueChange(course.courseCode, 'PO2', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={course.PO3}
                      onChange={(e) => handleValueChange(course.courseCode, 'PO3', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      value={course.PO1_justification}
                      onChange={(e) => handleJustificationChange(course.courseCode, 'PO1', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      value={course.PO2_justification}
                      onChange={(e) => handleJustificationChange(course.courseCode, 'PO2', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default StaffDashboard;
