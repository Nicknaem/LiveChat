const userName = document.getElementById('user-name');

userName.addEventListener('onchange',()=>{
    //debounce and check if user name is available in users collection
    //if yes show "OK" create user icon
    //esle login icon
})

/* 
    if(userName is available)
    insert user into users collection, send insert request from here or inserti it from serverside on ChatRoom join
    send info to database
    {
        chatRoom:params.room,
        userName: userName.value
    } 
    */
//creating account
/* 
    on OK, post {userName, pin}, and insert it to database
    and => login
    
*/
//loggin in
/* 
    post {userName, pin}, if findUsername == pin
    res.send {image, stats, loggedIN:true}
    freeze username, hide password
*/

document.getElementById('room-container').addEventListener('room-click', (params)=>{
    //if LoggedIn = true
    //fetch get chat.html, {userName:"nika", chatRoom:"timeMode" pin:"394" }
    //else please login or create account
})