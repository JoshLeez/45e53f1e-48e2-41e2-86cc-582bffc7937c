"use client"
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Icon } from '@iconify/react';

interface UserType {
  id: number;
  firstname: string;
  lastname: string;
  position: string;
  phoneNumber: string;
  email: string;
}

interface ErrorType {
  firstname?: string;
  lastname?: string;
  email?: string;
}

export default function UsersCard({ userData }: { userData: UserType[] }) {
  const [editedUsers, setEditedUsers] = useState<UserType[]>(userData);
  const [errors, setErrors] = useState<{[key: string]: ErrorType}>({});
  const [newUserId, setNewUserId] = useState(editedUsers.length);
  const [modifiedFields, setModifiedFields] = useState<{ [key: string]: boolean }>({});
  const [sortColumn, setSortColumn] = useState<keyof UserType | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>, userId: number, field: keyof UserType) => {
    const { value } = e.target;
    const nameRegex = /^[a-zA-Z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errorMessage = "";
    if (field === "firstname") {
      if (!nameRegex.test(value)) {
        errorMessage = "Invalid first name";
      }
    } else if (field === "email") {
      if (!emailRegex.test(value)) {
        errorMessage = "Invalid email format";
      }  else {
        const currentUser = editedUsers.find(user => user.id === userId);
        if (currentUser && value !== currentUser.email) {
          const emailExists = editedUsers.some(user => user.id !== userId && user.email === value);
          if (emailExists) {
            errorMessage = "Email is not unique";
          }
        }  
      }
    }
    const updatedUsers = editedUsers.map(user => {
      if (user.id === userId) {
        return { ...user, [field]: value };
      }
      return user;
    });
    setEditedUsers(updatedUsers);
    setErrors(prevErrors => ({ ...prevErrors, [userId]: { ...prevErrors[userId], [field]: errorMessage } }));
    setModifiedFields(prevFields => ({ ...prevFields, [`${userId}_${field}`]: true }));
  };

  const handleAddRow = () => {
    setEditedUsers([...editedUsers, {
      id: newUserId + 1,
      firstname: "",
      lastname: "",
      position: "",
      phoneNumber: "",
      email: "",
    }]);
    setErrors((prevErrors) => ({...prevErrors, [newUserId + 1]: {}}));
    setNewUserId((prevId) => prevId + 1);
    setSortColumn(null);
    setSortDirection("asc");
  };

  const newUsers = editedUsers.filter((user) => user.id === newUserId)

  const handleCreate = async () => {
    try {
        const response = await fetch("/users/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUsers[0]),
        });
        const newUser = await response.json();
        setEditedUsers((prevUsers) => [...prevUsers, newUser]);
        setNewUserId((prevId) => prevId + 1);
      console.log("Users updated successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    try {
      await fetch("/users/api", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedUsers),
      });
      console.log("Users updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const sortedUsers = editedUsers.slice().sort((a, b) => {
    if (sortColumn === null) {
      return 0;
    }
    const key = sortColumn as keyof UserType;
    if (sortColumn === key) {
      if (sortDirection === "desc") {
        return (a[key] as string).localeCompare(b[key] as string);
      } else {
        return (b[key] as string).localeCompare(a[key] as string);
      }
    }
    return 0;
  });

  return (
    <form>
      <div className="action-container">
        <button className="bg-green-500 p-1 text-white rounded-md border-2 border-green-500 hover:text-green-500 hover:bg-white" onClick={()=>{handleCreate(); handleSave()}}>Save</button>
        <button className="p-2 bg-blue-500 border-2 border-blue-500 rounded-md hover:bg-white hover:text-blue-500 text-white" type="button" onClick={handleAddRow}>Add</button>
      </div>
      <table>
        <thead>
          <tr>
            <th
            onClick={() => {
              if (sortColumn === "firstname") {
                setSortDirection(sortDirection === "desc" ? "desc" : "asc");
              } else {
                setSortColumn("firstname");
                setSortDirection("asc");
              }
            }}
            >
              <div>
                <h1>First Name</h1>
                <Icon icon="icons8:up-arrow" />
              </div>
            </th>
            <th
            onClick={() => {
              if (sortColumn === "lastname") {
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              } else {
                setSortColumn("lastname");
                setSortDirection("asc");
              }
            }}
            >
              <div>
                <h1>First Name</h1>
                <Icon icon="icons8:up-arrow" />
              </div>
            </th>
            <th
            onClick={() => {
              if (sortColumn === "position") {
                setSortDirection(sortDirection === "desc" ? "desc" : "asc");
              } else {
                setSortColumn("position");
                setSortDirection("asc");
              }
            }}
            >
              <div>
                <h1>Position</h1>
                <Icon icon="icons8:up-arrow" />
              </div>
            </th>
            <th>Phone Number</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.toReversed().map((user, index) => {
            return (
              <tr key={index}>
                <td>
                  <div>
                  <input
                    value={user.firstname}
                    onChange={(e) => handleInputChange(e, user.id, "firstname")}
                    className={`${errors[user.id]?.firstname ? "input-error" : ""} ${modifiedFields[`${user.id}_firstname`] ? "input-modified" : ""}`}
                  />
                  {errors[user.id]?.firstname && <span className="absolute mt-12 bg-red-500 text-white p-2 rounded-md">{errors[user.id]?.firstname}</span>}
                  </div>
                </td>
                <td>
                  <div>
                  <input
                    value={user.lastname}
                    onChange={(e) => handleInputChange(e, user.id, "lastname")}
                    className={`${errors[user.id]?.lastname ? "input-error" : ""} ${modifiedFields[`${user.id}_lastname`] ? "input-modified" : ""}`}
                  />
                  {errors[user.id]?.lastname && <span className="absolute mt-12 bg-red-500 text-white p-2 rounded-md">{errors[user.id]?.lastname}</span>}
                  </div>
                </td>
                <td>
                  <input
                    value={user.position}
                    onChange={(e) => handleInputChange(e, user.id, "position")}
                    className={`${modifiedFields[`${user.id}_position`] ? "input-modified" : ""}`}
                  
                  />
                </td>
                <td>  
                  <input
                    value={user.phoneNumber}
                    onChange={(e) => handleInputChange(e, user.id, "phoneNumber")}
                    className={`${modifiedFields[`${user.id}_phoneNumber`] ? "input-modified" : ""}`}
                 
                 />
                </td>
                <td>
                  <div>
                  <input
                    value={user.email}
                    onChange={(e) => handleInputChange(e, user.id, "email")}
                    className={`${errors[user.id]?.email ? "input-error" : ""}` || `${modifiedFields[`${user.id}_email`] ? "input-modified" : ""}`}
                  />
                  {errors[user.id]?.email && <span className="absolute mt-12 bg-red-500 text-white p-2 rounded-md">{errors[user.id]?.email}</span>}
                    
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </form>
  );
}
