//logout.js
// Handles logging the user out and sends a request to the backend.
// Must have login cookie to logout
// The backend then removes the authentication cookie from the browser.
export async function logout() {
    //Send a POST request to the logout endpoint.
    //the user's authentication state.
    const response = await fetch( "/api/auth/logout",{
            method: "POST",
            //Include the user's authentication cookie
            //so the server knows which session to end
            credentials: "include"
        }
    );
    // Convert the server response into JSON.
    const data = await response.json();
    //Check whether the logout request succeeded.
    if (!response.ok) {
        throw new Error(data.message ||"Logout failed.");
    }
    return data;
}
