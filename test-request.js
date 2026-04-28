const token = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zMFNaYzZsVjYzWjNITHJ3dWNyV2VrUkszTWgiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjUxNzMiLCJleHAiOjE3NzczNjUzODksImZ2YSI6Wzk0ODYsLTFdLCJpYXQiOjE3NzczNjQ3ODksImlzcyI6Imh0dHBzOi8vZXRlcm5hbC1uZXd0LTQwLmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTc3NzM2NDc3OSwic2lkIjoic2Vzc18zQ2c3d05HaTZUQ1Q5RDRJUEthWGhKZWZEbWciLCJzdHMiOiJhY3RpdmUiLCJzdWIiOiJ1c2VyXzMwU2FRMDd2M3pldzJ3MXR2Zzg5QjdFVU5CSiIsInYiOjJ9.W70KuNesqka36s1voP9yJb0PFsj-iHTmMNea4NWvP7WaLIq1NEex8AC3ZRaEXir7eDshrhGhi5UnJV7cBcoiJ_hous9OeU3LwjxHu-yr8oosG1iF7RDYHFEKp8E5iMRrdDxB0ECYzU4agLZKIASOFYMRynl4VYUAptNWvu5r3Sj3o3wbs3LbbIQZ5mZ_a3yNy3s4KEdiLWe8f2IEHgoLyNYSofv80qFm-V679R3gn2C02wQdV7ZkML2l-MGYLPXwom5DJt4-L_6sRHP4PPmVvFlsXrWDYpbFdhevsKPuVplzKZbjyh9TQTl3cnxSWqyD19HM4K6rItkILowap8kqUw";

const body = {
  topic: "React Native",
  currentLevel: "beginner",
  weeklyHours: 5,
  targetWeeks: 4
};

async function testEndpoint() {
  console.log("Sending POST request to http://localhost:3001/api/v1/learning-plans/generate...");
  try {
    const res = await fetch("http://localhost:3001/api/v1/learning-plans/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    console.log(`Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log("Response Body:");
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error during fetch:", e.message);
  }
}

testEndpoint();
