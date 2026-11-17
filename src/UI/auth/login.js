export async function login(username, password) {
    //Send the login information to the server.
    const response = await fetch("/api/auth/login",
        {
            //information to the server
            method: "POST",
            // Tell Express that the body is JSON
            headers: { "Content-Type": "application/json"},
             // Include authentication cookies
             // The backend will create a login cookie
            credentials: "include", 
            // Convert the email and password into JSON         
            body: JSON.stringify({username: username, password: password})
        });
    //Read the response from the server.
    const data = await response.json();
    // If the login failed, throw an error.
    if (!response.ok) {
        throw new Error(data.message || "Login failed." );
    }
    //Return the successful login information.
    return data;
}
