import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module"
import "/components/user-message.js"
import App from "/app.js"

class ChatPage extends LitElement{
    static get styles() {
        return css`
            #chat-page{
                height:100vh;
                display:flex;
                align-items:center;
            }
            #chat-section{
                display:flex;
                flex-direction:column;
                height:80%;
                width:25%;
                justify-self:end;
            }
            #messages-section{
                height:80%;
                overflow-y:scroll;
            }
            #message-form{
                height:20%;
            }
            #stats-section{
                width:25%;
                height:80%;
            }
            #game-board{
                width:50%;
                height:80%;
            }

        `;
      }
    render(){     
        return html`
            <div id="chat-page">
        
                <div id="stats-section">

                </div>
                <div id="game-board">

                </div>
                <div id="chat-section">
                    <div id="messages-section">

                    </div>
                    <form id="message-form">
                        <input 
                            id="message-input"
                            type="text"
                            placeholder="Type here" 
                            autocomplete="off" 
                            required
                        />
                        <button type="submit" id="message-button">Send</button>
                    </form>
                </div>
                
            </div>
        `
    }

    firstUpdated(){
        const socket = App.socket;
        const user = App.user;
        const room = App.room;
        const messageForm = this.shadowRoot.getElementById('message-form');
        const messagesDiv = this.shadowRoot.getElementById('messages-section');
        let scrollBack = 2;

        //=================================== Socket emits
        //joining the correct room
        socket.emit('join', {user,room})

        messageForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const msgText = event.target.elements['message-input'];  //HTLMFormElement mozdev
            socket.emit('chatMessage', msgText.value)
            msgText.value = '';
            msgText.focus();
        })

        messagesDiv.addEventListener("scroll", (e)=>{
            if(e.target.scrollTop < 1){
                socket.emit('loadMore', scrollBack);
                scrollBack++;
                e.target.scrollTop = 15;
            }
        });
        
        //=================================== Socket Catches

        socket.on('chatMessage', ({messages, msgType}) => {
            renderMessage(messages, msgType);
            console.log(msgType);
            
        })
        
        let renderMessage = (messages, msgType) => {

            if(msgType === "down"){
                let msgDiv = document.createElement('user-message');
                msgDiv.props = messages[0];
                messagesDiv.appendChild(msgDiv);
            }else{
                for (var i=messages.length-1; i>=0; i--) {
                    let msgDiv = document.createElement('user-message');
                    msgDiv.props = messages[i];
                    messagesDiv.insertBefore(msgDiv, messagesDiv.firstChild);
                }
            }
            if(msgType != "up"){
                //$$! scrolldown, its too wierd, without timeout doesnot scroll to full down
                setTimeout(()=>{
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                },10); 
            }
        }
    }
}
window.customElements.define('chat-page', ChatPage);