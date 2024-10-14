document.addEventListener("DOMContentLoaded", function() {
    // Get the username from the data-attribute
    const username = document.getElementById('user-data').getAttribute('data-username');
    
    const typedUsername = document.getElementById('typed-username');
    let index = 0;

    function typeUsername() {
        if (index < username.length) {
            typedUsername.innerHTML += username.charAt(index);
            index++;
            setTimeout(typeUsername, 85); // Adjust typing speed here
        }
    }

    typeUsername();
});