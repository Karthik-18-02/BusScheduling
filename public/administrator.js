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
        alert(data.message);  // Now the message comes from JSON
      })
      .catch((error) => {
        alert('Error adding user: ' + error);
      });
    
  } else {
    alert("Please fill out all fields to add a new user.");
  }
}
