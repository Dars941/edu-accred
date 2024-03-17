import React, { useState, useEffect } from 'react';
import supabase from '../../createClent';

const UserManagement = () => {
  const [fetchError, setFetchError] = useState(null);
  const [userList, setUserList] = useState([]); // Initialize as empty array
  const [addEditUser, setAddEditUser] = useState(null); // State to manage add/edit popup
  const [selectedUser, setSelectedUser] = useState({ id: null, email: '', password: '', role: '' });
  const [rerenderFlag, setRerenderFlag] = useState(false); // New state variable for re-rendering

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select();
        if (error) {
          throw error;
        }
        setUserList(data || []);
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching user list:', error.message);
        setFetchError('Could not fetch data');
        setUserList([]);
      }
    };
    fetchUserList();
  }, [rerenderFlag]); // Include rerenderFlag in the dependency array

  const handleEdit = (user) => {
    setSelectedUser(user);
    setAddEditUser('edit');
  };

  const handleDelete = async (user) => {
    try {
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      setUserList(userList.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  const handleAddEditClose = () => {
    setAddEditUser(null);
    setSelectedUser({ id: null, email: '', password: '', role: '' });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form with selectedUser:', selectedUser);
      if (addEditUser === 'add') {
        const { id, ...userWithoutId } = selectedUser;
        const { data, error } = await supabase
          .from('users')
          .insert([userWithoutId]);
        if (error) {
          throw error;
        }
        if (data) {
          console.log('User added successfully:', data);
          setUserList([...userList, data[0]]);
        }
        handleAddEditClose();
      } else if (addEditUser === 'edit') {
        // Handle edit functionality
        const { id, ...updatedUser } = selectedUser;
        const { error } = await supabase
          .from('users')
          .update(updatedUser)
          .eq('id', id);
        if (error) {
          throw error;
        }
        console.log('User updated successfully');
  
        // Update the userList state with the edited user
        setUserList(userList.map(user => user.id === selectedUser.id ? selectedUser : user));
  
        handleAddEditClose();
      }
      // After adding or editing user, set rerenderFlag to trigger re-render
      setRerenderFlag(prevFlag => !prevFlag);
    } catch (error) {
      console.error('Error adding/editing user:', error.message);
    }
  };
  

  return (
    <div className='p-7 text-2xl text-black bg-blue-100 w-full font-semibold overflow-x-auto max-h-max'>
      <h2>User Management</h2>
      <button
        onClick={() => {
          setAddEditUser('add');
          setSelectedUser({ id: null, email: '', password: '', role: '' }); // Initialize selectedUser for adding
        }}
        className="bg-text-hover-color w-[60px] h-[40px] rounded-lg mt-1 text-center p-2 text-[20px] text-white font-normal"
      >
        Add
      </button>
      {fetchError && <p>{fetchError}</p>}
      <table className="pl-[10px] text-left table-auto bg-white border w-full rounded-[25px] shadow-lg overflow-auto">
        <thead className="rounded-lg">
          <tr className="rounded-lg">
            {/* <th className="px-8 py-4 font-semibold">User ID</th> */}
            <th className="px-8 py-4 font-semibold">Email</th>
            <th className="px-8 py-4 font-semibold">Password</th>
            <th className="px-8 py-4 font-semibold">Role</th>
            <th className="px-8 py-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="font-sans">
          {userList.map((user, index) => (
            <tr key={user.id} className={index % 2 === 0 ? 'bg-text-hover-bg' : ''}>
              {/* <td className="px-8 py-4 font-light text-[20px]">{user.id}</td> */}
              <td className="px-8 py-4 font-light text-[20px]">{user.email}</td>
              <td className="px-8 py-4 font-light text-[20px]">{user.password}</td>
              <td className="px-8 py-4 font-light text-[20px]">{user.role}</td>
              <td className="px-8 py-4 flex gap-6">
                <button className="mr-2" onClick={() => handleEdit(user)}>
                  <i className="fa-solid fa-pencil text-blue-500"></i>
                </button>
                <button onClick={() => handleDelete(user)}>
                  <i className="fa-solid fa-trash text-red-500"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit User Popup */}
      {addEditUser && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              {addEditUser === 'add' ? 'Add User' : 'Edit User'}
            </h2>
            {/* Form for adding/editing user */}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Email"
                className="border rounded-lg px-3 py-2 mb-2 w-full"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="border rounded-lg px-3 py-2 mb-2 w-full"
                value={selectedUser.password}
                onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
              />
              <select
                className="border rounded-lg px-3 py-2 mb-2 w-full"
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="staffadvisor">Staff Advisor</option>
              </select>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddEditClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                  {addEditUser === 'add' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
