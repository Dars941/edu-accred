// components/DepartmentDetails.js

import React from 'react';

const DepartmentDetails = () => {
  return (
    <div className="bg-blue-100 p-8 text-center w-full">
      <h1 className="font-bold text-3xl mb-8">Department of Computer Science and Engineering</h1>

      <div className="mb-4">
        <h2 className="font-bold text-xl">Vision</h2>
        <p>To empower the students of the Computer Science and Engineering Department...</p>
      </div>

      <div className="mb-4">
        <h2 className="font-bold text-xl">Mission</h2>
        <ul>
          <li>M1: To develop knowledge in both theoretical and applied foundations...</li>
          <li>M2: To establish a learner-centric and career-oriented education system.</li>
          <li>M3: To provide good quality education for preparing better software professionals.</li>
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="font-bold text-xl">Programme Specific Outcomes (PSOs)</h2>
        <ul>
          <li>PSO1: The students will be able to identify, formulate and design solutions...</li>
          <li>PSO2: Enable the students to apply the fundamentals of Computer Science...</li>
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="font-bold text-xl">Programme Educational Objectives (PEOs)</h2>
        <ul>
          <li>PEO1: Graduates shall evolve as globally competent Computer engineers...</li>
          <li>PEO2: Graduates shall have up-to-date knowledge in Computer Science & Engineering...</li>
          <li>PEO3: Graduates shall nurture team spirit, ethics, social values, communication skills...</li>
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="font-bold text-xl">Programme Outcome</h2>
        <ul>
          <li>Engineering Graduates will be able to: Apply the knowledge of mathematics...</li>
          <li>Problem analysis: Identify, formulate, review research literature, and analyze complex...</li>
          {/* Add other outcomes here */}
        </ul>
      </div>

      <div>
        <p>Coordinator:Shinu</p>
        <p>HOD: Anup</p>
      </div>
    </div>
  );
};

export default DepartmentDetails;
