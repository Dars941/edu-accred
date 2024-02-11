import React, { useState, useEffect } from 'react';
import supabase from '../../createClent'; // Assuming this is your Supabase client
import { v4 as uuid } from 'uuid';

const Stafflist = () => {
  const [fetchError, setFetchError] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [addEditStaff, setAddEditStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState({ id: null, name: '', dept: '', mobile_number: '', email: '', is_advisor: false, advisor_batch: '' });

  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const { data, error } = await supabase
          .from('stafflist')
          .select();
        if (error) {
          throw error;
        }
        setStaffList(data || []);
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching staff list:', error.message);
        setFetchError('Could not fetch data');
        setStaffList([]);
      }
    };
    fetchStaffList();
  }, []);

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setAddEditStaff('edit');
  };

  const handleDelete = async (staff) => {
    try {
      await supabase
        .from('stafflist')
        .delete()
        .eq('id', staff.id);
      setStaffList(staffList.filter((s) => s.id !== staff.id));
    } catch (error) {
      console.error('Error deleting staff:', error.message);
    }
  };

  const handleAddEditClose = () => {
    setAddEditStaff(null);
    setSelectedStaff({ id: null, name: '', dept: '', mobile_number: '', email: '', is_advisor: false, advisor_batch: '' });
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    try {
      console.log('Submitting form with selectedStaff:', selectedStaff);
      if (addEditStaff === 'add') {
        const newStaffId = Math.floor(Math.random() * 1000000); // Generate random integer ID
        const newStaff = { ...selectedStaff, id: newStaffId };
        const { data, error } = await supabase
          .from('stafflist')
          .insert([newStaff]);
        if (error) {
          throw error;
        }
        console.log('Staff added successfully:', data);
        setStaffList([...staffList, data[0]]);
        handleAddEditClose();
      } else if (addEditStaff === 'edit') {
        const { data, error } = await supabase
          .from('stafflist')
          .update(selectedStaff)
          .eq('id', selectedStaff.id);
        if (error) {
          throw error;
        }
        console.log('Staff edited successfully:', data);
        const updatedList = staffList.map(staff => {
          if (staff.id === selectedStaff.id) {
            return selectedStaff;
          }
          return staff;
        });
        setStaffList(updatedList);
        handleAddEditClose();
      }
    } catch (error) {
      console.error('Error adding/editing staff:', error.message);
    }
  };
  
  return (
    <div className='p-7 text-2xl text-black bg-blue-100 w-full font-semibold'>
      <h2>Staff List</h2>
      <button
        onClick={() => {
          setAddEditStaff('add');
          setSelectedStaff({ id: null, name: '', dept: '', mobile_number: '', email: '', is_advisor: false, advisor_batch: '' });
        }}
        className="bg-text-hover-color w-[60px] h-[40px] rounded-lg mt-1 text-center p-2 text-[20px] text-white font-normal"
      >
        Add
      </button>
      {fetchError && <p>{fetchError}</p>}
      <table className="pl-[10px] text-left table-auto bg-white border w-full rounded-[25px] shadow-lg">
        <thead className="rounded-lg">
          <tr className="rounded-lg">
            {/* <th className="px-4 py-2 font-semibold">ID</th> */}
            <th className="px-4 py-2 font-semibold">Name</th>
            <th className="px-4 py-2 font-semibold">Department</th>
            <th className="px-4 py-2 font-semibold">Mobile Number</th>
            <th className="px-4 py-2 font-semibold">Email</th>
            <th className="px-4 py-2 font-semibold">Is Advisor</th>
            <th className="px-4 py-2 font-semibold">Advisor Batch</th>
            <th className="px-4 py-2 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="font-sans">
          {staffList.map((staff, index) => (
            <tr key={staff.id} className={index % 2 === 0 ? 'bg-text-hover-bg' : ''}>
              {/* <td className="px-4 py-2 font-light text-[20px]">{staff.id}</td> */}
              <td className="px-4 py-2 font-light text-[20px]">{staff.name}</td>
              <td className="px-4 py-2 font-light text-[20px]">{staff.dept}</td>
              <td className="px-4 py-2 font-light text-[20px]">{staff.mobile_number}</td>
              <td className="px-4 py-2 font-light text-[20px]">{staff.email}</td>
              <td className="px-4 py-2 font-light text-[20px]">{staff.is_advisor ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2 font-light text-[20px]">{staff.advisor_batch}</td>
              <td className="px-4 py-2 flex gap-6">
                <button className="mr-2" onClick={() => handleEdit(staff)}>
                  <i className="fa-solid fa-pencil text-blue-500"></i>
                </button>
                <button onClick={() => handleDelete(staff)}>
                  <i className="fa-solid fa-trash text-red-500"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Staff Popup */}
      {addEditStaff && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              {addEditStaff === 'add' ? 'Add Staff' : 'Edit Staff'}
            </h2>
            {/* Form for adding/editing staff */}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                className="border rounded-lg px-3 py-2 mb-2 w-full"
                value={selectedStaff.name}
                onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Department"
                className="border rounded-lg px-3 py-2 mb-2 w-full"
                value={selectedStaff.dept}
                onChange={(e) => setSelectedStaff({ ...selectedStaff, dept: e.target.value })}
              />
              <input
                type="text"
                placeholder="Mobile Number"
                className="border rounded-lg px-3 py-2 mb-2 w-full"
                value={selectedStaff.mobile_number}
                onChange={(e) => setSelectedStaff({ ...selectedStaff, mobile_number: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="border rounded-lg px-3 py-2 mb-2 w-full"
                value={selectedStaff.email}
                onChange={(e) => setSelectedStaff({ ...selectedStaff, email: e.target.value })}
              />
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedStaff.is_advisor}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, is_advisor: e.target.checked })}
                />
                <label className="text-[20px]">Is Advisor</label>
              </div>
              <input
                type="text"
                placeholder="Advisor Batch"
                className="border rounded-lg px-3 py-2 mb-2 w-full"
                value={selectedStaff.advisor_batch}
                onChange={(e) => setSelectedStaff({ ...selectedStaff, advisor_batch: e.target.value })}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddEditClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                  {addEditStaff === 'add' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stafflist;
