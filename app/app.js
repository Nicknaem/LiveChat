const socket = io();
import Router from "/pageLogics/router.js"

let user;
let room;
let loginStatus = true;
//=================================== Socket Emits

//joining the correct room
//this should happen on roomCard click
//join should happen after room click
//socket.emit('join', {user,room})




//creating account
/* 
    on OK, post {userName, pin}, and insert it to database users collection
    and => login
*/

//else please login or create account



//go back functionality
window.addEventListener('popstate',Router.updateRoute);




