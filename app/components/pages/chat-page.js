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

        //=================================== Socket Catches

        socket.on('chatMessage', (messageData) => {
            renderMessage(messageData);

            //scrolldown
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        })

        let renderMessage = (msgProps) => {
            let msgDiv = document.createElement('user-message');

            //send data to web component
            msgDiv.props = msgProps;
            messagesDiv.appendChild(msgDiv);
        }
    }
}
window.customElements.define('chat-page', ChatPage);