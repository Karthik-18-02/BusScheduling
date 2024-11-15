// Function to fetch and display users in the "user-list" section
function fetchUsers() {
  // Fetch users from the backend
  fetch('http://localhost:5000/getUsers', {
    method: 'GET',
  })
    .then((response) => response.json()) // Parse the JSON response
    .then((users) => {
      // Display the "Current Users" heading
      const currentUsersHeading = document.getElementById('currentUsersHeading');
      currentUsersHeading.style.display = 'block'; // Show the heading

      const userList = document.getElementById('userList');
      userList.innerHTML = ''; // Clear the existing list

      // Add users to the list
      users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = `${user.name} (${user.role})`;
        userList.appendChild(listItem); // Add the user and role to the list
      });
    })
    .catch((error) => {
      alert('Error fetching users: ' + error);
    });
}

// Add event listener to the "Show Current Users" button
document.getElementById('showUsersButton').addEventListener('click', fetchUsers);

// Modify the existing addUser function to refresh the user list after adding
function addUser() {
  const newName = document.getElementById("newName").value;
  const newLoginId = document.getElementById("newLoginId").value;
  const newPassword = document.getElementById("newPassword").value;
  const newRole = document.getElementById("newRole").value;

  if (newName && newLoginId && newPassword && newRole) {
    // Send a POST request to the backend
    fetch('http://localhost:5000/addUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newName,
        loginId: newLoginId,
        password: newPassword,
        role: newRole,
      }),
    })
      .then((response) => response.json())  // Parse the JSON response
      .then((data) => {
        alert(data.message);  // Display the message from the backend
        fetchUsers();  // Refresh the user list after adding a new user
      })
      .catch((error) => {
        alert('Error adding user: ' + error);
      });
  } else {
    alert("Please fill out all fields to add a new user.");
  }
}

//lo