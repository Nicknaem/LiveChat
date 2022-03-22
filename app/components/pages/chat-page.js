// import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module"
import { LitElement, html, css } from "lit-element"
import "/components/user-message.js"
import App from "/app.js"

class ChatPage extends LitElement{
    static get styles() {
        return css`
            #chat-page{
                height:100%;
                display:flex;
                align-items:center;
                justify-content:space-around;
                background-color:#e7e7e7
            }
            #chat-page > div {
                border-radius: 25px;
                background: #e7e7e7;
                box-shadow:  6px 6px 12px #bebebe,-6px -6px 12px #ffffff;
            }
            #stats-section{
                width:25%;
                height:70%;
            }

            #game-board{
                width:40%;
                height:70%;
                box-shadow: 1px 1px 5px rgba(0,0,0,0.2);
            }

            #chat-section{
                display:flex;
                flex-direction:column;
                height:70%;
                width:25%;
            }
                #messages-section{
                    height:80%;
                    overflow-y:scroll;
                }
                #message-form{
                    height:20%;
                    display:flex;
                    border-radius:10px;
                    margin:15px
                }
                #message-input{
                    flex-grow:1;
                    outline:none;
                    border:none;
                    background-color:transparent;
                    box-shadow: 7px 7px 25px #bebebe,
                    -7px -7px 35px rgba(255, 255, 255, .7),
                    rgb(245 245 245) 0px 0px 2px 4px inset,
                    rgb(190 190 190) 5px 5px 8px inset; 
                    border-radius: 15px 0px 0px 15px;
                    padding:10px;
                    font-size:1.2em;
                }
                #message-button{
                    width:20%;
                    outline:none;
                    border:none;
                    background: linear-gradient(145deg, #f0f0f0, #cacaca);
                    box-shadow: rgb(190 190 190) 5px 5px 12px 0px, inset rgb(245 245 245 / 67%) 0px 0px 8px 2px;
                    border-radius:0px 15px 15px 0px;
                }
                
                #messages-section {
                    border-radius:inherit;
                    overflow: overlay;
                    overflow-x: hidden;
                    font-family: var(--generalFont);
                }
                /* total width */
                #messages-section::-webkit-scrollbar {
                width: 17px;
                /* background-color: transparent; */
                }
                
                /* scrollbar itself */
                #messages-section::-webkit-scrollbar-thumb {
                    background-color: #bebebe;
                    border-radius: 15px;
                    width: 5px;
                    border: 4px solid transparent;
                    background-clip: content-box;
                }
                
                /* set button(top and bottom of the scrollbar) */
                #messages-section::-webkit-scrollbar-button {
                    display:none;
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
        const user = App.userName;
        const room = App.room;
        const messageForm = this.shadowRoot.getElementById('message-form');
        const messagesDiv = this.shadowRoot.getElementById('messages-section');
        let scrollBack = 3;

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
                e.target.scrollTop = 6;
            }
        });
        
        //=================================== Socket Catches

        socket.on('chatMessage', ({messages, msgType}) => {
            renderMessage(messages, msgType);
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