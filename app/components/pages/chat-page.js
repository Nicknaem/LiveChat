import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module"
import "/components/user-message.js"
import App from "/app.js"

class ChatPage extends LitElement{
    static get styles() {
        return css`
            
        `;
      }
    render(){     
        return html`
            <div id="chat-section">
        
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
        `
    }

    firstUpdated(){
        const socket = App.socket;
        const user = App.user;
        const room = App.room;
        const messageForm = this.shadowRoot.getElementById('message-form');
        const chatDiv = this.shadowRoot.getElementById('chat-section');

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
            chatDiv.scrollTop = chatDiv.scrollHeight;
        })

        let renderMessage = (msgProps) => {
            let msgDiv = document.createElement('user-message');

            //send data to web component
            msgDiv.props = msgProps;
            chatDiv.appendChild(msgDiv);
        }
    }
}
window.customElements.define('chat-page', ChatPage);