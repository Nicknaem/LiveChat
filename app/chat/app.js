const socket = io();
const messageForm = document.getElementById('message-form');
const chatDiv = document.getElementById('chat-section');
let user = "nika";
let room = "TimeMode"
//=================================== Socket Emits

//joining the correct room
//this should happen on roomCard click
socket.emit('join', {user,room})

messageForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const msgText = event.target.elements['message-input'];  //HTLMFormElement mozdev
    socket.emit('chatMessage', msgText.value)
    msgText.value = '';
    msgText.focus();
})

//=================================== Socket Catches

socket.on('chatMessage', (messageData)=>{
    renderMessage(messageData);

    //scrolldown
    chatDiv.scrollTop = chatDiv.scrollHeight;
})  

//=================================== App functions
let renderMessage = (msgProps)=>{

    let msgDiv = document.createElement('user-message');

    //send data to web component
    //method: 3 give it through props
    msgDiv.props = msgProps;
    
    //method: 1 give it through custom html data attributes
    // setAttributes(msgDiv, {
    //     'data-userimg': msgProps.img,
    //     'data-username': msgProps.name,
    //     'data-usermsg': msgProps.text,
    //     'data-msgdate': msgProps.date,
    // })
        
    //method: 2 give it thorugh slots
    // msgDiv.innerHTML =` 
    //     <slot name="userImg"></slot>
    //     <slot name="msgText">${msg}</slot>
    //     <slot name="msgDate"></slot>    
    // `;

    chatDiv.appendChild(msgDiv);
    
}

const setAttributes = (element, attributesObject)=>{
    console.log(attributesObject);
      for(var key in attributesObject) {
        element.setAttribute(key, attributesObject[key]);
      }
  }